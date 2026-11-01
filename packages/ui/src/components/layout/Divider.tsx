import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  /** Optional centered content (e.g. "or"). Horizontal only. */
  label?: ReactNode;
  /** Decorative dividers are removed from the a11y tree. */
  decorative?: boolean;
}

/**
 * A separator. With a `label` it becomes a labelled horizontal rule; without
 * content it is exposed as a semantic `separator`.
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { className, orientation = "horizontal", label, decorative = false, children, ...rest },
  ref,
) {
  const content = label ?? children;
  const isLabelled = orientation === "horizontal" && content != null;

  return (
    <div
      ref={ref}
      role={decorative ? undefined : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      aria-hidden={decorative || undefined}
      data-orientation={orientation}
      data-labelled={isLabelled || undefined}
      className={cx("ui-divider", `ui-divider--${orientation}`, isLabelled && "ui-divider--labelled", className)}
      {...rest}
    >
      {isLabelled ? (
        <span className="ui-divider__label">{content}</span>
      ) : null}
    </div>
  );
});
Divider.displayName = "Divider";
