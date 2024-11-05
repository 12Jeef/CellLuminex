import * as tiff from "tiff";

export function hash(s: string) {
  let hash = 0;
  if (s.length === 0) return hash;
  for (let i = 0; i < s.length; i++) {
    let chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

export function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
}

export function castObject(src: any): { [key: string]: any } {
  if (typeof src !== "object" || src == null) return {};
  return src;
}

export function castArray(src: any): any[] {
  return Array.from(src ?? []);
}

export function castUint8Array(src: any): Uint8Array {
  if (src instanceof Uint8Array) return src;
  return new Uint8Array();
}

export function castFloat(src: any, def: number = 0): number {
  return parseFloat(src ?? def);
}
export function castInt(src: any, def: number = 0): number {
  return parseInt(src ?? def);
}

export const alphabet = "abcdefghijklmnopqrstuvwxyz";
export const base64 =
  alphabet.toLowerCase() + alphabet.toUpperCase() + "0123456789+=";
export function jargon(length: number) {
  return new Array(length)
    .fill(null)
    .map(() => base64[Math.floor(base64.length * Math.random())])
    .join("");
}

export function scaleCanvas(
  canvas: HTMLCanvasElement,
  scale: number,
): HTMLCanvasElement {
  const canvas2 = document.createElement("canvas");
  canvas2.width = Math.ceil(canvas.width * scale);
  canvas2.height = Math.ceil(canvas.height * scale);
  const ctx = canvas2.getContext("2d");
  if (ctx) ctx.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);
  return canvas2;
}

export function clampCanvas(
  canvas: HTMLCanvasElement,
  maxWidth: number = 100,
  maxHeight: number = 100,
): HTMLCanvasElement {
  return scaleCanvas(
    canvas,
    Math.min(maxWidth / canvas.width, maxHeight / canvas.height),
  );
}

export function copyCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  return scaleCanvas(canvas, 1);
}

export function getCanvasFromImage(
  image: HTMLImageElement,
): HTMLCanvasElement[] {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.drawImage(image, 0, 0);
  return [canvas];
}

export async function getImageFromCanvas(
  canvas: HTMLCanvasElement,
): Promise<HTMLImageElement> {
  return await new Promise((res, rej) => {
    const image = new Image();
    image.addEventListener("load", (e) => res(image));
    image.addEventListener("error", (e) => rej(e));
    image.src = canvas.toDataURL();
  });
}

export function getCanvasFromBuffer(
  buffer: Uint8Array | Uint16Array | Float32Array,
  width: number,
  height: number,
  alpha: boolean = true,
): HTMLCanvasElement[] {
  const bitDepth =
    buffer instanceof Uint8Array ? 8 : buffer instanceof Uint16Array ? 16 : 32;
  const getToUint8 = (value: number) => {
    if (bitDepth === 8) return value;
    if (bitDepth === 16) return 255 * (value / ((1 << 16) - 1));
    return 255 * (value / ((1 << 32) - 1));
  };
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let imageDataI = (y * width + x) * 4;
        let bufferI = (y * width + x) * (alpha ? 4 : 3);
        imageData.data[imageDataI + 3] = alpha
          ? getToUint8(buffer[bufferI + 3])
          : 255;
        for (let i = 0; i < 3; i++)
          imageData.data[imageDataI + i] = getToUint8(buffer[bufferI + i]);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
  return [canvas];
}

export function getBufferFromCanvas(canvas: HTMLCanvasElement): Uint8Array {
  const ctx = canvas.getContext("2d");
  if (ctx)
    return new Uint8Array(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data,
    );
  return new Uint8Array();
}

export async function getCanvasFromFile(
  file: File,
): Promise<HTMLCanvasElement[]> {
  if (!file.type.startsWith("image/"))
    throw new Error("File is not an image (" + file.type + ")");

  const isTiff = file.type === "image/tiff";

  return await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.addEventListener("load", async (e) => {
      if (!e.target) return rej(new Error("No target found"));
      const result = e.target.result;

      if (isTiff) {
        if (!(result instanceof ArrayBuffer))
          return rej(new Error("TIFF: Invalid result"));
        const data = tiff.decode(result);
        const canvases: HTMLCanvasElement[] = [];
        await Promise.all(
          data.map(async (data) =>
            canvases.push(
              ...getCanvasFromBuffer(
                data.data,
                data.width,
                data.height,
                data.alpha,
              ),
            ),
          ),
        );
        res(canvases);
        return;
      }

      if (typeof result !== "string")
        return rej(new Error("IMG: Invalid result"));

      const image = new Image();
      image.addEventListener("load", async (e) =>
        res(getCanvasFromImage(image)),
      );
      image.src = result;
    });

    if (isTiff) reader.readAsArrayBuffer(file);
    else reader.readAsDataURL(file);
  });
}

export function deepCopy<T>(src: T): T {
  if (typeof src === "object" && src != null && src.constructor === Array)
    return Array.from(src).map((src) => deepCopy(src)) as T;
  if (typeof src === "object" && src != null && src.constructor === Object) {
    const srcCopy: { [key: string]: any } = {};
    for (const key in src) srcCopy[key] = deepCopy(src[key]);
    return srcCopy as T;
  }
  return src;
}
