import {
  addMonths,
  compareDateValues,
  compareValues,
  daysInMonth,
  differenceInDays,
  endOfMonth,
  formatDate,
  isDateDisabled,
  isLeapYear,
  isSameDay,
  isWithin,
  parseDateValue,
  startOfMonth,
  startOfWeek,
  toDateOnlyString,
} from "@adem.rejeb/ui";

describe("parseDateValue", () => {
  it("treats YYYY-MM-DD as a local calendar date (no UTC shift)", () => {
    const parsed = parseDateValue("2026-10-15");
    expect(parsed.kind).toBe("date");
    expect(parsed.time).toBe(new Date(2026, 9, 15).getTime());
  });

  it("treats ISO strings with a zone as instants", () => {
    const parsed = parseDateValue("2026-10-15T12:00:00Z");
    expect(parsed.kind).toBe("instant");
    expect(parsed.time).toBe(Date.UTC(2026, 9, 15, 12, 0, 0));
  });

  it("treats a zone-less ISO date-time as a local instant", () => {
    const parsed = parseDateValue("2026-10-15T09:30");
    expect(parsed.kind).toBe("instant");
    expect(parsed.time).toBe(new Date(2026, 9, 15, 9, 30).getTime());
  });

  it("rejects ambiguous locale-specific strings", () => {
    expect(parseDateValue("10/11/2026").kind).toBe("invalid");
  });

  it("classifies empty and null as empty", () => {
    expect(parseDateValue("").kind).toBe("empty");
    expect(parseDateValue(null).kind).toBe("empty");
    expect(parseDateValue(undefined).kind).toBe("empty");
  });

  it("rejects overflowed calendar dates", () => {
    expect(parseDateValue("2026-02-31").kind).toBe("invalid");
  });
});

describe("compareDateValues", () => {
  it("compares date-only values across month and year boundaries", () => {
    expect(compareDateValues("2025-12-31", "2026-01-15")).toBeLessThan(0);
    expect(compareDateValues("2026-02-01", "2026-01-15")).toBeGreaterThan(0);
    expect(compareDateValues("2026-01-15", "2026-01-15")).toBe(0);
  });

  it("compares instants across time zones by absolute time", () => {
    // 12:00Z is later than 13:00+02:00 (11:00Z)
    expect(compareDateValues("2026-10-15T12:00:00Z", "2026-10-15T13:00:00+02:00")).toBeGreaterThan(0);
  });

  it("sorts empty values last by default, in both directions", () => {
    expect(compareDateValues(null, "2026-01-01")).toBeGreaterThan(0);
    expect(compareDateValues(null, "2026-01-01", { direction: "desc" })).toBeGreaterThan(0);
    expect(compareDateValues("2026-01-01", null)).toBeLessThan(0);
  });
});

describe("compareValues", () => {
  it("sorts null/empty last in both directions", () => {
    expect(compareValues(null, "a")).toBeGreaterThan(0);
    expect(compareValues(null, "a", { direction: "desc" })).toBeGreaterThan(0);
  });

  it("sorts numbers numerically, not lexically", () => {
    expect(compareValues(2, 10)).toBeLessThan(0);
    expect(compareValues(2, 10, { kind: "numeric-string" })).toBeLessThan(0);
  });

  it("auto-detects date-only strings and sorts chronologically", () => {
    expect(compareValues("2025-12-31", "2026-01-01")).toBeLessThan(0);
  });
});

describe("calendar arithmetic", () => {
  it("clamps month addition to the target month length", () => {
    const jan31 = new Date(2026, 0, 31);
    expect(addMonths(jan31, 1).getDate()).toBe(28);
  });

  it("handles leap years", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(daysInMonth(2024, 1)).toBe(29);
    expect(daysInMonth(2026, 1)).toBe(28);
  });

  it("computes month boundaries", () => {
    expect(startOfMonth("2026-10-15").getDate()).toBe(1);
    expect(endOfMonth("2026-10-15").getDate()).toBe(31);
    expect(endOfMonth("2026-02-10").getDate()).toBe(28);
  });

  it("respects the configured week start", () => {
    // 2026-10-15 is a Thursday
    expect(startOfWeek("2026-10-15", 1).getDay()).toBe(1); // Monday
    expect(startOfWeek("2026-10-15", 0).getDay()).toBe(0); // Sunday
  });

  it("computes inclusive ranges and day differences", () => {
    expect(isWithin("2026-10-15", { from: "2026-10-10", to: "2026-10-20" })).toBe(true);
    expect(isWithin("2026-10-25", { from: "2026-10-10", to: "2026-10-20" })).toBe(false);
    expect(differenceInDays("2026-10-10", "2026-10-15")).toBe(5);
    expect(isSameDay("2026-10-15T23:00", "2026-10-15T01:00")).toBe(true);
  });
});

describe("serialization and formatting", () => {
  it("serializes to a calendar date using local components", () => {
    expect(toDateOnlyString(new Date(2026, 9, 15))).toBe("2026-10-15");
    expect(toDateOnlyString("2026-10-15")).toBe("2026-10-15");
  });

  it("formats date-only values without a time component", () => {
    const formatted = formatDate("2026-10-15", { locale: "en-US", dateStyle: "medium" });
    expect(formatted).toMatch(/2026/);
  });
});

describe("isDateDisabled", () => {
  it("honours min/max, weekdays, and custom predicates", () => {
    expect(isDateDisabled("2026-10-01", { min: "2026-10-10" })).toBe(true);
    expect(isDateDisabled("2026-10-20", { max: "2026-10-10" })).toBe(true);
    expect(isDateDisabled("2026-10-17", { disabledWeekdays: [6] })).toBe(true); // Saturday
    expect(isDateDisabled("2026-10-18", { isDisabled: (d) => d.getDate() === 18 })).toBe(true);
    expect(isDateDisabled("2026-10-15", { min: "2026-10-10", max: "2026-10-20" })).toBe(false);
  });
});
