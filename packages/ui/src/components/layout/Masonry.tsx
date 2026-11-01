import { Children, forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type MasonryGap = "sm" | "md" | "lg";
export type MasonrySlot = "root" | "item";
export type MasonryClassNames = SlotClassNames<MasonrySlot>;

export interface MasonryProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    SlotConfig<MasonrySlot> {
  children: ReactNode;
  /** Number of columns. Ignored when `columnWidth` is set. */
  columns?: number;
  /** Responsive mode: minimum column width in px. */
  columnWidth?: number;
  gap?: MasonryGap;
}

/**
 * A CSS multi-column masonry layout. Items keep their natural height and are
 * distributed across columns without JavaScript measurement.
 */
export const Masonry = forwardRef<HTMLDivElement, MasonryProps>(function Masonry(
  {
    className,
    children,
    columns = 3,
    columnWidth,
    gap = "md",
    unstyled = false,
    classNames,
    style,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);

  return (
    <div
      ref={ref}
      data-gap={gap}
      className={slotClass(config, "root", "ui-masonry", className)}
      style={{
        columnCount: columnWidth ? undefined : columns,
        columnWidth: columnWidth ? `${columnWidth}px` : undefined,
        ...style,
      }}
      {...rest}
    >
      {Children.map(children, (child, index) =>
        child == null ? null : (
          <div key={index} className={slotClass(config, "item", "ui-masonry__item")}>
            {child}
          </div>
        ),
      )}
    </div>
  );
});
Masonry.displayName = "Masonry";
