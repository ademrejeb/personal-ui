import type { ElementType } from "react";
import { cx } from "../../utilities/cx";
import { spaceVar } from "../../utilities/space";
import type { Space } from "../../types";
import {
  polymorphicForwardRef,
  type PolymorphicProps,
  type PolymorphicRef,
} from "../../utilities/polymorphic";

export interface BoxOwnProps {
  className?: string;
  /** Semantic padding step or raw CSS length. */
  padding?: Space;
}

/**
 * The foundational layout surface: renders a `<div>` by default and any other
 * element via `as`, forwarding refs and all intrinsic attributes.
 */
export const Box = polymorphicForwardRef<BoxOwnProps, "div">(
  function Box<C extends ElementType = "div">(
    { as, className, padding, style, ...rest }: PolymorphicProps<C, BoxOwnProps>,
    ref: PolymorphicRef<C>,
  ) {
    const Component = (as ?? "div") as ElementType;
    const paddingStyle = padding !== undefined ? { padding: spaceVar(padding) } : undefined;
    return (
      <Component
        ref={ref}
        className={cx("ui-box", className)}
        style={{ ...paddingStyle, ...style }}
        {...rest}
      />
    );
  },
  "Box",
);
