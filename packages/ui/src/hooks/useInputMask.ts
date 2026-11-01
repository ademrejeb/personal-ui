import { useRef, useState, type InputHTMLAttributes, type Ref } from "react";
import {
  applyMask,
  isMaskComplete,
  isNumericMask,
  maskToPlaceholder,
  unmaskValue,
} from "../utilities/mask";
import { mergeRefs } from "../utilities/mergeRefs";

export interface UseInputMaskOptions {
  /** Mask pattern: `9` digit, `a` letter, `*` alphanumeric, other chars literal. */
  mask: string;
  /** Controlled masked value. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (maskedValue: string, rawValue: string) => void;
  /** Defaults to the mask itself, e.g. `(999) 999-9999`. */
  placeholder?: string;
  /** Character used when building the default placeholder. */
  placeholderChar?: string;
}

export interface InputMaskPropBag extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  [dataAttribute: `data-${string}`]: unknown;
}

export interface UseInputMaskResult {
  /** Formatted value to render. */
  value: string;
  /** Value with the literal characters removed. */
  rawValue: string;
  /** True once every mask position is filled. */
  complete: boolean;
  /** Formats and commits a new value (usually straight from an input event). */
  setValue: (next: string) => void;
  getInputProps: (props?: InputMaskPropBag) => InputMaskPropBag;
}

/**
 * Headless masked input. The mask is applied on every keystroke, so the control
 * never holds a value that cannot exist, and the raw characters are reported
 * alongside the formatted ones.
 */
export function useInputMask({
  mask,
  value,
  defaultValue = "",
  onValueChange,
  placeholder,
  placeholderChar = "_",
}: UseInputMaskOptions): UseInputMaskResult {
  const [internal, setInternal] = useState(() => applyMask(defaultValue, mask));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resolved = value !== undefined ? applyMask(value, mask) : internal;

  const setValue = (next: string) => {
    const masked = applyMask(next, mask);
    if (value === undefined) setInternal(masked);
    if (masked !== resolved) onValueChange?.(masked, unmaskValue(masked, mask));
  };

  return {
    value: resolved,
    rawValue: unmaskValue(resolved, mask),
    complete: isMaskComplete(resolved, mask),
    setValue,
    getInputProps: (props = {}) => ({
      autoComplete: "off",
      spellCheck: false,
      ...props,
      ref: mergeRefs(inputRef, props.ref),
      value: resolved,
      placeholder: props.placeholder ?? placeholder ?? maskToPlaceholder(mask, placeholderChar),
      inputMode: isNumericMask(mask) ? "numeric" : props.inputMode,
      onChange: (event) => {
        props.onChange?.(event);
        const masked = applyMask(event.target.value, mask);
        // Keep the DOM in sync even when the formatted value is unchanged, so a
        // rejected character never lingers in the field.
        event.target.value = masked;
        setValue(masked);
      },
    }),
  };
}
