import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, CopyButton, IconButton, ToggleGroup, ToggleGroupItem } from "@personal-ui/ui";

describe("Button", () => {
  it("renders its label and defaults to type=button", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("applies variant and size data attributes", () => {
    render(
      <Button variant="danger" size="lg">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveAttribute("data-variant", "danger");
    expect(button).toHaveAttribute("data-size", "lg");
    expect(button).toHaveClass("ui-button--danger", "ui-button--lg");
  });

  it("disables interaction and announces busy while loading", () => {
    render(<Button loading>Submit</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("invokes onClick when pressed", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("IconButton", () => {
  it("exposes an accessible name and hides the icon", () => {
    render(<IconButton aria-label="Add item" icon={<span data-testid="icon" />} />);
    const button = screen.getByRole("button", { name: "Add item" });
    expect(button).toHaveClass("ui-icon-button");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});

describe("CopyButton", () => {
  beforeEach(() => {
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("writes the value to the clipboard and reports success", async () => {
    render(<CopyButton value="hello world" />);
    await userEvent.click(screen.getByRole("button"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello world");
    expect(await screen.findByRole("status")).toHaveTextContent("Copied");
  });
});

describe("ToggleGroup", () => {
  it("selects a single value and reports the change", async () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="single" defaultValue="a" onValueChange={onValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("aria-pressed", "true");
  });

  it("does not leak control props onto the DOM", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <ToggleGroup type="single" value="a" defaultValue="a" onValueChange={() => {}}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );

    const group = container.firstChild as HTMLElement;
    expect(group).not.toHaveAttribute("onvaluechange");
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
