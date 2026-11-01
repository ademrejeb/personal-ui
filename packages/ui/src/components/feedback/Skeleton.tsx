import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: number | string;
  height?: number | string;
  radius?: string;
  /** Number of stacked lines (text variant only). */
  lines?: number;
  animated?: boolean;
}

const toCss = (value: number | string | undefined): string | undefined =>
  typeof value === "number" ? `${value}px` : value;

/** Loading placeholder. Marked `aria-hidden`; announce loading state on the region. */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  {
    className,
    variant = "text",
    width,
    height,
    radius,
    lines = 1,
    animated = true,
    style,
    ...rest
  },
  ref,
) {
  const base: CSSProperties = {
    width: toCss(width),
    height: toCss(height),
    borderRadius: radius,
  };

  if (variant === "text" && lines > 1) {
    return (
      <div ref={ref} className={cx("ui-skeleton-group", className)} aria-hidden="true" {...rest}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cx("ui-skeleton", "ui-skeleton--text", animated && "ui-skeleton--animated")}
            style={{ ...base, height: toCss(height), width: index === lines - 1 ? "70%" : base.width }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cx("ui-skeleton", `ui-skeleton--${variant}`, animated && "ui-skeleton--animated", className)}
      style={{ ...base, ...style }}
      {...rest}
    />
  );
});
Skeleton.displayName = "Skeleton";
