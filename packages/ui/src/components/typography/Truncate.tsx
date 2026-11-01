import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";

export interface TruncateProps extends HTMLAttributes<HTMLSpanElement> {
  /** Number of visible lines before clamping. Defaults to 1 (ellipsis). */
  lines?: number;
}

/** Truncates text to one or more lines with an ellipsis / line clamp. */
export const Truncate = forwardRef<HTMLSpanElement, TruncateProps>(function Truncate(
  { className, lines = 1, style, ...rest },
  ref,
) {
  const isSingle = lines <= 1;
  const computed: CSSProperties | undefined = isSingle
    ? undefined
    : { WebkitLineClamp: lines, lineClamp: lines };
  return (
    <span
      ref={ref}
      className={cx(isSingle ? "ui-truncate" : "ui-truncate--multiline", className)}
      style={{ ...computed, ...style }}
      {...rest}
    />
  );
});
Truncate.displayName = "Truncate";
