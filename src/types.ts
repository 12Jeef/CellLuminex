import {
  castArray,
  castObject,
  castFloat,
  castInt,
  castUint8Array,
  getBufferFromCanvas,
  getCanvasFromBuffer,
  clampCanvas,
  hash,
} from "./util";

import { Client } from "./worker/client";

export type WorkspaceInputChannel = {
  shown: boolean;
  inverted: boolean;
  contrast: number;
  threshold: number;
};
export function castWorkspaceInputChannel(src: any): WorkspaceInputChannel {
  const data = castObject(src);
  const shown = data.shown ?? true;
  const inverted = data.inverted ?? false;
  const contrast = castFloat(data.contrast, 1);
  const threshold = castFloat(data.threshold, 0.5);
  return { shown, inverted, contrast, threshold };
}
export type WorkspaceInputChannels = WorkspaceInputChannel[];
export function castWorkspaceInputChannels(src: any): WorkspaceInputChannels {
  return castArray(src).map((src) => castWorkspaceInputChannel(src));
}

export type WorkspaceOutputChannel = {
  shown: boolean;
  areas?: { x: number; y: number; area: number }[] | null;
};
export function castWorkspaceOutputChannel(src: any): WorkspaceOutputChannel {
  const data = castObject(src);
  const shown = data.shown ?? true;
  const areas = data.areas
    ? castArray(data.areas).map((src) => {
        const data = castObject(src);
        const x = castFloat(data.x);
        const y = castFloat(data.y);
        const area = castFloat(data.area);
        return { x, y, area };
      })
    : null;
  return { shown, areas };
}
export type WorkspaceOutputChannels = WorkspaceOutputChannel[];
export function castWorkspaceOutputChannels(src: any): WorkspaceOutputChannels {
  return castArray(src).map((src) => castWorkspaceOutputChannel(src));
}

export type WorkspaceInput = {
  file?: File | null;
  canvas: HTMLCanvasElement;
  smallCanvas: HTMLCanvasElement;

  channels: WorkspaceInputChannels;

  sampleSize: number;
};
export function castWorkspaceInput(src: any): WorkspaceInput {
  const data = castObject(src);
  const file = data.file;
  if (!(file instanceof File)) throw new Error(".file not File");
  const canvas = data.canvas;
  if (!(canvas instanceof HTMLCanvasElement))
    throw new Error(".canvas not HTMLCanvasElement");
  const smallCanvas = data.smallCanvas;
  if (!(smallCanvas instanceof HTMLCanvasElement))
    throw new Error(".smallCanvas not HTMLCanvasElement");
  const channels = castWorkspaceInputChannels(data.channels);
  const sampleSize = castFloat(data.sampleSize, 15);
  return { file, canvas, smallCanvas, channels, sampleSize };
}
export type WorkspaceInputSerialized = {
  data: Uint8Array;
  width: number;
  height: number;

  channels: WorkspaceInputChannels;

  sampleSize: number;
};
export function castWorkspaceInputSerialized(
  src: any,
): WorkspaceInputSerialized {
  const data = castObject(src);
  const data2 = castUint8Array(data.data);
  const width = castInt(data.width);
  const height = castInt(data.width);
  const channels = castWorkspaceInputChannels(data.channels);
  const sampleSize = castFloat(data.sampleSize, 15);
  return { data: data2, width, height, channels, sampleSize };
}

export type WorkspaceOutput = {
  channels: WorkspaceOutputChannels;
};
export function castWorkspaceOutput(src: any): WorkspaceOutput {
  const data = castObject(src);
  const channels = castWorkspaceOutputChannels(data.channels);
  return { channels };
}

export type Workspace = {
  id: string;
  time: number;

  step: number;

  input: WorkspaceInput;
  output: WorkspaceOutput;

  client: Client;
};
export function castWorkspace(src: any): Workspace {
  const data = castObject(src);
  const id = String(data.id ?? "");
  const time = castFloat(data.time);
  const step = castInt(data.step);
  const input = castWorkspaceInput(data.input);
  const output = castWorkspaceOutput(data.output);
  const client = data.client;
  if (!(client instanceof Client)) throw new Error(".client is not Client");
  return {
    id,
    time,
    step,
    input,
    output,
    client,
  };
}
export type WorkspaceSerialized = {
  id: string;
  time: number;

  step: number;

  input: WorkspaceInputSerialized;
  output: WorkspaceOutput;
};
export function castWorkspaceSerialized(src: any): WorkspaceSerialized {
  const data = castObject(src);
  const id = String(data.id ?? "");
  const time = castFloat(data.time);
  const step = castInt(data.step);
  const input = castWorkspaceInputSerialized(data.input);
  const output = castWorkspaceOutput(data.output);
  return {
    id,
    time,
    step,
    input,
    output,
  };
}

export type Workspaces = { [key: string]: Workspace | undefined };
export function castWorkspaces(src: any): Workspaces {
  const data = castObject(src);
  for (const id in data) {
    data[id] = castWorkspace(data[id]);
    data[id].id = id;
  }
  return data as Workspaces;
}
export type WorkspacesSerialized = {
  [key: string]: WorkspaceSerialized | undefined;
};
export function castWorkspacesSerialized(src: any): WorkspacesSerialized {
  const data = castObject(src);
  for (const id in data) {
    data[id] = castWorkspaceSerialized(data[id]);
    data[id].id = id;
  }
  return data as WorkspacesSerialized;
}

export function serializeWorkspaceInput(
  input: WorkspaceInput,
  buffer?: Uint8Array,
): WorkspaceInputSerialized {
  const { file, canvas, smallCanvas, channels, sampleSize } = input;
  return {
    data: buffer ?? getBufferFromCanvas(canvas),
    width: canvas.width,
    height: canvas.height,
    channels,
    sampleSize,
  };
}
export function serializeWorkspace(
  workspace: Workspace,
  buffer?: Uint8Array,
): WorkspaceSerialized {
  const { id, time, step, input, output } = workspace;
  return {
    id,
    time,
    step,
    input: serializeWorkspaceInput(input, buffer),
    output,
  };
}
export function deserializeWorkspaceInput(
  input: WorkspaceInputSerialized,
): WorkspaceInput {
  const { data, width, height, channels, sampleSize } = input;
  const canvas = getCanvasFromBuffer(data, width, height, true)[0];
  return {
    canvas,
    smallCanvas: clampCanvas(canvas),
    channels,
    sampleSize,
  };
}
export function deserializeWorkspace(
  workspace: WorkspaceSerialized,
): Workspace {
  const { id, time, step, input, output } = workspace;
  return {
    id,
    time,
    step,
    input: deserializeWorkspaceInput(input),
    output,
    client: new Client(),
  };
}

export function hashWorkspace(workspace: Workspace | WorkspaceSerialized) {
  const { id, time, input } = workspace;
  return hash(JSON.stringify({ id, time, input }));
}

export function encodeWorkspace(workspace: Workspace | WorkspaceSerialized) {
  const { id, output } = workspace;
  const lines = [];
  lines.push(
    `"Remember! This algorithm is not perfect",`,
    `"It can under/over count!",`,
    `"Make sure to double check!",`,
    new Array(output.channels.length * 3 + 1).fill("***,").join(""),
    "," +
      output.channels
        .map(
          (channel, i) =>
            `${["R", "G", "B", "R&G", "G&B", "R&B", "R&G&B"][i]},,,`,
        )
        .join(""),
    "Count," +
      output.channels
        .map((channel, i) => `${(channel.areas ?? []).length},,,`)
        .join(""),
    "Avg Area," +
      output.channels
        .map(
          (channel, i) =>
            `${
              (channel.areas ?? []).reduce(
                (prev, curr) => prev + curr.area,
                0,
              ) / Math.max(1, (channel.areas ?? []).length)
            },,,`,
        )
        .join(""),
    new Array(output.channels.length * 3 + 1).fill("***,").join(""),
    "Area #," +
      output.channels.map((channel, i) => "Area X,Area Y,Area,").join(""),
  );
  let n = 0;
  while (true) {
    const line = [n + 1 + ","];
    let anyAdd = false;
    for (const channel of output.channels) {
      const areas = channel.areas ?? [];
      if (n >= areas.length) {
        line.push(",,,");
        continue;
      }
      anyAdd = true;
      line.push(`${areas[n].x},${areas[n].y},${areas[n].area},`);
    }
    n++;
    if (!anyAdd) break;
    lines.push(line.join(""));
  }
  return lines.join("\n");
}
