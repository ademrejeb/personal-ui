/** Joins multiple `aria-describedby` id sources, dropping empty values. */
export function mergeDescribedBy(...ids: (string | undefined | null | false)[]): string | undefined {
  const joined = ids.filter(Boolean).join(" ").trim();
  return joined.length > 0 ? joined : undefined;
}

/** Creates a stable id from a base and suffix. */
export function idSuffix(base: string, suffix: string): string {
  return `${base}-${suffix}`;
}

/** A CSS-safe reference to a value, used for option ids. */
export function optionId(base: string, value: string): string {
  return `${base}-${value.replace(/\s+/g, "-").toLowerCase()}`;
}
