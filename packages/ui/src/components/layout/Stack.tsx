import type { CSSProperties, ElementType } from "react";
import { cx } from "../../utilities/cx";
import { alignToCss, justifyToCss, spaceVar } from "../../utilities/space";
import type { Align, Justify, Space } from "../../types";
import {
  polymorphicForwardRef,
  type PolymorphicProps,
  type PolymorphicRef,
} from "../../utilities/polymorphic";

export interface StackOwnProps {
  className?: string;
  /** Main axis. Defaults to "column". */
  direction?: "row" | "column";
  gap?: Space;
  rowGap?: Space;
  columnGap?: Space;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  /** Render as inline-flex. */
  inline?: boolean;
}

/**
 * One-dimensional layout primitive with token-driven gaps and alignment.
 * Renders a flex container; `direction` controls the main axis.
 */
export const Stack = polymorphicForwardRef<StackOwnProps, "div">(
  function Stack<C extends ElementType = "div">(
    {
      as,
      className,
      direction = "column",
      gap = 4,
      rowGap,
      columnGap,
      align,
      justify,
      wrap = false,
      inline = false,
      style,
      ...rest
    }: PolymorphicProps<C, StackOwnProps>,
    ref: PolymorphicRef<C>,
  ) {
    const Component = (as ?? "div") as ElementType;
    // Only emit the gap longhands that were actually requested. React clears
    // an undefined inline style key; emitting `rowGap: undefined` after `gap`
    // clears the row-gap branch of the `gap` shorthand and collapses the
    // layout on every client-side render (SSR keeps the raw style string).
    const computed: CSSProperties = {
      display: inline ? "inline-flex" : "flex",
      flexDirection: direction,
      ...(rowGap === undefined && columnGap === undefined
        ? { gap: spaceVar(gap) }
        : {
            ...(rowGap !== undefined ? { rowGap: spaceVar(rowGap) } : {}),
            ...(columnGap !== undefined ? { columnGap: spaceVar(columnGap) } : {}),
          }),
      alignItems: align ? alignToCss(align) : undefined,
      justifyContent: justify ? justifyToCss(justify) : undefined,
      flexWrap: wrap ? "wrap" : undefined,
    };
    return (
      <Component
        ref={ref}
        className={cx("ui-stack", className)}
        style={{ ...computed, ...style }}
        {...rest}
      />
    );
  },
  "Stack",
);
