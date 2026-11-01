import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";
import { VisuallyHidden } from "../layout/VisuallyHidden";
import { Spinner } from "../feedback/Spinner";
import type { ControlSize } from "../../types";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
export type ButtonSize = ControlSize;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, disables interaction, and announces a busy state. */
  loading?: boolean;
  /** Announced instead of the label while loading. Defaults to "Loading". */
  loadingText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}

/**
 * The primary action control.
 *
 * Notes:
 * - Renders a native `<button>` with `type="button"` by default to avoid
 *   accidental form submission; override with `type="submit"` as needed.
 * - While `loading`, the label stays in the layout (visually hidden) so the
 *   button never changes size, and a centered spinner is overlaid.
 * - For link-styled navigation, compose `Link` instead of a button.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    loading = false,
    loadingText = "Loading",
    startIcon,
    endIcon,
    fullWidth = false,
    disabled,
    type = "button",
    children,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      data-variant={variant}
      data-size={size}
      className={cx(
        "ui-button",
        `ui-button--${variant}`,
        `ui-button--${size}`,
        fullWidth && "ui-button--block",
        loading && "ui-button--loading",
        className,
      )}
      {...rest}
    >
      <span className="ui-button__label">
        {startIcon ? (
          <span className="ui-button__icon" aria-hidden="true">
            {startIcon}
          </span>
        ) : null}
        {children}
        {endIcon ? (
          <span className="ui-button__icon" aria-hidden="true">
            {endIcon}
          </span>
        ) : null}
      </span>
      {loading ? (
        <>
          <span className="ui-button__spinner" aria-hidden="true">
            <Spinner size="sm" decorative />
          </span>
          {loadingText ? <VisuallyHidden>{loadingText}</VisuallyHidden> : null}
        </>
      ) : null}
    </button>
  );
});
Button.displayName = "Button";
