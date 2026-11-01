import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";

export interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end" | "between";
  /** Pin actions to the bottom of a scroll container. */
  sticky?: boolean;
}

/** Consistent layout for a form's submit/cancel controls. */
export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(function FormActions(
  { className, align = "end", sticky = false, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      data-align={align}
      className={cx("ui-form-actions", `ui-form-actions--${align}`, sticky && "ui-form-actions--sticky", className)}
      {...rest}
    />
  );
});
FormActions.displayName = "FormActions";
