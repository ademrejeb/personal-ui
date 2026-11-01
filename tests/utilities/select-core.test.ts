import { renderHook, act } from "@testing-library/react";
import {
  buildGroups,
  defaultFilterOption,
  findEdgeEnabledIndex,
  findNextEnabledIndex,
  getOptionText,
  optionEquals,
  useListbox,
  type SelectOption,
} from "@adem.rejeb/ui";

const OPTIONS: SelectOption<string>[] = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta", disabled: true },
  { value: "c", label: "Gamma" },
  { value: "d", label: "Delta", group: "Extras" },
];

describe("getOptionText", () => {
  it("uses a string label when present", () => {
    expect(getOptionText({ value: "x", label: "Shown" })).toBe("Shown");
  });

  it("falls back to keywords then the value", () => {
    expect(getOptionText({ value: "x", keywords: ["one", "two"] })).toBe("one two");
    expect(getOptionText({ value: "x" })).toBe("x");
  });
});

describe("defaultFilterOption", () => {
  it("matches case-insensitively on the label", () => {
    expect(defaultFilterOption(OPTIONS[0], "alp")).toBe(true);
    expect(defaultFilterOption(OPTIONS[0], "zzz")).toBe(false);
  });

  it("matches everything for an empty query", () => {
    expect(defaultFilterOption(OPTIONS[0], "  ")).toBe(true);
  });
});

describe("buildGroups", () => {
  it("keeps first-seen group order and a trailing ungrouped bucket", () => {
    const groups = buildGroups(OPTIONS, "");
    expect(groups.map((g) => g.label)).toEqual(["", "Extras"]);
    expect(groups[0].options.map((o) => o.value)).toEqual(["a", "b", "c"]);
    expect(groups[1].options.map((o) => o.value)).toEqual(["d"]);
  });

  it("filters before grouping", () => {
    const groups = buildGroups(OPTIONS, "delta");
    expect(groups).toHaveLength(1);
    expect(groups[0].options.map((o) => o.value)).toEqual(["d"]);
  });
});

describe("findNextEnabledIndex", () => {
  it("skips disabled options and wraps around", () => {
    expect(findNextEnabledIndex(OPTIONS, -1, 1)).toBe(0);
    expect(findNextEnabledIndex(OPTIONS, 0, 1)).toBe(2);
    expect(findNextEnabledIndex(OPTIONS, 3, 1)).toBe(0);
  });

  it("moves backwards and stops at the start when looping is off", () => {
    expect(findNextEnabledIndex(OPTIONS, 0, -1)).toBe(3);
    expect(findNextEnabledIndex(OPTIONS, 0, -1, false)).toBe(0);
  });

  it("returns -1 for an empty list", () => {
    expect(findNextEnabledIndex([], 0, 1)).toBe(-1);
  });
});

describe("findEdgeEnabledIndex", () => {
  it("finds the first and last enabled options", () => {
    expect(findEdgeEnabledIndex(OPTIONS, "start")).toBe(0);
    expect(findEdgeEnabledIndex(OPTIONS, "end")).toBe(3);
  });

  it("returns -1 when nothing is enabled", () => {
    expect(findEdgeEnabledIndex([{ value: "x", disabled: true }], "start")).toBe(-1);
  });
});

describe("optionEquals", () => {
  it("compares by value", () => {
    expect(optionEquals("a", "a")).toBe(true);
    expect(optionEquals("a", "b")).toBe(false);
  });
});

describe("useListbox", () => {
  it("starts with no active option and exposes stable ids", () => {
    const { result } = renderHook(() => useListbox({ options: OPTIONS, idPrefix: "lb" }));
    expect(result.current.activeIndex).toBe(-1);
    expect(result.current.getOptionId(2)).toBe("lb-option-2");
    expect(result.current.flat).toHaveLength(4);
  });

  it("moves the active index and skips disabled options", () => {
    const { result } = renderHook(() => useListbox({ options: OPTIONS, idPrefix: "lb" }));
    act(() => result.current.moveActive(1));
    expect(result.current.activeIndex).toBe(0);
    act(() => result.current.moveActive(1));
    expect(result.current.activeIndex).toBe(2);
  });

  it("jumps to edges", () => {
    const { result } = renderHook(() => useListbox({ options: OPTIONS, idPrefix: "lb" }));
    act(() => result.current.moveToEdge("end"));
    expect(result.current.activeIndex).toBe(3);
    act(() => result.current.moveToEdge("start"));
    expect(result.current.activeIndex).toBe(0);
  });

  it("filters options by query", () => {
    const { result } = renderHook(() =>
      useListbox({ options: OPTIONS, idPrefix: "lb", query: "gam" }),
    );
    expect(result.current.flat.map((o) => o.value)).toEqual(["c"]);
    expect(result.current.groups).toHaveLength(1);
  });
});
