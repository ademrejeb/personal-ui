import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export type ProgressVariant = "default" | "success" | "warning" | "danger";
export type ProgressSize = "sm" | "md" | "lg";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value. Omit (or set `indeterminate`) for an indeterminate bar. */
  value?: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  label?: ReactNode;
  showValue?: boolean;
  formatValue?: (value: number, max: number) => string;
  indeterminate?: boolean;
  /** Accessible label when no visible label is provided. */
  "aria-label"?: string;
}

const clampPercent = (value: number, max: number): number => {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
};

/** Linear progress bar. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    className,
    value = 0,
    max = 100,
    variant = "default",
    size = "md",
    label,
    showValue = false,
    formatValue,
    indeterminate = false,
    "aria-label": ariaLabel,
    ...rest
  },
  ref,
) {
  const percent = clampPercent(value, max);
  const text = formatValue ? formatValue(value, max) : `${Math.round(percent)}%`;

  return (
    <div ref={ref} className={cx("ui-progress", className)} data-size={size} {...rest}>
      {label != null || showValue ? (
        <div className="ui-progress__header">
          {label != null ? <span className="ui-progress__label">{label}</span> : null}
          {showValue ? <span className="ui-progress__value">{text}</span> : null}
        </div>
      ) : null}
      <div
        className="ui-progress__track"
        role="progressbar"
        aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuetext={indeterminate ? undefined : text}
        data-variant={variant}
        data-indeterminate={indeterminate || undefined}
      >
        <div className="ui-progress__fill" style={indeterminate ? undefined : { width: `${percent}%` }} />
      </div>
    </div>
  );
});
Progress.displayName = "Progress";
