import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContextMenu, MenuBar, NavigationMenu } from "@personal-ui/ui";

describe("NavigationMenu", () => {
  it("opens a panel from its trigger and closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <NavigationMenu>
        <NavigationMenu.List>
          <NavigationMenu.Item value="products">
            <NavigationMenu.Trigger value="products">Products</NavigationMenu.Trigger>
            <NavigationMenu.Content value="products">
              <NavigationMenu.Link href="/one">One</NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>,
    );

    const trigger = screen.getByRole("button", { name: "Products" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "One" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "One" })).not.toBeInTheDocument();
  });
});

describe("MenuBar", () => {
  it("opens a menu and fires the item handler", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <MenuBar>
        <MenuBar.Menu value="file" label="File">
          <MenuBar.Item onSelect={onSelect}>New</MenuBar.Item>
        </MenuBar.Menu>
        <MenuBar.Menu value="edit" label="Edit">
          <MenuBar.Item>Undo</MenuBar.Item>
        </MenuBar.Menu>
      </MenuBar>,
    );

    await user.click(screen.getByRole("menuitem", { name: "File" }));
    await user.click(await screen.findByRole("menuitem", { name: "New" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("moves between menus with arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <MenuBar>
        <MenuBar.Menu value="file" label="File">
          <MenuBar.Item>New</MenuBar.Item>
        </MenuBar.Menu>
        <MenuBar.Menu value="edit" label="Edit">
          <MenuBar.Item>Undo</MenuBar.Item>
        </MenuBar.Menu>
      </MenuBar>,
    );

    const file = screen.getByRole("menuitem", { name: "File" });
    file.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
  });
});

describe("ContextMenu", () => {
  it("opens on right-click and runs the item", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ContextMenu>
        <ContextMenu.Trigger>
          <button type="button">Right click me</button>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item onSelect={onSelect}>Duplicate</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Right click me" }));
    const item = await screen.findByRole("menuitem", { name: "Duplicate" });
    await user.click(item);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menuitem", { name: "Duplicate" })).not.toBeInTheDocument();
  });
});
