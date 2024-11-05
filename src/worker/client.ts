import {
  WorkspaceOutput,
  castWorkspaceOutput,
  WorkspaceSerialized,
} from "../types";
import {
  Message,
  castMessage,
  ProgressPayload,
  castProgressPayload,
} from "./common";

export class Client {
  private worker: Worker | null;
  private _payload: WorkspaceSerialized | null;
  private _result: WorkspaceOutput | null;
  private _progress: ProgressPayload | null;

  private resolve: ((result: WorkspaceOutput) => void) | null;

  public constructor() {
    this.worker = null;
    this._payload = null;
    this._result = null;
    this._progress = null;

    this.resolve = null;
  }

  public get running() {
    return this.worker != null;
  }
  public get payload() {
    return this._payload;
  }
  public get result() {
    return this._result;
  }
  public get progress() {
    return this._progress;
  }

  protected innerStart() {
    this.worker = new Worker(new URL("./worker.ts", import.meta.url));
    this.worker.addEventListener("message", (e) => {
      const message = castMessage(e.data);

      if (message.name === "process-done") {
        this.innerStop();
        this._payload = null;
        this._result = castWorkspaceOutput(message.payload);
        this._progress = null;
        if (this.resolve) this.resolve(this._result);
        this.resolve = null;
        return;
      }
      if (message.name === "progress") {
        this._progress = castProgressPayload(message.payload);
        return;
      }
    });
    this.sendMessage({ name: "process", payload: this._payload });
  }
  protected innerStop() {
    if (!this.worker) return;
    this.worker.terminate();
    this.worker = null;
  }

  public start(payload: WorkspaceSerialized) {
    if (this.running) return;

    this._payload = payload;
    this._result = null;
    this._progress = null;

    this.innerStart();
  }
  public stop() {
    if (!this.running) return;

    this._payload = null;
    this._result = null;
    this._progress = null;

    this.resolve = null;

    this.innerStop();
  }
  public async run(payload: WorkspaceSerialized) {
    return await new Promise<WorkspaceOutput>((res, rej) => {
      this.resolve = res;
      this.start(payload);
    });
  }

  protected sendMessage(message: Message) {
    if (!this.worker) return;
    this.worker.postMessage(message);
  }
}
