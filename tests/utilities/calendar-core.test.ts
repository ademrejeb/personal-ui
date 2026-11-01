import {
  buildEventIndex,
  buildMonthMatrix,
  eventsForDay,
  getMonthLabel,
  getWeekdayLabels,
  isDateInRange,
  isDayInEvent,
  normalizeEvent,
} from "@adem.rejeb/ui";

describe("buildMonthMatrix", () => {
  it("starts on the week containing the 1st and pads with adjacent days", () => {
    const weeks = buildMonthMatrix(new Date(2026, 1, 15), 1);
    expect(weeks).toHaveLength(5);
    for (const week of weeks) expect(week.days).toHaveLength(7);
    expect(weeks[0].days[0].key).toBe("2026-01-26");
  });

  it("marks outside days and honours a Sunday start", () => {
    const weeks = buildMonthMatrix(new Date(2026, 1, 15), 0);
    expect(weeks[0].days[0].key).toBe("2026-02-01");
    expect(weeks[0].days[0].outside).toBe(false);
    expect(weeks[0].days[6]?.key).toBe("2026-02-07");
  });

  it("forces six weeks when fixedWeeks is set", () => {
    const weeks = buildMonthMatrix(new Date(2026, 1, 15), 1, true);
    expect(weeks).toHaveLength(6);
    expect(weeks.flatMap((w) => w.days)).toHaveLength(42);
  });

  it("handles leap years", () => {
    const days = buildMonthMatrix(new Date(2028, 1, 1), 1, true).flatMap((w) => w.days);
    const febDays = days.filter((d) => d.key.startsWith("2028-02"));
    expect(febDays.some((d) => d.key === "2028-02-29")).toBe(true);
  });
});

describe("getWeekdayLabels", () => {
  it("returns seven localized labels ordered by weekStartsOn", () => {
    const monday = getWeekdayLabels("en-US", 1);
    expect(monday).toHaveLength(7);
    expect(monday[0]).toBe("Mon");
    expect(monday[6]).toBe("Sun");
  });
});

describe("getMonthLabel", () => {
  it("formats a localized month and year", () => {
    expect(getMonthLabel(new Date(2026, 9, 5), "en-US")).toBe("October 2026");
  });
});

describe("isDateInRange", () => {
  const from = new Date(2026, 0, 10);
  const to = new Date(2026, 0, 20);

  it("includes endpoints and interior days", () => {
    expect(isDateInRange(new Date(2026, 0, 10), { from, to })).toBe(true);
    expect(isDateInRange(new Date(2026, 0, 15), { from, to })).toBe(true);
    expect(isDateInRange(new Date(2026, 0, 20), { from, to })).toBe(true);
  });

  it("excludes days outside the range", () => {
    expect(isDateInRange(new Date(2026, 0, 9), { from, to })).toBe(false);
    expect(isDateInRange(new Date(2026, 0, 21), { from, to })).toBe(false);
  });

  it("is order-agnostic", () => {
    expect(isDateInRange(new Date(2026, 0, 15), { from: to, to: from })).toBe(true);
  });
});

describe("calendar events", () => {
  it("normalizes single-day and reversed spans", () => {
    const single = normalizeEvent({ start: new Date(2026, 0, 10) });
    expect(single.start).toBe(single.end);

    const reversed = normalizeEvent({ start: new Date(2026, 0, 20), end: new Date(2026, 0, 10) });
    expect(new Date(reversed.start).getDate()).toBe(10);
    expect(new Date(reversed.end).getDate()).toBe(20);
  });

  it("tests day membership inclusively", () => {
    const span = normalizeEvent({ start: new Date(2026, 0, 10), end: new Date(2026, 0, 12) });
    expect(isDayInEvent(new Date(2026, 0, 10), span)).toBe(true);
    expect(isDayInEvent(new Date(2026, 0, 12), span)).toBe(true);
    expect(isDayInEvent(new Date(2026, 0, 13), span)).toBe(false);
  });

  it("indexes every day a span covers", () => {
    const index = buildEventIndex([
      normalizeEvent({ id: "a", start: new Date(2026, 0, 30), end: new Date(2026, 1, 2) }),
    ]);
    expect(eventsForDay(index, new Date(2026, 0, 31))).toHaveLength(1);
    expect(eventsForDay(index, new Date(2026, 1, 1))).toHaveLength(1);
    expect(eventsForDay(index, new Date(2026, 1, 3))).toHaveLength(0);
  });
});
