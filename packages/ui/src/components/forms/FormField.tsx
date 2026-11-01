import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utilities/cx";
import { idSuffix } from "../../utilities/aria";
import { Label } from "../typography/Label";
import { useFormContext } from "./Form";

export interface FormFieldContextValue {
  /** The id the control must adopt. */
  controlId: string;
  descriptionId?: string;
  errorId?: string;
  required: boolean;
  disabled: boolean;
  invalid: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/** Access the enclosing `FormField` wiring. Returns null outside a field. */
export function useFormField(): FormFieldContextValue | null {
  return useContext(FormFieldContext);
}

/** Access the enclosing `FormField` wiring, throwing when absent. */
export function useRequiredFormField(): FormFieldContextValue {
  const ctx = useContext(FormFieldContext);
  if (!ctx) throw new Error("This control must be used within a <FormField>.");
  return ctx;
}

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Control id. Generated when omitted. */
  id?: string;
  /** Field key in the enclosing `Form` engine; enables automatic error wiring. */
  name?: string;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  optional?: boolean;
  orientation?: "vertical" | "horizontal";
  children: ReactNode;
}

/**
 * Wires a label, description, and error message to a control via generated ids
 * and `aria-describedby`, and shares the field state through context so
 * `Input`, `Select`, etc. configure themselves automatically.
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  {
    className,
    id,
    name,
    label,
    description,
    error: errorProp,
    required = false,
    disabled = false,
    optional = false,
    orientation = "vertical",
    children,
    ...rest
  },
  ref,
) {
  const form = useFormContext();
  const generatedId = useId();
  const controlId = id ?? (name ? idSuffix(generatedId, name) : generatedId);
  const externalError = name ? form?.errors[name] : undefined;
  const submitCount = form?.submitCount ?? 0;
  const showExternal =
    Boolean(externalError) && (submitCount > 0 || Boolean(name && form?.touched[name]));
  const error = errorProp !== undefined ? errorProp : showExternal ? externalError : undefined;
  const descriptionId = description != null ? idSuffix(controlId, "description") : undefined;
  const errorId = error != null ? idSuffix(controlId, "error") : undefined;
  const invalid = error != null;

  const contextValue: FormFieldContextValue = {
    controlId,
    descriptionId,
    errorId,
    required,
    disabled,
    invalid,
  };

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div
        ref={ref}
        data-orientation={orientation}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cx("ui-field", `ui-field--${orientation}`, className)}
        {...rest}
      >
        {label != null ? (
          <Label htmlFor={controlId} required={required} optional={optional} disabled={disabled}>
            {label}
          </Label>
        ) : null}
        <div className="ui-field__control">{children}</div>
        {description != null ? (
          <p id={descriptionId} className="ui-field__description">
            {description}
          </p>
        ) : null}
        {error != null ? (
          <p id={errorId} className="ui-field__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </FormFieldContext.Provider>
  );
});
FormField.displayName = "FormField";
