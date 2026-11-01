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
import type { Status } from "../../types";

export type ToastVariant = Status;
export type ToastPosition =
  | "top-right"
  | "top-center"
  | "top-left"
  | "bottom-right"
  | "bottom-center"
  | "bottom-left";

const ICONS: Record<ToastVariant, ReactNode> = {
  neutral: <Info size={18} />,
  info: <Info size={18} />,
  success: <CheckCircle2 size={18} />,
  warning: <AlertTriangle size={18} />,
  danger: <XCircle size={18} />,
};

export interface ToastOptions {
  id?: string;
  variant?: ToastVariant;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Auto-dismiss delay in ms. `0` keeps the toast until dismissed. */
  duration?: number;
}

export interface ToastRecord extends ToastOptions {
  id: string;
}

export interface ToastApi {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let toastCounter = 0;
const nextToastId = (): string => {
  toastCounter += 1;
  return `ui-toast-${toastCounter}`;
};

/** Access the toast API. Must be used within a `ToastProvider`. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>.");
  return ctx;
}

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  /** Maximum number of concurrent toasts. */
  max?: number;
  defaultDuration?: number;
}

/** Provides the toast API and renders the toast viewport. */
export function ToastProvider({
  children,
  position = "bottom-right",
  max = 4,
  defaultDuration = 5000,
}: ToastProviderProps): ReactNode {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? nextToastId();
      setToasts((prev) => {
        const record: ToastRecord = { duration: defaultDuration, ...options, id };
        const withoutDuplicate = prev.filter((t) => t.id !== id);
        const next = [...withoutDuplicate, record];
        return next.slice(Math.max(0, next.length - max));
      });
      return id;
    },
    [defaultDuration, max],
  );

  const api = useMemo<ToastApi>(() => ({ toast, dismiss, dismissAll }), [toast, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} position={position} />
    </ToastContext.Provider>
  );
}

export interface ToasterProps {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
  position?: ToastPosition;
}

/** The fixed viewport that stacks active toasts. */
export function Toaster({ toasts, onDismiss, position = "bottom-right" }: ToasterProps): ReactNode {
  return (
    <Portal>
      <div className={cx("ui-toaster", `ui-toaster--${position}`)} aria-live="polite" aria-atomic="false">
        {toasts.map((record) => (
          <Toast key={record.id} {...record} onDismiss={() => onDismiss(record.id)} />
        ))}
      </div>
    </Portal>
  );
}

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: ToastVariant;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  duration?: number;
  onDismiss?: () => void;
}

/** A single toast. Pauses its dismiss timer on hover or focus. */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    className,
    variant = "neutral",
    title,
    description,
    action,
    duration = 5000,
    onDismiss,
    ...rest
  },
  ref,
) {
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (duration === 0 || paused || !onDismiss) return;
    timer.current = setTimeout(onDismiss, duration);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [duration, paused, onDismiss]);

  const role = variant === "danger" ? "alert" : "status";

  return (
    <div
      ref={ref}
      role={role}
      data-variant={variant}
      className={cx("ui-toast", `ui-toast--${variant}`, className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      {...rest}
    >
      <span className="ui-toast__icon" aria-hidden="true">
        {ICONS[variant]}
      </span>
      <div className="ui-toast__content">
        {title != null ? <div className="ui-toast__title">{title}</div> : null}
        {description != null ? <div className="ui-toast__description">{description}</div> : null}
      </div>
      {action != null ? <div className="ui-toast__action">{action}</div> : null}
      {onDismiss ? (
        <button type="button" className="ui-toast__close" onClick={onDismiss} aria-label="Dismiss notification">
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});
Toast.displayName = "Toast";
