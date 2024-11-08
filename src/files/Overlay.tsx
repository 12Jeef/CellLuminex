import { useContext, useEffect, useRef, useState } from "react";
import { IonIcon } from "@ionic/react";

import "./Overlay.css";

import close from "ionicons/dist/svg/close.svg";

import { context } from "..";
import { appContext } from "./App";

import WorkSpaceDisplay from "./WorkSpaceDisplay";

function Overlay() {
  const { workspaces, activeWorkspace } = useContext(context);

  const { layer, overlay, closeOverlay } = useContext(appContext);

  const workspace = activeWorkspace ? workspaces[activeWorkspace] : undefined;
  const step = workspace?.step ?? 0;

  const [maxWidth, setMaxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resize = () => {
      const rect = element.getBoundingClientRect();
      setMaxWidth(rect.width - 30 * 2);
      setMaxHeight(rect.height - 30 * 2);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return (
    <div className={"Overlay" + (overlay ? " active" : "")} ref={ref}>
      <WorkSpaceDisplay
        id={activeWorkspace}
        step={step}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        outputLayers={1 << layer}
        glRenderDebounce={100}
      />
      <button
        onClick={() => {
          closeOverlay();
        }}
      >
        <IonIcon src={close} />
      </button>
    </div>
  );
}

export default Overlay;
