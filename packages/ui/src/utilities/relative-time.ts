const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Formats a date relative to `now` using `Intl.RelativeTimeFormat`.
 * Pure and deterministic when `now` is supplied, so it is safe in tests and SSR.
 */
export function formatRelativeTime(
  value: Date | number | string,
  now: Date = new Date(),
  locale?: string,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = (date.getTime() - now.getTime()) / 1000;
  const abs = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (abs < 45) return formatter.format(0, "second");
  if (abs < 90) return formatter.format(Math.round(seconds / MINUTE), "minute");
  if (abs < 45 * MINUTE) return formatter.format(Math.round(seconds / MINUTE), "minute");
  if (abs < 90 * MINUTE) return formatter.format(Math.round(seconds / HOUR), "hour");
  if (abs < 22 * HOUR) return formatter.format(Math.round(seconds / HOUR), "hour");
  if (abs < 36 * HOUR) return formatter.format(Math.round(seconds / DAY), "day");
  if (abs < 26 * DAY) return formatter.format(Math.round(seconds / DAY), "day");
  if (abs < 45 * DAY) return formatter.format(Math.round(seconds / WEEK), "week");
  if (abs < 320 * DAY) return formatter.format(Math.round(seconds / MONTH), "month");
  return formatter.format(Math.round(seconds / YEAR), "year");
}
