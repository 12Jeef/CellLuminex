import { useEffect, useRef } from "react";

import "./DropBox.css";

function DropBox(options: {
  onInput?: (fileList: File[]) => void;
  multiple?: boolean;
}) {
  const { onInput, multiple: _multiple } = options;
  const multiple = _multiple ?? true;

  const ref = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const button = buttonRef.current;
    if (!button) return;

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
    element.addEventListener("dragenter", onDragIn);
    element.addEventListener("dragover", onDragIn);
    element.addEventListener("dragleave", onDragOut);
    element.addEventListener("dragend", onDragOut);
    element.addEventListener("drop", onDrop);

    const onClick = () => {
      button.disabled = true;
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = multiple;
      input.addEventListener("change", (e) => {
        button.disabled = false;
        if (onInput) onInput(Array.from(input.files ?? []));
      });
      input.click();
    };
    button.addEventListener("click", onClick);

    return () => {
      element.removeEventListener("dragenter", onDragIn);
      element.removeEventListener("dragover", onDragIn);
      element.removeEventListener("dragleave", onDragOut);
      element.removeEventListener("dragend", onDragOut);
      element.removeEventListener("drop", onDrop);

      button.removeEventListener("click", onClick);
    };
  }, [ref, buttonRef, onInput, multiple]);

  return (
    <div className="DropBox" ref={ref}>
      <button ref={buttonRef}>Upload Image</button>
      <span>or drag and drop</span>
    </div>
  );
}

export default DropBox;
