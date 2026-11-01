import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utilities/cx";
import { Checkbox } from "./Checkbox";
import { FormField } from "./FormField";
import { Input } from "./Input";
import { Select } from "./Select";
import { Switch } from "./Switch";
import { Textarea } from "./Textarea";
import type { FormBinding, UseFormReturn } from "./form-engine";

export type FormBuildFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "date"
  | "time"
  | "textarea"
  | "select"
  | "checkbox"
  | "switch"
  | "custom";

export interface FormBuildField<T extends Record<string, unknown>> {
  name: keyof T & string;
  label?: ReactNode;
  type?: FormBuildFieldType;
  description?: ReactNode;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: { label: string; value: string | number }[];
  /** Columns to span in the grid. */
  colSpan?: number;
  hidden?: (values: T) => boolean;
  /** Full control over rendering for `type: "custom"`. */
  render?: (field: FormBuildField<T>, binding: FormBinding) => ReactNode;
}

export interface FormBuilderProps<T extends Record<string, unknown>>
  extends HTMLAttributes<HTMLDivElement> {
  form: UseFormReturn<T>;
  fields: FormBuildField<T>[];
  /** Grid columns at the widest breakpoint. Defaults to 2. */
  columns?: number;
}

/**
 * Renders a grid of form controls from a schema, wired to a `useForm` engine.
 * For full control, provide a `type: "custom"` field with a `render` function.
 */
export function FormBuilder<T extends Record<string, unknown>>({
  form,
  fields,
  columns = 2,
  className,
  style,
  ...rest
}: FormBuilderProps<T>): ReactNode {
  return (
    <div
      className={cx("ui-form-builder", className)}
      style={{ ...({ "--ui-form-columns": String(columns) } as CSSProperties), ...style }}
      {...rest}
    >
      {fields.map((field) => {
        if (field.hidden?.(form.values)) return null;
        const binding = form.bind(field.name);
        // Checkbox/switch render their own label inline with the control.
        const inlineLabel = field.type === "checkbox" || field.type === "switch";
        return (
          <FormField
            key={field.name}
            name={field.name}
            label={inlineLabel ? undefined : field.label}
            description={field.description}
            required={field.required}
            className="ui-form-builder__field"
            style={{ gridColumn: field.colSpan ? `span ${field.colSpan}` : undefined }}
          >
            {renderControl(field, binding, form)}
          </FormField>
        );
      })}
    </div>
  );
}

function renderControl<T extends Record<string, unknown>>(
  field: FormBuildField<T>,
  binding: FormBinding,
  form: UseFormReturn<T>,
): ReactNode {
  const { type = "text", name } = field;

  if (type === "custom") {
    return field.render?.(field, binding) ?? null;
  }

  if (type === "checkbox" || type === "switch") {
    const checkboxBinding = form.bindCheckbox(name);
    if (type === "switch") {
      return <Switch label={field.label} {...checkboxBinding} />;
    }
    return <Checkbox label={field.label} {...checkboxBinding} />;
  }

  if (type === "textarea") {
    return (
      <Textarea
        placeholder={field.placeholder}
        rows={field.rows}
        value={binding.value as string}
        onChange={binding.onChange}
        onBlur={binding.onBlur}
      />
    );
  }

  if (type === "select") {
    return (
      <Select
        value={binding.value as string | number}
        onChange={binding.onChange}
        onBlur={binding.onBlur}
        placeholder={field.placeholder}
      >
        {field.options?.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  }

  return (
    <Input
      type={type}
      placeholder={field.placeholder}
      value={binding.value as string | number}
      onChange={binding.onChange}
      onBlur={binding.onBlur}
    />
  );
}

FormBuilder.displayName = "FormBuilder";
