import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./App.css";

import { context } from "..";

import Header from "../common/Header";
import HeaderButton from "../common/HeaderButton";
import DropOverlay from "../common/DropOverlay";
import Files from "./Files";
import WorkSpace from "./WorkSpace";

function App() {
  const { workspaces, onFiles } = useContext(context);

  const navigate = useNavigate();

  useEffect(() => {
    if (Object.keys(workspaces).length <= 0) navigate("/upload");
  }, [workspaces, navigate]);

  return (
    <>
      <Header>
        <HeaderButton link="about">About</HeaderButton>
        <HeaderButton link="upload">Upload</HeaderButton>
        <HeaderButton link="files">Files</HeaderButton>
      </Header>
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
