import { createElement, forwardRef, type ElementType, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "display" | "2xl" | "xl" | "lg" | "md" | "sm";
export type HeadingTone = "default" | "muted" | "primary" | "danger";
export type HeadingAlign = "left" | "center" | "right";

export interface HeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, "color"> {
  /** Semantic level, controls the rendered `h1`–`h6`. */
  level?: HeadingLevel;
  /** Visual size, decoupled from the semantic level. */
  size?: HeadingSize;
  tone?: HeadingTone;
  align?: HeadingAlign;
  /** Override the rendered element without changing the a11y level. */
  as?: ElementType;
}

const DEFAULT_SIZE: Record<HeadingLevel, HeadingSize> = {
  1: "2xl",
  2: "xl",
  3: "lg",
  4: "md",
  5: "sm",
  6: "sm",
};

/** Semantic heading with independent visual scale. */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level = 2, size, tone = "default", align, as, className, ...rest },
  ref,
) {
  const tag = as ?? (`h${level}` as const);
  return createElement(tag, {
    ref,
    className: cx(
      "ui-heading",
      `ui-heading--${size ?? DEFAULT_SIZE[level]}`,
      tone !== "default" && `ui-heading--tone-${tone}`,
      align && `ui-heading--align-${align}`,
      className,
    ),
    ...rest,
  });
});
Heading.displayName = "Heading";
