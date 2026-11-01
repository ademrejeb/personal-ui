import { useRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FloatingLayer } from "@personal-ui/ui";

interface HarnessProps {
  open: boolean;
  onDismiss?: () => void;
  focusOnOpen?: boolean;
}

function Harness({ open, onDismiss, focusOnOpen }: HarnessProps) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  return (
    <div>
      <button ref={anchorRef} type="button">
        Anchor
      </button>
      <FloatingLayer
        open={open}
        anchorRef={anchorRef}
        onDismiss={onDismiss}
        returnFocusRef={anchorRef}
        focusOnOpen={focusOnOpen}
        role="dialog"
        aria-label="Layer"
        tabIndex={-1}
      >
        <button type="button">Inside</button>
      </FloatingLayer>
    </div>
  );
}

describe("FloatingLayer", () => {
  it("only renders its content while open", () => {
    const { rerender } = render(<Harness open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(<Harness open />);
    expect(screen.getByRole("dialog", { name: "Layer" })).toBeInTheDocument();
  });

  it("dismisses on an outside pointer interaction", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Harness open onDismiss={onDismiss} />);

    await user.click(document.body);

    expect(onDismiss).toHaveBeenCalled();
  });

  it("dismisses on Escape and restores focus to the anchor", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Harness open onDismiss={onDismiss} />);

    await user.keyboard("{Escape}");

    expect(onDismiss).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Anchor" })).toHaveFocus();
  });

  it("can move focus into the layer on open", () => {
    render(<Harness open focusOnOpen />);
    // jsdom reports no layout, so `getFocusableElements` finds nothing and
    // focusFirst falls back to the layer itself (which is `tabIndex={-1}`).
    expect(screen.getByRole("dialog", { name: "Layer" })).toHaveFocus();
  });
});

