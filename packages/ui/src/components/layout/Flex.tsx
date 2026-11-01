import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";
import { alignToCss, justifyToCss, spaceVar } from "../../utilities/space";
import type { Align, Justify, Space } from "../../types";
import {
  polymorphicForwardRef,
  type PolymorphicProps,
  type PolymorphicRef,
} from "../../utilities/polymorphic";

export interface FlexOwnProps {
  className?: string;
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
  gap?: Space;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  inline?: boolean;
}

function flexStyle({
  direction = "row",
  gap = 3,
  align,
  justify,
  wrap = false,
  inline = false,
}: FlexOwnProps): CSSProperties {
  return {
    display: inline ? "inline-flex" : "flex",
    flexDirection: direction,
    gap: spaceVar(gap),
    alignItems: align ? alignToCss(align) : undefined,
    justifyContent: justify ? justifyToCss(justify) : undefined,
    flexWrap: wrap ? "wrap" : undefined,
  };
}

/** General-purpose flexbox container with the full set of flex options. */
export const Flex = polymorphicForwardRef<FlexOwnProps, "div">(
  function Flex<C extends ElementType = "div">(
    props: PolymorphicProps<C, FlexOwnProps>,
    ref: PolymorphicRef<C>,
  ) {
    const { as, className, style, direction, gap, align, justify, wrap, inline, ...rest } = props;
    const Component = (as ?? "div") as ElementType;
    return (
      <Component
        ref={ref}
        className={cx("ui-flex", className)}
        style={{ ...flexStyle({ direction, gap, align, justify, wrap, inline }), ...style }}
        {...rest}
      />
    );
  },
  "Flex",
);

export interface InlineOwnProps extends Omit<FlexOwnProps, "direction" | "wrap"> {
  gap?: Space;
}

/** Horizontal flex container that wraps by default — for tag/toolbar rows. */
export const Inline = polymorphicForwardRef<InlineOwnProps, "span">(
  function Inline<C extends ElementType = "span">(
    { as, className, style, gap = 2, align = "center", ...rest }: PolymorphicProps<C, InlineOwnProps>,
    ref: PolymorphicRef<C>,
  ) {
    const Component = (as ?? "span") as ElementType;
    return (
      <Component
        ref={ref}
        className={cx("ui-inline", className)}
        style={{
          display: "inline-flex",
          flexWrap: "wrap",
          gap: spaceVar(gap),
          alignItems: alignToCss(align),
          ...style,
        }}
        {...rest}
      />
    );
  },
  "Inline",
);

export interface CenterOwnProps extends Pick<FlexOwnProps, "gap" | "inline"> {
  className?: string;
  direction?: "row" | "column";
}

/** Centers children on both axes. */
export const Center = polymorphicForwardRef<CenterOwnProps, "div">(
  function Center<C extends ElementType = "div">(
    {
      as,
      className,
      style,
      gap,
      inline = false,
      direction = "row",
      ...rest
    }: PolymorphicProps<C, CenterOwnProps>,
    ref: PolymorphicRef<C>,
  ) {
    const Component = (as ?? "div") as ElementType;
    return (
      <Component
        ref={ref}
        className={cx("ui-center", className)}
        style={{
          display: inline ? "inline-flex" : "flex",
          flexDirection: direction,
          alignItems: "center",
          justifyContent: "center",
          gap: gap !== undefined ? spaceVar(gap) : undefined,
          ...style,
        }}
        {...rest}
      />
    );
  },
  "Center",
);

/** A flexible gap that pushes siblings apart. */
export const Spacer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Spacer({ className, style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cx("ui-spacer", className)}
        style={{ flex: "1 1 auto", alignSelf: "stretch", ...style }}
        {...rest}
      />
    );
  },
);
Spacer.displayName = "Spacer";
