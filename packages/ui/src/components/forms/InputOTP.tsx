import {
  forwardRef,
  useRef,
  type ClipboardEvent,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";

export interface InputOTPProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Number of segments. Defaults to 6. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Fired once all segments are filled. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  /** Mask entered characters. */
  mask?: boolean;
  /** Input mode / pattern: "numeric" restricts to digits. */
  type?: "numeric" | "text";
  name?: string;
  /** Insert a visual gap after every N segments. */
  groupSize?: number;
}

const SANITIZE = {
  numeric: (s: string) => s.replace(/\D/g, ""),
  text: (s: string) => s.replace(/\s/g, ""),
} as const;

/**
 * Segmented one-time-password input with paste support and full keyboard
 * navigation. `PinInput` is provided as a deprecated alias.
 */
export const InputOTP = forwardRef<HTMLDivElement, InputOTPProps>(function InputOTP(
  {
    className,
    length = 6,
    value,
    defaultValue = "",
    onValueChange,
    onComplete,
    disabled = false,
    invalid = false,
    autoFocus = false,
    mask = false,
    type = "numeric",
    name,
    groupSize,
    "aria-label": ariaLabel = "One-time code",
    ...rest
  },
  ref,
) {
  const [code, setCode] = useControllableState<string>({
    value,
    defaultValue,
    onChange: (next) => {
      onValueChange?.(next);
      if (next.length === length) onComplete?.(next);
    },
  });

  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length }, (_, index) => code[index] ?? "");

  const focusIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    const el = inputs.current[clamped];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const commit = (next: string) => setCode(SANITIZE[type](next).slice(0, length));

  const handleInput = (index: number, raw: string) => {
    const sanitized = SANITIZE[type](raw);
    if (!sanitized) {
      const next = chars.slice();
      next[index] = "";
      commit(next.join(""));
      return;
    }
    if (sanitized.length > 1) {
      // Fast typing / autofill dumped multiple characters into one cell.
      const merged = (code.slice(0, index) + sanitized + code.slice(index + 1)).slice(0, length);
      commit(merged);
      focusIndex(merged.length);
      return;
    }
    const next = chars.slice();
    next[index] = sanitized;
    commit(next.join(""));
    if (index < length - 1) focusIndex(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (chars[index]) {
        return; // default clears the cell
      }
      event.preventDefault();
      const next = chars.slice();
      next[Math.max(0, index - 1)] = "";
      commit(next.join(""));
      focusIndex(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusIndex(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusIndex(index + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusIndex(length - 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pasted = SANITIZE[type](event.clipboardData.getData("text")).slice(0, length);
    commit(pasted);
    focusIndex(pasted.length);
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      className={cx("ui-otp", className)}
      onPaste={handlePaste}
      {...rest}
    >
      {chars.map((char, index) => {
        const groupEnd = groupSize ? (index + 1) % groupSize === 0 && index !== length - 1 : false;
        return (
          <input
            key={index}
            ref={(node) => {
              inputs.current[index] = node;
            }}
            className="ui-otp__cell ui-control"
            inputMode={type === "numeric" ? "numeric" : "text"}
            autoComplete="one-time-code"
            pattern={type === "numeric" ? "[0-9]*" : undefined}
            maxLength={1}
            value={mask && char ? "•" : char}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={invalid || undefined}
            autoFocus={autoFocus && index === 0}
            data-group-end={groupEnd || undefined}
            onChange={(event) => handleInput(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
          />
        );
      })}
      {name ? <input type="hidden" name={name} value={code} /> : null}
    </div>
  );
});
InputOTP.displayName = "InputOTP";
