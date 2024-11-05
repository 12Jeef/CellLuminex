import { WorkspaceOutputChannels } from "../types";

import "./WorkSpaceChannels.css";

import WorkSpaceOutputChannel from "./WorkSpaceOutputChannel";

function WorkSpaceOutputChannels(options: {
  channels: WorkspaceOutputChannels;
  flags?: number;
  onChange?: () => void;
  setLayer?: (layer: number) => void;
}) {
  const { channels, flags, onChange, setLayer } = options;

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

  return (
    <section className="WorkSpaceChannels output">
      {channels.map((channel, i) => (
        <WorkSpaceOutputChannel
          key={i}
          i={i}
          channel={channel}
          flags={flags}
          onChange={onChange}
          onShownSetOnly={onShownSetOnly}
          onShownSetAll={onShownSetAll}
          setLayer={setLayer}
        />
      ))}
    </section>
  );
}

export default WorkSpaceOutputChannels;
