import { useContext } from "react";

import "./App.css";

import { context } from "..";

import Header from "../common/Header";
import HeaderButton from "../common/HeaderButton";
import DropOverlay from "../common/DropOverlay";
import Logo from "../common/Logo";

function App() {
  const { onFiles } = useContext(context);

  return (
    <>
      <Header>
        <HeaderButton link="about">About</HeaderButton>
        <HeaderButton link="upload">Upload</HeaderButton>
        <HeaderButton link="files">Files</HeaderButton>
      </Header>
      <main className="AboutApp">
        <article>
          <Logo />
          <h3>Fluorescent Cell Staining Counter</h3>
          <p>
            Here's what this app does: count cell bodies for you! Built
            specifically around the SSSIP program at Stanford, it is able to
            identify with 90% accuracy cell bodies stained fluorescently
          </p>
          <p>
            This outshines any traditional method of purely manual counting,
            such as with{" "}
            <a href="https://imagej.net/ij/" target="_blank">
              ImageJ
            </a>
            , automating the process<span className="asterix">*</span>
          </p>
          <p>
            <span className="asterix">
              It's not fully automated, but performs well
            </span>
          </p>
          <h3>How does this work?</h3>
          <p>
            The script first performs a simple filter over your image, boosting
            contrast and hiding or showing the RGB channels
          </p>
          <p>
            Next, the script performs a brightness boosting algorithm by looking
            within a neighborhood double the size of a typical cell that you
            specify
          </p>
          <p>
            Third, the script performs a thresholding pass to prepare the image
            for the final step
          </p>
          <p>
            Finally, the script does a flood-fill pass over the entire image,
            scrubbing out all the cell bodies
          </p>
          <p>
            Interested in how this was made? Check out the{" "}
            <a href="https://github.com/12Jeef/CellLuminex" target="_blank">
              github repository
            </a>{" "}
            for the source code!
          </p>
          <h3>Why was this made?</h3>
          <p>
            Well, when I participated in SSSIP in 2023, we were provided the
            same task: count transfection efficiency of a
            immunofluorescently-dyed image. All other three lab groups manually
            counted. I was lab lead, and being lazy, wrote a python program that
            performed just steps 3 and 4 of the process above. It was accurate
            enough for the time, but I wanted to develop the algorithm further.
            And here we are!
          </p>
          <h3>Anything else?</h3>
          <p>
            Interested in what I've done? Check out{" "}
            <a href="https://12jeef.github.io/">my website</a> for more cool
            projects I've done!
          </p>
        </article>
      </main>
      <DropOverlay onInput={onFiles} />
    </>
  );
}

export default App;
