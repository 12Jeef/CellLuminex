import { WorkspaceInputChannels } from "../types";

import "./WorkSpaceChannels.css";

import WorkSpaceInputChannel from "./WorkSpaceInputChannel";

function WorkSpaceInputChannels(options: {
  channels: WorkspaceInputChannels;
  flags?: number;
  onChange?: () => void;
}) {
  const { channels, flags, onChange } = options;

  const onShownSetOnly = (i: number) => {
    let allMatch = true;
    channels.forEach((channel, j) => {
      if (channel.shown !== (j === i)) allMatch = false;
    });
    const flip = allMatch && channels[i].shown;
    channels.forEach((channel, j) => {
      channel.shown = flip ? j !== i : j === i;
    });
  };
  const onShownSetAll = (value: boolean) => {
    for (const channel of channels) channel.shown = value;
  };

  const onInvertedSetOnly = (i: number) => {
    let allMatch = true;
    channels.forEach((channel, j) => {
      if (channel.inverted !== (j === i)) allMatch = false;
    });
    const flip = allMatch && channels[i].inverted;
    channels.forEach((channel, j) => {
      channel.inverted = flip ? j !== i : j === i;
    });
  };
  const onInvertedSetAll = (value: boolean) => {
    for (const channel of channels) channel.inverted = value;
  };

  const onContrastSetAll = (value: number) => {
    for (const channel of channels) channel.contrast = value;
  };

  const onThresholdSetAll = (value: number) => {
    for (const channel of channels) channel.threshold = value;
  };

  return (
    <section className="WorkSpaceChannels input">
      {channels.map((channel, i) => (
        <WorkSpaceInputChannel
          key={i}
          i={i}
          channel={channel}
          flags={flags}
          onChange={onChange}
          onShownSetOnly={onShownSetOnly}
          onShownSetAll={onShownSetAll}
          onInvertedSetOnly={onInvertedSetOnly}
          onInvertedSetAll={onInvertedSetAll}
          onContrastSetAll={onContrastSetAll}
          onThresholdSetAll={onThresholdSetAll}
        />
      ))}
    </section>
  );
}

export default WorkSpaceInputChannels;
