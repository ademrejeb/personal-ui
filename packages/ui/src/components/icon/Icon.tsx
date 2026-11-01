import { forwardRef, type ComponentType, type SVGProps } from "react";
import { cx } from "../../utilities/cx";
import type { ControlSize } from "../../types";

export type IconSize = ControlSize | number;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** A Lucide (or any compatible SVG) icon component. */
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Named step from the control scale, or an explicit pixel size. */
  size?: IconSize;
  /** Accessible name. When omitted the icon is decorative (aria-hidden). */
  label?: string;
  /** Animate the icon continuously (e.g. a loader). */
  spin?: boolean;
}

const ICON_PX: Record<ControlSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
};

/**
 * Consistent wrapper around our icon set. Aligns stroke, colour, and optical
 * sizing with the control scale so icons sit correctly inside buttons and inputs.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { icon: IconComponent, size = "md", label, spin = false, className, ...rest },
  ref,
) {
  const px = typeof size === "number" ? size : ICON_PX[size];
  return (
    <IconComponent
      ref={ref}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      width={px}
      height={px}
      className={cx("ui-icon", spin && "ui-icon--spin", className)}
      {...rest}
    />
  );
});
Icon.displayName = "Icon";
