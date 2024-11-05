import { useContext, useEffect, useRef, useState } from "react";
import { IonIcon } from "@ionic/react";

import "./WorkSpace.css";

import arrowForward from "ionicons/dist/svg/arrow-forward.svg";
import alertCircleOutline from "ionicons/dist/svg/alert-circle-outline.svg";

import { serializeWorkspace, hashWorkspace, encodeWorkspace } from "../types";

import { context } from "..";

import WorkSpaceDisplay from "./WorkSpaceDisplay";
import {
  USECONTRASTSLIDER,
  USEINVERTEDTOGGLE,
  USESHOWNTOGGLE,
  USETHRESHOLDSLIDER,
} from "./WorkSpaceInputChannel";
import WorkSpaceInputChannels from "./WorkSpaceInputChannels";
import { USECOUNT } from "./WorkSpaceOutputChannel";
import WorkSpaceOutputChannels from "./WorkSpaceOutputChannels";

function StepNav(options: {
  title: string;
  step: number;
  currentStep: number;
  setStep?: (step: number) => void;
}) {
  const { title, step, currentStep, setStep } = options;

  return (
    <button
      className={step === currentStep ? "this" : ""}
      onClick={() => {
        if (setStep) setStep(step);
      }}
    >
      <span className="info">{title}</span>
    </button>
  );
}
function StepNavSeparator(options: { lastStep: number; currentStep: number }) {
  const { lastStep, currentStep } = options;

  return (
    <span
      className={
        lastStep === currentStep
          ? "left"
          : lastStep === currentStep - 1
          ? "right"
          : ""
      }
    ></span>
  );
}

function StepSection(options: {
  title: string;
  step: number;
  currentStep: number;
  setStep?: (step: number) => void;
  children?: any;
}) {
  const { title, step, currentStep, setStep, children } = options;

  const ref = useRef<HTMLHeadingElement | null>(null);
  const justInRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!element.parentElement) return;
    const parentElement = element.parentElement;
    if (!element.parentElement.parentElement) return;
    const parentParentElement = element.parentElement.parentElement;

    if (step === currentStep) {
      if (justInRef.current) {
        justInRef.current = false;
        return;
      }
      element.scrollIntoView({ behavior: "smooth" });
      return;
    }

    let timeoutId: NodeJS.Timer | null = null;
    const onScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const thisRect = parentElement.getBoundingClientRect();
        const parentRect = parentParentElement.getBoundingClientRect();
        const parentMiddle = parentRect.top + parentRect.height / 2;
        const inView =
          parentMiddle > thisRect.top && parentMiddle < thisRect.bottom;

        if (!inView) return;

        if (setStep) {
          justInRef.current = true;
          setStep(step);
        }
      }, 100);
    };
    parentParentElement.addEventListener("scroll", onScroll);
    onScroll();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      parentParentElement.removeEventListener("scroll", onScroll);
    };
  }, [ref, step, currentStep, setStep]);

  return (
    <section className={"step" + step}>
      <h1 ref={ref}>{title}</h1>
      {children}
      <button
        className="next"
        onClick={() => {
          if (setStep) setStep(step + 1);
        }}
      >
        Next
        <IonIcon src={arrowForward} />
      </button>
    </section>
  );
}

function WorkSpace() {
  const { workspaces, addWorkspace, activeWorkspace } = useContext(context);

  const workspace = activeWorkspace ? workspaces[activeWorkspace] : undefined;
  const step = workspace?.step ?? 0;
  const hash = workspace ? hashWorkspace(workspace) : null;

  const [maxWidth, setMaxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [layer, setLayer] = useState(0);

  const dataRef = useRef(new Uint8Array());
  const hashRef = useRef(0);

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resize = () => {
      const rect = element.getBoundingClientRect();
      setMaxWidth(rect.width * 0.5);
      setMaxHeight(rect.height * 0.75);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  const onChange = () => {
    if (!workspace) return;
    addWorkspace(workspace);
  };

  const setStep = (step: number) => {
    if (!workspace) return;
    workspace.step = Math.min(3, Math.max(0, step));
    onChange();
  };

  let ignore = false;
  useEffect(() => {
    let frameId = 0;
    const update = () => {
      frameId = window.requestAnimationFrame(update);
      const value = workspace?.client.progress?.value;
      if (value == null) document.documentElement.classList.remove("loading");
      else {
        document.documentElement.classList.add("loading");
        document.documentElement.style.setProperty("--p", String(value));
      }
    };
    update();
    return () => {
      ignore = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [workspace]);

  return (
    <div className="WorkSpace" ref={ref}>
      <div className="display">
        <WorkSpaceDisplay
          id={activeWorkspace}
          step={step}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          outputLayers={1 << layer}
          glRenderDebounce={100}
          onRender={(data, width, height) => {
            dataRef.current = data;

            if (!workspace) return;
            if (workspace.step !== 3) return;

            if (!hash) return;
            if (hashRef.current === hash) return;

            let changed = false;
            workspace.output.channels.forEach((channel) => {
              if (channel.shown != true) {
                changed = true;
                channel.shown = true;
              }
              if (channel.areas != null) {
                changed = true;
                channel.areas = null;
              }
            });
            if (changed) onChange();

            workspace.client.stop();

            (async () => {
              const result = await workspace.client.run(
                serializeWorkspace(workspace, dataRef.current),
              );
              if (ignore) return;
              hashRef.current = hash;
              workspace.output = result;
              onChange();
            })();
          }}
        />
        <div className="info">Click to enlarge</div>
      </div>
      <div className="ui">
        <nav>
          <StepNav
            title="Input"
            step={0}
            currentStep={step}
            setStep={setStep}
          />
          <StepNavSeparator lastStep={0} currentStep={step} />
          <StepNav
            title="Normalization"
            step={1}
            currentStep={step}
            setStep={setStep}
          />
          <StepNavSeparator lastStep={1} currentStep={step} />
          <StepNav
            title="Threshold"
            step={2}
            currentStep={step}
            setStep={setStep}
          />
          <StepNavSeparator lastStep={2} currentStep={step} />
          <StepNav
            title="Complete"
            step={3}
            currentStep={step}
            setStep={setStep}
          />
        </nav>
        <section>
          <StepSection
            title="Input Configuration"
            step={0}
            currentStep={step}
            setStep={setStep}
          >
            <h3>Channel Configuration</h3>
            <p>
              Try to make the image's cells bright and the background dark!
              <br />
              If your image is{" "}
              <a
                href="https://en.wikipedia.org/wiki/Immunofluorescence"
                target="_blank"
              >
                immunofluorescently dyed
              </a>
              , you won't need to do much here!
            </p>
            <WorkSpaceInputChannels
              channels={workspace?.input.channels ?? []}
              flags={USESHOWNTOGGLE | USEINVERTEDTOGGLE | USECONTRASTSLIDER}
              onChange={onChange}
            />
          </StepSection>
          <StepSection
            title="Normalization"
            step={1}
            currentStep={step}
            setStep={setStep}
          >
            <h3>Cell Identification</h3>
            <p>On average, how big a single cell is in pixels</p>
            <section>
              <span className="info">
                Cell Size: {(workspace?.input.sampleSize ?? 0) / 2}
              </span>
              <input
                type="range"
                min={0}
                max={
                  (((workspace?.input.canvas.width ?? 0) +
                    (workspace?.input.canvas.height ?? 0)) /
                    2 /
                    2) *
                  0.5
                }
                value={(workspace?.input.sampleSize ?? 0) / 2}
                onChange={(e) => {
                  if (!workspace) return;
                  workspace.input.sampleSize = e.target.valueAsNumber * 2;
                  onChange();
                }}
              />
            </section>
          </StepSection>
          <StepSection
            title="Thresholding"
            step={2}
            currentStep={step}
            setStep={setStep}
          >
            <h3>Cell Thresholding</h3>
            <p>Deciding what is and is not a cell</p>
            <WorkSpaceInputChannels
              channels={workspace?.input.channels ?? []}
              flags={USESHOWNTOGGLE | USETHRESHOLDSLIDER}
              onChange={onChange}
            />
          </StepSection>
          <StepSection
            title="Complete"
            step={3}
            currentStep={step}
            setStep={setStep}
          >
            <h3>Results</h3>
            <p>
              Lets see how many exist in each channel! Download the results{" "}
              <a
                href={
                  "data:text/plain;charset=utf-8," +
                  encodeURIComponent(
                    workspace ? encodeWorkspace(workspace) : "",
                  )
                }
                download={(workspace?.id ?? "") + ".csv"}
                target="_blank"
              >
                here
              </a>
            </p>
            <span className="warning">
              <IonIcon src={alertCircleOutline} />
              <span>
                These results could be inaccurate! Double check by hovering the
                appropriate channel to check if it selected the right cells or
                if it double counted!
              </span>
            </span>
            <WorkSpaceOutputChannels
              channels={workspace?.output?.channels ?? []}
              flags={USESHOWNTOGGLE | USECOUNT}
              onChange={onChange}
              setLayer={setLayer}
            />
          </StepSection>
        </section>
      </div>
    </div>
  );
}

export default WorkSpace;
