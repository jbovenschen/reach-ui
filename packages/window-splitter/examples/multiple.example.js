import React from "react";
import {
  WindowSplitter,
  WINDOW_SPLITTER_ORIENTATION_VERTICAL,
} from "@reach/window-splitter";
import "@reach/window-splitter/styles.css";

let name = "Multiple";

function Example() {
  return (
    <WindowSplitter style={{ height: "400px", width: "100%" }}>
      <strong>Primary pane</strong>
      <WindowSplitter
        orientation={WINDOW_SPLITTER_ORIENTATION_VERTICAL}
        style={{ width: "100%" }}
      >
        <WindowSplitter style={{ height: "100%" }}>
          <strong>Secondary pane</strong>
          <strong>Tertiary pane</strong>
        </WindowSplitter>
        <strong>Quaternary pane</strong>
      </WindowSplitter>
    </WindowSplitter>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "WindowSplitter" };
