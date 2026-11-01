import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import userEvent from "@testing-library/user-event";
import {
  InlineEdit,
  Kbd,
  Meter,
  RelativeTime,
  SplitPane,
  ThemeScript,
  formatRelativeTime,
  useDisclosure,
} from "@adem.rejeb/ui";

const NOW = new Date("2026-01-01T15:00:00.000Z");

describe("Kbd", () => {
  it("renders a semantic kbd for a single key", () => {
    render(<Kbd>K</Kbd>);
    const key = screen.getByText("K");
    expect(key.tagName).toBe("KBD");
    expect(key).toHaveClass("ui-kbd");
  });

  it("renders a key combination with a spoken label", () => {
    render(<Kbd keys={["Ctrl", "K"]} size="sm" variant="outline" />);
    const group = screen.getByLabelText("Ctrl + K");
    expect(group).toHaveAttribute("data-size", "sm");
    expect(group).toHaveAttribute("data-variant", "outline");
    expect(screen.getByText("Ctrl")).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();
  });

  it("supports slot overrides and unstyled mode", () => {
    const { container, rerender } = render(
      <Kbd keys={["A", "B"]} classNames={{ root: "custom-root", key: "custom-key" }} />,
    );
    expect(container.querySelector("kbd")).toHaveClass("ui-kbd", "custom-root");
    expect(container.querySelector(".ui-kbd__key")).toHaveClass("custom-key");

    rerender(<Kbd unstyled>K</Kbd>);
    expect(screen.getByText("K")).not.toHaveClass("ui-kbd");
  });
});

describe("RelativeTime", () => {
  it("renders a relative label and an absolute timestamp", () => {
    render(<RelativeTime value={new Date("2026-01-01T12:00:00.000Z")} now={NOW} locale="en" />);
    const time = screen.getByText("3 hours ago");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("datetime", "2026-01-01T12:00:00.000Z");
    expect(time).toHaveAttribute("title");
  });

  it("supports a custom formatter and hides the title", () => {
    render(
      <RelativeTime
        value={new Date("2026-01-01T12:00:00.000Z")}
        now={NOW}
        showTitle={false}
        format={(date, now) => `${Math.round((now.getTime() - date.getTime()) / 3_600_000)}h`}
      />,
    );
    const time = screen.getByText("3h");
    expect(time).not.toHaveAttribute("title");
  });

  it("falls back to the raw value when the date is invalid", () => {
    render(<RelativeTime value="not-a-date" />);
    expect(screen.getByText("not-a-date")).not.toHaveAttribute("datetime");
  });

  it("formats without a component", () => {
    expect(formatRelativeTime(new Date("2026-01-01T12:00:00.000Z"), NOW, "en")).toBe("3 hours ago");
    expect(formatRelativeTime("not-a-date", NOW, "en")).toBe("");
  });

  it("supports slot overrides and unstyled mode", () => {
    const { rerender } = render(
      <RelativeTime
        value={new Date("2026-01-01T12:00:00.000Z")}
        now={NOW}
        locale="en"
        classNames={{ root: "custom-time" }}
      />,
    );
    expect(screen.getByText("3 hours ago")).toHaveClass("ui-relative-time", "custom-time");

    rerender(<RelativeTime value={new Date("2026-01-01T12:00:00.000Z")} now={NOW} locale="en" unstyled />);
    expect(screen.getByText("3 hours ago")).not.toHaveClass("ui-relative-time");
  });
});

describe("Meter", () => {
  it("exposes range semantics and an accessible name", () => {
    render(<Meter value={68} label="Disk usage" />);
    const meter = screen.getByRole("meter", { name: "Disk usage" });
    expect(meter).toHaveAttribute("aria-valuenow", "68");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps the value and fill width", () => {
    const { container } = render(<Meter value={150} max={100} label="Usage" />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
    expect(container.querySelector(".ui-meter__fill")).toHaveStyle({ width: "100%" });
  });

  it("derives a tone from low/high/optimum", () => {
    const { container, rerender } = render(
      <Meter value={10} low={20} high={80} optimum={50} label="Score" />,
    );
    expect(container.firstChild).toHaveAttribute("data-tone", "danger");
    rerender(<Meter value={50} low={20} high={80} optimum={50} label="Score" />);
    expect(container.firstChild).toHaveAttribute("data-tone", "success");
  });

  it("allows an explicit tone and formatted value", () => {
    const { container } = render(
      <Meter value={42} tone="warning" showValue formatValue={(value) => `${value} GB`} label="Storage" />,
    );
    expect(container.firstChild).toHaveAttribute("data-tone", "warning");
    expect(screen.getByText("42 GB")).toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "42 GB");
  });

  it("supports slot overrides and unstyled mode", () => {
    const { container, rerender } = render(
      <Meter value={50} label="Usage" classNames={{ root: "custom-root", track: "custom-track" }} />,
    );
    expect(container.firstChild).toHaveClass("ui-meter", "custom-root");
    expect(screen.getByRole("meter")).toHaveClass("ui-meter__track", "custom-track");

    rerender(<Meter value={50} label="Usage" unstyled />);
    expect(container.firstChild).not.toHaveClass("ui-meter");
    expect(screen.getByRole("meter")).not.toHaveClass("ui-meter__track");
  });
});

describe("InlineEdit", () => {
  it("enters edit mode from the keyboard and commits on Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<InlineEdit defaultValue="Original" label="Project name" onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /Edit Project name:/ }));
    const input = screen.getByRole("textbox", { name: "Project name" });
    await waitFor(() => expect(input).toHaveFocus());

    await user.clear(input);
    await user.type(input, "Renamed{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("Renamed");
    expect(screen.getByRole("button", { name: /Edit Project name:/ })).toHaveTextContent("Renamed");
  });

  it("cancels with Escape and restores the previous value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(
      <InlineEdit defaultValue="Original" label="Project name" onSubmit={onSubmit} onCancel={onCancel} />,
    );

    await user.click(screen.getByRole("button", { name: /Edit Project name:/ }));
    const input = screen.getByRole("textbox", { name: "Project name" });
    await user.clear(input);
    await user.type(input, "Changed{Escape}");

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /Edit Project name:/ })).toHaveTextContent("Original");
  });

  it("commits on blur by default", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <>
        <InlineEdit defaultValue="Original" label="Project name" onSubmit={onSubmit} />
        <button type="button">Elsewhere</button>
      </>,
    );

    await user.click(screen.getByRole("button", { name: /Edit Project name:/ }));
    const input = screen.getByRole("textbox", { name: "Project name" });
    await user.clear(input);
    await user.type(input, "Updated");
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));

    expect(onSubmit).toHaveBeenCalledWith("Updated");
  });

  it("uses a textarea and Ctrl+Enter to commit when multiline", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<InlineEdit defaultValue="Line" label="Notes" multiline onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /Edit Notes:/ }));
    const textarea = screen.getByRole("textbox", { name: "Notes" });
    expect(textarea.tagName).toBe("TEXTAREA");

    await user.type(textarea, " one{Control>}{Enter}{/Control}");
    expect(onSubmit).toHaveBeenCalledWith("Line one");
  });

  it("supports explicit save and cancel actions", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<InlineEdit defaultValue="Original" label="Project name" showActions onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /Edit Project name:/ }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledWith("Original");

    await user.click(screen.getByRole("button", { name: /Edit Project name:/ }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: /Edit Project name:/ })).toHaveTextContent("Original");
  });

  it("disables the trigger when disabled", () => {
    render(<InlineEdit defaultValue="Locked" label="Project name" disabled />);
    expect(screen.getByRole("button", { name: /Edit Project name:/ })).toBeDisabled();
  });

  it("supports slot overrides and unstyled mode", () => {
    const { container, rerender } = render(
      <InlineEdit
        defaultValue="Original"
        label="Project name"
        classNames={{ root: "custom-root", trigger: "custom-trigger" }}
      />,
    );
    expect(container.firstChild).toHaveClass("ui-inline-edit", "custom-root");
    expect(screen.getByRole("button", { name: /Edit Project name:/ })).toHaveClass(
      "ui-inline-edit__trigger",
      "custom-trigger",
    );

    rerender(<InlineEdit defaultValue="Original" label="Project name" unstyled />);
    expect(container.firstChild).not.toHaveClass("ui-inline-edit");
    expect(screen.getByRole("button", { name: /Edit Project name:/ })).not.toHaveClass(
      "ui-inline-edit__trigger",
    );
  });
});

describe("SplitPane", () => {
  it("renders an accessible separator with the current size", () => {
    render(<SplitPane start={<div>Start</div>} end={<div>End</div>} defaultSize={40} />);
    const separator = screen.getByRole("separator", { name: "Resize panes" });
    expect(separator).toHaveAttribute("aria-valuenow", "40");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
  });

  it("resizes with arrow keys and jumps with Home/End", async () => {
    const user = userEvent.setup();
    const onSizeChange = vi.fn();
    render(
      <SplitPane
        start={<div>Start</div>}
        end={<div>End</div>}
        defaultSize={40}
        min={20}
        max={80}
        onSizeChange={onSizeChange}
      />,
    );
    const separator = screen.getByRole("separator");
    separator.focus();

    await user.keyboard("{ArrowRight}");
    expect(separator).toHaveAttribute("aria-valuenow", "42");

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(separator).toHaveAttribute("aria-valuenow", "38");

    await user.keyboard("{Home}");
    expect(separator).toHaveAttribute("aria-valuenow", "20");

    await user.keyboard("{End}");
    expect(separator).toHaveAttribute("aria-valuenow", "80");
    expect(onSizeChange).toHaveBeenLastCalledWith(80);
  });

  it("resizes vertically with up/down arrows", async () => {
    const user = userEvent.setup();
    render(
      <SplitPane start={<div>Start</div>} end={<div>End</div>} orientation="vertical" defaultSize={50} />,
    );
    const separator = screen.getByRole("separator");
    separator.focus();

    await user.keyboard("{ArrowDown}");
    expect(separator).toHaveAttribute("aria-valuenow", "52");
    expect(separator).toHaveAttribute("aria-orientation", "horizontal");

    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(separator).toHaveAttribute("aria-valuenow", "48");
  });

  it("does not resize when disabled", async () => {
    const user = userEvent.setup();
    render(<SplitPane start={<div>Start</div>} end={<div>End</div>} disabled />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("tabindex", "-1");

    separator.focus();
    await user.keyboard("{ArrowRight}");
    expect(separator).toHaveAttribute("aria-valuenow", "50");
  });

  it("supports slot overrides and unstyled mode", () => {
    const { container, rerender } = render(
      <SplitPane
        start={<div>Start</div>}
        end={<div>End</div>}
        classNames={{ root: "custom-root", handle: "custom-handle" }}
      />,
    );
    expect(container.firstChild).toHaveClass("ui-split-pane", "custom-root");
    expect(screen.getByRole("separator")).toHaveClass("ui-split-pane__handle", "custom-handle");

    rerender(<SplitPane start={<div>Start</div>} end={<div>End</div>} unstyled />);
    expect(container.firstChild).not.toHaveClass("ui-split-pane");
    expect(screen.getByRole("separator")).not.toHaveClass("ui-split-pane__handle");
  });
});

describe("useDisclosure", () => {
  it("manages uncontrolled open state", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useDisclosure({ onOpenChange }));

    expect(result.current.open).toBe(false);
    act(() => result.current.onOpen());
    expect(result.current.open).toBe(true);
    act(() => result.current.onToggle());
    expect(result.current.open).toBe(false);
    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
  });

  it("honours controlled state", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useDisclosure({ open: false, onOpenChange }));

    act(() => result.current.onOpen());
    expect(result.current.open).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe("ThemeScript", () => {
  it("serializes the storage key and default theme", () => {
    const html = renderToStaticMarkup(<ThemeScript />);
    expect(html).toContain("adem.rejeb-theme");
    expect(html).toContain("system");
    expect(html).toContain("data-theme");
  });

  it("forwards a CSP nonce and escapes markup in the key", () => {
    const html = renderToStaticMarkup(
      <ThemeScript storageKey="</script><script>alert(1)</script>" defaultTheme="dark" nonce="abc123" />,
    );
    expect(html).toContain('nonce="abc123"');
    expect(html).toContain("dark");
    expect(html).not.toContain("</script><script>alert(1)");
    expect(html).toContain("\\u003c");
  });
});
