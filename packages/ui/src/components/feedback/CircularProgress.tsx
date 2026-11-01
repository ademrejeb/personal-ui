import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  /** Diameter in pixels. */
  size?: number;
  /** Ring thickness in pixels. */
  thickness?: number;
  indeterminate?: boolean;
  showValue?: boolean;
  formatValue?: (value: number, max: number) => string;
  label?: ReactNode;
  tone?: "accent" | "success" | "warning" | "danger";
}

/** Radial progress indicator rendered with SVG. */
export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  function CircularProgress(
    {
      className,
      value = 0,
      max = 100,
      size = 48,
      thickness = 4,
      indeterminate = false,
      showValue = false,
      formatValue,
      label,
      tone = "accent",
      ...rest
    },
    ref,
  ) {
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
    const offset = circumference - (percent / 100) * circumference;
    const text = formatValue ? formatValue(value, max) : `${Math.round(percent)}%`;

    return (
      <div
        ref={ref}
        className={cx("ui-circular-progress", className)}
        data-tone={tone}
        data-indeterminate={indeterminate || undefined}
        style={{ width: size, height: size }}
        {...rest}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="progressbar"
          aria-valuemin={indeterminate ? undefined : 0}
          aria-valuemax={indeterminate ? undefined : max}
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuetext={indeterminate ? undefined : text}
          aria-label={label ? undefined : "Progress"}
        >
          <circle
            className="ui-circular-progress__track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
          />
          <circle
            className="ui-circular-progress__indicator"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={indeterminate ? circumference * 0.75 : offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        {showValue && !indeterminate ? (
          <span className="ui-circular-progress__value" aria-hidden="true">
            {text}
          </span>
        ) : null}
      </div>
    );
  },
);
CircularProgress.displayName = "CircularProgress";

/** Alias of `CircularProgress` for metric-style displays. */
export const ProgressRing = CircularProgress;
