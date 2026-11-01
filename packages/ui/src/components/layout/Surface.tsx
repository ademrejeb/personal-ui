import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";
import { spaceVar } from "../../utilities/space";
import type { Space } from "../../types";

export type SurfaceTone = "surface" | "raised" | "inset" | "transparent";
export type SurfaceRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  bordered?: boolean;
  /** Elevation level 0–3. */
  elevation?: 0 | 1 | 2 | 3;
  radius?: SurfaceRadius;
  padding?: Space;
  /** Adds hover affordance for clickable surfaces. */
  interactive?: boolean;
}

/** A semantic surface with tone, border, radius, elevation, and padding. */
export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  {
    className,
    tone = "surface",
    bordered = true,
    elevation = 0,
    radius = "lg",
    padding,
    interactive = false,
    style,
    ...rest
  },
  ref,
) {
  const computed: CSSProperties | undefined =
    padding !== undefined ? { padding: spaceVar(padding) } : undefined;
  return (
    <div
      ref={ref}
      data-tone={tone}
      data-elevation={elevation}
      className={cx(
        "ui-surface",
        `ui-surface--${tone}`,
        `ui-surface--radius-${radius}`,
        bordered && "ui-surface--bordered",
        interactive && "ui-surface--interactive",
        className,
      )}
      style={{ ...computed, ...style }}
      {...rest}
    />
  );
});
Surface.displayName = "Surface";
