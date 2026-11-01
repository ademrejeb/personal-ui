import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox, MultiSelect, type SelectOption } from "@adem.rejeb/ui";

const OPTIONS: SelectOption<string>[] = [
  { value: "eng", label: "Engineering", group: "Teams" },
  { value: "design", label: "Design", group: "Teams" },
  { value: "marketing", label: "Marketing", group: "Departments" },
];

describe("Combobox", () => {
  it("opens the listbox and selects with the pointer", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} label="Team" onChange={onChange} />);

    const input = screen.getByRole("combobox", { name: "Team" });
    await user.click(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: /Engineering/ }));
    expect(onChange).toHaveBeenCalledWith("eng");
    expect(input).toHaveValue("Engineering");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters options as the user types", async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} label="Team" />);

    const input = screen.getByRole("combobox", { name: "Team" });
    await user.click(input);
    await user.type(input, "mark");

    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option", { name: /Marketing/ })).toBeInTheDocument();
  });

  it("selects the active option with the keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} label="Team" onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Team" }));
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledWith("eng");
  });

  it("closes on Escape without selecting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} label="Team" onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Team" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clears a controlled value", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<string | null>("design");
      return <Combobox options={OPTIONS} label="Team" value={value} onChange={setValue} />;
    }
    render(<Controlled />);

    const input = screen.getByRole("combobox", { name: "Team" });
    expect(input).toHaveValue("Design");
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(input).toHaveValue("");
  });
});

describe("MultiSelect", () => {
  it("renders chips for the default selection", () => {
    render(<MultiSelect options={OPTIONS} label="Teams" defaultValue={["eng", "design"]} />);
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  it("adds and removes selections through the listbox", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <MultiSelect
          options={OPTIONS}
          label="Teams"
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }
    render(<Controlled />);

    await user.click(screen.getByRole("combobox", { name: "Teams" }));
    await user.click(screen.getByRole("option", { name: /Engineering/ }));
    expect(onChange).toHaveBeenLastCalledWith(["eng"]);

    await user.click(screen.getByRole("option", { name: /Engineering/ }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("removes the last chip with Backspace on an empty search", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState<string[]>(["eng", "design"]);
      return (
        <MultiSelect
          options={OPTIONS}
          label="Teams"
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }
    render(<Controlled />);

    const input = screen.getByRole("combobox", { name: "Teams" });
    await user.click(input);
    await user.keyboard("{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith(["eng"]);
  });

  it("collapses overflow chips into a +N indicator", () => {
    render(
      <MultiSelect
        options={OPTIONS}
        label="Teams"
        defaultValue={["eng", "design", "marketing"]}
        maxVisibleChips={2}
      />,
    );
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });

  it("disables further options once the selection limit is reached", async () => {
    const user = userEvent.setup();
    render(
      <MultiSelect options={OPTIONS} label="Teams" value={["eng"]} onChange={() => {}} maxSelected={1} />,
    );
    await user.click(screen.getByRole("combobox", { name: "Teams" }));
    expect(screen.getByRole("option", { name: /Design/ })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("option", { name: /Engineering/ })).not.toHaveAttribute("aria-disabled");
  });
});
