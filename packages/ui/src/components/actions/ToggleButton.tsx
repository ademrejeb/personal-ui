import { forwardRef, type ReactNode } from "react";
import { cx } from "../../utilities/cx";
import { Button, type ButtonProps } from "./Button";
import { useControllableState } from "../../hooks/useControllableState";

export interface ToggleButtonProps
  extends Omit<ButtonProps, "aria-pressed" | "value" | "defaultValue" | "onChange"> {
  /** Controlled pressed state. */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  value?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

/** A two-state button exposing `aria-pressed`. */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(
  {
    className,
    pressed,
    defaultPressed = false,
    onPressedChange,
    variant = "secondary",
    disabled,
    onClick,
    ...rest
  },
  ref,
) {
  const [isPressed, setIsPressed] = useControllableState<boolean>({
    value: pressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });

  return (
    <Button
      ref={ref}
      variant={variant}
      disabled={disabled}
      aria-pressed={isPressed}
      data-state={isPressed ? "on" : "off"}
      className={cx("ui-toggle-button", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setIsPressed((prev) => !prev);
      }}
      {...rest}
    />
  );
});
ToggleButton.displayName = "ToggleButton";
