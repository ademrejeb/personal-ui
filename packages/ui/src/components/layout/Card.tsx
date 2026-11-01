import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";
import { spaceVar } from "../../utilities/space";
import type { Space } from "../../types";

export type CardTone = "surface" | "raised" | "inset";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  bordered?: boolean;
  elevation?: 0 | 1 | 2 | 3;
  /** Internal padding for the root; sections manage their own padding. */
  padding?: Space;
  /** Make the entire card a hoverable/clickable affordance. */
  interactive?: boolean;
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, tone = "surface", bordered = true, elevation = 0, padding, interactive = false, style, ...rest },
  ref,
) {
  const computed: CSSProperties | undefined =
    padding !== undefined ? { padding: spaceVar(padding) } : undefined;
  return (
    <div
      ref={ref}
      data-tone={tone}
      data-elevation={elevation}
      className={cx(
        "ui-card",
        `ui-card--${tone}`,
        bordered && "ui-card--bordered",
        interactive && "ui-card--interactive",
        className,
      )}
      style={{ ...computed, ...style }}
      {...rest}
    />
  );
});

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("ui-card__header", className)} {...rest} />;
});

export type CardBodyProps = HTMLAttributes<HTMLDivElement>;
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("ui-card__body", className)} {...rest} />;
});

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("ui-card__footer", className)} {...rest} />;
});

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, as: As = "h3", ...rest },
  ref,
) {
  return <As ref={ref} className={cx("ui-card__title", className)} {...rest} />;
});

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, ...rest }, ref) {
    return <p ref={ref} className={cx("ui-card__description", className)} {...rest} />;
  },
);

export type CardActionsProps = HTMLAttributes<HTMLDivElement>;
export const CardActions = forwardRef<HTMLDivElement, CardActionsProps>(function CardActions(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("ui-card__actions", className)} {...rest} />;
});

/**
 * Compound card. Sections are exposed both as named exports and as static
 * members: `Card.Header` / `CardHeader` are equivalent.
 */
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
  Actions: CardActions,
});
