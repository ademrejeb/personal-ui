import { render } from "@testing-library/react";
import { ThemeProvider } from "@adem.rejeb/ui";
import {
  generateCode,
  getEntry,
  groupedRegistry,
  initialState,
  registry,
  searchRegistry,
} from "../../apps/component-lab/src/registry";

describe("registry integrity", () => {
  it("has unique ids", () => {
    const ids = registry.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("populates required fields on every entry", () => {
    for (const entry of registry) {
      expect(entry.id).toMatch(/^[a-z0-9-]+$/);
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.category.length).toBeGreaterThan(0);
      expect(typeof entry.render).toBe("function");
    }
  });

  it("exposes every entry through getEntry and grouping", () => {
    const grouped = groupedRegistry().flatMap((group) => group.entries);
    expect(grouped).toHaveLength(registry.length);
    for (const entry of registry) {
      expect(getEntry(entry.id)).toBe(entry);
    }
  });

  it("produces a non-empty code string for every entry", () => {
    for (const entry of registry) {
      const code = generateCode(entry, initialState(entry));
      expect(typeof code).toBe("string");
      expect(code.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("registry rendering", () => {
  for (const entry of registry) {
    it(`renders ${entry.id} without throwing`, () => {
      const state = initialState(entry);
      expect(() =>
        render(<ThemeProvider defaultTheme="dark">{entry.render(state)}</ThemeProvider>),
      ).not.toThrow();
    });
  }
});

describe("searchRegistry", () => {
  it("ranks exact name matches first", () => {
    expect(searchRegistry("button")[0]?.id).toBe("button");
  });

  it("returns matches by keyword", () => {
    const results = searchRegistry("cta");
    expect(results.some((entry) => entry.id === "button")).toBe(true);
  });

  it("returns everything for an empty query", () => {
    expect(searchRegistry("")).toHaveLength(registry.length);
  });
});
