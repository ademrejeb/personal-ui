import { act, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@adem.rejeb/ui";

function Probe() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={() => setTheme("light")}>
        light
      </button>
      <button type="button" onClick={() => setTheme("dark")}>
        dark
      </button>
    </>
  );
}

const styleCount = () => document.head.querySelectorAll("style").length;

describe("ThemeProvider", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("applies and persists theme changes", () => {
    render(
      <ThemeProvider defaultTheme="system">
        <Probe />
      </ThemeProvider>,
    );

    act(() => screen.getByRole("button", { name: "light" }).click());
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(window.localStorage.getItem("adem.rejeb-theme")).toBe("light");
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("survives repeated changes after the transition guard is restored", () => {
    vi.useFakeTimers();
    const baseline = styleCount();
    render(
      <ThemeProvider defaultTheme="system">
        <Probe />
      </ThemeProvider>,
    );

    // The guard <style> is removed on the next frame; a later effect cleanup
    // must not try to remove the same node again (that crashed the whole tree).
    act(() => vi.advanceTimersByTime(50));
    act(() => screen.getByRole("button", { name: "light" }).click());
    act(() => vi.advanceTimersByTime(50));
    act(() => screen.getByRole("button", { name: "dark" }).click());
    act(() => vi.advanceTimersByTime(50));

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(styleCount()).toBe(baseline);
  });
});
