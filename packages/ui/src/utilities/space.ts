import type { Align, Justify, Space } from "../types";

/**
 * Literal fallbacks for the token scale. Layout primitives set their gaps and
 * paddings inline; if the token stylesheet is missing or still parsing when the
 * first frame lands, a bare `var(--ui-p-space-3)` resolves to nothing and the
 * layout silently collapses. The fallback keeps the rhythm until the tokens
 * arrive, and a consumer override still wins when the token exists.
 */
const SPACE_FALLBACKS: Record<string, string> = {
  "0": "0",
  px: "1px",
  "0-5": "0.125rem",
  "1": "0.25rem",
  "1-5": "0.375rem",
  "2": "0.5rem",
  "3": "0.75rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "8": "2rem",
  "10": "2.5rem",
  "12": "3rem",
  "16": "4rem",
  "20": "5rem",
  "24": "6rem",
};

/** Maps a spacing step to the corresponding primitive token reference. */
export function spaceVar(value: Space): string {
  if (typeof value === "number" || /^\d+(\.\d+)?$/.test(value)) {
    const key = String(value).replace(".", "-");
    const fallback = SPACE_FALLBACKS[key];
    return fallback
      ? `var(--ui-p-space-${key}, ${fallback})`
      : `var(--ui-p-space-${key})`;
  }
  // "px" or any raw CSS length passes through unchanged.
  return value === "px" ? "var(--ui-p-space-px, 1px)" : value;
}

const ALIGN_MAP: Record<Align, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  baseline: "baseline",
  stretch: "stretch",
};

const JUSTIFY_MAP: Record<Justify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

export const alignToCss = (value: Align): string => ALIGN_MAP[value];
export const justifyToCss = (value: Justify): string => JUSTIFY_MAP[value];
