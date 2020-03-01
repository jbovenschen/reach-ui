import React from "react";
import {
  WindowSplitter,
  WINDOW_SPLITTER_ORIENTATION_VERTICAL,
} from "@reach/window-splitter";
import "@reach/window-splitter/styles.css";

let name = "Multiple";

function Example() {
  return (
    <WindowSplitter style={{ height: "400px" }}>
      <strong>Primary pane</strong>
      <WindowSplitter orientation={WINDOW_SPLITTER_ORIENTATION_VERTICAL}>
        <strong>Secondary pane</strong>
        <WindowSplitter style={{ height: "100%" }}>
          <strong>Tertiary pane</strong>
          <strong>Quaternary pane</strong>
        </WindowSplitter>
      </WindowSplitter>
    </WindowSplitter>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "WindowSplitter" };
