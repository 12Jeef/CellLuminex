import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./App.css";

import { context } from "..";

import DropOverlay from "../common/DropOverlay";
import Files from "./Files";
import WorkSpace from "./WorkSpace";
import HeaderDefault from "../common/HeaderDefault";

function App() {
  const { workspaces, onFiles } = useContext(context);

  const navigate = useNavigate();

  useEffect(() => {
    if (Object.keys(workspaces).length <= 0) navigate("/upload");
  }, [workspaces, navigate]);

  return (
    <>
      <HeaderDefault />
      <main className="FilesApp">
        <article>
          <WorkSpace />
          <Files />
        </article>
      </main>
      <DropOverlay onInput={onFiles} />
    </>
  );
}

export default App;
