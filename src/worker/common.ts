import { castObject, castFloat } from "../util";

export type Message = {
  name: string;
  payload: any;
};

export function castMessage(src: any): Message {
  const data = castObject(src);
  const name = String(data.name ?? "");
  const payload = data.payload;
  return { name, payload };
}

export type ProgressPayload = {
  display: string;
  value: number;
};

export function castProgressPayload(src: any): ProgressPayload {
  const data = castObject(src);
  const display = String(data.display ?? "");
  const value = castFloat(data.value);
  return { display, value };
}
