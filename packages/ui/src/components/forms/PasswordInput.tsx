import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cx } from "../../utilities/cx";
import { Input, type InputProps } from "./Input";

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  showLabel?: string;
  hideLabel?: string;
}

/** Password input with an accessible show/hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { className, showLabel = "Show password", hideLabel = "Hide password", ...rest },
    ref,
  ) {
    const [visible, setVisible] = useState(false);

    return (
      <div className={cx("ui-password-input", className)} data-size={rest.size ?? "md"}>
        <Input ref={ref} type={visible ? "text" : "password"} {...rest} />
        <button
          type="button"
          className="ui-password-input__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
