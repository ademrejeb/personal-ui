import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  InputMask,
  applyMask,
  isMaskComplete,
  isNumericMask,
  maskToPlaceholder,
  parseMask,
  unmaskValue,
  type InputMaskProps,
} from "@personal-ui/ui";

const PHONE = "(999) 999-9999";

describe("mask utilities", () => {
  it("parses tokens, literals and escapes", () => {
    expect(parseMask("9a*")).toEqual([
      { kind: "token", token: "9" },
      { kind: "token", token: "a" },
      { kind: "token", token: "*" },
    ]);
    expect(parseMask("\\9")).toEqual([{ kind: "literal", char: "9" }]);
  });

  it("formats incrementally and only adds literals that are followed by input", () => {
    expect(applyMask("555", PHONE)).toBe("(555");
    expect(applyMask("5551", PHONE)).toBe("(555) 1");
    expect(applyMask("5551234567", PHONE)).toBe("(555) 123-4567");
    expect(applyMask("555123456789", PHONE)).toBe("(555) 123-4567");
  });

  it("drops characters that do not match the token", () => {
    expect(applyMask("a5b5c5", PHONE)).toBe("(555");
    expect(applyMask("abcd", "aa-aa")).toBe("ab-cd");
    expect(applyMask("abc", PHONE)).toBe("");
  });

  it("unmasks, checks completeness and builds placeholders", () => {
    expect(unmaskValue("(555) 123-4567", PHONE)).toBe("5551234567");
    expect(isMaskComplete("(555) 123-4567", PHONE)).toBe(true);
    expect(isMaskComplete("(555) 123-456", PHONE)).toBe(false);
    expect(maskToPlaceholder(PHONE)).toBe("(___) ___-____");
    expect(isNumericMask(PHONE)).toBe(true);
    expect(isNumericMask("aa-9")).toBe(false);
  });
});

describe("InputMask", () => {
  function Example(props: Partial<InputMaskProps> = {}) {
    return <InputMask mask={PHONE} aria-label="Phone" {...props} />;
  }

  it("formats typed digits and reports the raw value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);

    const input = screen.getByRole("textbox", { name: "Phone" });
    await user.type(input, "5551234567");

    expect(input).toHaveValue("(555) 123-4567");
    expect(onValueChange).toHaveBeenLastCalledWith("(555) 123-4567", "5551234567");
  });

  it("rejects characters that do not fit the mask", async () => {
    const user = userEvent.setup();
    render(<Example />);

    const input = screen.getByRole("textbox", { name: "Phone" });
    await user.type(input, "abc");

    expect(input).toHaveValue("");
  });

  it("accepts a controlled value in any shape", () => {
    render(<Example value="5551234567" />);
    expect(screen.getByRole("textbox", { name: "Phone" })).toHaveValue("(555) 123-4567");
  });

  it("uses the mask as the default placeholder and marks completion", async () => {
    const user = userEvent.setup();
    const { container } = render(<Example />);

    const input = screen.getByRole("textbox", { name: "Phone" });
    expect(input).toHaveAttribute("placeholder", "(___) ___-____");
    expect(input).toHaveAttribute("inputmode", "numeric");

    await user.type(input, "5551234567");
    expect(container.querySelector(".ui-input-mask")).toHaveAttribute("data-complete");
  });

  it("submits the raw value, or the masked one on request", () => {
    const { unmount } = render(<Example name="phone" defaultValue="5551234567" />);
    expect(document.querySelector('input[name="phone"]')).toHaveValue("5551234567");
    unmount();

    render(<Example name="phone" defaultValue="5551234567" submitMasked />);
    expect(document.querySelector('input[name="phone"]')).toHaveValue("(555) 123-4567");
  });

  it("honours unstyled and per-slot classNames", () => {
    const { container } = render(<Example unstyled classNames={{ input: "custom-input" }} />);
    const input = screen.getByRole("textbox", { name: "Phone" });
    expect(container.querySelector(".ui-input")).toBeNull();
    expect(input).toHaveClass("custom-input");
  });
});
