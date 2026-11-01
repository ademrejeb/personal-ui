import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  /** Join buttons into a single segmented control. */
  attached?: boolean;
  /** Stretch to fill the container. */
  fullWidth?: boolean;
}

/** Groups related action buttons; optionally joins them into one control. */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { className, orientation = "horizontal", attached = false, fullWidth = false, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      data-orientation={orientation}
      className={cx(
        "ui-button-group",
        `ui-button-group--${orientation}`,
        attached && "ui-button-group--attached",
        fullWidth && "ui-button-group--block",
        className,
      )}
      {...rest}
    />
  );
});
ButtonGroup.displayName = "ButtonGroup";
