import { forwardRef, type ForwardRefRenderFunction } from "react";
import type {
  ComponentPropsWithRef,
  ElementType,
  PropsWithoutRef,
  ReactElement,
} from "react";

/**
 * Polymorphic component typing.
 *
 * `PolymorphicRef` extracts the ref element type for a given host element.
 * `PolymorphicProps` merges the base props with the intrinsic props of the
 * selected `as` element, making `as="a"` accept `href`, etc.
 */
export type PolymorphicRef<C extends ElementType> = ComponentPropsWithRef<C>["ref"];

export type PolymorphicProps<C extends ElementType, Props = object> = Props & {
  as?: C;
} & Omit<ComponentPropsWithRef<C>, keyof Props | "as">;

export interface AsProp<C extends ElementType> {
  as?: C;
}

/** A component whose root element is configurable via `as`. */
export type PolymorphicComponent<Props, Default extends ElementType = "div"> = <
  C extends ElementType = Default,
>(
  props: PolymorphicProps<C, Props> & { ref?: PolymorphicRef<C> },
) => ReactElement | null;

/**
 * Creates a polymorphic, ref-forwarding component.
 *
 * The generic render function is intentionally cast because `forwardRef`'s
 * signature cannot express a component whose ref type depends on the `as`
 * prop. The public type is precise via `PolymorphicComponent`.
 */
export function polymorphicForwardRef<Own, Default extends ElementType = "div">(
  render: <C extends ElementType = Default>(
    props: PolymorphicProps<C, Own>,
    ref: PolymorphicRef<C>,
  ) => ReactElement | null,
  displayName: string,
): PolymorphicComponent<Own, Default> {
  const component = forwardRef(
    render as unknown as ForwardRefRenderFunction<unknown, PropsWithoutRef<Own>>,
  );
  component.displayName = displayName;
  return component as unknown as PolymorphicComponent<Own, Default>;
}
