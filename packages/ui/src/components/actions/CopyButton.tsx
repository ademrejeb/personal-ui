import { forwardRef, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cx } from "../../utilities/cx";
import { Button, type ButtonProps } from "./Button";
import { VisuallyHidden } from "../layout/VisuallyHidden";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

export interface CopyButtonProps extends Omit<ButtonProps, "children" | "startIcon" | "endIcon" | "loading"> {
  /** Text written to the clipboard. */
  value: string;
  /** Visible/accessible label. Defaults to "Copy". */
  label?: string;
  /** Label shown after a successful copy. Defaults to "Copied". */
  copiedLabel?: string;
  /** Show the icon only, with an accessible name. */
  iconOnly?: boolean;
  /** Custom icons. */
  copyIcon?: ReactNode;
  copiedIcon?: ReactNode;
  onCopied?: (success: boolean) => void;
}

/**
 * Copies `value` to the clipboard and reports success visually (icon + label
 * swap) and to assistive technology via a polite live region.
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  {
    className,
    value,
    label = "Copy",
    copiedLabel = "Copied",
    iconOnly = false,
    copyIcon,
    copiedIcon,
    onCopied,
    variant = "ghost",
    size = "sm",
    ...rest
  },
  ref,
) {
  const { copied, copy } = useCopyToClipboard();

  const handleClick = async () => {
    const ok = await copy(value);
    onCopied?.(ok);
  };

  const icon = copied ? copiedIcon ?? <Check size={16} /> : copyIcon ?? <Copy size={16} />;
  const text = copied ? copiedLabel : label;

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      {...rest}
      className={cx("ui-copy-button", className)}
      onClick={handleClick}
      aria-label={text}
    >
      <span className="ui-copy-button__icon" aria-hidden="true">
        {icon}
      </span>
      {iconOnly ? (
        <VisuallyHidden role="status" aria-live="polite">
          {text}
        </VisuallyHidden>
      ) : (
        <>
          <span aria-hidden="true">{text}</span>
          <VisuallyHidden role="status" aria-live="polite">
            {copied ? copiedLabel : ""}
          </VisuallyHidden>
        </>
      )}
    </Button>
  );
});
CopyButton.displayName = "CopyButton";
