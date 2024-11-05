import { useRef } from "react";
import { IonIcon } from "@ionic/react";

import { WorkspaceInputChannel } from "../types";

import { lerp } from "../util";

import "./WorkSpaceChannel.css";

import eye from "ionicons/dist/svg/eye.svg";
import eyeOff from "ionicons/dist/svg/eye-off.svg";
import radioButtonOff from "ionicons/dist/svg/radio-button-off.svg";
import radioButtonOn from "ionicons/dist/svg/radio-button-on.svg";

export const USESHOWNTOGGLE = 1 << 0;
export const USEINVERTEDTOGGLE = 1 << 1;
export const USECONTRASTSLIDER = 1 << 2;
export const USETHRESHOLDSLIDER = 1 << 3;

function WorkSpaceInputChannel(options: {
  i: number;
  channel: WorkspaceInputChannel;
  flags?: number;
  onChange?: () => void;
  onShownSetOnly?: (i: number) => void;
  onShownSetAll?: (value: boolean) => void;
  onInvertedSetOnly?: (i: number) => void;
  onInvertedSetAll?: (value: boolean) => void;
  onContrastSetAll?: (value: number) => void;
  onThresholdSetAll?: (value: number) => void;
}) {
  const {
    i,
    channel,
    flags,
    onChange,
    onShownSetOnly,
    onShownSetAll,
    onInvertedSetOnly,
    onInvertedSetAll,
    onContrastSetAll,
    onThresholdSetAll,
  } = options;

  const contrastToSlider = (contrast: number) => {
    contrast = Math.min(5, Math.max(0, contrast));
    if (contrast < 1) return lerp(-50, -100, (contrast - 1) / -1);
    return lerp(-50, 100, (contrast - 1) / (5 - 1));
  };
  const sliderToContrast = (slider: number) => {
    slider = Math.min(100, Math.max(-100, slider));
    if (slider < -50) return lerp(1, 0, (slider + 50) / -50);
    return lerp(1, 5, (slider + 50) / (100 + 50));
  };
  const contrastToDisplay = (contrast: number) => {
    contrast = Math.min(5, Math.max(0, contrast));
    if (contrast < 1) return lerp(0, -100, (contrast - 1) / -1);
    return lerp(0, 100, (contrast - 1) / (5 - 1));
  };

  const thresholdToSlider = (threshold: number) => {
    return Math.min(1, Math.max(0, threshold)) * 100;
  };
  const sliderToThreshold = (slider: number) => {
    return Math.min(1, Math.max(0, slider / 100));
  };

  const sliderAllRef = useRef(false);

  return (
    <section
      className={
        "WorkSpaceChannel input " + ["r", "g", "b", "y", "c", "m", "w"][i]
      }
    >
      <section className="main">
        <button>
          {["Red", "Green", "Blue", "Yellow", "Cyan", "Magenta", "White"][i]}
        </button>
        {(flags ?? 0) & USECONTRASTSLIDER && i < 3 ? (
          <span>
            <input
              type="range"
              min={-100}
              max={100}
              step={0.01}
              value={contrastToSlider(channel.contrast)}
              onMouseDown={(e) => {
                sliderAllRef.current = e.shiftKey;
              }}
              onChange={(e) => {
                let value =
                  Math.round(sliderToContrast(e.target.valueAsNumber) * 100) /
                  100;
                if (sliderAllRef.current && onContrastSetAll)
                  onContrastSetAll(value);
                else channel.contrast = value;
                if (onChange) onChange();
              }}
            />
            <span className="info">
              Contrast:{" "}
              {Math.round(contrastToDisplay(channel.contrast) * 100) / 100}
            </span>
          </span>
        ) : undefined}
        {(flags ?? 0) & USETHRESHOLDSLIDER && i < 3 ? (
          <span>
            <input
              type="range"
              min={0}
              max={100}
              step={0.01}
              value={thresholdToSlider(channel.threshold)}
              onMouseDown={(e) => {
                sliderAllRef.current = e.shiftKey;
              }}
              onChange={(e) => {
                let value =
                  Math.round(sliderToThreshold(e.target.valueAsNumber) * 100) /
                  100;
                if (sliderAllRef.current && onThresholdSetAll)
                  onThresholdSetAll(value);
                else channel.threshold = value;
                if (onChange) onChange();
              }}
            />
            <span className="info">
              Threshold: {Math.round(thresholdToSlider(channel.threshold))}
            </span>
          </span>
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
        {(flags ?? 0) & USEINVERTEDTOGGLE && i < 3 ? (
          <button
            onClick={(e) => {
              if (e.altKey && onInvertedSetOnly) onInvertedSetOnly(i);
              else if (e.shiftKey && onInvertedSetAll)
                onInvertedSetAll(!channel.inverted);
              else channel.inverted = !channel.inverted;
              if (onChange) onChange();
            }}
          >
            <IonIcon src={channel.inverted ? radioButtonOn : radioButtonOff} />
            <span className="info">
              {channel.inverted ? "Inverted" : "Noninverted"}
            </span>
          </button>
        ) : undefined}
      </section>
    </section>
  );
}

export default WorkSpaceInputChannel;
