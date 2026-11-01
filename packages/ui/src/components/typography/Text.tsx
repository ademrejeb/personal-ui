import type { ElementType } from "react";
import { cx } from "../../utilities/cx";
import {
  polymorphicForwardRef,
  type PolymorphicProps,
  type PolymorphicRef,
} from "../../utilities/polymorphic";

export type TextSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl";
export type TextTone = "default" | "muted" | "subtle" | "primary" | "success" | "warning" | "danger" | "info";
export type TextWeight = "regular" | "medium" | "semibold" | "bold";
export type TextAlign = "left" | "center" | "right";

export interface TextOwnProps {
  className?: string;
  size?: TextSize;
  tone?: TextTone;
  weight?: TextWeight;
  align?: TextAlign;
  /** Render in a monospace font. */
  mono?: boolean;
  /** Single-line ellipsis truncation. */
  truncate?: boolean;
  /** Fluid body copy at readable measure. */
  leading?: "tight" | "snug" | "normal" | "relaxed";
}

/** Semantic text primitive. Defaults to `<span>`. */
export const Text = polymorphicForwardRef<TextOwnProps, "span">(
  function Text<C extends ElementType = "span">(
  {
    as,
    className,
    size = "sm",
    tone = "default",
    weight,
    align,
    mono,
    truncate,
    leading,
    ...rest
  }: PolymorphicProps<C, TextOwnProps>,
  ref: PolymorphicRef<C>,
) {
  const Component = (as ?? "span") as ElementType;
  return (
    <Component
      ref={ref}
      className={cx(
        "ui-text",
        `ui-text--${size}`,
        `ui-text--tone-${tone}`,
        weight && `ui-text--${weight}`,
        align && `ui-text--align-${align}`,
        mono && "ui-text--mono",
        truncate && "ui-truncate",
        leading && `ui-text--leading-${leading}`,
        className,
      )}
      {...rest}
    />
  );
  },
  "Text",
);

export type CaptionOwnProps = TextOwnProps;

/** Small, muted supporting text rendered as a `<span>`. */
export const Caption = polymorphicForwardRef<CaptionOwnProps, "span">(
  function Caption<C extends ElementType = "span">(
  {
    as,
    className,
    size = "xs",
    tone = "muted",
    weight,
    align,
    mono,
    truncate,
    leading,
    ...rest
  }: PolymorphicProps<C, CaptionOwnProps>,
  ref: PolymorphicRef<C>,
) {
  const Component = (as ?? "span") as ElementType;
  return (
    <Component
      ref={ref}
      className={cx(
        "ui-caption",
        `ui-caption--${size}`,
        `ui-text--tone-${tone}`,
        weight && `ui-text--${weight}`,
        align && `ui-text--align-${align}`,
        mono && "ui-text--mono",
        truncate && "ui-truncate",
        leading && `ui-text--leading-${leading}`,
        className,
      )}
      {...rest}
    />
  );
  },
  "Caption",
);
