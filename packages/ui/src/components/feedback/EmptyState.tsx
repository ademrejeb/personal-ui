import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Primary and secondary actions. */
  actions?: ReactNode;
  size?: "sm" | "md" | "lg";
}

/** Neutral empty-data presentation with an optional illustration and actions. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { className, icon, title, description, actions, size = "md", children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      data-size={size}
      className={cx("ui-empty-state", `ui-empty-state--${size}`, className)}
      {...rest}
    >
      {icon != null ? (
        <div className="ui-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      {title != null ? <h3 className="ui-empty-state__title">{title}</h3> : null}
      {description != null ? <p className="ui-empty-state__description">{description}</p> : null}
      {children}
      {actions != null ? <div className="ui-empty-state__actions">{actions}</div> : null}
    </div>
  );
});
EmptyState.displayName = "EmptyState";
