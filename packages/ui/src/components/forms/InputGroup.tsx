import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";
import type { ControlSize } from "../../types";

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  size?: ControlSize;
  invalid?: boolean;
  disabled?: boolean;
}

/**
 * Attaches addons and action buttons flush to a control. Compose with
 * `InputGroup.Addon` and `InputGroup.Button` (or any `.ui-control`).
 */
const InputGroupRoot = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { className, size = "md", invalid, disabled, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      data-size={size}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cx("ui-input-group", className)}
      {...rest}
    />
  );
});
InputGroupRoot.displayName = "InputGroup";

export interface InputGroupAddonProps extends HTMLAttributes<HTMLSpanElement> {
  position?: "start" | "end";
}

export const InputGroupAddon = forwardRef<HTMLSpanElement, InputGroupAddonProps>(
  function InputGroupAddon({ className, position = "start", ...rest }, ref) {
    return (
      <span
        ref={ref}
        data-position={position}
        className={cx("ui-input-group__addon", className)}
        {...rest}
      />
    );
  },
);

export type InputGroupButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const InputGroupButton = forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  function InputGroupButton({ className, type = "button", ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cx("ui-input-group__button", className)}
        {...rest}
      />
    );
  },
);

export const InputGroup = Object.assign(InputGroupRoot, {
  Addon: InputGroupAddon,
  Button: InputGroupButton,
});
