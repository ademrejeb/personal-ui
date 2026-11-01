import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cx } from "../../utilities/cx";

export type AlertVariant = "neutral" | "info" | "success" | "warning" | "danger";

const ICONS: Record<AlertVariant, ReactNode> = {
  neutral: <Info size={18} />,
  info: <Info size={18} />,
  success: <CheckCircle2 size={18} />,
  warning: <AlertTriangle size={18} />,
  danger: <XCircle size={18} />,
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  title?: ReactNode;
  icon?: ReactNode | false;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: ReactNode;
}

/**
 * Inline semantic message. Uses `role="alert"` for urgent variants and
 * `role="status"` otherwise, and always pairs color with an icon so status is
 * never conveyed by color alone.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    className,
    variant = "info",
    title,
    icon,
    dismissible = false,
    onDismiss,
    actions,
    children,
    ...rest
  },
  ref,
) {
  const role = variant === "danger" || variant === "warning" ? "alert" : "status";
  const resolvedIcon = icon === undefined ? ICONS[variant] : icon;

  return (
    <div
      ref={ref}
      role={role}
      data-variant={variant}
      className={cx("ui-alert", `ui-alert--${variant}`, className)}
      {...rest}
    >
      {resolvedIcon !== false ? (
        <span className="ui-alert__icon" aria-hidden="true">
          {resolvedIcon}
        </span>
      ) : null}
      <div className="ui-alert__content">
        {title != null ? <div className="ui-alert__title">{title}</div> : null}
        {children != null ? <div className="ui-alert__description">{children}</div> : null}
        {actions != null ? <div className="ui-alert__actions">{actions}</div> : null}
      </div>
      {dismissible ? (
        <button type="button" className="ui-alert__dismiss" onClick={onDismiss} aria-label="Dismiss">
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});
Alert.displayName = "Alert";

export interface BannerProps extends AlertProps {
  /** Stick the banner to the top of the viewport. */
  sticky?: boolean;
  /** Center the content horizontally. */
  centered?: boolean;
}

/** A prominent, full-width contextual notification built on `Alert`. */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  { className, sticky = false, centered = false, ...rest },
  ref,
) {
  return (
    <Alert
      ref={ref}
      className={cx("ui-banner", sticky && "ui-banner--sticky", centered && "ui-banner--centered", className)}
      {...rest}
    />
  );
});
Banner.displayName = "Banner";
