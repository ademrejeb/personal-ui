import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import { cx } from "../../utilities/cx";

export type TagVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: "sm" | "md";
  icon?: ReactNode;
  /** Show a remove affordance and call `onRemove`. */
  removable?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
}

/** A label or removable token. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    className,
    variant = "neutral",
    size = "md",
    icon,
    removable = false,
    onRemove,
    removeLabel = "Remove",
    children,
    ...rest
  },
  ref,
) {
  return (
    <span
      ref={ref}
      data-variant={variant}
      data-size={size}
      className={cx("ui-tag", `ui-tag--${variant}`, className)}
      {...rest}
    >
      {icon ? (
        <span className="ui-tag__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="ui-tag__label">{children}</span>
      {removable ? (
        <button type="button" className="ui-tag__remove" onClick={onRemove} aria-label={removeLabel}>
          <X size={12} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
});
Tag.displayName = "Tag";
