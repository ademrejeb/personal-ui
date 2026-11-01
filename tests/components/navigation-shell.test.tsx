import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar, Sidebar } from "@adem.rejeb/ui";

describe("Navbar", () => {
  it("renders brand, links, and an active page marker", () => {
    render(
      <Navbar>
        <Navbar.Brand href="/">Acme</Navbar.Brand>
        <Navbar.Nav>
          <Navbar.Link href="/" active>
            Dashboard
          </Navbar.Link>
          <Navbar.Link href="/projects">Projects</Navbar.Link>
        </Navbar.Nav>
      </Navbar>,
    );

    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Projects" })).not.toHaveAttribute("aria-current");
  });

  it("toggles the mobile menu from the toggle button", async () => {
    const user = userEvent.setup();
    render(
      <Navbar>
        <Navbar.Toggle />
        <Navbar.Nav>
          <Navbar.Link href="/">Home</Navbar.Link>
        </Navbar.Nav>
      </Navbar>,
    );

    const toggle = screen.getByRole("button", { name: "Toggle navigation" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("navigation")).not.toHaveAttribute("data-open");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation")).toHaveAttribute("data-open");
    expect(toggle).toHaveAttribute("aria-controls", screen.getByRole("navigation").id);
  });

  it("reports open changes to a controlled owner", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Navbar open={false} onOpenChange={onOpenChange}>
        <Navbar.Toggle />
        <Navbar.Nav />
      </Navbar>,
    );

    await user.click(screen.getByRole("button", { name: "Toggle navigation" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe("Sidebar", () => {
  it("groups links and marks the active item", () => {
    render(
      <Sidebar>
        <Sidebar.Nav>
          <Sidebar.Section label="Workspace">
            <Sidebar.Link href="/" active>
              Dashboard
            </Sidebar.Link>
            <Sidebar.Link href="/projects">Projects</Sidebar.Link>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>,
    );

    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute("aria-current", "page");
  });

  it("toggles the collapsed rail from the toggle button", async () => {
    const user = userEvent.setup();
    render(
      <Sidebar>
        <Sidebar.Header>
          <Sidebar.Toggle />
        </Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Link href="/">Home</Sidebar.Link>
        </Sidebar.Nav>
      </Sidebar>,
    );

    const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("closes the mobile drawer from the close button", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Sidebar open onOpenChange={onOpenChange}>
        <Sidebar.Close />
      </Sidebar>,
    );

    await user.click(screen.getByRole("button", { name: "Close sidebar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
