import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  SearchX,
  ServerCrash,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type ResultStatus =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "neutral"
  | "404"
  | "403"
  | "500";
export type ResultSize = "sm" | "md" | "lg";
export type ResultSlot = "root" | "icon" | "title" | "description" | "extra";
export type ResultClassNames = SlotClassNames<ResultSlot>;

const ICONS: Record<ResultStatus, ReactNode> = {
  success: <CheckCircle2 />,
  info: <Info />,
  warning: <AlertTriangle />,
  danger: <XCircle />,
  neutral: <Info />,
  "404": <SearchX />,
  "403": <ShieldAlert />,
  "500": <ServerCrash />,
};

export interface ResultProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    SlotConfig<ResultSlot> {
  status?: ResultStatus;
  title?: ReactNode;
  description?: ReactNode;
  /** Actions rendered under the description (buttons, links). */
  extra?: ReactNode;
  /** Replace the status icon. */
  icon?: ReactNode;
  size?: ResultSize;
}

/**
 * Full-area outcome message: success confirmations, empty/not-found pages, and
 * error states. Uses the same semantic tones as feedback components.
 */
export const Result = forwardRef<HTMLDivElement, ResultProps>(function Result(
  {
    className,
    status = "info",
    title,
    description,
    extra,
    icon,
    size = "md",
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);

  return (
    <div
      ref={ref}
      role="status"
      data-status={status}
      data-size={size}
      className={slotClass(config, "root", "ui-result", className)}
      {...rest}
    >
      <span className={slotClass(config, "icon", "ui-result__icon")} aria-hidden="true">
        {icon ?? ICONS[status]}
      </span>
      {title != null ? (
        <div className={slotClass(config, "title", "ui-result__title")}>{title}</div>
      ) : null}
      {description != null ? (
        <div className={slotClass(config, "description", "ui-result__description")}>
          {description}
        </div>
      ) : null}
      {extra != null ? (
        <div className={slotClass(config, "extra", "ui-result__extra")}>{extra}</div>
      ) : null}
    </div>
  );
});
Result.displayName = "Result";
