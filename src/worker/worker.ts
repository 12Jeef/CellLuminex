/* eslint-disable no-restricted-globals */

import { WorkspaceOutput, castWorkspaceSerialized } from "../types";
import { Message, castMessage } from "./common";

console.log("Worker started!");

const sendMessage = (message: Message) => {
  self.postMessage(message);
};
const progressQuality = 100;
let progress = 0;
const sendProgress = (display: string, value: number) => {
  let newProgress = Math.floor(value * progressQuality);
  if (progress === newProgress) return;
  progress = newProgress;
  sendMessage({ name: "progress", payload: { display, value } });
};

const process = (message: Message) => {
  const { id, input } = castWorkspaceSerialized(message.payload);
  const { data, width, height, channels, sampleSize } = input;

  const stateBuffer = new Uint8Array(data.length);

  const getI = (x: number, y: number, i: number) =>
    ((height - 1 - y) * width + x) * 4 + i;

  const get = (buffer: Uint8Array, x: number, y: number, i: number) =>
    buffer[getI(x, y, i)];
  const set = (
    buffer: Uint8Array,
    x: number,
    y: number,
    i: number,
    value: number,
  ) => (buffer[getI(x, y, i)] = value);

  const getState = (x: number, y: number, i: number) =>
    get(stateBuffer, x, y, i);
  const setState = (x: number, y: number, i: number, value: number) =>
    set(stateBuffer, x, y, i, value);

  const getData = (x: number, y: number, i: number) => get(data, x, y, i);
  const setData = (x: number, y: number, i: number, value: number) =>
    set(data, x, y, i, value);

  const channelFlagsList = [
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, false],
    [false, true, true],
    [true, false, true],
    [true, true, true],
  ];

  const N = channelFlagsList.length * width * height;
  let I = 0;

  sendProgress(id, 0);

  const output: WorkspaceOutput = { channels: [] };

  for (const channelFlags of channelFlagsList) {
    const getDataFlagged = (x: number, y: number) => {
      if (getState(x, y, 0) >= 128) return false;
      for (let i = 0; i < 3; i++) {
        if (!channelFlags[i]) continue;
        if (!channels[i].shown) return false;
        if (getData(x, y, i) < 128) return false;
      }
      return true;
    };

    stateBuffer.fill(0);

    let areas: { x: number; y: number; area: number }[] = [];
    let areaSum = 0;
    let areaMax = -Infinity;
    let areaMin = Infinity;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        sendProgress(id, (I * width * height + x * height + y) / N);
        let xSum = 0,
          ySum = 0,
          area = 0;
        const bfs = [[x, y]];
        while (bfs.length > 0) {
          const [x, y] = bfs.pop() as number[];
          if (x < 0 || x >= width) continue;
          if (y < 0 || y >= height) continue;
          if (!getDataFlagged(x, y)) continue;
          setState(x, y, 0, 255);
          xSum += x;
          ySum += y;
          area++;
          bfs.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
        if (area <= 25) continue;
        areas.push({ area, x: xSum / area, y: ySum / area });
        areaSum += area;
        areaMax = Math.max(areaMax, area);
        areaMin = Math.min(areaMin, area);
      }
    }

    const avgArea = areaSum / Math.max(1, areas.length);
    const threshAreaMax = avgArea * 25;
    const threshAreaMin = avgArea * 0.25;
    areas = areas.filter(
      ({ x, y, area }) => area < threshAreaMax && area > threshAreaMin,
    );

    output.channels.push({ shown: true, areas });
    I++;
  }

  sendProgress(id, 1);

  sendMessage({ name: "process-done", payload: output });
};

self.addEventListener("message", (e) => {
  const message = castMessage(e.data);
  console.log("Received message " + message.name + "...");
  if (message.name === "process") return process(message);
});

export {};
