import {
  useMemo,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { Clock, X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { useFieldControl } from "./field-utils";
import type { ControlSize } from "../../types";
import type { Placement } from "../../utilities/position";

export interface TimePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Time as a 24-hour `HH:mm` or `HH:mm:ss` string. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Minute interval. Defaults to 1. */
  step?: number;
  /** Include a seconds column. */
  seconds?: boolean;
  hourCycle?: 12 | 24;
  min?: string;
  max?: string;
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

interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}

const TIME_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

function parseTime(value: string | undefined): TimeParts | null {
  if (!value) return null;
  const match = TIME_RE.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? 0);
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return { hours, minutes, seconds };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatTime(parts: TimeParts, seconds: boolean): string {
  return seconds
    ? `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
    : `${pad(parts.hours)}:${pad(parts.minutes)}`;
}

function toMinutes(value: string | undefined): number | null {
  const parts = parseTime(value);
  return parts ? parts.hours * 60 + parts.minutes : null;
}

/** Scrollable hour/minute/second column picker backed by a text trigger. */
export function TimePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  step = 1,
  seconds = false,
  hourCycle = 24,
  min,
  max,
  size = "md",
  invalid,
  disabled,
  required,
  readOnly,
  clearable = true,
  placeholder = "Select time",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom-start",
  name,
  label = "Time",
  id,
  className,
  "aria-describedby": describedBy,
  ...rest
}: TimePickerProps): ReactNode {
  const field = useFieldControl({ id, invalid, disabled, required, "aria-describedby": describedBy });
  const popupId = `${field.id}-popup`;
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const parts = useMemo(() => parseTime(value) ?? { hours: 0, minutes: 0, seconds: 0 }, [value]);

  const isDisabled = (partsNext: TimeParts): boolean => {
    const minutes = partsNext.hours * 60 + partsNext.minutes;
    const lo = toMinutes(min);
    const hi = toMinutes(max);
    if (lo != null && minutes < lo) return true;
    if (hi != null && minutes > hi) return true;
    return false;
  };

  const commit = (next: Partial<TimeParts>) => {
    const merged = { ...parts, ...next };
    if (isDisabled(merged)) return;
    setValue(formatTime(merged, seconds));
  };

  const hourOptions = useMemo(
    () =>
      hourCycle === 12
        ? Array.from({ length: 12 }, (_, i) => ({ label: pad(i + 1), value: i + 1 }))
        : Array.from({ length: 24 }, (_, h) => ({ label: pad(h), value: h })),
    [hourCycle],
  );

  const minuteOptions = useMemo(
    () =>
      Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step).map((m) => ({
        label: pad(m),
        value: m,
      })),
    [step],
  );
  const secondOptions = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i).map((s) => ({ label: pad(s), value: s })),
    [],
  );

  const openPopup = () => {
    if (field.disabled || readOnly) return;
    setOpen(true);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPopup();
    } else if (event.key === "Escape" && open) {
      setOpen(false);
    }
  };

  const period = parts.hours >= 12 ? "PM" : "AM";

  return (
    <div
      ref={(node) => {
        anchorRef.current = node;
      }}
      className={cx("ui-timepicker", className)}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      data-open={open || undefined}
      {...rest}
    >
      <div className="ui-timepicker__control ui-control" data-size={size}>
        <Clock size={16} className="ui-timepicker__icon" aria-hidden="true" />
        <input
          id={field.id}
          type="text"
          role="combobox"
          className="ui-timepicker__input"
          value={value}
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
          onKeyDown={handleKeyDown}
        />
        {clearable && value && !field.disabled && !readOnly ? (
          <button
            type="button"
            className="ui-timepicker__clear"
            aria-label="Clear time"
            onClick={() => setValue("")}
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {name ? <input type="hidden" name={name} value={value} /> : null}

      <FloatingLayer
        open={open}
        anchorRef={anchorRef}
        placement={placement}
        offset={4}
        onDismiss={() => setOpen(false)}
        id={popupId}
        className="ui-timepicker__popup"
      >
            <TimeColumn
              label="Hour"
              options={hourOptions}
              selected={hourCycle === 12 ? parts.hours % 12 || 12 : parts.hours}
              onSelect={(h) => commit({ hours: hourCycle === 12 ? (h % 12) + (period === "PM" ? 12 : 0) : h })}
              disabledCheck={(h) =>
                isDisabled({ ...parts, hours: hourCycle === 12 ? (h % 12) + (period === "PM" ? 12 : 0) : h })
              }
            />
            <TimeColumn
              label="Minute"
              options={minuteOptions}
              selected={parts.minutes}
              onSelect={(m) => commit({ minutes: m })}
              disabledCheck={(m) => isDisabled({ ...parts, minutes: m })}
            />
            {seconds ? (
              <TimeColumn
                label="Second"
                options={secondOptions}
                selected={parts.seconds}
                onSelect={(s) => commit({ seconds: s })}
                disabledCheck={(s) => isDisabled({ ...parts, seconds: s })}
              />
            ) : null}
            {hourCycle === 12 ? (
              <TimeColumn
                label="Period"
                options={[
                  { label: "AM", value: "AM" },
                  { label: "PM", value: "PM" },
                ]}
                selected={period}
                onSelect={(p) => {
                  const base = parts.hours % 12;
                  commit({ hours: p === "PM" ? base + 12 : base });
                }}
                disabledCheck={() => false}
              />
            ) : null}
      </FloatingLayer>
    </div>
  );
}

interface TimeOption<T extends string | number> {
  label: string;
  value: T;
}

interface TimeColumnProps<T extends string | number> {
  label: string;
  options: TimeOption<T>[];
  selected: T | number;
  onSelect: (value: T) => void;
  disabledCheck: (value: T) => boolean;
}

function TimeColumn<T extends string | number>({
  label,
  options,
  selected,
  onSelect,
  disabledCheck,
}: TimeColumnProps<T>): ReactNode {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const index = options.findIndex((option) => option.value === selected);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      let next = index;
      for (let i = 0; i < options.length; i += 1) {
        next = (next + direction + options.length) % options.length;
        if (!disabledCheck(options[next].value)) break;
      }
      onSelect(options[next].value);
    }
  };

  return (
    <div className="ui-timepicker__column" role="listbox" aria-label={label} onKeyDown={handleKeyDown}>
      {options.map((option) => {
        const isSelected = option.value === selected;
        const isDisabled = disabledCheck(option.value);
        return (
          <button
            key={String(option.value)}
            type="button"
            role="option"
            aria-selected={isSelected}
            aria-disabled={isDisabled || undefined}
            tabIndex={isSelected ? 0 : -1}
            className="ui-timepicker__option"
            data-selected={isSelected || undefined}
            onClick={() => {
              if (!isDisabled) onSelect(option.value);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

TimePicker.displayName = "TimePicker";
