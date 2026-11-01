import {
  useMemo,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { CalendarClock, X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { formatDate, toDateOnlyString } from "../../utilities/date";
import { useFieldControl } from "./field-utils";
import { Calendar } from "./Calendar";
import type { ControlSize } from "../../types";
import type { Placement } from "../../utilities/position";

export interface DateTimePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Local date-time as `YYYY-MM-DDTHH:mm` (or with `:ss` when `seconds`). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  seconds?: boolean;
  hourCycle?: 12 | 24;
  /** Minute interval. Defaults to 1. */
  step?: number;
  defaultMonth?: Date;
  min?: Date;
  max?: Date;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  numberOfMonths?: number;
  size?: ControlSize;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  placeholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  name?: string;
  label?: string;
}

interface Parts {
  date: string;
  hours: number;
  minutes: number;
  seconds: number;
}

const VALUE_RE = /^(\d{4}-\d{2}-\d{2})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?$/;

function parseValue(value: string | undefined): Parts {
  const fallback: Parts = { date: "", hours: 0, minutes: 0, seconds: 0 };
  if (!value) return fallback;
  const match = VALUE_RE.exec(value.trim());
  if (!match) return fallback;
  return {
    date: match[1],
    hours: Number(match[2]),
    minutes: Number(match[3]),
    seconds: Number(match[4] ?? 0),
  };
}

const pad = (n: number): string => String(n).padStart(2, "0");

function serialize(parts: Parts, seconds: boolean): string {
  if (!parts.date) return "";
  const time = `${pad(parts.hours)}:${pad(parts.minutes)}${seconds ? `:${pad(parts.seconds)}` : ""}`;
  return `${parts.date}T${time}`;
}

/** Date and time in one control, backed by the shared `Calendar` in a popup. */
export function DateTimePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  seconds = false,
  hourCycle = 24,
  step = 1,
  defaultMonth,
  min,
  max,
  weekStartsOn = 1,
  numberOfMonths = 1,
  size = "md",
  invalid,
  disabled,
  required,
  readOnly,
  clearable = true,
  placeholder = "Select date & time",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom-start",
  name,
  label = "Date and time",
  id,
  className,
  "aria-describedby": describedBy,
  ...rest
}: DateTimePickerProps): ReactNode {
  const field = useFieldControl({ id, invalid, disabled, required, "aria-describedby": describedBy });
  const popupId = `${field.id}-popup`;
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? "",
    onChange: (next) => onValueChange?.(next || null),
  });
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const parts = useMemo(() => parseValue(value), [value]);
  const selectedDate = parts.date ? new Date(`${parts.date}T00:00:00`) : null;

  const commit = (next: Partial<Parts>) => {
    const merged = { ...parts, ...next };
    setValue(serialize(merged, seconds));
  };

  const display = value
    ? `${formatDate(selectedDate, { dateStyle: "medium" })}${hourCycle === 12 ? " " : ", "}${pad(
        hourCycle === 12 ? parts.hours % 12 || 12 : parts.hours,
      )}:${pad(parts.minutes)}${seconds ? `:${pad(parts.seconds)}` : ""}${
        hourCycle === 12 ? (parts.hours >= 12 ? " PM" : " AM") : ""
      }`
    : "";

  const openPopup = () => {
    if (field.disabled || readOnly) return;
    setOpen(true);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPopup();
    } else if (event.key === "Escape" && open) {
      setOpen(false);
    }
  };

  const hourOptions = useMemo(
    () =>
      hourCycle === 12
        ? Array.from({ length: 12 }, (_, i) => i + 1)
        : Array.from({ length: 24 }, (_, i) => i),
    [hourCycle],
  );
  const minuteOptions = useMemo(
    () => Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step),
    [step],
  );
  const secondOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const period = parts.hours >= 12 ? "PM" : "AM";

  const navigateColumn = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    options: number[],
    current: number,
    onPick: (value: number) => void,
  ) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const index = Math.max(0, options.indexOf(current));
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const next = options[(index + direction + options.length) % options.length];
    onPick(next);
  };

  return (
    <div
      ref={(node) => {
        anchorRef.current = node;
      }}
      className={cx("ui-datetime", className)}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      data-open={open || undefined}
      {...rest}
    >
      <div className="ui-datetime__control ui-control" data-size={size}>
        <CalendarClock size={16} className="ui-datetime__icon" aria-hidden="true" />
        <input
          id={field.id}
          type="text"
          role="combobox"
          className="ui-datetime__input"
          value={display}
          placeholder={placeholder}
          readOnly
          disabled={field.disabled}
          required={field.required}
          aria-invalid={field.invalid || undefined}
          aria-describedby={field.describedBy}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={popupId}
          aria-label={label}
          onClick={openPopup}
          onKeyDown={handleTriggerKeyDown}
        />
        {clearable && value && !field.disabled && !readOnly ? (
          <button
            type="button"
            className="ui-datetime__clear"
            aria-label="Clear date and time"
            onClick={() => setValue("")}
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}

      <FloatingLayer
        open={open}
        anchorRef={anchorRef}
        placement={placement}
        offset={4}
        onDismiss={() => setOpen(false)}
        id={popupId}
        role="dialog"
        aria-label={label}
        className="ui-datetime__popup"
      >
            <Calendar
              mode="single"
              value={selectedDate}
              defaultMonth={selectedDate ?? defaultMonth}
              min={min}
              max={max}
              weekStartsOn={weekStartsOn}
              numberOfMonths={numberOfMonths}
              onValueChange={(date) => commit({ date: date ? toDateOnlyString(date) : "" })}
            />
            <div className="ui-datetime__time">
              <TimeColumn
                label="Hour"
                options={hourOptions}
                current={hourCycle === 12 ? parts.hours % 12 || 12 : parts.hours}
                onPick={(h) =>
                  commit({
                    hours:
                      hourCycle === 12 ? (h % 12) + (period === "PM" ? 12 : 0) : h,
                  })
                }
                onNavigate={(event, options0, current, pick) =>
                  navigateColumn(event, options0, current, pick)
                }
              />
              <TimeColumn
                label="Minute"
                options={minuteOptions}
                current={parts.minutes}
                onPick={(m) => commit({ minutes: m })}
                onNavigate={(event, options0, current, pick) =>
                  navigateColumn(event, options0, current, pick)
                }
              />
              {seconds ? (
                <TimeColumn
                  label="Second"
                  options={secondOptions}
                  current={parts.seconds}
                  onPick={(s) => commit({ seconds: s })}
                  onNavigate={(event, options0, current, pick) =>
                    navigateColumn(event, options0, current, pick)
                  }
                />
              ) : null}
              {hourCycle === 12 ? (
                <div className="ui-timepicker__column" role="listbox" aria-label="Period">
                  {(["AM", "PM"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      role="option"
                      aria-selected={period === option}
                      className="ui-timepicker__option"
                      data-selected={period === option || undefined}
                      onClick={() => {
                        const base = parts.hours % 12;
                        commit({ hours: option === "PM" ? base + 12 : base });
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
      </FloatingLayer>
    </div>
  );
}

interface TimeColumnProps {
  label: string;
  options: number[];
  current: number;
  onPick: (value: number) => void;
  onNavigate: (
    event: ReactKeyboardEvent<HTMLDivElement>,
    options: number[],
    current: number,
    onPick: (value: number) => void,
  ) => void;
}

function TimeColumn({ label, options, current, onPick, onNavigate }: TimeColumnProps): ReactNode {
  return (
    <div
      className="ui-timepicker__column"
      role="listbox"
      aria-label={label}
      onKeyDown={(event) => onNavigate(event, options, current, onPick)}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="option"
          aria-selected={option === current}
          tabIndex={option === current ? 0 : -1}
          className="ui-timepicker__option"
          data-selected={option === current || undefined}
          onClick={() => onPick(option)}
        >
          {pad(option)}
        </button>
      ))}
    </div>
  );
}

DateTimePicker.displayName = "DateTimePicker";
