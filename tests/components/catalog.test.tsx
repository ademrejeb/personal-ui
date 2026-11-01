import { createRef, type ReactNode } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Anchor,
  Affix,
  Attachment,
  Bubble,
  Button,
  FloatButton,
  Image,
  Item,
  Masonry,
  Mentions,
  MessageScroller,
  NotificationProvider,
  Popconfirm,
  Result,
  Tour,
  Watermark,
  formatFileSize,
  useNotification,
  type MessageScrollerHandle,
  type NotificationOptions,
} from "@adem.rejeb/ui";

function NotifyButton({ options }: { options: NotificationOptions }) {
  const { notify } = useNotification();
  return (
    <Button onClick={() => notify(options)}>Notify</Button>
  );
}

function renderWithNotification(options: NotificationOptions, children?: ReactNode) {
  return render(
    <NotificationProvider>
      {children}
      <NotifyButton options={options} />
    </NotificationProvider>,
  );
}

describe("Result", () => {
  it("renders a status message with semantic tone", () => {
    render(
      <Result status="danger" title="Upload failed" description="Try again." />,
    );
    const root = screen.getByRole("status");
    expect(root).toHaveAttribute("data-status", "danger");
    expect(root).toHaveTextContent("Upload failed");
    expect(root).toHaveTextContent("Try again.");
  });

  it("supports unstyled and slot class names", () => {
    render(
      <Result
        unstyled
        classNames={{ title: "my-title" }}
        title="Hello"
      />,
    );
    const root = screen.getByRole("status");
    expect(root).not.toHaveClass("ui-result");
    expect(screen.getByText("Hello")).toHaveClass("my-title");
  });
});

describe("Notification", () => {
  it("stacks a notification and dismisses it", async () => {
    renderWithNotification({ variant: "success", title: "Saved", description: "All good." });

    await userEvent.click(screen.getByRole("button", { name: "Notify" }));
    const card = await screen.findByRole("status");
    expect(card).toHaveTextContent("Saved");
    expect(card).toHaveTextContent("All good.");

    await userEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  });

  it("uses role=alert for danger notifications", async () => {
    renderWithNotification({ variant: "danger", title: "Failed" });
    await userEvent.click(screen.getByRole("button", { name: "Notify" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed");
  });
});

describe("Popconfirm", () => {
  it("confirms and cancels from the popup", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <Popconfirm
        title="Delete item?"
        description="This cannot be undone."
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <Button>Delete</Button>
      </Popconfirm>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("alertdialog", { name: "Delete item?" });
    expect(dialog).toHaveTextContent("This cannot be undone.");

    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape", async () => {
    render(
      <Popconfirm title="Sure?">
        <Button>Open</Button>
      </Popconfirm>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });
});

describe("Tour", () => {
  it("steps through and finishes", async () => {
    const onFinish = vi.fn();
    render(
      <Tour
        defaultOpen
        onFinish={onFinish}
        steps={[
          { title: "Step one", description: "First" },
          { title: "Step two", description: "Second" },
        ]}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Step one" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("dialog", { name: "Step two" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(onFinish).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("Anchor", () => {
  it("renders nested links and marks the active section", () => {
    render(
      <Anchor
        defaultActiveId="beta"
        sticky={false}
        items={[
          { id: "alpha", title: "Alpha" },
          { id: "beta", title: "Beta", children: [{ id: "beta-one", title: "Beta one" }] },
        ]}
      />,
    );

    expect(screen.getByRole("navigation", { name: "On this page" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Beta" })).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Alpha" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Beta one" })).toBeInTheDocument();
  });
});

describe("Affix", () => {
  it("renders content with slot overrides", () => {
    render(
      <Affix classNames={{ content: "pinned" }} offsetTop={0}>
        <span>Header</span>
      </Affix>,
    );
    expect(screen.getByText("Header").parentElement).toHaveClass("pinned");
  });
});

describe("Masonry", () => {
  it("wraps each child in an item and applies the gap", () => {
    render(
      <Masonry columns={2} gap="lg" data-testid="masonry">
        <div>A</div>
        <div>B</div>
      </Masonry>,
    );
    const root = screen.getByTestId("masonry");
    expect(root).toHaveAttribute("data-gap", "lg");
    expect(root.style.columnCount).toBe("2");
    expect(root.children).toHaveLength(2);
    expect(root.children[0]).toHaveClass("ui-masonry__item");
  });
});

describe("Watermark", () => {
  it("renders a decorative SVG pattern with the text", () => {
    const { container } = render(
      <Watermark text="Confidential" opacity={0.2}>
        <div>Content</div>
      </Watermark>,
    );
    const layer = container.querySelector("svg");
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer?.textContent).toContain("Confidential");
  });
});

describe("FloatButton", () => {
  it("exposes its label and badge", () => {
    render(<FloatButton label="New item" badge={3} icon={<span />} />);
    const button = screen.getByRole("button", { name: /New item/ });
    expect(button).toHaveAttribute("data-shape", "pill");
    expect(button).toHaveTextContent("3");
  });

  it("scrolls to the top when backTop is pressed", async () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<FloatButton backTop />);
    await userEvent.click(screen.getByRole("button", { name: "Back to top" }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    scrollTo.mockRestore();
  });
});

describe("Mentions", () => {
  const options = [
    { value: "ada", label: "Ada Lovelace" },
    { value: "grace", label: "Grace Hopper" },
  ];

  it("opens suggestions on @ and inserts the chosen mention", async () => {
    render(<Mentions options={options} />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "@ad");
    const option = await screen.findByRole("option", { name: /Ada Lovelace/ });
    await userEvent.click(option);
    expect(textarea).toHaveValue("@ada ");
  });

  it("selects with the keyboard", async () => {
    render(<Mentions options={options} />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "@gr");
    await userEvent.keyboard("{Enter}");
    expect(textarea).toHaveValue("@grace ");
  });
});

describe("Image", () => {
  it("opens a lightbox preview", async () => {
    render(
      <Image
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
        alt="Placeholder"
        preview
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Preview image: Placeholder" }));
    expect(await screen.findByRole("dialog", { name: "Image preview: Placeholder" })).toBeInTheDocument();
  });
});

describe("Item", () => {
  it("composes media, content, and actions with root slots", () => {
    render(
      <Item variant="outline" classNames={{ title: "my-title" }}>
        <Item.Media>M</Item.Media>
        <Item.Content>
          <Item.Title>Row title</Item.Title>
          <Item.Description>Supporting text</Item.Description>
        </Item.Content>
        <Item.Actions>
          <Button size="sm">Open</Button>
        </Item.Actions>
      </Item>,
    );
    expect(screen.getByText("Row title")).toHaveClass("my-title");
    expect(screen.getByText("Row title").closest(".ui-item")).toHaveAttribute(
      "data-variant",
      "outline",
    );
  });
});

describe("Attachment", () => {
  it("formats sizes", () => {
    expect(formatFileSize(1480000)).toBe("1.4 MB");
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("renders progress and a remove action", async () => {
    const onRemove = vi.fn();
    render(
      <Attachment
        name="report.pdf"
        size={2048}
        status="uploading"
        progress={40}
        onRemove={onRemove}
      />,
    );
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Uploading report.pdf" })).toHaveAttribute(
      "aria-valuenow",
      "40",
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove report.pdf" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe("Bubble", () => {
  it("renders alignment, identity, and timestamp", () => {
    render(
      <Bubble align="end" variant="primary" name="Ada" time="12:04">
        Hello
      </Bubble>,
    );
    const root = screen.getByText("Hello").closest(".ui-bubble") as HTMLElement;
    expect(root).toHaveAttribute("data-align", "end");
    expect(root).toHaveAttribute("data-variant", "primary");
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("12:04")).toBeInTheDocument();
  });
});

describe("MessageScroller", () => {
  it("renders a keyboard-focusable log and exposes scroll helpers", () => {
    const ref = createRef<MessageScrollerHandle>();
    render(
      <MessageScroller ref={ref}>
        <Bubble>Hello</Bubble>
      </MessageScroller>,
    );
    const log = screen.getByRole("log", { name: "Messages" });
    expect(log).toHaveAttribute("tabindex", "0");
    expect(ref.current?.getViewport()).toBe(log);

    act(() => ref.current?.scrollToBottom("auto"));
    expect(log.scrollTop).toBe(log.scrollHeight);
  });

  it("shows the empty state when there are no children", () => {
    render(<MessageScroller emptyState="Nothing here yet" />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });
});
