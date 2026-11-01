import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Button,
  Modal,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from "@adem.rejeb/ui";

describe("Popover", () => {
  function Demo() {
    return (
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    );
  }

  it("toggles the content when the trigger is clicked", async () => {
    render(<Demo />);
    expect(screen.queryByText("Popover body")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Popover body")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Popover body")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("Popover body")).not.toBeInTheDocument());
  });
});

describe("Tooltip", () => {
  it("shows on focus and hides on blur", async () => {
    render(
      <Tooltip content="Helpful hint">
        <Button>Hover me</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Hover me" });
    trigger.focus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Helpful hint");
    trigger.blur();
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });
});

describe("Modal", () => {
  function Demo({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
    const [open, setOpen] = useState(true);
    return (
      <Modal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange?.(next);
        }}
      >
        <Modal.Content aria-label="Settings">
          <Modal.Body>Modal body</Modal.Body>
        </Modal.Content>
      </Modal>
    );
  }

  it("renders an open dialog and closes via the close button", async () => {
    const onOpenChange = vi.fn();
    render(<Demo onOpenChange={onOpenChange} />);
    const dialog = document.querySelector("dialog.ui-modal");
    expect(dialog).not.toBeNull();
    expect(dialog).toHaveAttribute("data-state", "open");

    await userEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() =>
      expect(document.querySelector("dialog.ui-modal")).toHaveAttribute("data-state", "closed"),
    );
  });
});
