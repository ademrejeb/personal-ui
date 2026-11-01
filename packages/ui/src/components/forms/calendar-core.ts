import {
  addDays,
  addMonths,
  daysInMonth,
  differenceInDays,
  isWithin,
  startOfMonth,
  startOfWeek,
  toDateOnlyString,
  type DateInput,
} from "../../utilities/date";
import type { Status } from "../../types";

/**
 * A dated event rendered on the calendar. `end` is inclusive, so a single-day
 * event omits it. Events are annotations: they highlight days and are announced
 * to assistive technology without changing selection behavior.
 */
export interface CalendarEvent {
  id?: string;
  start: DateInput;
  end?: DateInput;
  label?: string;
  /** Visual tone for the event marker. */
  status?: Status;
  /** Arbitrary payload for the consumer. */
  data?: unknown;
}

/** An event resolved to local-midnight timestamps for fast day lookups. */
export interface CalendarEventSpan {
  event: CalendarEvent;
  /** Inclusive start, in ms since epoch at local midnight. */
  start: number;
  /** Inclusive end, in ms since epoch at local midnight. */
  end: number;
}

/** Resolve an event's inclusive span, tolerating a reversed start/end. */
export function normalizeEvent(event: CalendarEvent): CalendarEventSpan {
  const a = startOfDayTime(event.start);
  const b = event.end ? startOfDayTime(event.end) : a;
  return { event, start: Math.min(a, b), end: Math.max(a, b) };
}

/** True when `date` falls inside the event's inclusive span. */
export function isDayInEvent(date: Date, span: CalendarEventSpan): boolean {
  const t = startOfDayTime(date);
  return t >= span.start && t <= span.end;
}

/** Index events by `YYYY-MM-DD` so each rendered day can look up its events. */
export function buildEventIndex(spans: CalendarEventSpan[]): Map<string, CalendarEventSpan[]> {
  const index = new Map<string, CalendarEventSpan[]>();
  for (const span of spans) {
    let cursor = new Date(span.start);
    while (cursor.getTime() <= span.end) {
      const key = toDateOnlyString(cursor);
      const list = index.get(key);
      if (list) list.push(span);
      else index.set(key, [span]);
      cursor = addDays(cursor, 1);
    }
  }
  return index;
}

/** Events covering `date`, in insertion order. */
export function eventsForDay(
  index: Map<string, CalendarEventSpan[]>,
  date: Date,
): CalendarEventSpan[] {
  return index.get(toDateOnlyString(date)) ?? [];
}

export interface CalendarDay {
  /** Local midnight of the day. */
  date: Date;
  /** `YYYY-MM-DD`. */
  key: string;
  day: number;
  /** True when the day belongs to an adjacent month in the same grid. */
  outside: boolean;
}

export interface CalendarWeek {
  days: CalendarDay[];
}

/**
 * Build the visible weeks for one month. The grid always starts on the week
 * containing the 1st and includes leading/trailing days from adjacent months so
 * every row has exactly seven cells. `fixedWeeks` forces six rows so the
 * calendar does not change height as months change.
 */
export function buildMonthMatrix(
  month: DateInput,
  weekStartsOn = 1,
  fixedWeeks = false,
): CalendarWeek[] {
  const first = startOfMonth(month);
  const gridStart = startOfWeek(first, weekStartsOn);
  const leading = differenceInDays(gridStart, first);
  const totalDays = daysInMonth(first.getFullYear(), first.getMonth());
  const rows = Math.ceil((leading + totalDays) / 7);
  const cellCount = fixedWeeks ? 42 : rows * 7;
  const monthIndex = first.getMonth();

  const weeks: CalendarWeek[] = [];
  for (let i = 0; i < cellCount; i += 1) {
    const date = addDays(gridStart, i);
    if (i % 7 === 0) weeks.push({ days: [] });
    weeks[weeks.length - 1].days.push({
      date,
      key: toDateOnlyString(date),
      day: date.getDate(),
      outside: date.getMonth() !== monthIndex,
    });
  }
  return weeks;
}

/** Localized short weekday labels ordered from `weekStartsOn`. */
export function getWeekdayLabels(locale: string | undefined, weekStartsOn = 1): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 2024-01-07 is a Sunday, giving a stable reference week.
  const sunday = new Date(2024, 0, 7);
  return Array.from({ length: 7 }, (_, i) => formatter.format(addDays(sunday, (weekStartsOn + i) % 7)));
}

/** Localized "October 2026" style caption. */
export function getMonthLabel(
  month: DateInput,
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" },
): string {
  return new Intl.DateTimeFormat(locale, options).format(addMonths(month, 0));
}

export interface MonthRange {
  from?: DateInput;
  to?: DateInput;
}

/** True when `date` falls inside the (inclusive) range, order-agnostic. */
export function isDateInRange(date: Date, range: MonthRange): boolean {
  const { from, to } = range;
  if (!from && !to) return false;
  if (from && !to) return isWithin(date, { from });
  if (!from && to) return isWithin(date, { to });
  const a = startOfDayTime(from as DateInput);
  const b = startOfDayTime(to as DateInput);
  const t = startOfDayTime(date);
  return t >= Math.min(a, b) && t <= Math.max(a, b);
}

function startOfDayTime(value: DateInput): number {
  const d = addDays(value, 0);
  return d.getTime();
}
