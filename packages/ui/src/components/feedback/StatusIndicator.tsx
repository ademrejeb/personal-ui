import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";
import type { Status } from "../../types";

export interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  status?: Status;
  /** Visible label. Falls back to the status name for screen readers. */
  label?: ReactNode;
  /** Animate the dot to signal an in-progress/online state. */
  pulse?: boolean;
  size?: "sm" | "md";
  /** Render only the dot (label still announced). */
  dotOnly?: boolean;
}

/** A status dot with an accessible label. Never relies on color alone. */
export const StatusIndicator = forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  function StatusIndicator(
    { className, status = "neutral", label, pulse = false, size = "md", dotOnly = false, ...rest },
    ref,
  ) {
    return (
      <span
        ref={ref}
        data-status={status}
        data-size={size}
        className={cx("ui-status", dotOnly && "ui-status--dot-only", className)}
        {...rest}
      >
        <span className={cx("ui-status__dot", pulse && "ui-status__dot--pulse")} aria-hidden="true" />
        <span className="ui-status__label">{label ?? status}</span>
      </span>
    );
  },
);
StatusIndicator.displayName = "StatusIndicator";
