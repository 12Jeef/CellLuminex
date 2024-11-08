import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./App.css";

import { context } from "..";

import DropOverlay from "../common/DropOverlay";
import Files from "./Files";
import WorkSpace from "./WorkSpace";
import HeaderDefault from "../common/HeaderDefault";
import Overlay from "./Overlay";

export type AppContext = {
  layer: number;
  setLayer: (layer: number) => void;

  overlay: boolean;
  openOverlay: () => void;
  closeOverlay: () => void;
};

export const appContext = createContext({} as AppContext);

function App() {
  const { workspaces, onFiles } = useContext(context);

  const [layer, setLayer] = useState(0);
  const [overlay, setOverlay] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (Object.keys(workspaces).length <= 0) navigate("/upload");
  }, [workspaces, navigate]);

  return (
    <>
      <HeaderDefault />
      <appContext.Provider
        value={{
          layer,
          setLayer,
          overlay,
          openOverlay: () => setOverlay(true),
          closeOverlay: () => setOverlay(false),
        }}
      >
        <main className="FilesApp">
          <article>
            <WorkSpace />
            <Overlay />
            <Files />
          </article>
        </main>
      </appContext.Provider>
      <DropOverlay onInput={onFiles} />
    </>
  );
}

export default App;
