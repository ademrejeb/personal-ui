/** Shared, design-system-wide enums used across component APIs. */

/** Interactive control sizes (xs → xl). */
export type ControlSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Content/typographic sizes. */
export type Size = "sm" | "md" | "lg";

/** Semantic status used by feedback, badges, and indicators. */
export type Status = "neutral" | "success" | "warning" | "danger" | "info";

/** Alignment along the cross axis. */
export type Align = "start" | "center" | "end" | "baseline" | "stretch";

/** Distribution along the main axis. */
export type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";

/** Spacing steps available on the token scale. */
export type Space =
  | 0
  | 0.5
  | 1
  | 1.5
  | 2
  | 3
  | 4
  | 5
  | 6
  | 8
  | 10
  | 12
  | 16
  | 20
  | 24
  | "px"
  | (string & {});
