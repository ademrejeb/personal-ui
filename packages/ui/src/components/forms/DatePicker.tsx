import {
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { formatDate, toDateOnlyString, type DateInput } from "../../utilities/date";
import { Calendar, type CalendarProps } from "./Calendar";
import { useFieldControl } from "./field-utils";
import type { ControlSize } from "../../types";
import type { Placement } from "../../utilities/position";

export interface DatePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
  onMonthChange?: CalendarProps["onMonthChange"];
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
  label?: string;
}

/**
 * Date input with a popup `Calendar`. The trigger is a read-only text field so
 * the value is always a real calendar date rather than a free-typed string.
 */
export function DatePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  onMonthChange,
  defaultMonth,
  min,
  max,
  disabledWeekdays,
  isDateDisabled,
  weekStartsOn,
  numberOfMonths,
  fixedWeeks,
  showOutsideDays,
  captionLayout,
  locale,
  format,
  placeholder = "Select date",
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
  label = "Date",
  id,
  className,
  "aria-describedby": describedBy,
  ...rest
}: DatePickerProps): ReactNode {
  const field = useFieldControl({ id, invalid, disabled, required, "aria-describedby": describedBy });
  const popupId = `${field.id}-popup`;
  const [value, setValue] = useControllableState<Date | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [month, setMonth] = useState<Date | undefined>(defaultMonth);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const display = useMemo(() => {
    if (!value) return "";
    // Format the date-only string so a `Date` (an instant) is still shown as a
    // calendar date without a time component.
    return formatDate(toDateOnlyString(value), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      ...format,
      locale,
    });
  }, [value, format, locale]);

  const openPopup = () => {
    if (field.disabled || readOnly) return;
    setMonth(value ?? defaultMonth ?? new Date());
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
      className={cx("ui-datepicker", className)}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      data-open={open || undefined}
      {...rest}
    >
      <div className="ui-datepicker__control ui-control" data-size={size}>
        <CalendarIcon size={16} className="ui-datepicker__icon" aria-hidden="true" />
        <input
          id={field.id}
          type="text"
          role="combobox"
          className="ui-datepicker__input"
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
        {clearable && value && !field.disabled && !readOnly ? (
          <button
            type="button"
            className="ui-datepicker__clear"
            aria-label="Clear date"
            onClick={() => setValue(null)}
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {name ? <input type="hidden" name={name} value={value ? toDateOnlyString(value) : ""} /> : null}

      <FloatingLayer
        open={open}
        anchorRef={anchorRef}
        placement={placement}
        offset={4}
        onDismiss={() => setOpen(false)}
        id={popupId}
        className="ui-datepicker__popup"
      >
            <Calendar
              value={value}
              onValueChange={(next) => {
                setValue(next);
                setOpen(false);
              }}
              month={month}
              onMonthChange={(next) => {
                setMonth(next);
                onMonthChange?.(next);
              }}
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

DatePicker.displayName = "DatePicker";
