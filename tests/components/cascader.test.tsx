import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Cascader, findCascaderOption, resolveCascaderPath, type CascaderOption } from "@personal-ui/ui";

const OPTIONS: CascaderOption[] = [
  {
    value: "eu",
    label: "Europe",
    children: [
      { value: "de", label: "Germany", children: [{ value: "berlin", label: "Berlin" }] },
      { value: "fr", label: "France", children: [{ value: "paris", label: "Paris" }] },
    ],
  },
  {
    value: "us",
    label: "United States",
    children: [
      { value: "ca", label: "California", children: [{ value: "sf", label: "San Francisco" }] },
    ],
  },
];

describe("cascader utilities", () => {
  it("resolves a value path into options", () => {
    expect(resolveCascaderPath(OPTIONS, ["eu", "de"]).map((option) => option.label)).toEqual([
      "Europe",
      "Germany",
    ]);
    expect(findCascaderOption(OPTIONS, ["eu", "de", "berlin"])?.label).toBe("Berlin");
    expect(findCascaderOption(OPTIONS, ["eu", "de", "nope"])).toBeNull();
  });
});

describe("Cascader", () => {
  it("drills through columns and commits a leaf into the trigger", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Cascader options={OPTIONS} label="Region" onChange={onChange} />);

    const trigger = screen.getByRole("combobox", { name: "Region" });
    expect(trigger).toHaveTextContent("Select…");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(within(screen.getAllByRole("listbox")[0]).getByRole("option", { name: "Europe" }));
    await user.click(screen.getByRole("option", { name: "Germany" }));
    await user.click(screen.getByRole("option", { name: "Berlin" }));

    expect(onChange).toHaveBeenLastCalledWith(["eu", "de", "berlin"], expect.objectContaining({ value: "berlin" }));
    expect(screen.getByRole("combobox", { name: "Region" })).toHaveTextContent("Europe");
    expect(trigger).not.toHaveAttribute("aria-expanded", "true");
  });

  it("supports the keyboard: open, drill, step back and commit", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Cascader options={OPTIONS} label="Region" onChange={onChange} />);

    const trigger = screen.getByRole("combobox", { name: "Region" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger.getAttribute("aria-activedescendant")).toBeTruthy();

    await user.keyboard("{ArrowRight}");
    expect(screen.getAllByRole("listbox")).toHaveLength(2);
    await user.keyboard("{ArrowRight}");
    expect(screen.getAllByRole("listbox")).toHaveLength(3);

    await user.keyboard("{ArrowLeft}");
    expect(screen.getAllByRole("listbox")).toHaveLength(2);

    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(
      ["eu", "de", "berlin"],
      expect.objectContaining({ label: "Berlin" }),
    );
  });

  it("steps the highlight through the active column and skips disabled rows", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Cascader
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta", disabled: true },
          { value: "c", label: "Gamma" },
        ]}
        label="Region"
        changeOnSelect
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Region" });
    trigger.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(["c"], expect.objectContaining({ label: "Gamma" }));
  });

  it("commits parents when changeOnSelect is set", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Cascader options={OPTIONS} label="Region" changeOnSelect onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: "Region" }));
    await user.click(screen.getByRole("option", { name: "Europe" }));
    expect(onChange).toHaveBeenLastCalledWith(["eu"], expect.objectContaining({ value: "eu" }));
  });

  it("renders a controlled value as a path and clears it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Cascader
        options={OPTIONS}
        label="Region"
        value={["eu", "fr", "paris"]}
        clearable
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Region" })).toHaveTextContent("Paris");
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onChange).toHaveBeenLastCalledWith(null, null);
  });

  it("expands on hover when asked and submits through a hidden input", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Cascader
        options={OPTIONS}
        label="Region"
        expandTrigger="hover"
        defaultValue={["us", "ca", "sf"]}
        name="region"
      />,
    );

    expect(container.querySelector('input[name="region"]')).toHaveValue("us/ca/sf");

    await user.click(screen.getByRole("combobox", { name: "Region" }));
    await user.hover(screen.getByRole("option", { name: "Europe" }));
    expect(screen.getAllByRole("listbox")).toHaveLength(2);
  });

  it("honours unstyled and per-slot classNames", () => {
    const { container } = render(
      <Cascader
        options={OPTIONS}
        label="Region"
        defaultValue={["eu", "de", "berlin"]}
        unstyled
        classNames={{ trigger: "custom-trigger" }}
      />,
    );
    expect(container.querySelector(".ui-cascader")).toBeNull();
    expect(screen.getByRole("combobox", { name: "Region" })).toHaveClass("custom-trigger");
  });
});
