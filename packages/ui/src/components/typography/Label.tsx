import { forwardRef, type LabelHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";
import { VisuallyHidden } from "../layout/VisuallyHidden";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Show a required indicator and expose "(required)" to screen readers. */
  required?: boolean;
  /** Show an "(optional)" hint for forms where most fields are required. */
  optional?: boolean;
  /** Dim the label when its control is disabled. */
  disabled?: boolean;
  /** Optional trailing hint (e.g. helper text). */
  hint?: ReactNode;
}

/** Accessible form label with required/optional affordances. */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, required = false, optional = false, disabled = false, hint, children, ...rest },
  ref,
) {
  return (
    <label
      ref={ref}
      data-disabled={disabled || undefined}
      data-required={required || undefined}
      className={cx("ui-label", disabled && "ui-label--disabled", className)}
      {...rest}
    >
      <span className="ui-label__text">{children}</span>
      {required ? (
        <span className="ui-label__required" aria-hidden="true">
          *
        </span>
      ) : null}
      {required ? <VisuallyHidden>(required)</VisuallyHidden> : null}
      {optional && !required ? <span className="ui-label__optional">(optional)</span> : null}
      {hint ? <span className="ui-label__hint">{hint}</span> : null}
    </label>
  );
});
Label.displayName = "Label";
