import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  /** Leading status dot. */
  dot?: boolean;
  icon?: ReactNode;
}

/** Compact status/metadata label. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = "neutral", size = "md", dot = false, icon, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      data-variant={variant}
      data-size={size}
      className={cx("ui-badge", `ui-badge--${variant}`, className)}
      {...rest}
    >
      {dot ? <span className="ui-badge__dot" aria-hidden="true" /> : null}
      {icon ? (
        <span className="ui-badge__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
});
Badge.displayName = "Badge";
