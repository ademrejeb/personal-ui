import type { ElementType } from "react";
import { cx } from "../../utilities/cx";
import {
  polymorphicForwardRef,
  type PolymorphicProps,
  type PolymorphicRef,
} from "../../utilities/polymorphic";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ContainerOwnProps {
  className?: string;
  /** Max content width from the container token scale. */
  size?: ContainerSize;
  /** Add responsive horizontal gutters. Defaults to true. */
  gutter?: boolean;
}

/**
 * Centers content and constrains it to a readable max width with responsive
 * horizontal gutters.
 */
export const Container = polymorphicForwardRef<ContainerOwnProps, "div">(
  function Container<C extends ElementType = "div">(
    { as, className, size = "lg", gutter = true, ...rest }: PolymorphicProps<C, ContainerOwnProps>,
    ref: PolymorphicRef<C>,
  ) {
    const Component = (as ?? "div") as ElementType;
    return (
      <Component
        ref={ref}
        className={cx(
          "ui-container",
          `ui-container--${size}`,
          gutter && "ui-container--gutter",
          className,
        )}
        {...rest}
      />
    );
  },
  "Container",
);
