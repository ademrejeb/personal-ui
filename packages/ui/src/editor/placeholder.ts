import type { PlaceholderDefinition, PlaceholderRegistry } from "./types";

const DEFAULT_DELIMITERS = { open: "{{", close: "}}" };

export function createPlaceholderRegistry(
  variables: PlaceholderDefinition[] = [],
  delimiter?: { open: string; close: string },
): PlaceholderRegistry {
  const delims = delimiter ?? DEFAULT_DELIMITERS;
  const map = new Map(variables.map((v) => [v.key, v]));

  return {
    variables,
    delimiter: delims,
    resolve(key, context) {
      const def = map.get(key);
      const value = context[key] ?? def?.defaultValue;
      if (value === undefined || value === null) return def?.defaultValue ?? `{{${key}}}`;
      return def?.format ? def.format(value) : String(value);
    },
    validate(content) {
      const missing: string[] = [];
      const unknown: string[] = [];
      const regex = new RegExp(`${escapeRegex(delims.open)}\\s*([\\w.]+)\\s*${escapeRegex(delims.close)}`, "g");
      let m: RegExpExecArray | null;
      while ((m = regex.exec(content)) !== null) {
        const key = m[1];
        if (!map.has(key)) unknown.push(key);
      }
      return { missing, unknown };
    },
  };
}

function escapeRegex(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export function interpolatePlaceholders(
  content: string,
  registry: PlaceholderRegistry,
  context: Record<string, unknown>,
): string {
  const delims = registry.delimiter ?? DEFAULT_DELIMITERS;
  const regex = new RegExp(`${escapeRegex(delims.open)}\\s*([\\w.]+)\\s*${escapeRegex(delims.close)}`, "g");
  return content.replace(regex, (_match, key: string) => {
    const def = registry.variables.find((v) => v.key === key);
    if (!def) return `${delims.open}${key}${delims.close}`;
    return registry.resolve(key, context);
  });
}

export function extractPlaceholders(content: string, delimiter?: { open: string; close: string }): string[] {
  const delims = delimiter ?? DEFAULT_DELIMITERS;
  const regex = new RegExp(`${escapeRegex(delims.open)}\\s*([\\w.]+)\\s*${escapeRegex(delims.close)}`, "g");
  const keys: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) keys.push(m[1]);
  return [...new Set(keys)];
}
