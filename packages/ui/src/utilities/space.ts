import type { Align, Justify, Space } from "../types";

/** Maps a spacing step to the corresponding primitive token reference. */
export function spaceVar(value: Space): string {
  if (typeof value === "number") {
    return `var(--ui-p-space-${String(value).replace(".", "-")})`;
  }
  if (/^\d+(\.\d+)?$/.test(value)) {
    return `var(--ui-p-space-${value.replace(".", "-")})`;
  }
  // "px" or any raw CSS length passes through unchanged.
  return value === "px" ? "var(--ui-p-space-px)" : value;
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
