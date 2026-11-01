import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Collapsible } from "@adem.rejeb/ui";

function Example(props: {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  unstyled?: boolean;
  classNames?: { trigger?: string; content?: string };
}) {
  return (
    <Collapsible {...props}>
      <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
      <Collapsible.Content>Hidden details</Collapsible.Content>
    </Collapsible>
  );
}

describe("Collapsible", () => {
  it("starts closed and wires the trigger to the panel", () => {
    render(<Example />);

    const trigger = screen.getByRole("button", { name: "Advanced settings" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const region = screen.getByRole("region");
    expect(region).toHaveTextContent("Hidden details");
    expect(trigger).toHaveAttribute("aria-controls", region.id);
    expect(region).toHaveAttribute("aria-labelledby", trigger.id);
  });

  it("toggles closed again on a second click", async () => {
    const user = userEvent.setup();
    render(<Example defaultOpen />);

    const trigger = screen.getByRole("button", { name: "Advanced settings" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("defers to a controlled open value and reports changes", () => {
    const onOpenChange = vi.fn();
    render(<Example open={false} onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Advanced settings" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("ignores interaction while disabled", async () => {
    const user = userEvent.setup();
    render(<Example disabled />);

    await user.click(screen.getByRole("button", { name: "Advanced settings" }));
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("keeps the panel mounted when forceMount is set", () => {
    render(
      <Collapsible>
        <Collapsible.Trigger>More</Collapsible.Trigger>
        <Collapsible.Content forceMount>Always there</Collapsible.Content>
      </Collapsible>,
    );

    expect(screen.getByText("Always there")).not.toBeVisible();
  });

  it("drops built-in classes when unstyled and applies slot overrides", () => {
    const { container } = render(
      <Example unstyled classNames={{ trigger: "my-trigger", content: "my-content" }} defaultOpen />,
    );

    const trigger = screen.getByRole("button", { name: "Advanced settings" });
    expect(trigger).not.toHaveClass("ui-collapsible__trigger");
    expect(trigger).toHaveClass("my-trigger");
    expect(container.querySelector(".ui-collapsible")).toBeNull();
    expect(container.querySelector(".my-content")).toHaveTextContent("Hidden details");
  });
});
