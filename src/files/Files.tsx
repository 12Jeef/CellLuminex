import { useContext } from "react";

import { Workspace } from "../types";

import "./Files.css";

import { context } from "..";

import File from "./File";

function Files() {
  const { workspaces } = useContext(context);

  return (
    <div className="Files">
      {Object.keys(workspaces)
        .sort(
          (idA, idB) =>
            (workspaces[idA] as Workspace).time -
            (workspaces[idB] as Workspace).time,
        )
        .map((id) => (
          <File key={id} id={id} />
        ))}
    </div>
  );
}

export default Files;
