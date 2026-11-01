import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  /** Reveal the content again when focused (skip links). */
  focusable?: boolean;
}

/**
 * Hides content visually while keeping it available to assistive technology.
 * Uses the standard clip technique — never `display: none`.
 */
export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ className, focusable = false, ...rest }, ref) {
    return (
      <span
        ref={ref}
        className={cx("ui-visually-hidden", focusable && "ui-visually-hidden--focusable", className)}
        {...rest}
      />
    );
  },
);
VisuallyHidden.displayName = "VisuallyHidden";
