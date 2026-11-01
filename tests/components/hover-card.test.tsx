import { fireEvent, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HoverCard } from "@personal-ui/ui";

function Example(props: {
  open?: boolean;
  defaultOpen?: boolean;
  openDelay?: number;
  closeDelay?: number;
  onOpenChange?: (open: boolean) => void;
  unstyled?: boolean;
  classNames?: { content?: string };
}) {
  return (
    <HoverCard {...props}>
      <HoverCard.Trigger>
        <a href="/ada">Ada Lovelace</a>
      </HoverCard.Trigger>
      <HoverCard.Content>Mathematician and first programmer.</HoverCard.Content>
    </HoverCard>
  );
}

describe("HoverCard", () => {
  it("opens on hover and closes on leave", async () => {
    render(<Example openDelay={0} closeDelay={0} />);
    const trigger = screen.getByText("Ada Lovelace").parentElement as HTMLElement;

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole("dialog")).toHaveTextContent("first programmer");

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("waits for the open delay before showing", () => {
    vi.useFakeTimers();
    try {
      render(<Example openDelay={300} />);
      const trigger = screen.getByText("Ada Lovelace").parentElement as HTMLElement;

      fireEvent.mouseEnter(trigger);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("opens on keyboard focus and closes with Escape", async () => {
    const user = userEvent.setup();
    render(<Example openDelay={0} closeDelay={0} />);
    const trigger = screen.getByText("Ada Lovelace").parentElement as HTMLElement;

    fireEvent.focus(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("names the card after the trigger and links them", () => {
    render(<Example openDelay={0} defaultOpen />);
    const trigger = screen.getByText("Ada Lovelace").parentElement as HTMLElement;
    const dialog = screen.getByRole("dialog", { name: "Ada Lovelace" });

    expect(dialog).toHaveAttribute("aria-labelledby", trigger.id);
    expect(trigger).toHaveAttribute("id");
  });

  it("defers to a controlled open value", () => {
    const onOpenChange = vi.fn();
    render(<Example open={false} openDelay={0} onOpenChange={onOpenChange} />);

    fireEvent.mouseEnter(screen.getByText("Ada Lovelace").parentElement as HTMLElement);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports unstyled and per-slot class overrides", () => {
    render(<Example openDelay={0} defaultOpen unstyled classNames={{ content: "my-card" }} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).not.toHaveClass("ui-hovercard");
    expect(dialog).toHaveClass("my-card");
  });
});
