import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox, Input, Select, Switch, Textarea } from "@personal-ui/ui";

describe("Input", () => {
  it("reflects size and invalid state", () => {
    render(<Input size="lg" invalid aria-label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("data-size", "lg");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("ui-input", "ui-control");
  });

  it("reports typed values", async () => {
    const onChange = vi.fn();
    render(<Input aria-label="Name" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Name"), "Ada");
    expect(onChange).toHaveBeenCalled();
  });
});

describe("Checkbox", () => {
  it("toggles when its label is clicked", async () => {
    render(<Checkbox label="Accept terms" />);
    const checkbox = screen.getByLabelText("Accept terms") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await userEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(checkbox).toHaveClass("ui-checkbox__input");
  });

  it("exposes the indeterminate property", () => {
    render(<Checkbox label="Select all" indeterminate />);
    const checkbox = screen.getByLabelText("Select all") as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });
});

describe("Switch", () => {
  it("uses the switch role and toggles", async () => {
    render(<Switch label="Notifications" />);
    const toggle = screen.getByRole("switch", { name: "Notifications" });
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
  });
});

describe("Select", () => {
  it("renders options and forwards changes", async () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Fruit" defaultValue="apple" onChange={onChange}>
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </Select>,
    );
    const select = screen.getByLabelText("Fruit");
    expect(select).toHaveValue("apple");
    await userEvent.selectOptions(select, "banana");
    expect(onChange).toHaveBeenCalled();
  });
});

describe("Textarea", () => {
  it("shows a character count", async () => {
    render(<Textarea aria-label="Bio" showCount maxLength={20} defaultValue="hi" />);
    const textarea = screen.getByLabelText("Bio");
    expect(screen.getByText("2/20")).toBeInTheDocument();
    await userEvent.type(textarea, "!");
    expect(screen.getByText("3/20")).toBeInTheDocument();
  });
});
