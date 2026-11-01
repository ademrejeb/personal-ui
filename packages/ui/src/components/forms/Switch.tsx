import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  size?: "sm" | "md";
  label?: ReactNode;
  description?: ReactNode;
}

/**
 * Toggle switch built on a native checkbox with `role="switch"` so it keeps
 * form semantics while exposing the correct accessible role and state.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, label, description, size = "md", id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description != null ? `${inputId}-description` : undefined;
  const hasContent = label != null || description != null;
  const Wrapper = hasContent ? "label" : "span";

  return (
    <Wrapper className={cx("ui-switch", `ui-switch--${size}`, className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        role="switch"
        className="ui-switch__input"
        aria-describedby={descriptionId}
        {...rest}
      />
      <span className="ui-switch__track" aria-hidden="true">
        <span className="ui-switch__thumb" />
      </span>
      {hasContent ? (
        <span className="ui-switch__content">
          {label != null ? <span className="ui-switch__label">{label}</span> : null}
          {description != null ? (
            <span id={descriptionId} className="ui-switch__description">
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </Wrapper>
  );
});
Switch.displayName = "Switch";
