import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utilities/cx";
import { useMergedRefs } from "../../hooks/useMergedRefs";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Visually indeterminate state (e.g. "select all" with a partial selection). */
  indeterminate?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md";
}

/** Native checkbox with a custom indicator and indeterminate support. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, indeterminate = false, label, description, size = "md", id, ...rest },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mergedRef = useMergedRefs(ref, inputRef);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = description != null ? `${inputId}-description` : undefined;

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const hasContent = label != null || description != null;
  const Wrapper = hasContent ? "label" : "span";

  return (
    <Wrapper className={cx("ui-checkbox", `ui-checkbox--${size}`, className)}>
      <input
        ref={mergedRef}
        id={inputId}
        type="checkbox"
        className="ui-checkbox__input"
        aria-describedby={descriptionId}
        data-indeterminate={indeterminate || undefined}
        {...rest}
      />
      <span className="ui-checkbox__box" aria-hidden="true" />
      {hasContent ? (
        <span className="ui-checkbox__content">
          {label != null ? <span className="ui-checkbox__label">{label}</span> : null}
          {description != null ? (
            <span id={descriptionId} className="ui-checkbox__description">
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </Wrapper>
  );
});
Checkbox.displayName = "Checkbox";
