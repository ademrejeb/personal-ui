import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  setValue: (value: string) => void;
  disabled: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  orientation?: "horizontal" | "vertical";
  label?: ReactNode;
}

/** Groups a set of `Radio` controls with a single shared selection. */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    className,
    name,
    value,
    defaultValue = "",
    onValueChange,
    disabled = false,
    required = false,
    orientation = "vertical",
    label,
    id,
    "aria-label": ariaLabel,
    children,
    ...rest
  },
  ref,
) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  const labelId = label != null ? `${id ?? groupName}-label` : undefined;

  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  return (
    <RadioGroupContext.Provider
      value={{ name: groupName, value: selected, setValue: setSelected, disabled }}
    >
      <div
        ref={ref}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-labelledby={labelId}
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        data-orientation={orientation}
        className={cx("ui-radio-group", `ui-radio-group--${orientation}`, className)}
        {...rest}
      >
        {label != null ? (
          <span id={labelId} className="ui-radio-group__label">
            {label}
          </span>
        ) : null}
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = "RadioGroup";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "size"> {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md";
}

/** Native radio, configured automatically by the enclosing `RadioGroup`. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, value, label, description, size = "md", id, disabled, onChange, ...rest },
  ref,
) {
  const group = useContext(RadioGroupContext);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description != null ? `${inputId}-description` : undefined;
  const isDisabled = Boolean(disabled || group?.disabled);
  const checked = group ? group.value === value : undefined;
  const hasContent = label != null || description != null;
  const Wrapper = hasContent ? "label" : "span";

  return (
    <Wrapper className={cx("ui-radio", `ui-radio--${size}`, className)}>
      <input
        ref={ref}
        id={inputId}
        type="radio"
        name={group?.name}
        value={value}
        checked={checked}
        disabled={isDisabled}
        aria-describedby={descriptionId}
        className="ui-radio__input"
        onChange={(event) => {
          if (event.target.checked) group?.setValue(value);
          onChange?.(event);
        }}
        {...rest}
      />
      <span className="ui-radio__box" aria-hidden="true" />
      {hasContent ? (
        <span className="ui-radio__content">
          {label != null ? <span className="ui-radio__label">{label}</span> : null}
          {description != null ? (
            <span id={descriptionId} className="ui-radio__description">
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </Wrapper>
  );
});
Radio.displayName = "Radio";
