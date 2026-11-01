import type { ComponentEntry, DemoState, DemoValue } from "../registry/types";

export type AttrValue = DemoValue | null;

function formatValue(value: string | number): string {
  if (typeof value === "number") return `{${value}}`;
  // Strings that look like JSX, object literals, or arrays are emitted as raw
  // expressions (e.g. `<Tag />`, `["a", "b"]`) rather than quoted text.
  if (/^[<[{]/.test(value)) return `{${value}}`;
  return JSON.stringify(value);
}

/** Join attribute key/values into a JSX attribute string (booleans shorthand). */
export function formatAttrs(props: Record<string, AttrValue>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    parts.push(value === true ? key : `${key}=${formatValue(value)}`);
  }
  return parts.length ? " " + parts.join(" ") : "";
}

export interface JsxOptions {
  props?: Record<string, AttrValue>;
  children?: string;
}

/** Compose a JSX element string, indenting block children. */
export function jsx(tag: string, { props = {}, children }: JsxOptions = {}): string {
  const attrs = formatAttrs(props);
  if (children === undefined || children === "") return `<${tag}${attrs} />`;
  if (!children.includes("\n")) return `<${tag}${attrs}>${children}</${tag}>`;
  const indented = children
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
  return `<${tag}${attrs}>\n${indented}\n</${tag}>`;
}

/**
 * Fallback code generator: emits the component tag with every control whose
 * current value differs from its default, plus its default children.
 */
export function generateCode(entry: ComponentEntry, state: DemoState): string {
  if (entry.code) return entry.code(state);

  const props: Record<string, AttrValue> = {};
  for (const control of entry.controls ?? []) {
    const value = state[control.name];
    if (value === undefined || value === control.defaultValue) continue;
    props[control.name] = value === control.defaultValue ? undefined : value;
  }

  return jsx(entry.name, { props, children: entry.children });
}
