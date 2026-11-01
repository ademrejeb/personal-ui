import { act, renderHook } from "@testing-library/react";
import {
  areAllSelected,
  areSomeSelected,
  deselectKeys,
  isKeySelected,
  selectKeys,
  setKeys,
  toggleKey,
  useSelection,
} from "@adem.rejeb/ui";

describe("selection helpers", () => {
  it("toggles a key on and off", () => {
    expect(toggleKey(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleKey(["a", "b"], "a")).toEqual(["b"]);
  });

  it("returns the same reference for a no-op so no change is emitted", () => {
    const selected = ["a", "b"];
    expect(toggleKey(selected, "c", 2)).toBe(selected);
    expect(setKeys(selected, ["a"], true)).toBe(selected);
    expect(setKeys(selected, ["z"], false)).toBe(selected);
  });

  it("adds and removes many keys, preserving order", () => {
    expect(selectKeys(["a"], ["b", "c"])).toEqual(["a", "b", "c"]);
    expect(selectKeys(["a", "b"], ["a", "c"])).toEqual(["a", "b", "c"]);
    expect(deselectKeys(["a", "b", "c"], ["b"])).toEqual(["a", "c"]);
    expect(setKeys(["a", "b", "c"], ["a", "b"], false)).toEqual(["c"]);
  });

  it("respects the max when turning keys on", () => {
    expect(selectKeys(["a"], ["b", "c", "d"], 2)).toEqual(["a", "b"]);
    expect(setKeys(["a", "b"], ["c"], true, 2)).toEqual(["a", "b"]);
  });

  it("reports membership, all, and some", () => {
    expect(isKeySelected(["a"], "a")).toBe(true);
    expect(isKeySelected(["a"], "b")).toBe(false);
    expect(areAllSelected(["a", "b"], ["a", "b"])).toBe(true);
    expect(areAllSelected(["a", "b"], [])).toBe(false);
    expect(areSomeSelected(["a"], ["a", "b"])).toBe(true);
    expect(areSomeSelected(["a"], ["b", "c"])).toBe(false);
  });
});

describe("useSelection", () => {
  it("owns its state when uncontrolled", () => {
    const { result } = renderHook(() => useSelection<string>({ defaultValue: ["a"] }));

    expect(result.current.selected).toEqual(["a"]);
    act(() => result.current.toggle("b"));
    expect(result.current.selected).toEqual(["a", "b"]);
    expect(result.current.isSelected("b")).toBe(true);
    act(() => result.current.deselect("a"));
    expect(result.current.selected).toEqual(["b"]);
    act(() => result.current.clear());
    expect(result.current.selected).toEqual([]);
  });

  it("defers to a controlled value and reports changes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSelection<string>({ value: ["a"], onChange, defaultValue: [] }),
    );

    act(() => result.current.toggle("b"));
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    expect(result.current.selected).toEqual(["a"]);
  });

  it("toggles a whole group and reports limits", () => {
    const { result } = renderHook(() => useSelection<string>({ defaultValue: [], max: 2 }));

    act(() => result.current.toggleAll(["a", "b", "c"]));
    expect(result.current.selected).toEqual(["a", "b"]);
    expect(result.current.atLimit).toBe(true);
    expect(result.current.allSelected(["a", "b"])).toBe(true);
    expect(result.current.allSelected(["a", "b", "c"])).toBe(false);
    expect(result.current.someSelected(["b", "z"])).toBe(true);

    act(() => result.current.toggleAll(["a", "b"]));
    expect(result.current.selected).toEqual([]);
    expect(result.current.atLimit).toBe(false);
  });
});
