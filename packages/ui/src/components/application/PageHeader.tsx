import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Breadcrumbs or other contextual navigation. */
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  sticky?: boolean;
}

/** Page title, description, and primary actions. */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { className, title, description, breadcrumbs, actions, icon, badge, sticky = false, children, ...rest },
  ref,
) {
  return (
    <header
      ref={ref}
      className={cx("ui-page-header", sticky && "ui-page-header--sticky", className)}
      {...rest}
    >
      {breadcrumbs != null ? <div className="ui-page-header__breadcrumbs">{breadcrumbs}</div> : null}
      <div className="ui-page-header__main">
        {icon != null ? (
          <span className="ui-page-header__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <div className="ui-page-header__text">
          <div className="ui-page-header__title-row">
            <h1 className="ui-page-header__title">{title}</h1>
            {badge}
          </div>
          {description != null ? <p className="ui-page-header__description">{description}</p> : null}
        </div>
        {actions != null ? <div className="ui-page-header__actions">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
});
PageHeader.displayName = "PageHeader";
