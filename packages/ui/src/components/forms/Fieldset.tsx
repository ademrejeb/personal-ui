import { forwardRef, type FieldsetHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";
import { VisuallyHidden } from "../layout/VisuallyHidden";

export interface FieldsetProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** Group legend. Required for accessible grouping; may be visually hidden. */
  legend: ReactNode;
  description?: ReactNode;
  /** Keep the legend accessible but hide it visually. */
  hideLegend?: boolean;
  orientation?: "vertical" | "horizontal";
}

/** Groups related controls with a legend and native `disabled` propagation. */
export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(function Fieldset(
  { className, legend, description, hideLegend = false, orientation = "vertical", children, ...rest },
  ref,
) {
  return (
    <fieldset
      ref={ref}
      data-orientation={orientation}
      className={cx("ui-fieldset", `ui-fieldset--${orientation}`, className)}
      {...rest}
    >
      <legend className="ui-fieldset__legend">
        {hideLegend ? <VisuallyHidden>{legend}</VisuallyHidden> : legend}
      </legend>
      {description != null ? <p className="ui-fieldset__description">{description}</p> : null}
      <div className="ui-fieldset__content">{children}</div>
    </fieldset>
  );
});
Fieldset.displayName = "Fieldset";
