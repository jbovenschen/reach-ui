# @reach/slider

[![Stable release](https://img.shields.io/npm/v/@reach/window-splitter.svg)](https://npm.im/@reach/window-splitter) ![MIT license](https://badgen.now.sh/badge/license/MIT)

[Docs](https://reacttraining.com/reach-ui/window-splitter) | [Source](https://github.com/reach/reach-ui/tree/master/packages/window-splitter) | [WAI-ARIA](https://www.w3.org/TR/wai-aria-practices-1.1/#windowsplitter)

A UI Widget where the user moves a separator of two panes between a
given range. A Window Splitter has a separator that can be moved
between an allowed range.

When the focus is on the seperator the user can increment and decrement
the position of the seperator.

```jsx
import {
  WindowSplitter,
  WindowSplitterContainer,
  WindowSplitterPrimaryPane,
  WindowSplitterSecondaryPane,
  WindowSplitterSeparator,
} from "@reach/window-splitter";
import "@reach/window-splitter/styles.css";

function Example() {
  return (
    <WindowSplitter min={0} max={100} step={10}>
      <div>Primary pane</div>
      <div>Secondary pane</div>
    </WindowSplitter>
  );
}

function ExampleComposed() {
  return (
    <WindowSplitterContainer>
      <WindowSplitterPrimaryPane>
        <div>Primary pane</div>
      </WindowSplitterPrimaryPane>
      <WindowSplitterSeparator />
      <WindowSplitterSecondaryPane>
        <div>Secondary pane</div>
      </WindowSplitterSecondaryPane>
    </WindowSplitterContainer>
  );
}
```
