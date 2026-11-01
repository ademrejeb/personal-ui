import {
  createContext,
  forwardRef,
  useContext,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utilities/cx";
import type { FormContextValue } from "./form-engine";

const FormContext = createContext<FormContextValue | null>(null);

/** Access the enclosing `Form` engine. Returns null outside a `Form`. */
export function useFormContext(): FormContextValue | null {
  return useContext(FormContext);
}

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  /** The `useForm` engine that owns this form's state. */
  form: FormContextValue;
  children: ReactNode;
  onSubmit?: FormHTMLAttributes<HTMLFormElement>["onSubmit"];
}

/**
 * Renders a `<form>` and provides the `useForm` engine to descendants. Native
 * submission is always intercepted so validation runs first.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { form, children, className, noValidate = true, onSubmit, ...rest },
  ref,
) {
  return (
    <FormContext.Provider value={form}>
      <form
        ref={ref}
        noValidate={noValidate}
        className={cx("ui-form", className)}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.(event);
          void form.submit();
        }}
        {...rest}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
});
Form.displayName = "Form";
