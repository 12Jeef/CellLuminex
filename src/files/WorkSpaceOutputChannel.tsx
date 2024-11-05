import { IonIcon } from "@ionic/react";

import { WorkspaceOutputChannel } from "../types";

import "./WorkSpaceChannel.css";

import eye from "ionicons/dist/svg/eye.svg";
import eyeOff from "ionicons/dist/svg/eye-off.svg";

export const USESHOWNTOGGLE = 1 << 0;
export const USECOUNT = 1 << 1;

function WorkSpaceOutputChannel(options: {
  i: number;
  channel: WorkspaceOutputChannel;
  flags?: number;
  onChange?: () => void;
  onShownSetOnly?: (i: number) => void;
  onShownSetAll?: (value: boolean) => void;
  setLayer?: (layer: number) => void;
}) {
  const {
    i,
    channel,
    flags,
    onChange,
    onShownSetOnly,
    onShownSetAll,
    setLayer,
  } = options;

  return (
    <section
      className={
        "WorkSpaceChannel output " + ["r", "g", "b", "y", "c", "m", "w"][i]
      }
    >
      <section className="main">
        <button
          onMouseEnter={() => {
            if (setLayer) setLayer(i);
          }}
        >
          {["Red", "Green", "Blue", "Yellow", "Cyan", "Magenta", "White"][i]}
        </button>
        {(flags ?? 0) & USECOUNT ? (
          <span>{(channel.areas ?? []).length}</span>
        ) : undefined}
        {(flags ?? 0) & USESHOWNTOGGLE && i < 3 ? (
          <button
            onClick={(e) => {
              if (e.altKey && onShownSetOnly) onShownSetOnly(i);
              else if (e.shiftKey && onShownSetAll)
                onShownSetAll(!channel.shown);
              else channel.shown = !channel.shown;
              if (onChange) onChange();
            }}
          >
            <IonIcon src={channel.shown ? eye : eyeOff} />
            <span className="info">{channel.shown ? "Shown" : "Hidden"}</span>
          </button>
        ) : undefined}
      </section>
    </section>
  );
}

export default WorkSpaceOutputChannel;
