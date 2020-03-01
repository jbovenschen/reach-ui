import React from "react";
import { WindowSplitter } from "@reach/window-splitter";
import "@reach/window-splitter/styles.css";

let name = "Basic";

function Example() {
  return (
    <WindowSplitter>
      <strong>Primary pane</strong>
      <strong>Secondary pane</strong>
    </WindowSplitter>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "WindowSplitter" };
