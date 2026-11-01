import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";
import { VisuallyHidden } from "../layout/VisuallyHidden";
import type { ControlSize } from "../../types";

const SIZE_MAP: Record<ControlSize, number> = { xs: 12, sm: 14, md: 18, lg: 24, xl: 32 };

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: ControlSize | number;
  /** Accessible label announced to assistive technology. */
  label?: string;
  /** When true, the spinner is purely decorative (hidden from the a11y tree). */
  decorative?: boolean;
  /** Stroke width in SVG user units. */
  thickness?: number;
}

/** Compact, themable loading indicator. */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { className, size = "md", label = "Loading", decorative = false, thickness = 2.5, style, ...rest },
  ref,
) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];
  const computed: CSSProperties = { width: px, height: px, ...style };

  return (
    <span
      ref={ref}
      role={decorative ? undefined : "status"}
      aria-hidden={decorative || undefined}
      className={cx("ui-spinner", className)}
      style={computed}
      {...rest}
    >
      <svg className="ui-spinner__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth={thickness} />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="round"
        />
      </svg>
      {!decorative ? <VisuallyHidden>{label}</VisuallyHidden> : null}
    </span>
  );
});
Spinner.displayName = "Spinner";
