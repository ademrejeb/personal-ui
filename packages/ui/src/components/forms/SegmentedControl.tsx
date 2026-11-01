import { useId, useMemo, forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";
import type { ControlSize } from "../../types";

export type SegmentedControlSlot = "root" | "item" | "input" | "icon" | "label";

export type SegmentedControlClassNames = SlotClassNames<SegmentedControlSlot>;

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    SlotConfig<SegmentedControlSlot> {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ControlSize;
  disabled?: boolean;
  /** Shared radio name, useful when the control sits inside a form. */
  name?: string;
  /** Accessible name for the group. */
  label?: string;
  /** Stretch the segments across the container. */
  fullWidth?: boolean;
}

/**
 * Single-select segmented control with radio semantics: each segment is a native
 * radio, so arrow keys move the selection and the value can be submitted.
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(
    {
      options,
      value,
      defaultValue,
      onValueChange,
      size = "md",
      disabled = false,
      name,
      label,
      fullWidth = false,
      className,
      classNames,
      unstyled = false,
      ...rest
    },
    ref,
  ) {
    const config = useMemo(() => slotConfig(unstyled, classNames), [unstyled, classNames]);
    const [selected, setSelected] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? options[0]?.value ?? "",
      onChange: onValueChange,
    });
    const generatedName = useId();

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        data-size={size}
        data-disabled={disabled || undefined}
        data-full-width={fullWidth || undefined}
        className={slotClass(config, "root", "ui-segmented", className)}
        {...rest}
      >
        {options.map((option) => {
          const active = selected === option.value;
          return (
            <label
              key={option.value}
              className={slotClass(
                config,
                "item",
                "ui-segmented__item",
                active && "ui-segmented__item--active",
              )}
              data-state={active ? "active" : "inactive"}
            >
              <input
                type="radio"
                className={slotClass(config, "input", "ui-segmented__input")}
                name={name ?? generatedName}
                value={option.value}
                checked={active}
                disabled={disabled || option.disabled}
                onChange={() => setSelected(option.value)}
              />
              {option.icon != null && (
                <span
                  aria-hidden="true"
                  className={slotClass(config, "icon", "ui-segmented__icon")}
                >
                  {option.icon}
                </span>
              )}
              <span className={slotClass(config, "label", "ui-segmented__label")}>{option.label}</span>
            </label>
          );
        })}
      </div>
    );
  },
);
