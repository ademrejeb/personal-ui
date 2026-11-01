# Calendar guide

`Calendar` is a roving-grid month calendar with three selection models and
optional dated events. The date math lives in `calendar-core.ts` (pure,
testable) and the accessible grid/keyboard model lives in `Calendar.tsx`;
`DatePicker`, `DateRangePicker`, and `DateTimePicker` reuse the same core inside
a popup. Styles are `ui-calendar__*` in `styles/components/forms.css`.

> Dates here are **calendar dates** — a `Date` at local midnight. The utilities
> in `utilities/date.ts` never apply a UTC shift, so a date picked in one place
> compares equal everywhere.

## Selection modes

```tsx
// single (default)
<Calendar value={date} onValueChange={setDate} />

// range
<Calendar mode="range" defaultRange={{ from: null, to: null }} onRangeChange={setRange} />

// multiple — toggle individual dates
<Calendar mode="multiple" defaultValues={[]} onValuesChange={setDays} />
```

| Mode | Value props | Change |
| --- | --- | --- |
| `single` | `value` / `defaultValue` (`Date \| null`) | `onValueChange` |
| `range` | `range` / `defaultRange` (`{ from, to }`) | `onRangeChange` |
| `multiple` | `values` / `defaultValues` (`Date[]`) | `onValuesChange` |

Every mode is controlled-or-uncontrolled through the shared
`useControllableState`. Membership is tested with `isSameDay`, so dates from
different `Date` objects still match.

## Keyboard model

Focus is a single roving `tabIndex={0}` on the focused day; all movement is
handled by the grid container:

| Key | Action |
| --- | --- |
| `←` / `→` | ±1 day |
| `↑` / `↓` | ±1 week |
| `Home` / `End` | Start / end of the week (respects `weekStartsOn`) |
| `PageUp` / `PageDown` | ±1 month; hold `Shift` for ±1 year |
| `Enter` / `Space` | Select the focused day (ignored when disabled) |

Moving focus across a month boundary changes the visible month automatically.

## Constraints

`min` / `max` (any `DateInput`), `disabledWeekdays: number[]`, and a free-form
`isDateDisabled(date) => boolean` all funnel through `isDateDisabled` from
`utilities/date.ts`, and disabled days are skipped by nothing — they are simply
not selectable and are announced as disabled.

## Events

```tsx
<Calendar
  events={[
    { id: "sprint", start: new Date(2026, 1, 9), end: new Date(2026, 1, 11), label: "Sprint", status: "info" },
    { id: "launch", start: new Date(2026, 1, 24), label: "Launch", status: "success" },
  ]}
/>
```

`CalendarEvent` is `{ id?, start: DateInput, end?: DateInput, label?, status?, data? }`.
The span is **inclusive** of both `start` and `end`; omitting `end` makes a
single-day event. `normalizeEvent` / `buildEventIndex` / `eventsForDay` pre-index
spans by `YYYY-MM-DD` so a month render is O(days + events).

Rendered days expose:

- `data-event` — present when the day belongs to at least one event,
- `data-event-status` — the tone of the first event,
- `data-event-count` — number of events,
- an `aria-label` that appends the event labels, so events are not visual-only,
- a `.ui-calendar__event` corner dot when a day has more than one event.

`status` reuses the global `Status` tones (`neutral`/`success`/`warning`/`danger`/`info`).

## Presentation

`numberOfMonths` (multi-month layouts), `captionLayout="dropdown"` (month/year
selects), `weekStartsOn`, `locale`, `fixedWeeks` (always six rows),
`showOutsideDays`, `size` (`ControlSize`), and a `footer` slot for an
apply/clear row. The visible month is controlled via `month` /
`defaultMonth` / `onMonthChange`.

## Tests

- `tests/utilities/calendar-core.test.ts` — month matrix, weekday labels, ranges, and the event index/normalisation.
- `tests/components/date-pickers.test.tsx` — single/range/multiple selection and event rendering through the pickers.
