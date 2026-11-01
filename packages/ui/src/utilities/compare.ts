import { compareDateValues, isDateObject, parseDateValue, type EmptyPosition } from "./date";

/** How a column's values should be compared. */
export type CompareKind =
  | "auto"
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "date-only"
  | "numeric-string";

export interface CompareOptions {
  kind?: CompareKind;
  direction?: "asc" | "desc";
  emptyPosition?: EmptyPosition;
  /** Locale(s) passed to `String.prototype.localeCompare`. */
  locale?: string | string[];
  /** Treat invalid values like empty. Defaults to true. */
  invalidAsEmpty?: boolean;
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

function detectKind(a: unknown, b: unknown): CompareKind {
  if (isDateObject(a) || isDateObject(b)) return "date";
  if (typeof a === "number" || typeof b === "number") return "number";
  if (typeof a === "boolean" || typeof b === "boolean") return "boolean";
  if (typeof a === "string" || typeof b === "string") {
    const pa = parseDateValue(a as string);
    const pb = parseDateValue(b as string);
    if (
      (pa.kind === "date" || pa.kind === "instant") &&
      (pb.kind === "date" || pb.kind === "instant")
    ) {
      return pa.kind === "date" && pb.kind === "date" ? "date-only" : "date";
    }
  }
  return "auto";
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Type-aware, direction-aware comparison used by `DataTable` and other sorted
 * collections. Empty values sort to `emptyPosition` (default: last) in both
 * directions. Never mutates its inputs and never compares formatted strings.
 */
export function compareValues(a: unknown, b: unknown, options: CompareOptions = {}): number {
  const {
    direction = "asc",
    emptyPosition = "last",
    locale,
    invalidAsEmpty = true,
    kind = "auto",
  } = options;
  const dir = direction === "asc" ? 1 : -1;

  const emptyA = isEmpty(a);
  const emptyB = isEmpty(b);
  if (emptyA && emptyB) return 0;
  if (emptyA) return emptyPosition === "last" ? 1 : -1;
  if (emptyB) return emptyPosition === "last" ? -1 : 1;

  const resolved = kind === "auto" ? detectKind(a, b) : kind;

  let base: number;
  switch (resolved) {
    case "date":
    case "date-only": {
      const ra = parseDateValue(a as never);
      const rb = parseDateValue(b as never);
      if ((ra.kind === "invalid" || ra.kind === "empty") && invalidAsEmpty) {
        return rb.kind === "invalid" || rb.kind === "empty"
          ? 0
          : emptyPosition === "last"
            ? 1
            : -1;
      }
      // compareDateValues applies empty placement and direction itself.
      return compareDateValues(a as never, b as never, { emptyPosition, direction });
    }
    case "number": {
      const na = toNumber(a);
      const nb = toNumber(b);
      if (na === null || nb === null) {
        if (invalidAsEmpty) return emptyPosition === "last" ? 1 : -1;
        base = String(a).localeCompare(String(b), locale, { numeric: true });
        break;
      }
      base = na === nb ? 0 : na < nb ? -1 : 1;
      break;
    }
    case "boolean": {
      const na = a ? 1 : 0;
      const nb = b ? 1 : 0;
      base = na - nb;
      break;
    }
    case "numeric-string": {
      const na = toNumber(a);
      const nb = toNumber(b);
      if (na !== null && nb !== null) {
        base = na === nb ? 0 : na < nb ? -1 : 1;
      } else {
        base = String(a).localeCompare(String(b), locale, { numeric: true });
      }
      break;
    }
    case "string":
    default:
      base = String(a).localeCompare(String(b), locale, { numeric: true, sensitivity: "base" });
      break;
  }

  if (base === 0) return 0;
  return base < 0 ? -dir : dir;
}

/** Build a stable comparator that falls back to the original index on ties. */
export function makeStableComparator<T>(
  compare: (a: T, b: T) => number,
): (a: T, b: T, indexA: number, indexB: number) => number {
  return (a, b, indexA, indexB) => {
    const result = compare(a, b);
    return result !== 0 ? result : indexA - indexB;
  };
}

const COLLATOR_CACHE = new Map<string, Intl.Collator>();

/** Memoized `Intl.Collator` for locale-aware, numeric-aware string sorting. */
export function getCollator(locale?: string | string[]): Intl.Collator {
  const key = Array.isArray(locale) ? locale.join(",") : (locale ?? "");
  let collator = COLLATOR_CACHE.get(key);
  if (!collator) {
    collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
    COLLATOR_CACHE.set(key, collator);
  }
  return collator;
}
