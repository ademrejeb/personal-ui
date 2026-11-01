/**
 * Date utilities.
 *
 * The library distinguishes four kinds of date value, because conflating them
 * is the root cause of the classic "my calendar date jumped a day" bug:
 *
 *   1. Calendar date   — a day in the calendar, no time, no zone. e.g. "2026-10-15".
 *                        Represented internally as a local Date at local midnight.
 *   2. Local date-time — a wall-clock instant with no explicit zone. e.g. "2026-10-15T09:30".
 *   3. Instant         — an unambiguous point in time. e.g. a `Date`, epoch ms, or
 *                        an ISO string with `Z` / an offset.
 *   4. Zoned date-time — an instant expressed in a specific IANA zone (formatting only).
 *
 * We deliberately avoid constructing date-only values through `Date.parse` /
 * `new Date("2026-10-15")`, which interprets the string as UTC midnight and can
 * shift the calendar day depending on the host time zone.
 */

export type DateKind = "date" | "instant" | "invalid" | "empty";

export interface ParsedDate {
  kind: DateKind;
  /** Epoch milliseconds. For calendar dates this is local midnight of that day. */
  time: number;
  /** The original input, preserved for debugging / formatting decisions. */
  input: unknown;
}

export type DateInput = Date | number | string | null | undefined;

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME_LOCAL = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
const DATE_TIME_ZONED = /([zZ]|[+-]\d{2}:?\d{2})$/;
const ISO_DATETIME =
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:[zZ]|[+-]\d{2}:?\d{2})?$/;

export function isDateObject(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** True for a valid `Date` or a finite epoch-ms number. */
export function isValidDate(value: unknown): boolean {
  if (isDateObject(value)) return true;
  if (typeof value === "number") return Number.isFinite(value);
  return false;
}

/**
 * Parse a supported date representation without the UTC-shift pitfall.
 *
 * - `Date` and finite numbers are treated as instants.
 * - `YYYY-MM-DD` is a calendar date (local midnight).
 * - ISO strings with `Z`/offset are instants; without one they are local date-times.
 * - `null`/`undefined`/`""` are `empty`; anything unparseable is `invalid`.
 *
 * Ambiguous, locale-specific strings such as `10/11/2026` are intentionally
 * treated as `invalid`. Callers that need them must pass an explicit parser or
 * resolve the value with `parseWith` before handing it to the table.
 */
export function parseDateValue(value: DateInput): ParsedDate {
  if (value === null || value === undefined || value === "") {
    return { kind: "empty", time: Number.NaN, input: value };
  }
  if (isDateObject(value)) {
    return { kind: "instant", time: value.getTime(), input: value };
  }
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? { kind: "instant", time: value, input: value }
      : { kind: "invalid", time: Number.NaN, input: value };
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return { kind: "empty", time: Number.NaN, input: value };

    const dateOnly = DATE_ONLY.exec(trimmed);
    if (dateOnly) {
      const time = localTime(
        Number(dateOnly[1]),
        Number(dateOnly[2]),
        Number(dateOnly[3]),
      );
      return Number.isNaN(time)
        ? { kind: "invalid", time: Number.NaN, input: value }
        : { kind: "date", time, input: value };
    }

    const local = DATE_TIME_LOCAL.exec(trimmed);
    if (local && !DATE_TIME_ZONED.test(trimmed)) {
      const time = localTime(
        Number(local[1]),
        Number(local[2]),
        Number(local[3]),
        Number(local[4]),
        Number(local[5]),
        Number(local[6] ?? 0),
        Number((local[7] ?? "0").padEnd(3, "0")),
      );
      return Number.isNaN(time)
        ? { kind: "invalid", time: Number.NaN, input: value }
        : { kind: "instant", time, input: value };
    }

    // Only accept unambiguous ISO-8601 date-time strings. Locale-formatted
    // strings (e.g. "10/11/2026") are intentionally rejected rather than
    // guessed, since their meaning depends on the host's interpretation.
    if (!ISO_DATETIME.test(trimmed)) {
      return { kind: "invalid", time: Number.NaN, input: value };
    }
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed)
      ? { kind: "invalid", time: Number.NaN, input: value }
      : { kind: "instant", time: parsed, input: value };
  }
  return { kind: "invalid", time: Number.NaN, input: value };
}

function localTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  ms = 0,
): number {
  const date = new Date(year, month - 1, day, hour, minute, second, ms);
  // Reject overflowed calendar values (e.g. 2026-02-31 rolling into March).
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return Number.NaN;
  }
  return date.getTime();
}

/** Parse only date-only / instant values, applying an explicit custom parser first. */
export function parseWith(value: DateInput, parser: (input: string) => Date | null): ParsedDate {
  if (typeof value === "string") {
    const parsed = parser(value);
    if (isDateObject(parsed)) return { kind: "instant", time: parsed.getTime(), input: value };
  }
  return parseDateValue(value);
}

export type EmptyPosition = "last" | "first";

export interface CompareDateOptions {
  direction?: "asc" | "desc";
  /** Where empty values sort relative to populated ones. Defaults to "last". */
  emptyPosition?: EmptyPosition;
  /** Treat invalid values like empty. Defaults to true. */
  invalidAsEmpty?: boolean;
}

/**
 * Compare two date values with calendar-correct semantics. Never compares
 * formatted display strings.
 */
export function compareDateValues(a: DateInput, b: DateInput, options: CompareDateOptions = {}): number {
  const { direction = "asc", emptyPosition = "last", invalidAsEmpty = true } = options;
  const dir = direction === "asc" ? 1 : -1;
  const directed = (n: number) => (n === 0 ? 0 : n * dir);

  const pa = parseDateValue(a);
  const pb = parseDateValue(b);
  const emptyA = pa.kind === "empty" || (invalidAsEmpty && pa.kind === "invalid");
  const emptyB = pb.kind === "empty" || (invalidAsEmpty && pb.kind === "invalid");

  if (emptyA && emptyB) return 0;
  if (emptyA) return emptyPosition === "last" ? 1 : -1;
  if (emptyB) return emptyPosition === "last" ? -1 : 1;

  if (pa.time === pb.time) return 0;
  return directed(pa.time < pb.time ? -1 : 1);
}

/** Format a `Date`/instant/date-only value using `Intl.DateTimeFormat`. */
export function formatDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions & { locale?: string | string[] } = {},
): string {
  const parsed = parseDateValue(value);
  if (parsed.kind === "empty" || parsed.kind === "invalid") return "";
  const { locale, ...rest } = options;
  const date = new Date(parsed.time);
  const hasStyle = rest.dateStyle || rest.timeStyle;
  const fmt: Intl.DateTimeFormatOptions = hasStyle
    ? rest
    : {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        ...(parsed.kind === "instant" ? { hour: "2-digit", minute: "2-digit" } : {}),
        ...rest,
      };
  return new Intl.DateTimeFormat(locale, fmt).format(date);
}

/** Serialize a date to a calendar-date string (`YYYY-MM-DD`) using local components. */
export function toDateOnlyString(value: DateInput): string {
  const parsed = parseDateValue(value);
  if (parsed.kind === "empty" || parsed.kind === "invalid") return "";
  const date = new Date(parsed.time);
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}`;
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, "0");
}

/* ------------------------------------------------------------------ *
 * Calendar arithmetic (operates on local calendar dates)
 * ------------------------------------------------------------------ */

export function startOfDay(value: DateInput): Date {
  const d = new Date(parseDateValue(value).time);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(value: DateInput): Date {
  const d = new Date(parseDateValue(value).time);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(value: DateInput, amount: number): Date {
  const d = startOfDay(value);
  d.setDate(d.getDate() + amount);
  return d;
}

/** Add months, clamping the day to the target month's length (Jan 31 + 1 mo → Feb 28/29). */
export function addMonths(value: DateInput, amount: number): Date {
  const d = startOfDay(value);
  const targetDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + amount);
  const last = daysInMonth(d.getFullYear(), d.getMonth());
  d.setDate(Math.min(targetDay, last));
  return d;
}

export function startOfMonth(value: DateInput): Date {
  const d = startOfDay(value);
  d.setDate(1);
  return d;
}

export function endOfMonth(value: DateInput): Date {
  const d = startOfMonth(value);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d;
}

/** `weekStartsOn`: 0 = Sunday … 6 = Saturday. Defaults to Monday (1), matching ISO. */
export function startOfWeek(value: DateInput, weekStartsOn = 1): Date {
  const d = startOfDay(value);
  const diff = (d.getDay() - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function endOfWeek(value: DateInput, weekStartsOn = 1): Date {
  const d = startOfWeek(value, weekStartsOn);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, monthIndex: number): number {
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthIndex];
}

export function isSameDay(a: DateInput, b: DateInput): boolean {
  const da = startOfDay(a);
  const db = startOfDay(b);
  return da.getTime() === db.getTime();
}

export function isSameMonth(a: DateInput, b: DateInput): boolean {
  const da = startOfDay(a);
  const db = startOfDay(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth();
}

export function isBefore(a: DateInput, b: DateInput): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isAfter(a: DateInput, b: DateInput): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

/** Inclusive range check on calendar days by default. */
export function isWithin(
  value: DateInput,
  range: { from?: DateInput; to?: DateInput; inclusive?: boolean },
): boolean {
  const { from, to, inclusive = true } = range;
  const t = startOfDay(value).getTime();
  if (inclusive) {
    if (from != null && t < startOfDay(from).getTime()) return false;
    if (to != null && t > startOfDay(to).getTime()) return false;
    return true;
  }
  if (from != null && t <= startOfDay(from).getTime()) return false;
  if (to != null && t >= startOfDay(to).getTime()) return false;
  return true;
}

export function clampDate(value: DateInput, min?: DateInput, max?: DateInput): Date {
  let d = startOfDay(value);
  if (min != null && d.getTime() < startOfDay(min).getTime()) d = startOfDay(min);
  if (max != null && d.getTime() > startOfDay(max).getTime()) d = startOfDay(max);
  return d;
}

/** Number of whole calendar days from `from` to `to` (signed). */
export function differenceInDays(from: DateInput, to: DateInput): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

export interface DateDisabledConfig {
  min?: DateInput;
  max?: DateInput;
  /** Weekdays (0 = Sunday … 6 = Saturday) that cannot be selected. */
  disabledWeekdays?: number[];
  /** Custom predicate; return true to disable. */
  isDisabled?: (date: Date) => boolean;
}

/** Evaluate whether a calendar date is selectable given typical constraints. */
export function isDateDisabled(value: DateInput, config: DateDisabledConfig = {}): boolean {
  const day = startOfDay(value);
  if (!isDateObject(day)) return true;
  const { min, max, disabledWeekdays, isDisabled } = config;
  if (min != null && day.getTime() < startOfDay(min).getTime()) return true;
  if (max != null && day.getTime() > startOfDay(max).getTime()) return true;
  if (disabledWeekdays?.includes(day.getDay())) return true;
  if (isDisabled?.(day)) return true;
  return false;
}
