import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";
import { alignToCss, justifyToCss, spaceVar } from "../../utilities/space";
import type { Align, Justify, Space } from "../../types";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Fixed column count, or any valid `grid-template-columns` value. */
  columns?: number | string;
  /** When set, generates a responsive `auto-fit` grid of at least this width. */
  minItemWidth?: string;
  gap?: Space;
  rowGap?: Space;
  columnGap?: Space;
  align?: Align;
  justify?: Justify;
}

function resolveColumns(columns: number | string | undefined, minItemWidth?: string): string | undefined {
  if (minItemWidth) return `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`;
  if (typeof columns === "number") return `repeat(${columns}, minmax(0, 1fr))`;
  return columns;
}

/** Responsive CSS grid with token-driven gaps. */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  {
    className,
    style,
    columns = 1,
    minItemWidth,
    gap = 4,
    rowGap,
    columnGap,
    align,
    justify,
    ...rest
  },
  ref,
) {
  const computed: CSSProperties = {
    display: "grid",
    gridTemplateColumns: resolveColumns(columns, minItemWidth),
    // Same shorthand trap as Stack: never include an undefined rowGap /
    // columnGap key, or React clears the gap longhands on client renders.
    ...(rowGap === undefined && columnGap === undefined
      ? { gap: spaceVar(gap) }
      : {
          ...(rowGap !== undefined ? { rowGap: spaceVar(rowGap) } : {}),
          ...(columnGap !== undefined ? { columnGap: spaceVar(columnGap) } : {}),
        }),
    alignItems: align ? alignToCss(align) : undefined,
    justifyItems: justify ? justifyToCss(justify) : undefined,
  };
  return (
    <div ref={ref} className={cx("ui-grid", className)} style={{ ...computed, ...style }} {...rest} />
  );
});
