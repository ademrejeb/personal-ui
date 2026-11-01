import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cx } from "../../utilities/cx";
import { Portal } from "../../primitives/Portal";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";
import type { Status } from "../../types";

export type NotificationVariant = Status;
export type NotificationPlacement =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";
export type NotificationSlot =
  | "root"
  | "icon"
  | "content"
  | "title"
  | "description"
  | "actions"
  | "close";
export type NotificationClassNames = SlotClassNames<NotificationSlot>;

const ICONS: Record<NotificationVariant, ReactNode> = {
  neutral: <Info size={20} />,
  info: <Info size={20} />,
  success: <CheckCircle2 size={20} />,
  warning: <AlertTriangle size={20} />,
  danger: <XCircle size={20} />,
};

export interface NotificationOptions {
  id?: string;
  variant?: NotificationVariant;
  title?: ReactNode;
  description?: ReactNode;
  /** Extra content such as action buttons. */
  actions?: ReactNode;
  /** Replace the built-in variant icon. */
  icon?: ReactNode;
  /** Auto-dismiss delay in ms. `0` keeps it until dismissed. */
  duration?: number;
  closable?: boolean;
}

export interface NotificationRecord extends NotificationOptions {
  id: string;
}

export interface NotificationApi {
  notify: (options: NotificationOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const NotificationContext = createContext<NotificationApi | null>(null);

let notificationCounter = 0;
const nextNotificationId = (): string => {
  notificationCounter += 1;
  return `ui-notification-${notificationCounter}`;
};

/** Access the notification API. Must be used within a `NotificationProvider`. */
export function useNotification(): NotificationApi {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within a <NotificationProvider>.");
  return ctx;
}

export interface NotificationProviderProps {
  children: ReactNode;
  placement?: NotificationPlacement;
  /** Maximum number of concurrent notifications. */
  max?: number;
  defaultDuration?: number;
}

/**
 * Rich, stackable notifications — title, description, and action buttons — for
 * events that deserve more than a toast. The API mirrors `useToast`.
 */
export function NotificationProvider({
  children,
  placement = "top-right",
  max = 4,
  defaultDuration = 6000,
}: NotificationProviderProps): ReactNode {
  const [items, setItems] = useState<NotificationRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const dismissAll = useCallback(() => setItems([]), []);

  const notify = useCallback(
    (options: NotificationOptions) => {
      const id = options.id ?? nextNotificationId();
      setItems((prev) => {
        const record: NotificationRecord = { duration: defaultDuration, ...options, id };
        const withoutDuplicate = prev.filter((item) => item.id !== id);
        const next = [...withoutDuplicate, record];
        return next.slice(Math.max(0, next.length - max));
      });
      return id;
    },
    [defaultDuration, max],
  );

  const api = useMemo<NotificationApi>(
    () => ({ notify, dismiss, dismissAll }),
    [notify, dismiss, dismissAll],
  );

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <NotificationViewport items={items} onDismiss={dismiss} placement={placement} />
    </NotificationContext.Provider>
  );
}

export interface NotificationViewportProps {
  items: NotificationRecord[];
  onDismiss: (id: string) => void;
  placement?: NotificationPlacement;
}

/** The fixed stack that renders active notifications. */
export function NotificationViewport({
  items,
  onDismiss,
  placement = "top-right",
}: NotificationViewportProps): ReactNode {
  return (
    <Portal>
      <div
        className={cx("ui-notification-stack", `ui-notification-stack--${placement}`)}
        aria-live="polite"
        aria-atomic="false"
      >
        {items.map((record) => (
          <Notification key={record.id} {...record} onDismiss={() => onDismiss(record.id)} />
        ))}
      </div>
    </Portal>
  );
}

export interface NotificationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    SlotConfig<NotificationSlot> {
  variant?: NotificationVariant;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  duration?: number;
  closable?: boolean;
  onDismiss?: () => void;
}

/** A single notification card. Pauses its dismiss timer on hover or focus. */
export const Notification = forwardRef<HTMLDivElement, NotificationProps>(function Notification(
  {
    className,
    variant = "neutral",
    title,
    description,
    actions,
    icon,
    duration = 6000,
    closable = true,
    onDismiss,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (duration === 0 || paused || !onDismiss) return;
    timer.current = setTimeout(onDismiss, duration);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [duration, paused, onDismiss]);

  return (
    <div
      ref={ref}
      role={variant === "danger" ? "alert" : "status"}
      data-variant={variant}
      className={slotClass(config, "root", "ui-notification", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      {...rest}
    >
      <span className={slotClass(config, "icon", "ui-notification__icon")} aria-hidden="true">
        {icon ?? ICONS[variant]}
      </span>
      <div className={slotClass(config, "content", "ui-notification__content")}>
        {title != null ? (
          <div className={slotClass(config, "title", "ui-notification__title")}>{title}</div>
        ) : null}
        {description != null ? (
          <div className={slotClass(config, "description", "ui-notification__description")}>
            {description}
          </div>
        ) : null}
        {actions != null ? (
          <div className={slotClass(config, "actions", "ui-notification__actions")}>{actions}</div>
        ) : null}
      </div>
      {closable && onDismiss ? (
        <button
          type="button"
          className={slotClass(config, "close", "ui-notification__close")}
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});
Notification.displayName = "Notification";
