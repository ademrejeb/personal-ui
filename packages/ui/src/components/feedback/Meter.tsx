import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type MeterTone = "neutral" | "success" | "warning" | "danger";
export type MeterSize = "sm" | "md" | "lg";
export type MeterSlot = "root" | "header" | "label" | "value" | "track" | "fill";
export type MeterClassNames = SlotClassNames<MeterSlot>;

export interface MeterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    SlotConfig<MeterSlot> {
  value: number;
  min?: number;
  max?: number;
  /** Lower bound of the "good" range. */
  low?: number;
  /** Upper bound of the "good" range. */
  high?: number;
  /** Value the meter considers best; drives the automatic tone. */
  optimum?: number;
  label?: ReactNode;
  showValue?: boolean;
  formatValue?: (value: number, min: number, max: number) => string;
  size?: MeterSize;
  /** Override the tone derived from low/high/optimum. */
  tone?: MeterTone;
}

function resolveTone(
  value: number,
  min: number,
  max: number,
  low: number | undefined,
  high: number | undefined,
  optimum: number | undefined,
): MeterTone {
  if (low == null && high == null) return "neutral";
  const lower = low ?? min;
  const upper = high ?? max;
  const best = optimum ?? (lower + upper) / 2;

  if (best < lower) return value < lower ? "success" : value > upper ? "danger" : "warning";
  if (best > upper) return value > upper ? "success" : value < lower ? "danger" : "warning";
  return value < lower || value > upper ? "danger" : "success";
}

/**
 * A gauge for a value inside a known range (disk usage, score, capacity).
 * Uses `role="meter"` and derives a semantic tone from low/high/optimum.
 */
export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
  {
    className,
    value,
    min = 0,
    max = 100,
    low,
    high,
    optimum,
    label,
    showValue = false,
    formatValue,
    size = "md",
    tone,
    "aria-label": ariaLabel,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const labelId = useId();
  const clamped = Math.min(max, Math.max(min, value));
  const percent = max > min ? ((clamped - min) / (max - min)) * 100 : 0;
  const resolvedTone = tone ?? resolveTone(clamped, min, max, low, high, optimum);
  const text = formatValue ? formatValue(clamped, min, max) : `${Math.round(percent)}%`;

  return (
    <div
      ref={ref}
      className={slotClass(config, "root", "ui-meter", className)}
      data-size={size}
      data-tone={resolvedTone}
      {...rest}
    >
      {label != null || showValue ? (
        <div className={slotClass(config, "header", "ui-meter__header")}>
          {label != null ? (
            <span id={labelId} className={slotClass(config, "label", "ui-meter__label")}>
              {label}
            </span>
          ) : null}
          {showValue ? (
            <span className={slotClass(config, "value", "ui-meter__value")}>{text}</span>
          ) : null}
        </div>
      ) : null}
      <div
        className={slotClass(config, "track", "ui-meter__track")}
        role="meter"
        aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
        aria-labelledby={typeof label === "string" ? undefined : label != null ? labelId : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-valuetext={text}
      >
        <div
          className={slotClass(config, "fill", "ui-meter__fill")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
});
Meter.displayName = "Meter";
