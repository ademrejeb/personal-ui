import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "../../utilities/cx";
import { useFieldControl } from "./field-utils";
import type { ControlSize } from "../../types";

export type InputSize = ControlSize;

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  invalid?: boolean;
}

/**
 * Text input supporting all native input types. When placed inside a
 * `FormField` it automatically adopts the field's id, description, error, and
 * required/disabled state.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    size = "md",
    invalid,
    id,
    disabled,
    required,
    type = "text",
    "aria-describedby": describedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, disabled, required, "aria-describedby": describedBy });

  return (
    <input
      ref={ref}
      type={type}
      id={field.id}
      disabled={field.disabled || undefined}
      required={field.required || undefined}
      aria-invalid={field.invalid || undefined}
      aria-describedby={field.describedBy}
      data-size={size}
      data-invalid={field.invalid || undefined}
      className={cx("ui-input", "ui-control", className)}
      {...rest}
    />
  );
});
Input.displayName = "Input";
