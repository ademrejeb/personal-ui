import { useMemo, forwardRef, type InputHTMLAttributes } from "react";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";
import { useInputMask } from "../../hooks/useInputMask";
import { useFieldControl } from "./field-utils";
import type { ControlSize } from "../../types";

export type InputMaskSlot = "root" | "input";

export type InputMaskClassNames = SlotClassNames<InputMaskSlot>;

export interface InputMaskProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onChange">,
    SlotConfig<InputMaskSlot> {
  /** Mask pattern: `9` digit, `a` letter, `*` alphanumeric, any other char literal. */
  mask: string;
  /** Controlled masked value. */
  value?: string;
  defaultValue?: string;
  /** Receives both the formatted value and the raw characters. */
  onValueChange?: (maskedValue: string, rawValue: string) => void;
  size?: ControlSize;
  invalid?: boolean;
  /** Submit the masked value instead of the raw characters. */
  submitMasked?: boolean;
  /** Character used when the default placeholder is built from the mask. */
  placeholderChar?: string;
}

/**
 * Text input that keeps its value in a fixed shape while typing. Non-matching
 * characters are dropped, literals are inserted as you go, and the raw value is
 * available for forms.
 */
export const InputMask = forwardRef<HTMLInputElement, InputMaskProps>(function InputMask(
  {
    mask,
    value,
    defaultValue,
    onValueChange,
    className,
    classNames,
    unstyled = false,
    size = "md",
    invalid,
    disabled,
    required,
    id,
    name,
    placeholder,
    placeholderChar,
    submitMasked = false,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, disabled, required });
  const config = useMemo(() => slotConfig(unstyled, classNames), [unstyled, classNames]);
  const maskApi = useInputMask({
    mask,
    value,
    defaultValue,
    onValueChange,
    placeholder,
    placeholderChar,
  });

  return (
    <div
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      data-complete={maskApi.complete || undefined}
      className={slotClass(config, "root", "ui-input-mask", className)}
    >
      <input
        {...maskApi.getInputProps({
          id: field.id,
          type: "text",
          name: undefined,
          disabled: field.disabled || undefined,
          required: field.required || undefined,
          "aria-invalid": field.invalid || undefined,
          "aria-describedby": field.describedBy,
          "data-size": size,
          "data-invalid": field.invalid || undefined,
          className: slotClass(config, "input", "ui-input", "ui-control", "ui-input-mask__input"),
          ref,
        })}
        {...rest}
      />
      {name ? (
        <input
          type="hidden"
          name={name}
          value={submitMasked ? maskApi.value : maskApi.rawValue}
        />
      ) : null}
    </div>
  );
});
