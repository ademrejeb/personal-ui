/** Locale-aware value formatters used by table cells, stats, and inputs. */

export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  locale?: string | string[];
  /** Value rendered when the input is empty/NaN. Defaults to an em dash. */
  fallback?: string;
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function formatNumber(value: unknown, options: NumberFormatOptions = {}): string {
  const { locale, fallback = "—", ...rest } = options;
  const n = toNumberOrNull(value);
  if (n === null) return fallback;
  return new Intl.NumberFormat(locale, rest).format(n);
}

export function formatCurrency(
  value: unknown,
  currency: string,
  options: NumberFormatOptions = {},
): string {
  return formatNumber(value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
    currency,
    style: "currency",
  });
}

/** `precision` is expressed in percent points (e.g. 1.5 → "150%"). */
export function formatPercent(value: unknown, options: NumberFormatOptions = {}): string {
  return formatNumber(value, { style: "percent", maximumFractionDigits: 1, ...options });
}

export interface FileSizeFormatOptions {
  locale?: string | string[];
  /** Number of decimals. Defaults to 1. */
  decimals?: number;
  fallback?: string;
}

const FILE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;

export function formatFileSize(bytes: unknown, options: FileSizeFormatOptions = {}): string {
  const { locale, decimals = 1, fallback = "—" } = options;
  const n = toNumberOrNull(bytes);
  if (n === null || n < 0) return fallback;
  if (n < 1024) return `${formatNumber(n, { locale, maximumFractionDigits: 0 })} B`;
  const exponent = Math.min(Math.floor(Math.log(n) / Math.log(1024)), FILE_UNITS.length - 1);
  const scaled = n / 1024 ** exponent;
  return `${formatNumber(scaled, { locale, minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${FILE_UNITS[exponent]}`;
}

/** Truncate long strings with an ellipsis, preserving a trailing tail if requested. */
export function truncateText(value: string, max: number, options: { ellipsis?: string } = {}): string {
  const { ellipsis = "…" } = options;
  if (max <= 0 || value.length <= max) return value;
  return value.slice(0, Math.max(0, max - ellipsis.length)) + ellipsis;
}

/** Convert a string into a URL/id-safe slug. */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Convert a string into Title Case for display. */
export function titleCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
