import React from "react";
import {
  WindowSplitter,
  WINDOW_SPLITTER_ORIENTATION_VERTICAL,
} from "@reach/window-splitter";
import "@reach/window-splitter/styles.css";

let name = "Vertical";

function Example() {
  return (
    <WindowSplitter
      orientation={WINDOW_SPLITTER_ORIENTATION_VERTICAL}
      style={{ height: 200 }}
    >
      <strong>Primary pane</strong>
      <strong>Secondary pane</strong>
    </WindowSplitter>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "WindowSplitter" };
