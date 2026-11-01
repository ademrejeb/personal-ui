import { useMemo, forwardRef, type HTMLAttributes } from "react";
import { Check, ChevronDown } from "lucide-react";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { useColorPicker, type UseColorPickerOptions } from "../../hooks/useColorPicker";
import { formatColor, parseColor, readableTextColor, toHex } from "../../utilities/color";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";
import type { ControlSize } from "../../types";
import type { Placement } from "../../utilities/position";
import { useFieldControl } from "./field-utils";

export type ColorPickerSlot =
  | "root"
  | "trigger"
  | "swatch"
  | "value"
  | "indicator"
  | "popup"
  | "section"
  | "label"
  | "native"
  | "hexInput"
  | "alpha"
  | "alphaInput"
  | "swatches"
  | "swatchButton"
  | "invalid";

export type ColorPickerClassNames = SlotClassNames<ColorPickerSlot>;

export interface ColorPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    Omit<UseColorPickerOptions, "value" | "defaultValue" | "onValueChange">,
    SlotConfig<ColorPickerSlot> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ControlSize;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  name?: string;
  placement?: Placement;
  /** Show the formatted value next to the swatch in the trigger. */
  showValue?: boolean;
  /** Accessible name for the trigger and the popup dialog. */
  label?: string;
  /** Show the native colour input inside the popup. */
  nativeInput?: boolean;
  /** Hidden input value: the formatted colour, or the opaque hex. */
  submitFormat?: "value" | "hex";
}

/**
 * Colour picker with a swatch trigger and a `FloatingLayer` popup holding a
 * native colour input, a hex field, an optional alpha slider and presets.
 */
export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(function ColorPicker(
  {
    value,
    defaultValue,
    onValueChange,
    format = "hex",
    withAlpha = false,
    swatches,
    size = "md",
    disabled,
    invalid,
    id,
    name,
    placement = "bottom-start",
    showValue = false,
    label = "Colour",
    nativeInput = true,
    submitFormat = "value",
    className,
    classNames,
    unstyled = false,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, disabled });
  const config = useMemo(() => slotConfig(unstyled, classNames), [unstyled, classNames]);
  const picker = useColorPicker({ value, defaultValue, onValueChange, format, withAlpha, swatches });
  const { rgba, open, setOpen } = picker;
  const swatchStyle = { backgroundColor: formatColor(rgba, "rgb") };

  return (
    <div
      ref={ref}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      data-open={open || undefined}
      className={slotClass(config, "root", "ui-colorpicker", className)}
      {...rest}
    >
      <button
        {...picker.getTriggerProps({
          id: field.id,
          disabled: field.disabled,
          "aria-invalid": field.invalid || undefined,
          "aria-describedby": field.describedBy,
          "aria-label": showValue ? `${label}: ${picker.value}` : label,
          "data-size": size,
          className: slotClass(config, "trigger", "ui-colorpicker__trigger ui-control"),
        })}
      >
        <span
          aria-hidden="true"
          className={slotClass(config, "swatch", "ui-colorpicker__swatch")}
          style={swatchStyle}
        />
        {showValue && (
          <span className={slotClass(config, "value", "ui-colorpicker__value")}>{picker.value}</span>
        )}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={slotClass(config, "indicator", "ui-colorpicker__indicator")}
        />
      </button>

      {name ? (
        <input
          type="hidden"
          name={name}
          value={submitFormat === "hex" ? picker.hex : picker.value}
        />
      ) : null}

      <FloatingLayer
        open={open}
        anchorRef={picker.anchorRef}
        placement={placement}
        offset={4}
        keepOpenRefs={[picker.anchorRef]}
        returnFocusRef={picker.anchorRef}
        onDismiss={() => setOpen(false)}
        focusOnOpen
        {...{
          role: "dialog",
          "aria-label": label,
          className: slotClass(config, "popup", "ui-colorpicker__popup"),
        }}
      >
        {nativeInput && (
          <div className={slotClass(config, "section", "ui-colorpicker__section")}>
            <span className={slotClass(config, "label", "ui-colorpicker__label")}>Colour</span>
            <input
              type="color"
              value={picker.hex}
              aria-label="Colour"
              disabled={field.disabled}
              className={slotClass(config, "native", "ui-colorpicker__native")}
              onChange={(event) => {
                const parsed = parseColor(event.target.value);
                if (parsed) picker.setColor({ ...parsed, a: rgba.a });
              }}
            />
          </div>
        )}

        <div className={slotClass(config, "section", "ui-colorpicker__section")}>
          <label
            className={slotClass(config, "label", "ui-colorpicker__label")}
            htmlFor={`${field.id}-hex`}
          >
            Value
          </label>
          <input
            id={`${field.id}-hex`}
            type="text"
            value={picker.draft}
            autoComplete="off"
            spellCheck={false}
            disabled={field.disabled}
            aria-invalid={field.invalid || !picker.draftValid || undefined}
            className={slotClass(config, "hexInput", "ui-colorpicker__input", "ui-input", "ui-control")}
            onChange={(event) => picker.setDraft(event.target.value)}
            onBlur={picker.commitDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                picker.commitDraft();
              }
            }}
          />
          {!picker.draftValid && (
            <span className={slotClass(config, "invalid", "ui-colorpicker__invalid")}>
              Not a colour
            </span>
          )}
        </div>

        {withAlpha && (
          <div className={slotClass(config, "section", "ui-colorpicker__section")}>
            <label
              className={slotClass(config, "label", "ui-colorpicker__label")}
              htmlFor={`${field.id}-alpha`}
            >
              Opacity
            </label>
            <input
              id={`${field.id}-alpha`}
              type="range"
              min={0}
              max={100}
              value={Math.round(rgba.a * 100)}
              disabled={field.disabled}
              className={slotClass(config, "alphaInput", "ui-colorpicker__alpha")}
              onChange={(event) => picker.setColor({ ...rgba, a: Number(event.target.value) / 100 })}
            />
            <span className={slotClass(config, "alpha", "ui-colorpicker__alpha-value")}>
              {Math.round(rgba.a * 100)}%
            </span>
          </div>
        )}

        <div className={slotClass(config, "swatches", "ui-colorpicker__swatches")}>
          {picker.swatches.map((preset) => {
            const parsed = parseColor(preset);
            const active = parsed ? picker.hex === toHex(parsed) : false;
            return (
              <button
                key={preset}
                type="button"
                aria-label={preset}
                aria-pressed={active}
                disabled={field.disabled}
                className={slotClass(
                  config,
                  "swatchButton",
                  "ui-colorpicker__swatch-button",
                  active && "ui-colorpicker__swatch-button--active",
                )}
                style={{ backgroundColor: preset }}
                onClick={() => picker.setColor(parsed ? { ...parsed, a: rgba.a } : preset)}
              >
                {active && parsed ? (
                  <Check size={12} aria-hidden="true" style={{ color: readableTextColor(parsed) }} />
                ) : null}
              </button>
            );
          })}
        </div>
      </FloatingLayer>
    </div>
  );
});
