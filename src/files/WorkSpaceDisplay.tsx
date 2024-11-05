import { useContext, useEffect, useRef } from "react";

import "./WorkSpaceDisplay.css";

import { context } from "..";

const VERTSOURCE = `
precision highp float;

attribute vec2 a_pos;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
    vec2 clip_space = a_pos * 2.0 - 1.0;
    
    gl_Position = vec4(clip_space * vec2(1, -1), 0, 1);

    v_texCoord = a_texCoord;
}
` as const;
const FRAGSOURCEDEFAULT = `
precision highp float;

uniform vec2 u_resolution;
uniform sampler2D u_input;

varying vec2 v_texCoord;

void main() {
    vec4 color = texture2D(u_input, v_texCoord);

    gl_FragColor = color;
}
` as const;
const FRAGSOURCECOMPUTE = [
  `
precision highp float;

uniform vec2 u_resolution;
uniform sampler2D u_input;

varying vec2 v_texCoord;

vec3 clamp_col(vec3 color) {
  return clamp(color, 0.0, 1.0);
}`,
  `
void main() {

  vec2 tex_coord = v_texCoord * u_resolution;
  vec3 color = texture2D(u_input, v_texCoord).rgb;
  
  color = step§§§step(color);

  gl_FragColor = vec4(color, 1.0);
}`,
] as const;
const FRAGSOURCECOMPUTESTEP0 = `
uniform vec3 u_channelsShown;
uniform vec3 u_channelsInverted;
uniform vec3 u_channelsContrast;

vec3 step0_filter(vec3 color) {
  
  color = (1.0 - u_channelsInverted) * color + u_channelsInverted * (1.0 - color);
  color *= u_channelsShown;

  return clamp_col(color);
}

vec3 step0_avg() {

  vec3 color = vec3(0.0, 0.0, 0.0);

  for (float rx = 0.0; rx <= 10.0; rx++) {
    for (float ry = 0.0; ry <= 10.0; ry++) {
      vec2 coord = vec2(rx, ry) / 10.0;
      color += texture2D(u_input, coord).rgb;
    }
  }

  color /= 100.0;

  return clamp_col(color);
}

float step0_contrast(float value) {
  return (max(value, 1.0) - 1.0) * 0.75 + 1.0;
}

vec3 step0(vec3 color) {

  // vec3 avg_color = step0_avg();

  color = step0_filter(color);

  color.r = pow(color.r * step0_contrast(u_channelsContrast.r), u_channelsContrast.r);
  color.g = pow(color.g * step0_contrast(u_channelsContrast.g), u_channelsContrast.g);
  color.b = pow(color.b * step0_contrast(u_channelsContrast.b), u_channelsContrast.b);

  return clamp_col(color);
}`;
const FRAGSOURCECOMPUTESTEP1 = `
const vec2 sample = vec2(§§§sampleSize, §§§sampleSize);
uniform vec2 u_sampleSize;

vec3 step1(vec3 color) {

  color = step0(color);

  float weight_sum = 0.0;
  vec3 avg_color = vec3(0.0, 0.0, 0.0);
  
  for (float rx = -sample.x; rx <= sample.x; rx++) {
    for (float ry = -sample.y; ry <= sample.y; ry++) {
      vec2 offset = vec2(rx, ry) / sample * u_sampleSize / u_resolution;
      float weight = 1.0 - sqrt(pow(rx / sample.x, 2.0) + pow(ry / sample.y, 2.0));

      weight_sum += weight;
      avg_color += step0(texture2D(u_input, v_texCoord + offset).rgb) * weight;
    }
  }
  avg_color /= weight_sum;

  vec3 scale = vec3(0.5, 0.5, 0.5) / max(avg_color, 0.01);
  scale = min(max(scale, 0.5), 4.0);

  color *= scale;

  return clamp_col(color);
}`;
const FRAGSOURCECOMPUTESTEP2 = `
uniform vec3 u_threshold;

vec3 step2(vec3 color) {

  color = step1(color);

  color.r = float(color.r >= u_threshold.r);
  color.g = float(color.g >= u_threshold.g);
  color.b = float(color.b >= u_threshold.b);

  return clamp_col(color);
}`;

function WorkSpaceDisplay(options: {
  id?: string | null;
  step: number;
  maxWidth?: number;
  maxHeight?: number;
  outputLayers?: number;
  renderDebounce?: number;
  glRenderDebounce?: number;
  ctxRenderDebounce?: number;
  onRender?: (data: Uint8Array, width: number, height: number) => void;
}) {
  const {
    id,
    step,
    maxWidth,
    maxHeight,
    outputLayers,
    renderDebounce,
    glRenderDebounce,
    ctxRenderDebounce,
    onRender,
  } = options;

  const { workspaces } = useContext(context);

  const workspace = id ? workspaces[id] : undefined;

  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const glRenderRef = useRef<(() => void) | null>(null);
  const ctxRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;

    const gl = displayCanvas.getContext("webgl");
    if (!gl) return;

    const ctx = overlayCanvas.getContext("2d");
    if (!ctx) return;

    const width = workspace?.input.canvas.width ?? 0;
    const height = workspace?.input.canvas.height ?? 0;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log("CreateShader error: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const createProgram = (vertSource: string, fragSource: string) => {
      const vertShader = createShader(gl.VERTEX_SHADER, vertSource);
      if (!vertShader) return null;
      const fragShader = createShader(gl.FRAGMENT_SHADER, fragSource);
      if (!fragShader) {
        gl.deleteShader(vertShader);
        return null;
      }
      const program = gl.createProgram();
      if (!program) {
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        return null;
      }
      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("CreateProgram error: " + gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    };

    displayCanvas.width = width;
    displayCanvas.height = height;
    gl.viewport(0, 0, width, height);

    overlayCanvas.width = width;
    overlayCanvas.height = height;

    const scale = Math.min(
      (maxWidth ?? Infinity) / width,
      (maxHeight ?? Infinity) / height,
    );

    displayCanvas.style.width = overlayCanvas.style.width =
      width * scale + "px";
    displayCanvas.style.height = overlayCanvas.style.height =
      height * scale + "px";

    let lastProgram: WebGLProgram | null = null;
    let lastPosBuffer: WebGLBuffer | null = null;
    let lastTexCoordBuffer: WebGLBuffer | null = null;
    let lastTex: WebGLTexture | null = null;

    const dispose = () => {
      if (lastProgram) gl.deleteProgram(lastProgram);
      if (lastPosBuffer) gl.deleteBuffer(lastPosBuffer);
      if (lastTexCoordBuffer) gl.deleteBuffer(lastTexCoordBuffer);
      if (lastTex) gl.deleteTexture(lastTex);
    };

    glRenderRef.current = () => {
      if (!workspace) return dispose();

      const tex = (lastTex = gl.createTexture());
      if (!tex) return dispose();

      const sampleSize = workspace.input.sampleSize;

      const program = (lastProgram = createProgram(
        VERTSOURCE,
        [
          FRAGSOURCECOMPUTE[0],
          ...[
            FRAGSOURCECOMPUTESTEP0,
            FRAGSOURCECOMPUTESTEP1.replaceAll(
              "§§§sampleSize",
              String(Math.min(25, sampleSize / 2)),
            ),
            FRAGSOURCECOMPUTESTEP2,
          ].slice(0, step + 1),
          FRAGSOURCECOMPUTE[1].replace(
            "§§§step",
            String(Math.min(2, Math.max(0, step))),
          ),
        ].join("\n"),
      ));
      if (!program) return dispose();
      gl.useProgram(program);

      const posLocation = gl.getAttribLocation(program, "a_pos");
      const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

      gl.enableVertexAttribArray(posLocation);
      gl.enableVertexAttribArray(texCoordLocation);

      const posBuffer = (lastPosBuffer = gl.createBuffer());
      if (!posBuffer) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
        gl.STATIC_DRAW,
      );
      gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

      const texCoordBuffer = (lastTexCoordBuffer = gl.createBuffer());
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
        gl.STATIC_DRAW,
      );
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      const resLocation = gl.getUniformLocation(program, "u_resolution");
      gl.uniform2f(resLocation, gl.canvas.width, gl.canvas.height);

      const texLocation = gl.getUniformLocation(program, "u_input");

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        workspace.input.canvas,
      );

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      gl.uniform1i(texLocation, 0);

      const u_channelsShownLocation = gl.getUniformLocation(
        program,
        "u_channelsShown",
      );
      gl.uniform3f(
        u_channelsShownLocation,
        +(step === 3
          ? workspace.output.channels[0].shown
          : workspace.input.channels[0].shown),
        +(step === 3
          ? workspace.output.channels[1].shown
          : workspace.input.channels[1].shown),
        +(step === 3
          ? workspace.output.channels[2].shown
          : workspace.input.channels[2].shown),
      );

      const u_channelsInvertedLocation = gl.getUniformLocation(
        program,
        "u_channelsInverted",
      );
      gl.uniform3f(
        u_channelsInvertedLocation,
        +workspace.input.channels[0].inverted,
        +workspace.input.channels[1].inverted,
        +workspace.input.channels[2].inverted,
      );

      const u_channelsContrastLocation = gl.getUniformLocation(
        program,
        "u_channelsContrast",
      );
      gl.uniform3f(
        u_channelsContrastLocation,
        workspace.input.channels[0].contrast,
        workspace.input.channels[1].contrast,
        workspace.input.channels[2].contrast,
      );

      const u_sampleSizeLocation = gl.getUniformLocation(
        program,
        "u_sampleSize",
      );
      gl.uniform2f(u_sampleSizeLocation, sampleSize, sampleSize);

      const u_thresholdLocation = gl.getUniformLocation(program, "u_threshold");
      gl.uniform3f(
        u_thresholdLocation,
        workspace.input.channels[0].threshold,
        workspace.input.channels[1].threshold,
        workspace.input.channels[2].threshold,
      );

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const data = new Uint8Array(gl.canvas.width * gl.canvas.height * 4);
      gl.readPixels(
        0,
        0,
        gl.canvas.width,
        gl.canvas.height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data,
      );
      if (onRender) onRender(data, width, height);
    };

    ctxRenderRef.current = () => {
      if (!workspace) return;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (step === 1) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(
          ctx.canvas.width / 2,
          ctx.canvas.height / 2,
          workspace.input.sampleSize / 2,
          0,
          2 * Math.PI,
        );
        ctx.closePath();
        ctx.stroke();
        return;
      }

      if (step === 3) {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        for (let i = 0; i < workspace.output.channels.length; i++) {
          if (outputLayers && !(outputLayers & (1 << i))) continue;
          const { areas } = workspace.output.channels[i];
          for (const { x, y, area } of areas ?? []) {
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, Math.sqrt(area / Math.PI), 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
          }
        }
        return;
      }
    };

    if ((glRenderDebounce ?? renderDebounce ?? 0) <= 0) glRenderRef.current();
    if ((ctxRenderDebounce ?? renderDebounce ?? 0) <= 0) ctxRenderRef.current();

    return dispose;
  }, [
    displayCanvasRef,
    overlayCanvasRef,
    workspace,
    step,
    maxWidth,
    maxHeight,
    glRenderDebounce,
    ctxRenderDebounce,
    renderDebounce,
    onRender,
  ]);

  useEffect(() => {
    const glId = setInterval(() => {
      if (!glRenderRef.current) return;
      glRenderRef.current();
      glRenderRef.current = null;
    }, glRenderDebounce ?? renderDebounce ?? 0);
    if ((glRenderDebounce ?? renderDebounce ?? 0) === 0) clearInterval(glId);

    const ctxId = setInterval(() => {
      if (!ctxRenderRef.current) return;
      ctxRenderRef.current();
      ctxRenderRef.current = null;
    }, ctxRenderDebounce ?? renderDebounce ?? 0);
    if ((ctxRenderDebounce ?? renderDebounce ?? 0) === 0) clearInterval(ctxId);

    return () => {
      clearInterval(glId);
      clearInterval(ctxId);
    };
  }, [glRenderDebounce, ctxRenderDebounce, renderDebounce]);

  return (
    <div className="WorkSpaceDisplay">
      <canvas ref={displayCanvasRef} />
      <canvas ref={overlayCanvasRef} />
    </div>
  );
}

export default WorkSpaceDisplay;
