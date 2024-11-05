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
      <main className="IndexApp">
        <article>
          <section>
            <h1>
              <span>Fluorescent</span>
              <br />
              Cell Calculator
            </h1>
            <p>100% Free and Automatic</p>
          </section>
          <section>
            <DropBox onInput={onFiles} />
          </section>
          <div className="credit">
            Made by <a href="https://12jeef.github.io/" target="_blank">2023 SSSIP Student</a>
          </div>
        </article>
      </main>
      <DropOverlay onInput={onFiles} />
    </>
  );
}

export default App;