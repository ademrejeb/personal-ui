import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Rating, SegmentedControl } from "@personal-ui/ui";

describe("Rating", () => {
  it("exposes a radiogroup with one radio per star", () => {
    render(<Rating label="Score" defaultValue={2} />);
    expect(screen.getByRole("radiogroup", { name: "Score" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "2 stars" })).toBeChecked();
  });

  it("selects a value by clicking a star and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating label="Score" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("radio", { name: "4 stars" }));
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    expect(screen.getByRole("radio", { name: "4 stars" })).toBeChecked();
  });

  it("clears the rating when the current value is clicked again", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating label="Score" defaultValue={3} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("radio", { name: "3 stars" }));
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it("keeps the value when allowClear is off", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Rating label="Score" defaultValue={3} allowClear={false} onValueChange={onValueChange} />,
    );

    await user.click(screen.getByRole("radio", { name: "3 stars" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("renders a static image when readOnly", () => {
    render(<Rating label="Score" defaultValue={4} readOnly />);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.getByRole("img", { name: "Score: 4 out of 5" })).toBeInTheDocument();
  });

  it("keeps the selected stars filled after hovering away", async () => {
    const user = userEvent.setup();
    const { container } = render(<Rating label="Score" defaultValue={2} />);

    await user.hover(screen.getByRole("radio", { name: "5 stars" }));
    expect(container.querySelectorAll(".ui-rating__icon--filled")).toHaveLength(5);

    await user.unhover(screen.getByRole("radio", { name: "5 stars" }));
    await user.hover(container.querySelector(".ui-rating") as HTMLElement);
    expect(container.querySelectorAll(".ui-rating__icon--filled")).toHaveLength(2);
  });

  it("honours unstyled and per-slot classNames", () => {
    const { container } = render(
      <Rating label="Score" defaultValue={1} unstyled classNames={{ item: "custom-star" }} />,
    );
    expect(container.querySelector(".ui-rating")).toBeNull();
    expect(container.querySelectorAll(".custom-star")).toHaveLength(5);
  });
});

describe("SegmentedControl", () => {
  const OPTIONS = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month", disabled: true },
  ];

  it("renders a radiogroup with labelled segments", () => {
    render(<SegmentedControl options={OPTIONS} label="Range" defaultValue="week" />);
    expect(screen.getByRole("radiogroup", { name: "Range" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Week" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Month" })).toBeDisabled();
  });

  it("switches the selection and reports the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SegmentedControl options={OPTIONS} label="Range" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("radio", { name: "Week" }));
    expect(onValueChange).toHaveBeenLastCalledWith("week");
    expect(screen.getByText("Week").closest("label")).toHaveAttribute("data-state", "active");
  });

  it("works as a controlled component and disables everything", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("day");
      return (
        <SegmentedControl
          options={OPTIONS}
          label="Range"
          value={value}
          onValueChange={(next) => {
            setValue(next);
            onValueChange(next);
          }}
        />
      );
    }
    const { unmount } = render(<Controlled />);
    await user.click(screen.getByRole("radio", { name: "Week" }));
    expect(screen.getByRole("radio", { name: "Week" })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith("week");
    unmount();

    render(<SegmentedControl options={OPTIONS} label="Range" disabled />);
    expect(screen.getByRole("radio", { name: "Day" })).toBeDisabled();
  });

  it("honours unstyled and per-slot classNames", () => {
    const { container } = render(
      <SegmentedControl
        options={OPTIONS}
        label="Range"
        unstyled
        classNames={{ label: "custom-label" }}
      />,
    );
    expect(container.querySelector(".ui-segmented")).toBeNull();
    expect(container.querySelectorAll(".custom-label").length).toBeGreaterThan(0);
  });
});
