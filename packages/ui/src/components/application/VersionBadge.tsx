import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";

export interface VersionBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  version: string;
  /** Environment label, e.g. "staging", "production". */
  environment?: string;
  tone?: "neutral" | "info" | "warning" | "danger";
}

/** Package/environment indicator, e.g. `v1.4.2 · staging`. */
export const VersionBadge = forwardRef<HTMLSpanElement, VersionBadgeProps>(function VersionBadge(
  { className, version, environment, tone = "neutral", ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      data-tone={tone}
      className={cx("ui-version-badge", className)}
      {...rest}
    >
      <span className="ui-version-badge__version">{version}</span>
      {environment ? <span className="ui-version-badge__env">{environment}</span> : null}
    </span>
  );
});
VersionBadge.displayName = "VersionBadge";
