import { useId } from "react";
import { mergeDescribedBy } from "../../utilities/aria";
import { useFormField } from "./FormField";

export interface FieldControlInput {
  id?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  "aria-describedby"?: string;
}

export interface FieldControlOutput {
  id: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  describedBy: string | undefined;
}

/**
 * Derives the wiring for a single form control from an enclosing `FormField`
 * (when present) merged with any explicit props. Explicit props win where the
 * state is additive: `disabled`/`required`/`invalid` are OR-ed.
 */
export function useFieldControl(input: FieldControlInput): FieldControlOutput {
  const field = useFormField();
  const generatedId = useId();

  return {
    id: input.id ?? field?.controlId ?? generatedId,
    invalid: Boolean(input.invalid || field?.invalid),
    required: Boolean(input.required || field?.required),
    disabled: Boolean(input.disabled || field?.disabled),
    describedBy: mergeDescribedBy(
      input["aria-describedby"],
      field?.descriptionId,
      field?.errorId,
    ),
  };
}
