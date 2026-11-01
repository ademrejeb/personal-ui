import { forwardRef, type BlockquoteHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export interface BlockquoteProps extends BlockquoteHTMLAttributes<HTMLQuoteElement> {
  /** Attribution shown after the quote. */
  attribution?: ReactNode;
}

/** Styled quotation with an optional attribution. */
export const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(function Blockquote(
  { className, attribution, children, ...rest },
  ref,
) {
  return (
    <figure className="ui-blockquote-figure">
      <blockquote ref={ref} className={cx("ui-blockquote", className)} {...rest}>
        {children}
      </blockquote>
      {attribution ? <figcaption className="ui-blockquote__cite">— {attribution}</figcaption> : null}
    </figure>
  );
});
Blockquote.displayName = "Blockquote";
