export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

/**
 * Tiny, dependency-free class name combiner.
 *
 * Unlike `clsx` + `tailwind-merge`, this intentionally performs no conflict
 * resolution: this design system does not use atomic CSS, so later classes
 * simply win by source order. Keeping it minimal avoids a runtime dependency.
 */
export function cx(...values: ClassValue[]): string {
  let out = "";
  for (const value of values) {
    if (!value) continue;
    if (typeof value === "string" || typeof value === "number") {
      out = out ? `${out} ${value}` : String(value);
      continue;
    }
    if (Array.isArray(value)) {
      const inner = cx(...value);
      if (inner) out = out ? `${out} ${inner}` : inner;
      continue;
    }
    if (typeof value === "object") {
      for (const [key, active] of Object.entries(value)) {
        if (active) out = out ? `${out} ${key}` : key;
      }
    }
  }
  return out;
}
