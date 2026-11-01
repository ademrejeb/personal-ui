import { generateCode, initialState } from "../../apps/component-lab/src/registry";
import type { ComponentEntry } from "../../apps/component-lab/src/registry";
import { jsx } from "../../apps/component-lab/src/lib/jsx";

describe("jsx helper", () => {
  it("self-closes elements without children", () => {
    expect(jsx("Spinner")).toBe("<Spinner />");
  });

  it("renders boolean shorthand and omits false values", () => {
    expect(jsx("Button", { props: { loading: true, disabled: false } })).toBe("<Button loading />");
  });

  it("quotes string values and keeps numbers bare", () => {
    expect(jsx("Text", { props: { size: "lg", count: 3 } })).toBe('<Text size="lg" count={3} />');
  });

  it("inlines simple children and indents block children", () => {
    expect(jsx("Button", { children: "Save" })).toBe("<Button>Save</Button>");
    expect(jsx("Stack", { children: "<a />\n<b />" })).toBe("<Stack>\n  <a />\n  <b />\n</Stack>");
  });
});

function makeEntry(overrides: Partial<ComponentEntry> = {}): ComponentEntry {
  return {
    id: "widget",
    name: "Widget",
    category: "Actions",
    description: "A widget.",
    children: "Label",
    controls: [
      { name: "variant", type: "select", defaultValue: "primary" },
      { name: "block", type: "boolean", defaultValue: false },
    ],
    render: () => null,
    ...overrides,
  };
}

describe("generateCode", () => {
  it("prefers a hand-authored code function", () => {
    const entry = makeEntry({ code: () => "// custom" });
    expect(generateCode(entry, initialState(entry))).toBe("// custom");
  });

  it("omits values equal to their default and includes changed ones", () => {
    const entry = makeEntry();
    expect(generateCode(entry, { variant: "primary", block: false })).toBe("<Widget>Label</Widget>");
    expect(generateCode(entry, { variant: "danger", block: true })).toBe(
      '<Widget variant="danger" block>Label</Widget>',
    );
  });
});
