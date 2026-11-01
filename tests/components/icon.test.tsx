import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { getIcon, Icon, iconNames, iconRegistry } from "@adem.rejeb/ui";
import { Search } from "lucide-react";

describe("Icon", () => {
  it("is decorative by default", () => {
    const { container } = render(<Icon icon={Search} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("exposes an accessible name when labelled", () => {
    render(<Icon icon={Search} label="Search" />);
    expect(screen.getByRole("img", { name: "Search" })).toBeInTheDocument();
  });

  it("applies the spin modifier and pixel sizing", () => {
    const { container } = render(<Icon icon={Search} spin size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("ui-icon--spin");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("maps named sizes to pixel values", () => {
    const { container } = render(<Icon icon={Search} size="xl" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
  });

  it("exposes a curated registry", () => {
    expect(iconNames).toContain("search");
    expect(getIcon("search")).toBe(iconRegistry.search);
  });
});
