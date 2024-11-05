import { useContext } from "react";

import "./App.css";

import { context } from "..";

import Header from "../common/Header";
import HeaderButton from "../common/HeaderButton";
import DropBox from "../common/DropBox";
import DropOverlay from "../common/DropOverlay";

function App() {
  const { onFiles } = useContext(context);

  return (
    <>
      <Header>
        <HeaderButton link="about">About</HeaderButton>
        <HeaderButton link="upload">Upload</HeaderButton>
        <HeaderButton link="files">Files</HeaderButton>
      </Header>
      <main className="UploadApp">
        <article>
          <DropBox onInput={onFiles} />
        </article>
      </main>
      <DropOverlay onInput={onFiles} />
    </>
  );
}

export default App;
