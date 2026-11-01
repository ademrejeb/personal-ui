import { forwardRef, useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useFieldControl } from "./field-utils";
import type { ControlSize } from "../../types";

export interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "defaultValue" | "onChange" | "size" | "min" | "max" | "step"
  > {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: ControlSize;
  invalid?: boolean;
  /** Show increment/decrement controls. */
  stepper?: boolean;
}

const toDisplay = (value: number | null | undefined): string =>
  value === null || value === undefined || Number.isNaN(value) ? "" : String(value);

function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
}

/** Numeric input with validation, clamping, and optional stepper controls. */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    className,
    size = "md",
    invalid,
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    step = 1,
    stepper = true,
    id,
    disabled,
    required,
    onBlur,
    "aria-describedby": describedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, disabled, required, "aria-describedby": describedBy });
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(() => toDisplay(defaultValue));
  const display = isControlled ? toDisplay(value) : internal;

  const commit = (next: string) => {
    if (!isControlled) setInternal(next);
    if (next.trim() === "") {
      onValueChange?.(null);
      return;
    }
    const parsed = Number(next);
    if (!Number.isNaN(parsed)) onValueChange?.(parsed);
  };

  const stepBy = (delta: number) => {
    const base = Number(display);
    const current = Number.isNaN(base) ? 0 : base;
    const next = clamp(Number((current + delta).toFixed(6)), min, max);
    commit(String(next));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      stepBy(step);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      stepBy(-step);
    }
  };

  return (
    <div className={cx("ui-number-input", className)} data-size={size}>
      {stepper ? (
        <button
          type="button"
          className="ui-number-input__stepper"
          onClick={() => stepBy(-step)}
          disabled={field.disabled || (min !== undefined && Number(display) <= min)}
          aria-label="Decrease value"
          tabIndex={-1}
        >
          <Minus size={14} aria-hidden="true" />
        </button>
      ) : null}
      <input
        ref={ref}
        type="number"
        inputMode="decimal"
        id={field.id}
        value={display}
        min={min}
        max={max}
        step={step}
        disabled={field.disabled || undefined}
        required={field.required || undefined}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        data-size={size}
        data-invalid={field.invalid || undefined}
        className="ui-input ui-control ui-number-input__control"
        onChange={(event) => commit(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          if (event.target.value !== "" && !Number.isNaN(Number(event.target.value))) {
            const clamped = clamp(Number(event.target.value), min, max);
            commit(String(clamped));
          }
          onBlur?.(event);
        }}
        {...rest}
      />
      {stepper ? (
        <button
          type="button"
          className="ui-number-input__stepper"
          onClick={() => stepBy(step)}
          disabled={field.disabled || (max !== undefined && Number(display) >= max)}
          aria-label="Increase value"
          tabIndex={-1}
        >
          <Plus size={14} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});
NumberInput.displayName = "NumberInput";
