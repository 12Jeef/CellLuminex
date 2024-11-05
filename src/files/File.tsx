import { useContext, useEffect, useRef } from "react";

import "./File.css";

import { copyCanvas } from "../util";

import { context } from "..";

function File(options: { id: string }) {
  const { id } = options;

  const { workspaces, activeWorkspace, setActiveWorkspace } =
    useContext(context);

  const ref = useRef<HTMLButtonElement | null>(null);

  const workspace = workspaces[id];

  useEffect(() => {
    const button = ref.current;
    if (!button) return;
    button.innerHTML = "";
    if (!workspace) return;
    button.appendChild(copyCanvas(workspace.input.smallCanvas));
  }, [workspace, ref]);

  return (
    <button
      className={"File" + (id === activeWorkspace ? " this" : "")}
      ref={ref}
      onClick={() => {
        if (workspace) setActiveWorkspace(id);
      }}
    ></button>
  );
}

export default File;
