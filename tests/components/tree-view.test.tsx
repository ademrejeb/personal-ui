import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TreeView, type TreeItem } from "@adem.rejeb/ui";

const ITEMS: TreeItem[] = [
  {
    key: "src",
    label: "src",
    children: [
      {
        key: "components",
        label: "components",
        children: [
          { key: "button", label: "Button.tsx" },
          { key: "input", label: "Input.tsx" },
        ],
      },
      { key: "index", label: "index.ts" },
    ],
  },
  { key: "readme", label: "README.md" },
  { key: "locked", label: "Locked.tsx", disabled: true },
];

describe("TreeView", () => {
  const toggles = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLButtonElement>(".ui-tree__toggle:not(.ui-tree__toggle--leaf)"));
  /** Roving tabindex means the first row is the tab stop, like a real tree. */
  const focusTree = () => screen.getByRole("treeitem", { name: /src/ }).focus();

  it("renders a tree with level metadata and collapsed by default", () => {
    render(<TreeView items={ITEMS} label="Files" />);
    expect(screen.getByRole("tree", { name: "Files" })).toBeInTheDocument();

    const src = screen.getByRole("treeitem", { name: /src/ });
    expect(src).toHaveAttribute("aria-level", "1");
    expect(src).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("treeitem", { name: "Button.tsx" })).not.toBeInTheDocument();
  });

  it("expands a node with the disclosure button and marks it expanded", async () => {
    const user = userEvent.setup();
    const { container } = render(<TreeView items={ITEMS} label="Files" />);

    await user.click(toggles(container)[0]);
    expect(screen.getByRole("treeitem", { name: /src/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("treeitem", { name: "index.ts" })).toBeInTheDocument();
  });

  it("navigates with the arrow keys and toggles selection with Enter", async () => {
    const user = userEvent.setup();
    render(<TreeView items={ITEMS} label="Files" defaultExpandedKeys={["src"]} />);

    focusTree();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("treeitem", { name: "components" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("treeitem", { name: "components" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("ArrowRight expands then enters the child; ArrowLeft collapses then exits", async () => {
    const user = userEvent.setup();
    render(<TreeView items={ITEMS} label="Files" />);

    focusTree();
    await user.keyboard("{ArrowRight}");
    const src = screen.getByRole("treeitem", { name: /src/ });
    expect(src).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("treeitem", { name: "components" })).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(src).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(src).toHaveAttribute("aria-expanded", "false");
  });

  it("Home and End jump to the edges, skipping nothing visible", async () => {
    const user = userEvent.setup();
    render(<TreeView items={ITEMS} label="Files" defaultExpandedKeys={["src"]} />);

    focusTree();
    await user.keyboard("{End}");
    expect(screen.getByRole("treeitem", { name: "README.md" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("treeitem", { name: /src/ })).toHaveFocus();
  });

  it("cascades checks to leaf descendants in multiple mode", async () => {
    const user = userEvent.setup();
    const onSelectedKeysChange = vi.fn();
    render(
      <TreeView
        items={ITEMS}
        label="Files"
        selectionMode="multiple"
        onSelectedKeysChange={onSelectedKeysChange}
      />,
    );

    await user.click(screen.getByRole("treeitem", { name: /src/ }));
    expect(onSelectedKeysChange).toHaveBeenLastCalledWith(["button", "input", "index"]);
  });

  it("derives a mixed state for partially checked branches", () => {
    render(
      <TreeView
        items={ITEMS}
        label="Files"
        selectionMode="multiple"
        defaultSelectedKeys={["button"]}
        defaultExpandedKeys={["src", "components"]}
      />,
    );

    expect(screen.getByRole("treeitem", { name: /components/ })).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
    expect(screen.getByRole("treeitem", { name: /src/ })).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
    expect(screen.getByRole("treeitem", { name: "Button.tsx" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("disables interaction with disabled nodes", async () => {
    const user = userEvent.setup();
    const onSelectedKeysChange = vi.fn();
    render(
      <TreeView items={ITEMS} label="Files" onSelectedKeysChange={onSelectedKeysChange} />,
    );

    expect(screen.getByRole("treeitem", { name: "Locked.tsx" })).toHaveAttribute("aria-disabled");
    await user.click(screen.getByRole("treeitem", { name: "Locked.tsx" }));
    expect(onSelectedKeysChange).not.toHaveBeenCalled();
  });

  it("honours controlled expansion and selection", async () => {
    const user = userEvent.setup();
    const onExpandedKeysChange = vi.fn();
    const { container } = render(
      <TreeView
        items={ITEMS}
        label="Files"
        expandedKeys={[]}
        onExpandedKeysChange={onExpandedKeysChange}
      />,
    );

    await user.click(toggles(container)[0]);
    expect(onExpandedKeysChange).toHaveBeenCalledWith(["src"]);
    expect(screen.getByRole("treeitem", { name: /src/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("supports unstyled and per-slot classes", () => {
    const { container } = render(
      <TreeView items={ITEMS} label="Files" unstyled classNames={{ row: "my-row" }} />,
    );
    const tree = container.querySelector("ul") as HTMLElement;

    expect(tree).not.toHaveClass("ui-tree");
    expect(container.querySelectorAll(".my-row")).toHaveLength(3);
    expect(screen.getByRole("tree", { name: "Files" })).toBeInTheDocument();
  });
});
