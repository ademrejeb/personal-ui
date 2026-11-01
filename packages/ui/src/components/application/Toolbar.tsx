import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  start?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
  orientation?: "horizontal" | "vertical";
  /** Remove the container chrome. */
  plain?: boolean;
}

/** Groups actions and controls into consistent start/center/end regions. */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { className, start, center, end, orientation = "horizontal", plain = false, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-orientation={orientation}
      data-orientation={orientation}
      className={cx("ui-toolbar", plain && "ui-toolbar--plain", className)}
      {...rest}
    >
      {start != null ? <div className="ui-toolbar__start">{start}</div> : null}
      {center != null ? <div className="ui-toolbar__center">{center}</div> : null}
      {end != null ? <div className="ui-toolbar__end">{end}</div> : null}
      {children}
    </div>
  );
});
Toolbar.displayName = "Toolbar";
