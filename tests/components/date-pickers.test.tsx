import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Calendar,
  DatePicker,
  DateRangePicker,
  isSameDay,
  TimePicker,
} from "@adem.rejeb/ui";

describe("Calendar", () => {
  it("renders a labelled grid for the visible month", () => {
    render(<Calendar defaultMonth={new Date(2026, 1, 1)} locale="en-US" />);
    expect(screen.getByRole("grid")).toHaveAccessibleName("February 2026");
  });

  it("selects a day with the pointer", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Calendar
        defaultMonth={new Date(2026, 1, 1)}
        locale="en-US"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("gridcell", { name: /February 14, 2026/ }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(isSameDay(onValueChange.mock.calls[0][0], new Date(2026, 1, 14))).toBe(true);
  });

  it("moves focus with arrow keys and selects with Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Calendar
        defaultMonth={new Date(2026, 1, 1)}
        defaultValue={new Date(2026, 1, 10)}
        locale="en-US"
        onValueChange={onValueChange}
      />,
    );

    const day = screen.getByRole("gridcell", { name: /February 10, 2026/ });
    act(() => day.focus());
    await user.keyboard("{ArrowRight}{Enter}");
    expect(isSameDay(onValueChange.mock.calls[0][0], new Date(2026, 1, 11))).toBe(true);
  });

  it("marks days outside the min/max bounds as disabled", () => {
    render(
      <Calendar defaultMonth={new Date(2026, 1, 1)} locale="en-US" min={new Date(2026, 1, 10)} />,
    );
    expect(screen.getByRole("gridcell", { name: /February 5, 2026/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("gridcell", { name: /February 15, 2026/ })).not.toHaveAttribute(
      "aria-disabled",
    );
  });

  it("builds a range from two clicks in range mode", async () => {
    const user = userEvent.setup();
    const onRangeChange = vi.fn();
    render(
      <Calendar
        mode="range"
        defaultMonth={new Date(2026, 1, 1)}
        defaultRange={{ from: new Date(2026, 1, 10), to: null }}
        locale="en-US"
        onRangeChange={onRangeChange}
      />,
    );

    await user.click(screen.getByRole("gridcell", { name: /February 14, 2026/ }));
    const range = onRangeChange.mock.calls.at(-1)?.[0];
    expect(isSameDay(range.from, new Date(2026, 1, 10))).toBe(true);
    expect(isSameDay(range.to, new Date(2026, 1, 14))).toBe(true);
  });
});

describe("Calendar multiple selection and events", () => {
  it("toggles days on and off in multiple mode", async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    render(
      <Calendar
        mode="multiple"
        defaultMonth={new Date(2026, 1, 1)}
        locale="en-US"
        onValuesChange={onValuesChange}
      />,
    );

    await user.click(screen.getByRole("gridcell", { name: /February 10, 2026/ }));
    expect(onValuesChange.mock.calls.at(-1)?.[0]).toHaveLength(1);
    await user.click(screen.getByRole("gridcell", { name: /February 12, 2026/ }));
    expect(onValuesChange.mock.calls.at(-1)?.[0]).toHaveLength(2);

    await user.click(screen.getByRole("gridcell", { name: /February 10, 2026/ }));
    const last = onValuesChange.mock.calls.at(-1)?.[0];
    expect(last).toHaveLength(1);
    expect(isSameDay(last[0], new Date(2026, 1, 12))).toBe(true);
  });

  it("marks the days covered by an event and announces its label", () => {
    render(
      <Calendar
        defaultMonth={new Date(2026, 1, 1)}
        locale="en-US"
        events={[{ id: "sprint", start: new Date(2026, 1, 9), end: new Date(2026, 1, 11), label: "Sprint" }]}
      />,
    );

    expect(screen.getByRole("gridcell", { name: /February 10, 2026 — Sprint/ })).toHaveAttribute(
      "data-event",
    );
    expect(screen.getByRole("gridcell", { name: /February 12, 2026$/ })).not.toHaveAttribute(
      "data-event",
    );
  });
});

describe("DatePicker", () => {
  it("opens a calendar and updates the input value", async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        label="Start date"
        locale="en-US"
        defaultValue={new Date(2026, 1, 10)}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Start date" });
    expect(input).toHaveValue("02/10/2026");

    await user.click(input);
    expect(screen.getByRole("grid")).toBeInTheDocument();
    await user.click(screen.getByRole("gridcell", { name: /February 14, 2026/ }));

    expect(input).toHaveValue("02/14/2026");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});

describe("DateRangePicker", () => {
  it("shows a two-month calendar and fills the range", async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        label="Period"
        locale="en-US"
        defaultMonth={new Date(2026, 1, 1)}
        defaultValue={{ from: null, to: null }}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Period" });
    await user.click(input);
    expect(screen.getAllByRole("grid")).toHaveLength(2);

    await user.click(screen.getByRole("gridcell", { name: /February 12, 2026/ }));
    await user.click(screen.getByRole("gridcell", { name: /February 20, 2026/ }));
    expect(input).toHaveValue("02/12/2026 – 02/20/2026");
  });
});

describe("TimePicker", () => {
  it("updates the time from the hour column", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <TimePicker label="Start time" defaultValue="09:30" onValueChange={onValueChange} />,
    );

    const input = screen.getByRole("combobox", { name: "Start time" });
    expect(input).toHaveValue("09:30");

    await user.click(input);
    const hourColumn = screen.getByRole("listbox", { name: "Hour" });
    await user.click(within(hourColumn).getByRole("option", { name: "14" }));

    expect(onValueChange).toHaveBeenCalledWith("14:30");
    expect(input).toHaveValue("14:30");
  });
});
