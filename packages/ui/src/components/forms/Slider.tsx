import {
  forwardRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utilities/cx";
import { useFieldControl } from "./field-utils";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "size"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: "sm" | "md";
  /** Render the current value beside the slider. */
  showValue?: boolean;
  /** Custom value formatter for display and `aria-valuetext`. */
  formatValue?: (value: number) => ReactNode;
}

/** Single-value range slider built on the native `input[type=range]`. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    className,
    size = "md",
    value,
    defaultValue = 0,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    showValue = false,
    formatValue,
    id,
    disabled,
    "aria-describedby": describedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, disabled, "aria-describedby": describedBy });
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? value : internal;

  const range = max - min;
  const percent = range === 0 ? 0 : ((current - min) / range) * 100;
  const style = { "--ui-slider-value": `${percent}%` } as CSSProperties;
  const text = formatValue ? String(formatValue(current)) : undefined;

  return (
    <div className={cx("ui-slider", `ui-slider--${size}`, className)} style={style} data-disabled={field.disabled || undefined}>
      <input
        ref={ref}
        type="range"
        id={field.id}
        value={current}
        min={min}
        max={max}
        step={step}
        disabled={field.disabled || undefined}
        aria-describedby={field.describedBy}
        aria-valuetext={text}
        className="ui-slider__input"
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!isControlled) setInternal(next);
          onValueChange?.(next);
        }}
        {...rest}
      />
      {showValue ? <output className="ui-slider__value">{text ?? current}</output> : null}
    </div>
  );
});
Slider.displayName = "Slider";
