import { StrictMode, createContext, useState } from "react";
import { createRoot } from "react-dom/client";

import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { Workspace, Workspaces } from "./types";

import { clampCanvas, deepCopy, getCanvasFromFile, jargon } from "./util";

import { Client } from "./worker/client";

import "./index.css";

import ErrorElement from "./common/ErrorElement";
import IndexApp from "./index/App";
import FilesApp from "./files/App";
import UploadApp from "./upload/App";
import AboutApp from "./about/App";

export type Context = {
  workspaces: Workspaces;
  onFiles: (files: File[]) => void;
  addWorkspace: (workspace: Workspace) => boolean;
  removeWorkspace: (id: string) => boolean;

  activeWorkspace: string | null;
  setActiveWorkspace: (id: string) => void;
};

export const context = createContext<Context>({} as Context);

const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexApp />,
    errorElement: <ErrorElement />,
  },
  {
    path: "/files",
    element: <FilesApp />,
    errorElement: <ErrorElement />,
  },
  {
    path: "/upload",
    element: <UploadApp />,
    errorElement: <ErrorElement />,
  },
  {
    path: "/about",
    element: <AboutApp />,
    errorElement: <ErrorElement />,
  },
]);

function Main() {
  const [workspaces, setWorkspaces] = useState<Workspaces>({});
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);

  const onFiles = async (files: File[]) => {
    await Promise.all(
      files.map(async (file) => {
        const canvases = await getCanvasFromFile(file);
        canvases.forEach((canvas, i) => {
          addWorkspace({
            id: file.name + "-" + i + "-" + jargon(64),
            time: Date.now(),

            step: 0,

            input: {
              file,
              canvas,
              smallCanvas: clampCanvas(canvas),

              channels: new Array(3).fill(null).map((_, i) => ({
                inverted: false,
                shown: true,
                contrast: 1,
                threshold: [0.7, 0.5, 0.4][i],
              })),

              sampleSize: 125,
            },

            output: {
              channels: new Array(3 + 3 + 1)
                .fill(null)
                .map((_) => ({ shown: true })),
            },

            client: new Client(),
          });
        });
      }),
    );
    const ids = Object.keys(workspaces);
    if (ids.length <= 0) {
      setActiveWorkspace(null);
      router.navigate("/upload");
      return;
    }
    ids.sort(
      (idA, idB) =>
        (workspaces[idA] as Workspace).time -
        (workspaces[idB] as Workspace).time,
    );
    setActiveWorkspace(ids.at(-1) as string);
    router.navigate("/files");
  };
  const addWorkspace = (workspace: Workspace) => {
    if (workspaces[workspace.id] !== workspace)
      workspaces[workspace.id]?.client.stop();
    workspaces[workspace.id] = workspace;
    setWorkspaces(deepCopy(workspaces));
    return true;
  };
  const removeWorkspace = (id: string) => {
    if (!(id in workspaces)) return false;
    workspaces[id]?.client.stop();
    delete workspaces[id];
    setWorkspaces(deepCopy(workspaces));
    return true;
  };

  return (
    <StrictMode>
      <context.Provider
        value={{
          workspaces,
          onFiles,
          addWorkspace,
          removeWorkspace,

          activeWorkspace,
          setActiveWorkspace,
        }}
      >
        <div id="loading"></div>
        <RouterProvider router={router} />
      </context.Provider>
    </StrictMode>
  );
}

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<Main />);
