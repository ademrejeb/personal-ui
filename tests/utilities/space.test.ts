import { spaceVar } from "@adem.rejeb/ui";

describe("spaceVar", () => {
  it("adds a literal fallback so layout survives before the token CSS", () => {
    // A raw `var(--ui-p-space-3)` computes to nothing while the token sheet is
    // missing; the fallback keeps the 12 px gap.
    expect(spaceVar(3)).toBe("var(--ui-p-space-3, 0.75rem)");
    expect(spaceVar("3")).toBe("var(--ui-p-space-3, 0.75rem)");
    expect(spaceVar(0.5)).toBe("var(--ui-p-space-0-5, 0.125rem)");
    expect(spaceVar("0.5")).toBe("var(--ui-p-space-0-5, 0.125rem)");
    expect(spaceVar(0)).toBe("var(--ui-p-space-0, 0)");
    expect(spaceVar("px")).toBe("var(--ui-p-space-px, 1px)");
  });

  it("passes raw CSS lengths and unknown steps through untouched", () => {
    expect(spaceVar("10px")).toBe("10px");
    expect(spaceVar("var(--app-gutter)")).toBe("var(--app-gutter)");
    // The scale stops at 24; an unknown numeric step has no fallback to invent.
    expect(spaceVar("7")).toBe("var(--ui-p-space-7)");
  });
});
