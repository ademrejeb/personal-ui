import {
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { CalendarRange as CalendarRangeIcon, X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { formatDate, toDateOnlyString, type DateInput } from "../../utilities/date";
import { Calendar, type CalendarProps, type CalendarRange } from "./Calendar";
import { useFieldControl } from "./field-utils";
import type { ControlSize } from "../../types";
import type { Placement } from "../../utilities/position";

const EMPTY_RANGE: CalendarRange = { from: null, to: null };

export interface DateRangePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: CalendarRange;
  defaultValue?: CalendarRange;
  onRangeChange?: (range: CalendarRange) => void;
  /** Initial visible month when no value is set. */
  defaultMonth?: Date;
  min?: DateInput;
  max?: DateInput;
  disabledWeekdays?: number[];
  isDateDisabled?: (date: Date) => boolean;
  weekStartsOn?: number;
  numberOfMonths?: number;
  fixedWeeks?: boolean;
  showOutsideDays?: boolean;
  captionLayout?: CalendarProps["captionLayout"];
  locale?: string;
  format?: Intl.DateTimeFormatOptions & { locale?: string };
  placeholder?: string;
  rangeSeparator?: string;
  size?: ControlSize;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  footer?: ReactNode;
  name?: string;
  /** Accessible name for the trigger. */
  label?: string;
}

/** Two-month range calendar in a popup, with start/end endpoints and hover preview. */
export function DateRangePicker({
  value: valueProp,
  defaultValue = EMPTY_RANGE,
  onRangeChange,
  defaultMonth,
  min,
  max,
  disabledWeekdays,
  isDateDisabled,
  weekStartsOn,
  numberOfMonths = 2,
  fixedWeeks,
  showOutsideDays,
  captionLayout,
  locale,
  format,
  placeholder = "Select range",
  rangeSeparator = " – ",
  size = "md",
  invalid,
  disabled,
  required,
  readOnly,
  clearable = true,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom-start",
  footer,
  name,
  label = "Date range",
  id,
  className,
  "aria-describedby": describedBy,
  ...rest
}: DateRangePickerProps): ReactNode {
  const field = useFieldControl({ id, invalid, disabled, required, "aria-describedby": describedBy });
  const popupId = `${field.id}-popup`;
  const [range, setRange] = useControllableState<CalendarRange>({
    value: valueProp,
    defaultValue,
    onChange: onRangeChange,
  });
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [month, setMonth] = useState<Date | undefined>(defaultMonth);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const hasValue = Boolean(range.from || range.to);
  const display = useMemo(() => {
    const fmt = (date: Date) =>
      formatDate(toDateOnlyString(date), {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        ...format,
        locale,
      });
    const from = range.from ? fmt(range.from) : "";
    const to = range.to ? fmt(range.to) : "";
    if (from && to) return `${from}${rangeSeparator}${to}`;
    return from || to;
  }, [range, format, locale, rangeSeparator]);

  const openPopup = () => {
    if (field.disabled || readOnly) return;
    setMonth(range.from ?? defaultMonth ?? new Date());
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

  return (
    <div
      ref={(node) => {
        anchorRef.current = node;
      }}
      className={cx("ui-daterange", className)}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      data-open={open || undefined}
      {...rest}
    >
      <div className="ui-daterange__control ui-control" data-size={size}>
        <CalendarRangeIcon size={16} className="ui-daterange__icon" aria-hidden="true" />
        <input
          id={field.id}
          type="text"
          role="combobox"
          className="ui-daterange__input"
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
          onKeyDown={handleKeyDown}
        />
        {clearable && hasValue && !field.disabled && !readOnly ? (
          <button
            type="button"
            className="ui-daterange__clear"
            aria-label="Clear range"
            onClick={() => setRange(EMPTY_RANGE)}
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {name ? (
        <>
          <input type="hidden" name={`${name}From`} value={range.from ? toDateOnlyString(range.from) : ""} />
          <input type="hidden" name={`${name}To`} value={range.to ? toDateOnlyString(range.to) : ""} />
        </>
      ) : null}

      <FloatingLayer
        open={open}
        anchorRef={anchorRef}
        placement={placement}
        offset={4}
        onDismiss={() => setOpen(false)}
        id={popupId}
        className="ui-daterange__popup"
      >
            <Calendar
              mode="range"
              range={range}
              onRangeChange={setRange}
              month={month}
              onMonthChange={setMonth}
              min={min}
              max={max}
              disabledWeekdays={disabledWeekdays}
              isDateDisabled={isDateDisabled}
              weekStartsOn={weekStartsOn}
              numberOfMonths={numberOfMonths}
              fixedWeeks={fixedWeeks}
              showOutsideDays={showOutsideDays}
              captionLayout={captionLayout}
              locale={locale}
              footer={footer}
              size={size}
            />
      </FloatingLayer>
    </div>
  );
}

DateRangePicker.displayName = "DateRangePicker";
