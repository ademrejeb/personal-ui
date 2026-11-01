import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette, type CommandPaletteItem } from "@personal-ui/ui";

const ITEMS: CommandPaletteItem[] = [
  { id: "new", label: "New file", group: "File", keywords: ["create"] },
  { id: "open", label: "Open file", group: "File" },
  { id: "theme", label: "Toggle theme", group: "View", keywords: ["dark", "light"] },
];

describe("CommandPalette", () => {
  it("lists all items when open", () => {
    render(<CommandPalette open onSelect={vi.fn()} items={ITEMS} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("filters by label and keywords", async () => {
    const user = userEvent.setup();
    render(<CommandPalette open onSelect={vi.fn()} items={ITEMS} />);
    await user.type(screen.getByRole("combobox"), "dark");
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Toggle theme");
  });

  it("selects the active item with the keyboard and closes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(<CommandPalette open onOpenChange={onOpenChange} onSelect={onSelect} items={ITEMS} />);

    await user.keyboard("{ArrowDown}");
    expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(ITEMS[1]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<CommandPalette open onSelect={vi.fn()} items={ITEMS} />);
    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("No matching commands")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<CommandPalette open={false} onSelect={vi.fn()} items={ITEMS} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
