import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from "react";
import { cx } from "../../utilities/cx";
import { useFieldControl } from "./field-utils";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import type { ControlSize } from "../../types";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: ControlSize;
  invalid?: boolean;
  /** Grow height to fit content. */
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  /** Show a live character counter (uses `maxLength` when provided). */
  showCount?: boolean;
}

/** Multi-line text input with optional auto-resize and character count. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    className,
    size = "md",
    invalid,
    autoResize = false,
    minRows = 3,
    maxRows = 12,
    showCount = false,
    id,
    disabled,
    required,
    value,
    defaultValue,
    maxLength,
    onChange,
    rows,
    "aria-describedby": describedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, disabled, required, "aria-describedby": describedBy });
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const mergedRef = useMergedRefs(ref, innerRef);
  const isControlled = value !== undefined;
  const [count, setCount] = useState(() => String(value ?? defaultValue ?? "").length);

  const resize = () => {
    const el = innerRef.current;
    if (!el || !autoResize) return;
    const style = window.getComputedStyle(el);
    const lineHeight = Number.parseFloat(style.lineHeight) || 20;
    const padding = (Number.parseFloat(style.paddingTop) || 0) + (Number.parseFloat(style.paddingBottom) || 0);
    const border = (Number.parseFloat(style.borderTopWidth) || 0) + (Number.parseFloat(style.borderBottomWidth) || 0);
    el.style.height = "auto";
    const maxHeight = maxRows * lineHeight + padding + border;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  useEffect(resize);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) {
      const next = event.target.value;
      setCount(next.length);
    }
    onChange?.(event);
    resize();
  };

  return (
    <div className="ui-textarea-wrapper" data-size={size}>
      <textarea
        ref={mergedRef}
        id={field.id}
        rows={rows ?? minRows}
        disabled={field.disabled || undefined}
        required={field.required || undefined}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        data-size={size}
        data-invalid={field.invalid || undefined}
        className={cx("ui-textarea", "ui-control", className)}
        {...rest}
      />
      {showCount ? (
        <span className="ui-textarea__count" aria-hidden="true">
          {isControlled ? String(value ?? "").length : count}
          {maxLength ? `/${maxLength}` : ""}
        </span>
      ) : null}
    </div>
  );
});
Textarea.displayName = "Textarea";
