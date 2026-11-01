import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Alert, Progress, Spinner, StatusIndicator } from "@personal-ui/ui";

describe("Alert", () => {
  it("uses role=alert for urgent variants", () => {
    render(<Alert variant="danger" title="Failed" />);
    expect(screen.getByRole("alert")).toHaveClass("ui-alert--danger");
  });

  it("uses role=status for non-urgent variants", () => {
    render(<Alert variant="info">Heads up</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Heads up");
  });

  it("calls onDismiss from the dismiss button", async () => {
    const onDismiss = vi.fn();
    render(
      <Alert variant="warning" dismissible onDismiss={onDismiss}>
        Careful
      </Alert>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe("Progress", () => {
  it("exposes value semantics to assistive tech", () => {
    render(<Progress value={30} max={100} aria-label="Upload" />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("aria-valuenow", "30");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("omits value attributes when indeterminate", () => {
    render(<Progress indeterminate aria-label="Loading" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("data-indeterminate", "true");
  });
});

describe("Spinner", () => {
  it("announces loading by default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });

  it("is hidden from assistive tech when decorative", () => {
    render(<Spinner decorative />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("StatusIndicator", () => {
  it("renders an accessible label", () => {
    render(<StatusIndicator status="success" label="Online" />);
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.getByText("Online").closest("[data-status]")).toHaveAttribute(
      "data-status",
      "success",
    );
  });
});
