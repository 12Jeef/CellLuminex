import { useContext } from "react";

import "./App.css";

import { context } from "..";

import DropBox from "../common/DropBox";
import DropOverlay from "../common/DropOverlay";
import HeaderDefault from "../common/HeaderDefault";

function App() {
  const { onFiles } = useContext(context);

  return (
    <>
      <HeaderDefault />
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
