import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cx } from "../../utilities/cx";

export type InlineMessageStatus = "success" | "danger" | "warning" | "info";

const ICONS: Record<InlineMessageStatus, ReactNode> = {
  success: <CheckCircle2 size={14} />,
  danger: <XCircle size={14} />,
  warning: <AlertTriangle size={14} />,
  info: <Info size={14} />,
};

export interface InlineMessageProps extends HTMLAttributes<HTMLSpanElement> {
  status?: InlineMessageStatus;
  icon?: ReactNode | false;
}

/** Compact single-line validation/feedback message. */
export const InlineMessage = forwardRef<HTMLSpanElement, InlineMessageProps>(function InlineMessage(
  { className, status = "info", icon, children, ...rest },
  ref,
) {
  const resolvedIcon = icon === undefined ? ICONS[status] : icon;
  return (
    <span
      ref={ref}
      role={status === "danger" ? "alert" : "status"}
      data-status={status}
      className={cx("ui-inline-message", `ui-inline-message--${status}`, className)}
      {...rest}
    >
      {resolvedIcon !== false ? (
        <span className="ui-inline-message__icon" aria-hidden="true">
          {resolvedIcon}
        </span>
      ) : null}
      {children}
    </span>
  );
});
InlineMessage.displayName = "InlineMessage";
