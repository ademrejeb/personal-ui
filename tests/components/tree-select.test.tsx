import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TreeSelect, type TreeItem } from "@adem.rejeb/ui";

const ITEMS: TreeItem[] = [
  {
    key: "eu",
    label: "Europe",
    children: [
      { key: "fr", label: "France" },
      { key: "de", label: "Germany" },
    ],
  },
  {
    key: "us",
    label: "Americas",
    children: [{ key: "br", label: "Brazil" }],
  },
];

describe("TreeSelect", () => {
  /** Popup content is portaled to the body, so queries must not be scoped to the render container. */
  const popupToggles = () =>
    Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        ".ui-treeselect__popup .ui-tree__toggle:not(.ui-tree__toggle--leaf)",
      ),
    );

  it("shows the placeholder until a node is picked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TreeSelect items={ITEMS} label="Region" onValueChange={onValueChange} />);

    const trigger = screen.getByRole("combobox", { name: "Region" });
    expect(trigger).toHaveTextContent("Select…");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(popupToggles()[0]);
    await user.click(screen.getByRole("treeitem", { name: "France" }));

    expect(onValueChange).toHaveBeenCalledWith("fr");
    expect(trigger).toHaveTextContent("France");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the branch that contains the current value", async () => {
    const user = userEvent.setup();
    render(<TreeSelect items={ITEMS} label="Region" defaultValue="de" />);

    const trigger = screen.getByRole("combobox", { name: "Region" });
    expect(trigger).toHaveTextContent("Germany");

    await user.click(trigger);
    expect(screen.getByRole("treeitem", { name: "Europe" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("treeitem", { name: "Germany" })).toBeInTheDocument();
  });

  it("expands and collapses branches through the popup tree", async () => {
    const user = userEvent.setup();
    render(<TreeSelect items={ITEMS} label="Region" />);

    await user.click(screen.getByRole("combobox", { name: "Region" }));
    await user.click(popupToggles()[0]);

    expect(screen.getByRole("treeitem", { name: "Europe" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("treeitem", { name: "France" })).toBeInTheDocument();
  });

  it("filters the tree when searchable", async () => {
    const user = userEvent.setup();
    render(<TreeSelect items={ITEMS} label="Region" searchable />);

    await user.click(screen.getByRole("combobox", { name: "Region" }));
    await user.type(screen.getByRole("textbox", { name: "Search options" }), "braz");

    expect(screen.getByRole("treeitem", { name: "Brazil" })).toBeInTheDocument();
    expect(screen.queryByRole("treeitem", { name: "Germany" })).not.toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<TreeSelect items={ITEMS} label="Region" />);
    const trigger = screen.getByRole("combobox", { name: "Region" });

    await user.click(trigger);
    expect(screen.getByRole("tree")).toBeInTheDocument();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("keeps a controlled value and reports clearing", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <TreeSelect
        items={ITEMS}
        label="Region"
        value="br"
        clearable
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Region" });
    expect(trigger).toHaveTextContent("Brazil");
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(trigger).toHaveTextContent("Brazil");
  });

  it("submits the value through a hidden input", () => {
    const { container } = render(<TreeSelect items={ITEMS} label="Region" name="region" value="fr" />);
    expect(container.querySelector<HTMLInputElement>('input[name="region"]')?.value).toBe("fr");
  });

  it("renders the ancestry when asked, and can ignore parents", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <TreeSelect
        items={ITEMS}
        label="Region"
        value="fr"
        showPathInTrigger
        allowParentSelect={false}
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Region" });
    expect(trigger).toHaveTextContent("Europe");
    expect(trigger).toHaveTextContent("France");
    expect(container.querySelector(".ui-treeselect__path")).toHaveTextContent("Europe");

    await user.click(trigger);
    await user.click(screen.getByRole("treeitem", { name: "Europe" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables the control and marks it invalid for form fields", () => {
    render(<TreeSelect items={ITEMS} label="Region" disabled invalid required />);
    const trigger = screen.getByRole("combobox", { name: "Region" });

    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-required", "true");
  });

  it("supports unstyled and per-slot classes", () => {
    const { container } = render(
      <TreeSelect items={ITEMS} label="Region" unstyled classNames={{ trigger: "my-trigger" }} />,
    );
    expect(container.firstElementChild).not.toHaveClass("ui-treeselect");
    expect(container.querySelector(".my-trigger")).toBeInTheDocument();
  });
});
