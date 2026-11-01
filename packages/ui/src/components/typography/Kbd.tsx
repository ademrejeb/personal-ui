import { forwardRef, type HTMLAttributes } from "react";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type KbdVariant = "solid" | "outline" | "ghost";
export type KbdSlot = "root" | "key" | "plus";
export type KbdClassNames = SlotClassNames<KbdSlot>;

export interface KbdProps extends HTMLAttributes<HTMLElement>, SlotConfig<KbdSlot> {
  size?: "sm" | "md";
  variant?: KbdVariant;
  /** Render a key combination, e.g. `["Ctrl", "K"]`. */
  keys?: string[];
}

/**
 * Displays a keyboard key or shortcut. `keys` renders the combination as one
 * accessible `<kbd>` with a stable spoken label.
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  {
    className,
    size = "md",
    variant = "solid",
    keys,
    children,
    "aria-label": ariaLabel,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);

  if (keys?.length) {
    return (
      <kbd
        ref={ref}
        role="group"
        data-size={size}
        data-variant={variant}
        className={slotClass(config, "root", "ui-kbd", "ui-kbd--group", className)}
        aria-label={ariaLabel ?? keys.join(" + ")}
        {...rest}
      >
        {keys.map((key, index) => (
          <span key={`${key}-${index}`} className={slotClass(config, "key", "ui-kbd__key")}>
            {index > 0 ? (
              <span className={slotClass(config, "plus", "ui-kbd__plus")} aria-hidden="true">
                +
              </span>
            ) : null}
            {key}
          </span>
        ))}
      </kbd>
    );
  }

  return (
    <kbd
      ref={ref}
      data-size={size}
      data-variant={variant}
      className={slotClass(config, "root", "ui-kbd", className)}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </kbd>
  );
});
Kbd.displayName = "Kbd";
