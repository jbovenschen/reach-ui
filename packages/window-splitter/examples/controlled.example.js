import React, { useState, useRef } from "react";
import {
  WindowSplitterContainer,
  WindowSplitterPrimaryPane,
  WindowSplitterSeparator,
  WindowSplitterSecondaryPane,
  WINDOW_SPLITTER_ORIENTATION_VERTICAL,
} from "@reach/window-splitter";
import { useTooltip, TooltipPopup } from "@reach/tooltip";
import "@reach/window-splitter/styles.css";
import "@reach/tooltip/styles.css";

let name = "Controlled";

function Example() {
  const [value, setValue] = useState(50);

  const handleRef = useRef();
  const [trigger, tooltip] = useTooltip();

  return (
    <WindowSplitterContainer
      value={value}
      onChange={setValue}
      orientation={WINDOW_SPLITTER_ORIENTATION_VERTICAL}
      style={{ height: 300 }}
    >
      <WindowSplitterPrimaryPane>
        <strong>Primary pane</strong>
      </WindowSplitterPrimaryPane>
      <WindowSplitterSeparator ref={handleRef} {...trigger} />
      <TooltipPopup
        {...tooltip}
        label={`Position: ${Number(value).toFixed(1)}%`}
      />
      <WindowSplitterSecondaryPane>
        <strong>Secondary pane</strong>
      </WindowSplitterSecondaryPane>
    </WindowSplitterContainer>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "WindowSplitter" };
