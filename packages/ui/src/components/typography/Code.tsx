import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";

export type CodeProps = HTMLAttributes<HTMLElement>;

/** Inline code with a subtle token background. */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code({ className, ...rest }, ref) {
  return <code ref={ref} className={cx("ui-code", className)} {...rest} />;
});
Code.displayName = "Code";
