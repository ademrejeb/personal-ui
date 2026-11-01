import { forwardRef, type ReactNode } from "react";
import { cx } from "../../utilities/cx";
import { Button, type ButtonProps } from "./Button";

export interface IconButtonProps extends Omit<ButtonProps, "children" | "startIcon" | "endIcon"> {
  /** Required accessible name — icon-only controls must always be labelled. */
  "aria-label": string;
  icon: ReactNode;
  /** Render as a perfect circle. */
  rounded?: boolean;
}

/** Icon-only button. The focus ring and sizing are shared with `Button`. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, icon, rounded = false, size = "md", ...rest },
  ref,
) {
  return (
    <Button
      ref={ref}
      size={size}
      className={cx("ui-icon-button", rounded && "ui-icon-button--rounded", className)}
      {...rest}
    >
      <span className="ui-icon-button__icon" aria-hidden="true">
        {icon}
      </span>
    </Button>
  );
});
IconButton.displayName = "IconButton";
