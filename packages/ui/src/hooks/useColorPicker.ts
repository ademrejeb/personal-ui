import { useRef, useState, type ButtonHTMLAttributes, type Ref, type RefObject } from "react";
import {
  formatColor,
  parseColor,
  toHex,
  type ColorFormat,
  type RGBA,
} from "../utilities/color";
import { mergeRefs } from "../utilities/mergeRefs";

export const DEFAULT_COLOR_SWATCHES: readonly string[] = [
  "#ef4444",
  "#f59e0b",
  "#fbbf24",
  "#10b981",
  "#3b82f6",
  "#6c70f2",
  "#a855f7",
  "#ec4899",
  "#71717a",
  "#0f172a",
];

export interface UseColorPickerOptions {
  /** Controlled colour; any CSS colour string the parser understands. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Output format for `value` and the callback. */
  format?: ColorFormat;
  withAlpha?: boolean;
  swatches?: readonly string[];
}

export interface ColorPickerTriggerPropBag extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  [dataAttribute: `data-${string}`]: unknown;
}

export interface UseColorPickerResult {
  /** Popup state. */
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Formatted current colour. */
  value: string;
  /** Parsed current colour (never null — invalid input falls back to black). */
  rgba: RGBA;
  /** `#rrggbb`, always opaque, for the native colour input. */
  hex: string;
  /** Current text-field draft. */
  draft: string;
  /** True when the draft parses as a colour. */
  draftValid: boolean;
  setDraft: (draft: string) => void;
  /** Applies a parsed colour (or a raw string) and reports the formatted value. */
  setColor: (next: string | RGBA) => void;
  commitDraft: () => void;
  swatches: readonly string[];
  anchorRef: RefObject<HTMLButtonElement | null>;
  getTriggerProps: (props?: ColorPickerTriggerPropBag) => ColorPickerTriggerPropBag;
}

const FALLBACK: RGBA = { r: 0, g: 0, b: 0, a: 1 };

/**
 * Headless colour state: parsing, formatting and draft validation shared by the
 * picker popup and the trigger.
 */
export function useColorPicker({
  value,
  defaultValue = "#000000",
  onValueChange,
  format = "hex",
  swatches = DEFAULT_COLOR_SWATCHES,
}: UseColorPickerOptions): UseColorPickerResult {
  const [internal, setInternal] = useState(defaultValue);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const resolved = value !== undefined ? value : internal;
  const rgba = parseColor(resolved) ?? FALLBACK;
  const formatted = formatColor(rgba, format);
  const [draftState, setDraftState] = useState({ source: formatted, draft: formatted });
  const draft = draftState.source === formatted ? draftState.draft : formatted;
  const draftValid = parseColor(draft) !== null;

  const setColor = (next: string | RGBA) => {
    const parsed = typeof next === "string" ? parseColor(next) : next;
    if (!parsed) return;
    const output = formatColor(parsed, format);
    if (value === undefined) setInternal(output);
    onValueChange?.(output);
  };

  return {
    open,
    setOpen,
    value: formatted,
    rgba,
    hex: toHex(rgba),
    draft,
    draftValid,
    setDraft: (next) => setDraftState({ source: formatted, draft: next }),
    setColor,
    commitDraft: () => {
      if (draftValid) setColor(draft);
    },
    swatches,
    anchorRef,
    getTriggerProps: (props = {}) => ({
      ...props,
      ref: mergeRefs(anchorRef, props.ref),
      type: "button",
      role: "button",
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      onClick: (event) => {
        props.onClick?.(event);
        if (event.defaultPrevented) return;
        setOpen(!open);
      },
    }),
  };
}
