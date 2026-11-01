import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "@adem.rejeb/ui";

function TabsDemo() {
  return (
    <Tabs defaultValue="overview">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">Overview panel</Tabs.Content>
      <Tabs.Content value="activity">Activity panel</Tabs.Content>
      <Tabs.Content value="settings">Settings panel</Tabs.Content>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("renders a tablist with the default tab selected", () => {
    render(<TabsDemo />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Overview panel")).toBeInTheDocument();
    expect(screen.queryByText("Activity panel")).not.toBeInTheDocument();
  });

  it("activates a tab on click", async () => {
    render(<TabsDemo />);
    await userEvent.click(screen.getByRole("tab", { name: "Activity" }));
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Activity panel")).toBeInTheDocument();
  });

  it("moves selection with the arrow keys", async () => {
    render(<TabsDemo />);
    const overview = screen.getByRole("tab", { name: "Overview" });
    overview.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
  });

  it("only exposes the selected trigger to the tab order", () => {
    render(<TabsDemo />);
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("tabindex", "-1");
  });
});
