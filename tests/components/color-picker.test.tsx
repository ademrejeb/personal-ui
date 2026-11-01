import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ColorPicker,
  formatColor,
  hslToRgb,
  parseColor,
  readableTextColor,
  rgbToHsl,
  toHex,
  toHexWithAlpha,
} from "@personal-ui/ui";

describe("colour utilities", () => {
  it("parses hex, rgb() and hsl() strings", () => {
    expect(parseColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor("#f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor("#ff000080")).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    expect(parseColor("rgb(0, 128, 255)")).toEqual({ r: 0, g: 128, b: 255, a: 1 });
    expect(parseColor("hsla(210, 100%, 50%, 0.5)")).toEqual({ r: 0, g: 128, b: 255, a: 0.5 });
    expect(parseColor("not a colour")).toBeNull();
  });

  it("round-trips rgb and hsl", () => {
    expect(toHex({ r: 0, g: 128, b: 255 })).toBe("#0080ff");
    expect(toHexWithAlpha({ r: 0, g: 128, b: 255, a: 0.5 })).toBe("#0080ff80");
    const hsl = rgbToHsl({ r: 0, g: 128, b: 255 });
    expect(hsl).toEqual({ h: 210, s: 100, l: 50 });
    expect(hslToRgb(hsl)).toEqual({ r: 0, g: 128, b: 255 });
  });

  it("formats colours per format and picks readable text", () => {
    expect(formatColor({ r: 255, g: 0, b: 0, a: 1 }, "hex")).toBe("#ff0000");
    expect(formatColor({ r: 255, g: 0, b: 0, a: 0.5 }, "rgb")).toBe("rgba(255, 0, 0, 0.5)");
    expect(formatColor({ r: 0, g: 128, b: 255, a: 1 }, "hsl")).toBe("hsl(210, 100%, 50%)");
    expect(readableTextColor({ r: 255, g: 255, b: 255 })).toBe("#000000");
    expect(readableTextColor({ r: 10, g: 10, b: 10 })).toBe("#ffffff");
  });
});

describe("ColorPicker", () => {
  it("opens a dialog from the swatch trigger and picks a preset", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ColorPicker label="Accent" onValueChange={onValueChange} />);

    const trigger = screen.getByRole("button", { name: /^Accent/ });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: /^Accent/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "#10b981" }));
    expect(onValueChange).toHaveBeenLastCalledWith("#10b981");
    expect(screen.getByRole("button", { name: "#10b981" })).toHaveAttribute("aria-pressed", "true");
  });

  it("commits a typed colour and rejects nonsense", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ColorPicker label="Accent" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: /^Accent/ }));
    const field = screen.getByRole("textbox", { name: "Value" });

    await user.clear(field);
    await user.type(field, "nope");
    expect(screen.getByText("Not a colour")).toBeInTheDocument();
    await user.tab();
    expect(onValueChange).not.toHaveBeenCalled();

    await user.clear(field);
    await user.type(field, "0080ff{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("#0080ff");
  });

  it("outputs the requested format and honours withAlpha", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ColorPicker
        label="Accent"
        format="rgb"
        withAlpha
        defaultValue="#ff0000"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /^Accent/ }));
    const slider = screen.getByRole("slider", { name: "Opacity" });
    fireEvent.change(slider, { target: { value: "50" } });

    expect(onValueChange).toHaveBeenLastCalledWith("rgba(255, 0, 0, 0.5)");
  });

  it("stays controlled and submits through a hidden input", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState("#6c70f2");
      return (
        <div>
          <ColorPicker label="Accent" value={value} onValueChange={setValue} name="accent" showValue />
          <span data-testid="outside">{value}</span>
        </div>
      );
    }
    const { container } = render(<Controlled />);

    expect(screen.getByRole("button", { name: /^Accent/ })).toHaveTextContent("#6c70f2");
    await user.click(screen.getByRole("button", { name: /^Accent/ }));
    await user.click(screen.getByRole("button", { name: "#ef4444" }));

    expect(screen.getByTestId("outside")).toHaveTextContent("#ef4444");
    expect(container.querySelector('input[name="accent"]')).toHaveValue("#ef4444");
  });

  it("closes when the trigger is pressed again", async () => {
    const user = userEvent.setup();
    render(<ColorPicker label="Accent" />);

    const trigger = screen.getByRole("button", { name: /^Accent/ });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: /^Accent/ })).toBeInTheDocument();
    await user.click(trigger);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("honours unstyled and per-slot classNames", () => {
    const { container } = render(
      <ColorPicker label="Accent" defaultValue="#000000" unstyled classNames={{ swatch: "custom-swatch" }} />,
    );
    expect(container.querySelector(".ui-colorpicker")).toBeNull();
    expect(container.querySelector(".custom-swatch")).toBeInTheDocument();
  });
});
