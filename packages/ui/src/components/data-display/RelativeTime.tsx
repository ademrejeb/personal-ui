import { forwardRef, useEffect, useMemo, useState, type HTMLAttributes } from "react";
import { formatRelativeTime } from "../../utilities/relative-time";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type RelativeTimeSlot = "root";
export type RelativeTimeClassNames = SlotClassNames<RelativeTimeSlot>;

export interface RelativeTimeProps
  extends Omit<HTMLAttributes<HTMLTimeElement>, "children">,
    SlotConfig<RelativeTimeSlot> {
  value: Date | number | string;
  /** BCP 47 locale for the relative and absolute text. */
  locale?: string;
  /** Fixed reference time. Supplying it disables the internal timer. */
  now?: Date;
  /** How often to recompute, in ms. `0` disables the timer. Default 60s. */
  updateInterval?: number;
  /** Show the absolute date/time in the native tooltip. Default true. */
  showTitle?: boolean;
  /** Custom relative formatter. */
  format?: (value: Date, now: Date) => string;
}

/**
 * A semantic `<time>` element with a live relative label ("3 hours ago") and an
 * absolute timestamp in `dateTime` and the tooltip.
 */
export const RelativeTime = forwardRef<HTMLTimeElement, RelativeTimeProps>(function RelativeTime(
  {
    className,
    value,
    locale,
    now,
    updateInterval = 60_000,
    showTitle = true,
    format,
    suppressHydrationWarning = true,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const [clock, setClock] = useState<Date>(() => now ?? new Date());

  useEffect(() => {
    if (now || updateInterval <= 0) return;
    const id = window.setInterval(() => setClock(new Date()), updateInterval);
    return () => window.clearInterval(id);
  }, [now, updateInterval]);

  const date = useMemo(() => (value instanceof Date ? value : new Date(value)), [value]);
  const valid = !Number.isNaN(date.getTime());

  if (!valid) {
    return (
      <time ref={ref} className={slotClass(config, "root", "ui-relative-time", className)} {...rest}>
        {String(value)}
      </time>
    );
  }

  const reference = now ?? clock;
  const text = format ? format(date, reference) : formatRelativeTime(date, reference, locale);
  const absolute = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

  return (
    <time
      ref={ref}
      dateTime={date.toISOString()}
      title={showTitle ? absolute : undefined}
      className={slotClass(config, "root", "ui-relative-time", className)}
      suppressHydrationWarning={suppressHydrationWarning}
      {...rest}
    >
      {text}
    </time>
  );
});
RelativeTime.displayName = "RelativeTime";
