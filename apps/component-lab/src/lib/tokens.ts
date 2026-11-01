export interface CssVariable {
  name: string;
  value: string;
}

/** Read every `--ui-*` custom property currently resolved on `:root`. */
export function readCssVariables(prefix = "--ui-"): CssVariable[] {
  if (typeof window === "undefined") return [];
  const style = window.getComputedStyle(document.documentElement);
  const out: CssVariable[] = [];
  for (let index = 0; index < style.length; index += 1) {
    const name = style.item(index);
    if (!name || !name.startsWith(prefix)) continue;
    out.push({ name, value: style.getPropertyValue(name).trim() });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

const COLOR_RE =
  /(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(|oklab\(|color\(|color-mix\(|\btransparent\b)/;

export function looksLikeColor(value: string): boolean {
  return COLOR_RE.test(value);
}

export type TokenGroup = "Primitives" | "Semantic" | "Component";

export const TOKEN_GROUPS: TokenGroup[] = ["Semantic", "Component", "Primitives"];

const COMPONENT_PREFIXES = [
  "--ui-control-",
  "--ui-input-",
  "--ui-card-",
  "--ui-overlay-",
  "--ui-tooltip-",
  "--ui-table-",
  "--ui-button-",
  "--ui-toast-",
  "--ui-spinner-",
  "--ui-avatar-",
];

export function classifyToken(name: string): TokenGroup {
  if (name.startsWith("--ui-p-")) return "Primitives";
  if (COMPONENT_PREFIXES.some((prefix) => name.startsWith(prefix))) return "Component";
  return "Semantic";
}
