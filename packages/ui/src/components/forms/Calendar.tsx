import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";
import {
  addDays,
  addMonths,
  clampDate,
  endOfWeek,
  isAfter,
  isBefore,
  isDateDisabled,
  isSameDay,
  startOfMonth,
  startOfWeek,
  type DateDisabledConfig,
  type DateInput,
} from "../../utilities/date";
import {
  buildEventIndex,
  buildMonthMatrix,
  eventsForDay,
  getMonthLabel,
  getWeekdayLabels,
  isDateInRange,
  normalizeEvent,
  type CalendarEvent,
} from "./calendar-core";
import type { ControlSize } from "../../types";

export type CalendarMode = "single" | "range" | "multiple";

export interface CalendarRange {
  from: Date | null;
  to: Date | null;
}

export interface CalendarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  mode?: CalendarMode;
  /** Selected date (single mode). */
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
  /** Selected range (range mode). */
  range?: CalendarRange;
  defaultRange?: CalendarRange;
  onRangeChange?: (range: CalendarRange) => void;
  /** Selected dates (multiple mode). */
  values?: Date[];
  defaultValues?: Date[];
  onValuesChange?: (dates: Date[]) => void;
  /** Dated events highlighted across the grid (any mode). */
  events?: CalendarEvent[];
  /** Visible month (controlled). */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  numberOfMonths?: number;
  /** 0 = Sunday … 6 = Saturday. Defaults to Monday. */
  weekStartsOn?: number;
  locale?: string;
  min?: DateInput;
  max?: DateInput;
  disabledWeekdays?: number[];
  isDateDisabled?: (date: Date) => boolean;
  /** Keep six rows so the calendar height never jumps. */
  fixedWeeks?: boolean;
  showOutsideDays?: boolean;
  /** Render month/year dropdowns in the caption instead of static text. */
  captionLayout?: "label" | "dropdown";
  size?: ControlSize;
  footer?: ReactNode;
}

const EMPTY_RANGE: CalendarRange = { from: null, to: null };
const EMPTY_DATES: Date[] = [];

/**
 * Calendar grid with roving-focus keyboard navigation, single and range
 * selection, localization, and constraint support. Serves as the foundation for
 * DatePicker and DateRangePicker.
 */
export function Calendar({
  mode = "single",
  value: valueProp,
  defaultValue = null,
  onValueChange,
  range: rangeProp,
  defaultRange = EMPTY_RANGE,
  onRangeChange,
  values: valuesProp,
  defaultValues = EMPTY_DATES,
  onValuesChange,
  events,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  numberOfMonths = 1,
  weekStartsOn = 1,
  locale,
  min,
  max,
  disabledWeekdays,
  isDateDisabled: isDateDisabledProp,
  fixedWeeks = false,
  showOutsideDays = true,
  captionLayout = "label",
  size = "md",
  footer,
  className,
  ...rest
}: CalendarProps): ReactNode {
  const today = useMemo(() => addDays(new Date(), 0), []);
  const [selected, setSelected] = useControllableState<Date | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  const [range, setRange] = useControllableState<CalendarRange>({
    value: rangeProp,
    defaultValue: defaultRange,
    onChange: onRangeChange,
  });
  const [values, setValues] = useControllableState<Date[]>({
    value: valuesProp,
    defaultValue: defaultValues,
    onChange: onValuesChange,
  });
  const [month, setMonth] = useControllableState<Date>({
    value: monthProp,
    defaultValue: defaultMonth ?? selected ?? values[0] ?? today,
    onChange: onMonthChange,
  });
  const [hovered, setHovered] = useState<Date | null>(null);
  const [focusedDate, setFocusedDate] = useState<Date>(() =>
    clampDate((mode === "range" ? range.from : mode === "multiple" ? values[0] : selected) ?? today, min, max),
  );

  const eventIndex = useMemo(
    () => buildEventIndex((events ?? []).map(normalizeEvent)),
    [events],
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const focusPending = useRef(false);
  const reactId = useId();

  const disabledConfig: DateDisabledConfig = { min, max, disabledWeekdays, isDisabled: isDateDisabledProp };
  const isDisabled = (date: Date) => isDateDisabled(date, disabledConfig);

  const months = useMemo(
    () => Array.from({ length: Math.max(1, numberOfMonths) }, (_, i) => addMonths(month, i)),
    [month, numberOfMonths],
  );

  const lastMonth = months[months.length - 1];

  // Move DOM focus after the roving index changes.
  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    const key = toKey(focusedDate);
    containerRef.current?.querySelector<HTMLButtonElement>(`[data-date="${key}"]`)?.focus();
  }, [focusedDate]);

  const focusDate = (next: Date, options: { syncMonth?: boolean } = {}) => {
    const clamped = clampDate(next, min, max);
    setFocusedDate(clamped);
    focusPending.current = true;
    if (options.syncMonth !== false) {
      const before = isBefore(clamped, startOfMonth(months[0]));
      const after = isAfter(clamped, lastMonth);
      if (before || after) setMonth(startOfMonth(clamped));
    }
  };

  const select = (date: Date) => {
    if (mode === "single") {
      setSelected(date);
      return;
    }
    if (mode === "multiple") {
      setValues((prev) =>
        prev.some((value) => isSameDay(value, date))
          ? prev.filter((value) => !isSameDay(value, date))
          : [...prev, date],
      );
      return;
    }
    const { from, to } = range;
    if (!from || (from && to)) {
      setRange({ from: date, to: null });
    } else if (isBefore(date, from)) {
      setRange({ from: date, to: null });
    } else {
      setRange({ from, to: date });
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const { key, shiftKey } = event;
    let handled = true;
    switch (key) {
      case "ArrowLeft":
        focusDate(addDays(focusedDate, -1));
        break;
      case "ArrowRight":
        focusDate(addDays(focusedDate, 1));
        break;
      case "ArrowUp":
        focusDate(addDays(focusedDate, -7));
        break;
      case "ArrowDown":
        focusDate(addDays(focusedDate, 7));
        break;
      case "Home":
        focusDate(startOfWeek(focusedDate, weekStartsOn));
        break;
      case "End":
        focusDate(endOfWeek(focusedDate, weekStartsOn));
        break;
      case "PageUp":
        focusDate(addMonths(focusedDate, shiftKey ? -12 : -1));
        break;
      case "PageDown":
        focusDate(addMonths(focusedDate, shiftKey ? 12 : 1));
        break;
      case "Enter":
      case " ":
        if (!isDisabled(focusedDate)) select(focusedDate);
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  };

  return (
    <div
      {...rest}
      ref={containerRef}
      className={cx("ui-calendar", className)}
      data-size={size}
      data-mode={mode}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="ui-calendar__months">
        {months.map((monthDate, monthIndex) => {
          const weeks = buildMonthMatrix(monthDate, weekStartsOn, fixedWeeks);
          const caption = getMonthLabel(monthDate, locale);
          return (
            <div className="ui-calendar__month" key={`${reactId}-${monthIndex}`}>
              <div className="ui-calendar__header">
                {monthIndex === 0 ? (
                  <button
                    type="button"
                    className="ui-calendar__nav"
                    aria-label="Previous month"
                    onClick={() => setMonth(addMonths(month, -1))}
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </button>
                ) : (
                  <span className="ui-calendar__nav ui-calendar__nav--spacer" aria-hidden="true" />
                )}

                {captionLayout === "dropdown" ? (
                  <div className="ui-calendar__caption ui-calendar__caption--dropdown">
                    <select
                      className="ui-calendar__select"
                      aria-label="Month"
                      value={monthDate.getMonth()}
                      onChange={(event) => {
                        const next = new Date(monthDate);
                        next.setMonth(Number(event.target.value));
                        setMonth(next);
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2024, i, 1))}
                        </option>
                      ))}
                    </select>
                    <select
                      className="ui-calendar__select"
                      aria-label="Year"
                      value={monthDate.getFullYear()}
                      onChange={(event) => {
                        const next = new Date(monthDate);
                        next.setFullYear(Number(event.target.value));
                        setMonth(next);
                      }}
                    >
                      {yearOptions(monthDate.getFullYear(), min, max).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="ui-calendar__caption" aria-live="polite">
                    {caption}
                  </div>
                )}

                {monthIndex === months.length - 1 ? (
                  <button
                    type="button"
                    className="ui-calendar__nav"
                    aria-label="Next month"
                    onClick={() => setMonth(addMonths(month, 1))}
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                ) : (
                  <span className="ui-calendar__nav ui-calendar__nav--spacer" aria-hidden="true" />
                )}
              </div>

              <div
                className="ui-calendar__grid"
                role="grid"
                aria-label={caption}
              >
                <div className="ui-calendar__row ui-calendar__row--head" role="row">
                  {getWeekdayLabels(locale, weekStartsOn).map((weekday) => (
                    <span key={weekday} role="columnheader" className="ui-calendar__weekday" aria-label={weekday}>
                      {weekday.slice(0, 2)}
                    </span>
                  ))}
                </div>
                {weeks.map((week) => (
                  <div className="ui-calendar__row" role="row" key={toKey(week.days[0].date)}>
                    {week.days.map((day) => {
                      const disabled = isDisabled(day.date);
                      const selectedSingle =
                        mode === "single" && selected != null && isSameDay(day.date, selected);
                      const rangeStart =
                        mode === "range" && range.from != null && isSameDay(day.date, range.from);
                      const rangeEnd = mode === "range" && range.to != null && isSameDay(day.date, range.to);
                      const previewRange =
                        mode === "range" && range.from && !range.to
                          ? { from: range.from, to: hovered }
                          : range;
                      const inRange = mode === "range" && isDateInRange(day.date, previewRange);
                      const selectedMultiple =
                        mode === "multiple" && values.some((value) => isSameDay(value, day.date));
                      const isFocused = isSameDay(day.date, focusedDate);
                      const isToday = isSameDay(day.date, today);
                      const isSelected = selectedSingle || rangeStart || rangeEnd || selectedMultiple;
                      const dayEvents = eventsForDay(eventIndex, day.date);
                      const eventLabels = dayEvents
                        .map((span) => span.event.label)
                        .filter((label): label is string => Boolean(label));
                      const dayLabel = getMonthLabel(day.date, locale, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });

                      if (day.outside && !showOutsideDays) {
                        return (
                          <span
                            key={day.key}
                            role="gridcell"
                            className="ui-calendar__day ui-calendar__day--empty"
                            aria-hidden="true"
                          />
                        );
                      }

                      return (
                        <button
                          key={day.key}
                          type="button"
                          role="gridcell"
                          data-date={day.key}
                          tabIndex={isFocused ? 0 : -1}
                          className={cx("ui-calendar__day")}
                          data-outside={day.outside || undefined}
                          data-today={isToday || undefined}
                          data-selected={isSelected || undefined}
                          data-in-range={inRange && !isSelected ? true : undefined}
                          data-range-start={rangeStart || undefined}
                          data-range-end={rangeEnd || undefined}
                          data-event={dayEvents.length > 0 || undefined}
                          data-event-status={dayEvents[0]?.event.status}
                          data-event-count={dayEvents.length > 1 ? dayEvents.length : undefined}
                          aria-selected={isSelected}
                          aria-disabled={disabled || undefined}
                          aria-current={isToday ? "date" : undefined}
                          aria-label={
                            eventLabels.length ? `${dayLabel} — ${eventLabels.join(", ")}` : dayLabel
                          }
                          onClick={() => {
                            if (disabled) return;
                            setFocusedDate(day.date);
                            select(day.date);
                          }}
                          onMouseEnter={() => {
                            if (mode === "range" && range.from && !range.to) setHovered(day.date);
                          }}
                          onFocus={() => setFocusedDate(day.date)}
                        >
                          <span className="ui-calendar__day-number">{day.day}</span>
                          {dayEvents.length > 1 ? (
                            <span className="ui-calendar__event" aria-hidden="true" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {footer ? <div className="ui-calendar__footer">{footer}</div> : null}
    </div>
  );
}

function toKey(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function yearOptions(current: number, min?: DateInput, max?: DateInput): number[] {
  const minYear = typeof min === "string" ? Number(min.slice(0, 4)) : min instanceof Date ? min.getFullYear() : current - 10;
  const maxYear = typeof max === "string" ? Number(max.slice(0, 4)) : max instanceof Date ? max.getFullYear() : current + 10;
  const start = Math.min(minYear, current);
  const end = Math.max(maxYear, current);
  const years: number[] = [];
  for (let y = start; y <= end; y += 1) years.push(y);
  return years;
}

Calendar.displayName = "Calendar";
