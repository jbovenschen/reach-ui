/**
 * Welcome to @reach/window-splitter!
 *
 * A UI Widget where the user moves a separator of two panes between a
 * given range. A Window Splitter has a separator that can be moved
 * between an allowed range.
 *
 * When the focus is on the seperator the user can increment and decrement
 * the position of the seperator.
 *
 * @see Docs ...
 * @see Source https://github.com/reach/reach-ui/tree/master/packages/window-splitter
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#windowsplitter
 */

import React, {
  useContext,
  Children,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
  forwardRef,
} from "react";
import PropTypes from "prop-types";
import {
  createNamedContext,
  useForkedRef,
  forwardRefWithAs,
  wrapEvent,
} from "@reach/utils";

export type WindowSplitterVariant = "variable" | "fixed";

export type WindowSplitterOrientation = "horizontal" | "vertical";

export const WINDOW_SPLITTER_VARIANT_VARIABLE: WindowSplitterVariant =
  "variable";
export const WINDOW_SPLITTER_VARIANT_FIXED: WindowSplitterVariant = "fixed";

export const WINDOW_SPLITTER_ORIENTATION_HORIZONTAL: WindowSplitterOrientation =
  "horizontal";
export const WINDOW_SPLITTER_ORIENTATION_VERTICAL: WindowSplitterOrientation =
  "vertical";

const WindowSplitterContext = createNamedContext<IWindowSplitterContext>(
  "WindowSplitterContext",
  {} as IWindowSplitterContext
);

const useWindowSplitterContext = () => useContext(WindowSplitterContext);

// These proprtypes are shared between the composed Window and the
// simplified WindowSplitter components.
const windowSplitterPropTypes = {
  defaultValue: PropTypes.number,
  getValueText: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  orientation: PropTypes.oneOf([
    WINDOW_SPLITTER_ORIENTATION_HORIZONTAL,
    WINDOW_SPLITTER_ORIENTATION_VERTICAL,
  ]),
  value: PropTypes.number,
  onChange: PropTypes.func,
};

////////////////////////////////////////////////////////////////////////////////

/**
 * WindowSplitter
 *
 * @see Docs ...
 */

export const WindowSplitter = forwardRef<HTMLDivElement, WindowSplitterProps>(
  function WindowSplitter({ children, ...props }, forwardedRef) {
    const [primary, secondary] = Children.toArray(children);

    return (
      <WindowSplitterContainer ref={forwardedRef} {...props}>
        <WindowSplitterPrimaryPane>{primary}</WindowSplitterPrimaryPane>
        <WindowSplitterSeparator />
        <WindowSplitterSecondaryPane>{secondary}</WindowSplitterSecondaryPane>
      </WindowSplitterContainer>
    );
  }
);

/**
 * @see Docs ...
 */
export type WindowSplitterProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "children"
> & {
  /**
   * `WindowSplitter` requires 2 children, to fill a primary and secondary pane.
   *
   * @see Docs ...
   */
  children: [React.ReactNode, React.ReactNode];
  /**
   * The defaultValue is used to set an initial value for an uncontrolled
   * window splitter.
   *
   * @see Docs ...
   */
  defaultValue?: number;
  /**
   * The value is used to set the an value for an controlled window splitter
   *
   * @see Docs..
   */
  value?: number;
  /**
   * A function used to set a human readable value text based on the separator
   * position
   *
   * @see Docs ...
   */
  getValueText?(value: number): string;
  /**
   * The maximum value of the window splitter. Defaults to `100`.
   *
   * @see Docs ...
   */
  max?: number;
  /**
   * The minimu, value of the window splitter. Defaults to `0`.
   *
   * @see Docs ...
   */
  min?: number;
  /**
   * Callback which fires when the position of the separator changes.
   * When the `value` props is set, the `WindowSplitter` becaomes controlled
   * and the `onChange` prop must be used to update the value in response to
   * the user interaction
   *
   * @see Docs ...
   */
  onChange?(newValue: number): void;
  /**
   * Set the window splitter in horizontal or vertical mode.
   *
   * @see Docs ...
   */
  orientation?: WindowSplitterOrientation;
  /**
   * Set the window splitter in fixed or variable mode.
   *
   * @see Docs ...
   */
  variant?: WindowSplitterVariant;
  /**
   * The step attribute is a number which specifies the granularity that the
   * value must adhere to as it changes. Step sets minimum intervals of change,
   * creating a "snap" effect when the seperator is moved along the track.
   *
   * @see Docs ...
   */
  step?: number;
};

if (__DEV__) {
  WindowSplitter.displayName = "WindowSplitter";
  WindowSplitter.propTypes = {
    ...windowSplitterPropTypes,
    // NOTE there seems to be now way to type a tuple with typescript, without
    // letting the component proptypes break.
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * WindowSplitterContainer
 *
 * The outer container for the window splitter. This is a low level component.
 * Use this if you need control over either styles or rendering of the window
 * splitter inner components.
 *
 * @see Docs ...
 */
export const WindowSplitterContainer = forwardRefWithAs<WindowProps, "div">(
  function WindowSplitterContainer(
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-valuetext": ariaValueText,
      defaultValue,
      value: controlledValue,
      getValueText,
      max = 100,
      min = 0,
      step: stepProp,
      orientation = WINDOW_SPLITTER_ORIENTATION_HORIZONTAL,
      variant = WINDOW_SPLITTER_VARIANT_VARIABLE,
      onChange,
      children,
      ...props
    },
    forwardedRef
  ) {
    // Verify that the component is controlled or uncontrolled during it's lifecycle
    const { current: isControlled } = useRef(controlledValue != null);

    const separatorRef: SeparatorRef = useRef(null);
    const windowRef: WindowRef = useRef(null);
    const ref = useForkedRef(windowRef, forwardedRef);

    const [internalValue, setValue] = useState(
      defaultValue || min + (max - min) / 2
    );
    const [isPointerDown, setPointerDown] = useState(false);

    const _value = isControlled ? (controlledValue as number) : internalValue;
    const value = getAllowedValue(_value, min, max);
    const isHorizontal = orientation == WINDOW_SPLITTER_ORIENTATION_HORIZONTAL;
    const isVariable = variant == WINDOW_SPLITTER_VARIANT_VARIABLE;
    const step = stepProp || 1;

    const updateValue = useCallback(
      function updateValue(newValue) {
        if (!isControlled) {
          setValue(newValue);
        }

        if (onChange) {
          onChange(newValue);
        }
      },
      [onChange, isControlled]
    );

    const getNewValueFromPointer = useCallback(
      (event: React.PointerEvent | PointerEvent) => {
        if (windowRef.current) {
          const {
            left,
            width,
            height,
          } = windowRef.current.getBoundingClientRect();

          const { clientX, clientY } = event;

          const diff = isHorizontal ? clientX - left : clientY;
          const percent = diff / (isHorizontal ? width : height);
          let newValue = percentToValue(percent, min, max);

          if (step) {
            roundValueToStep(newValue, step);
          }

          newValue = getAllowedValue(newValue, min, max);
          return newValue;
        }

        return null;
      },
      [isHorizontal, max, min, step]
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      let flag = false;
      const keyStep = stepProp || (max - min) / 100;
      let newValue = value;

      switch (event.key) {
        case "ArrowLeft":
          if (isHorizontal && isVariable) {
            newValue = isVariable ? value - keyStep : min;
            flag = true;
          }
          break;
        case "ArrowRight":
          if (isHorizontal && isVariable) {
            newValue = isVariable ? value + keyStep : max;
            flag = true;
          }
          break;
        case "ArrowUp":
          if (!isHorizontal && isVariable) {
            newValue = isVariable ? value - keyStep : min;
            flag = true;
          }
          break;
        case "ArrowDown":
          if (!isHorizontal && isVariable) {
            newValue = isVariable ? value + keyStep : max;
            flag = true;
          }
          break;
        case "Home":
          newValue = min;
          flag = true;
          break;
        case "End":
          newValue = max;
          flag = true;
          break;
        case "F6":
          // TODO Toggle between focusable 'panes'.
          // Find any 'focusable' items in a window.
          // If a user pressed F6 we should switch to the other pane.
          break;
        default:
          return;
      }

      if (flag) {
        event.preventDefault();
        newValue = roundValueToStep(newValue, keyStep);
        newValue = getAllowedValue(newValue, min, max);
        updateValue(newValue);
      }
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (separatorRef.current) {
        setPointerDown(true);

        const newValue = getNewValueFromPointer(event);
        separatorRef.current.setPointerCapture &&
          separatorRef.current.setPointerCapture(event.pointerId);

        if (newValue != null && newValue !== value) {
          updateValue(newValue);
        }

        separatorRef.current.focus();
      }
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
      if (separatorRef.current && event.pointerId) {
        separatorRef.current.releasePointerCapture &&
          separatorRef.current.releasePointerCapture(event.pointerId);
      }

      setPointerDown(false);
    };

    const { ref: x, ...separatorDimensions } = useDimensions(separatorRef);

    const valueText = getValueText ? getValueText(value) : ariaValueText;

    const primaryPaneStyle = isHorizontal
      ? {
          width: `calc(${value}% - ${separatorDimensions.width}px / 2)`,
          height: "100%",
        }
      : {
          width: "100%",
          height: `calc(${value}% - ${separatorDimensions.height}px / 2)`,
        };

    const ctx: IWindowSplitterContext = {
      ariaLabel,
      ariaLabelledBy,
      orientation,
      separatorRef,
      onHandlePointerDown: handlePointerDown,
      onHandlePointerUp: handlePointerUp,
      onHandleKeyDown: handleKeyDown,
      windowSplitterMax: max,
      windowSplitterMin: min,
      windowSplitterStep: step,
      primaryPaneStyle,
      value,
      valueText,
    };

    const dataAttributes = makeDataAttributes("window-splitter", {
      orientation,
    });

    useEffect(() => {
      if (!isVariable && !isPointerDown) {
        let newValue = roundValueToClosest(value, max, min);

        if (newValue !== value) {
          updateValue(newValue);
        }
      }
    }, [updateValue, value, max, min, isVariable, isPointerDown]);

    useEffect(() => {
      const handlePointerMove = (event: PointerEvent) => {
        const newValue = getNewValueFromPointer(event);

        if (newValue !== value) {
          updateValue(newValue);
        }
      };

      if (isPointerDown) {
        document.addEventListener("pointermove", handlePointerMove);
      }

      return () => {
        document.removeEventListener("pointermove", handlePointerMove);
      };
    }, [isVariable, getNewValueFromPointer, isPointerDown, updateValue, value]);

    return (
      <WindowSplitterContext.Provider value={ctx}>
        <div {...props} {...dataAttributes} ref={ref}>
          {children}
        </div>
      </WindowSplitterContext.Provider>
    );
  }
);

/**
 * @see Docs...
 */
export type WindowProps = Omit<WindowSplitterProps, "children"> & {
  /**
   * `Window` expects one of each `PrimaryPane`, SecondaryPane and Seperator
   * components as its children.
   *
   * @see Docs ...
   */
  children: React.ReactNode;
};

if (__DEV__) {
  WindowSplitterContainer.displayName = "Window";
  WindowSplitterContainer.propTypes = {
    ...windowSplitterPropTypes,
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Separator
 *
 * The separator which distributes the available space between the
 * primary and secondary pane.
 *
 * @see Docs ...
 */

export const WindowSplitterSeparator = forwardRefWithAs<
  WindowSplitterSeparatorProps,
  "hr"
>(function WindowSplitterSeparator(
  { as: Comp = "hr", onKeyDown, onPointerDown, onPointerUp, ...props },
  forwardedRef
) {
  const {
    ariaLabel,
    ariaLabelledBy,
    orientation,
    onHandleKeyDown,
    onHandlePointerUp,
    onHandlePointerDown,
    value,
    windowSplitterMax,
    windowSplitterMin,
    separatorRef,
    valueText,
  } = useWindowSplitterContext();

  const dataAttributes = makeDataAttributes("window-splitter-separator", {
    orientation,
  });

  const ref = useForkedRef(separatorRef, forwardedRef);

  return (
    <Comp
      {...props}
      role="separator"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-valuenow={value}
      aria-valuemin={windowSplitterMin}
      aria-valuemax={windowSplitterMax}
      aria-valuetext={valueText}
      {...dataAttributes}
      onKeyDown={wrapEvent(onKeyDown, onHandleKeyDown)}
      onPointerDown={wrapEvent(onPointerDown, onHandlePointerDown)}
      onPointerUp={wrapEvent(onPointerDown, onHandlePointerUp)}
      ref={ref}
      tabIndex={0}
    />
  );
});

type WindowSplitterSeparatorProps = {};

if (__DEV__) {
  WindowSplitterSeparator.displayName = "Separator";
  WindowSplitterSeparator.propTypes = {};
}

////////////////////////////////////////////////////////////////////////////////

/**
 * PrimaryPane
 *
 * @see Docs ...
 */
export const WindowSplitterPrimaryPane = forwardRefWithAs<
  WindowSplitterPrimaryPaneProps,
  "div"
>(function WindowSplitterPrimaryPane(
  { as: Comp = "div", children, style = {}, ...props },
  forwardedRef
) {
  const { orientation, primaryPaneStyle } = useWindowSplitterContext();

  const dataAttributes = makeDataAttributes("window-splitter-primary-pane", {
    orientation,
  });

  return (
    <Comp
      ref={forwardedRef}
      style={{ ...primaryPaneStyle, ...style }}
      {...props}
      {...dataAttributes}
    >
      {children}
    </Comp>
  );
});

/**
 * `PrimaryPane` accepts any prop that a HTML element accepts
 *
 * @see Docs ...
 */
export type WindowSplitterPrimaryPaneProps = React.HTMLAttributes<
  HTMLDivElement
> & {
  children: React.ReactNode;
};

if (__DEV__) {
  WindowSplitterPrimaryPane.displayName = "PrimaryPane";
  WindowSplitterPrimaryPane.propTypes = {
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * SecondaryPane
 *
 * @see Docs ...
 */
export const WindowSplitterSecondaryPane = forwardRefWithAs<
  WindowSplitterSecondaryPaneProps,
  "div"
>(function WindowSplitterSecondaryPane(
  { children, style = {}, ...props },
  forwardedRef
) {
  const { orientation } = useWindowSplitterContext();

  const dataAttributes = makeDataAttributes("window-splitter-secondary-pane", {
    orientation,
  });

  return (
    <div ref={forwardedRef} style={{ ...style }} {...dataAttributes} {...props}>
      {children}
    </div>
  );
});

/**
 * `SecondaryPane` accepts any prop that a HTML element accepts
 *
 * @see Docs ...
 */
export type WindowSplitterSecondaryPaneProps = React.HTMLAttributes<
  HTMLDivElement
> & {
  children: React.ReactNode;
};

if (__DEV__) {
  WindowSplitterSecondaryPane.displayName = "SecondaryPane";
  WindowSplitterSecondaryPane.propTypes = {
    children: PropTypes.node,
  };
}

////////////////////////////////////////////////////////////////////////////////
function getAllowedValue(val: number, min: number, max: number) {
  return val > max ? max : val < min ? min : val;
}

function makeDataAttributes(
  component = "window-splitter",
  {
    orientation,
  }: {
    orientation: WindowSplitterOrientation;
  }
) {
  return {
    [`data-reach-${component}`]: "",
    [`data-reach-${component}-orientation`]: orientation,
  };
}

function makeValuePrecise(value: number, step: number) {
  const stepDecimalPart = step.toString().split(".")[1];
  const stepPrecision = stepDecimalPart ? stepDecimalPart.length : 0;
  return Number(value.toFixed(stepPrecision));
}

function percentToValue(percent: number, min: number, max: number) {
  return (max - min) * percent + min;
}

function roundValueToStep(value: number, step: number) {
  return makeValuePrecise(Math.round(value / step) * step, step);
}

function roundValueToClosest(value: number, min: number, max: number) {
  return Math.abs(min - value) < Math.abs(max - value) ? min : max;
}

function useDimensions(ref: React.RefObject<HTMLElement | null>) {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });
  // Many existing `useDimensions` type hooks will use `getBoundingClientRect`
  // getBoundingClientRect does not work here when borders are applied.
  // getComputedStyle is not as performant so we may want to create a utility to
  // check for any conflicts with box sizing first and only use
  // `getComputedStyle` if neccessary.
  /* const { width, height } = ref.current
    ? ref.current.getBoundingClientRect()
    : 0; */

  useLayoutEffect(() => {
    if (ref.current) {
      const { height: _newHeight, width: _newWidth } = window.getComputedStyle(
        ref.current
      );
      let newHeight = parseFloat(_newHeight);
      let newWidth = parseFloat(_newWidth);

      if (newHeight !== height || newWidth !== width) {
        setDimensions({ height: newHeight, width: newWidth });
      }
    }
  }, [ref, width, height]);
  return { ref, width, height };
}

////////////////////////////////////////////////////////////////////////////////
// Types

type SeparatorRef = React.RefObject<HTMLDivElement | null>;
type WindowRef = React.RefObject<HTMLDivElement | null>;

interface IWindowSplitterContext {
  ariaLabel: string | undefined;
  ariaLabelledBy: string | undefined;
  orientation: WindowSplitterOrientation;
  onHandleKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onHandlePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onHandlePointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  primaryPaneStyle: React.CSSProperties;
  value: number;
  valueText: string | undefined;
  windowSplitterMin: number;
  windowSplitterMax: number;
  windowSplitterStep: number;
  separatorRef: SeparatorRef;
}
