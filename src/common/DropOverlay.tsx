import { useEffect, useRef } from "react";

import "./DropOverlay.css";

function DropOverlay(options: { onInput?: (fileList: File[]) => void }) {
  const { onInput } = options;

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onDragIn = (e: DragEvent) => {
      e.preventDefault();

      element.classList.add("active");
    };
    const onDragOut = (e: DragEvent) => {
      e.preventDefault();

      element.classList.remove("active");
    };
    const onDrop = (e: DragEvent) => {
      onDragOut(e);

      e.preventDefault();

      if (onInput) onInput(Array.from(e.dataTransfer?.files ?? []));
    };
    document.body.addEventListener("dragenter", onDragIn);
    document.body.addEventListener("dragover", onDragIn);
    document.body.addEventListener("dragleave", onDragOut);
    document.body.addEventListener("dragend", onDragOut);
    document.body.addEventListener("drop", onDrop);
    return () => {
      document.body.removeEventListener("dragenter", onDragIn);
      document.body.removeEventListener("dragover", onDragIn);
      document.body.removeEventListener("dragleave", onDragOut);
      document.body.removeEventListener("dragend", onDragOut);
      document.body.removeEventListener("drop", onDrop);
    };
  }, [ref, onInput]);

  return (
    <div className="DropOverlay" ref={ref}>
      <h1>Drop Image</h1>
      <div className="t l"></div>
      <div className="t r"></div>
      <div className="b l"></div>
      <div className="b r"></div>
    </div>
  );
}

export default DropOverlay;
