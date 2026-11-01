import type { ReactNode } from "react";

/** Top-level grouping used for navigation and search. */
export type Category =
  | "Layout"
  | "Typography"
  | "Actions"
  | "Forms"
  | "Feedback"
  | "Overlays"
  | "Navigation"
  | "Data Display"
  | "Application"
  | "Icons";

export const CATEGORY_ORDER: Category[] = [
  "Layout",
  "Typography",
  "Actions",
  "Forms",
  "Feedback",
  "Overlays",
  "Navigation",
  "Data Display",
  "Application",
  "Icons",
];

/** A single control value in the playground. */
export type DemoValue = string | number | boolean | undefined;

/** The live playground state, keyed by control name. */
export type DemoState = Record<string, DemoValue>;

export interface SelectOption {
  label: string;
  value: string | number | boolean;
}

export type ControlType = "text" | "textarea" | "number" | "boolean" | "select";

/** Schema describing one editable control in the playground. */
export interface Control {
  /** Prop/state key. */
  name: string;
  type: ControlType;
  label?: string;
  description?: string;
  /** Value used when the playground first mounts. */
  defaultValue: DemoValue;
  /** Options for `type: "select"`. */
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

/** One row in the generated props table. */
export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  description: string;
  required?: boolean;
}

/** Everything the lab needs to render, document, and codegen a component. */
export interface ComponentEntry {
  /** URL slug, unique across the registry (e.g. "button"). */
  id: string;
  /** Display name (e.g. "Button"). */
  name: string;
  category: Category;
  /** One-line summary shown in lists and search. */
  description: string;
  /** Extra search terms. */
  keywords?: string[];
  /** Editable controls for the playground. Omit for purely static demos. */
  controls?: Control[];
  /** Default children text used by the demo and the default codegen. */
  children?: string;
  /** Renders the live preview for the current control state. */
  render: (state: DemoState) => ReactNode;
  /** Optional hand-authored code string; falls back to generated code. */
  code?: (state: DemoState) => string;
  /** Props metadata for the documentation table. */
  props?: PropDoc[];
  /** Accessibility / usage notes rendered under the preview. */
  notes?: string[];
}
