import React from "react";
import {
  WindowSplitter,
  WINDOW_SPLITTER_VARIANT_FIXED,
} from "@reach/window-splitter";
import "@reach/window-splitter/styles.css";

let name = "Fixed";

function Example() {
  return (
    <WindowSplitter variant={WINDOW_SPLITTER_VARIANT_FIXED}>
      <strong>Primary pane</strong>
      <strong>Secondary pane</strong>
    </WindowSplitter>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "WindowSplitter" };
