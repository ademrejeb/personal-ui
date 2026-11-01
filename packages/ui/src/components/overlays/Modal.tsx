import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cx } from "../../utilities/cx";

interface ModalContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const ModalContext = createContext<ModalContextValue | null>(null);
const useModal = (): ModalContextValue => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Modal subcomponents must be used within a <Modal>.");
  return ctx;
};

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

/** Root provider for a modal dialog. Supports controlled and uncontrolled use. */
function ModalRoot({ open, defaultOpen = false, onOpenChange, children }: ModalProps): ReactNode {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolled;
  const titleId = useId();
  const descriptionId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const value = useMemo<ModalContextValue>(
    () => ({ open: isOpen, setOpen, titleId, descriptionId }),
    [isOpen, setOpen, titleId, descriptionId],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export type ModalTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const ModalTrigger = forwardRef<HTMLButtonElement, ModalTriggerProps>(function ModalTrigger(
  { type = "button", onClick, ...rest },
  ref,
) {
  const { setOpen } = useModal();
  return (
    <button
      ref={ref}
      type={type}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
      {...rest}
    />
  );
});
ModalTrigger.displayName = "Modal.Trigger";

export interface ModalContentProps extends Omit<HTMLAttributes<HTMLDialogElement>, "role"> {
  size?: ModalSize;
  /** `alertdialog` for confirmations that require an explicit response. */
  role?: "dialog" | "alertdialog";
  /** Close when the backdrop is clicked. Defaults to true. */
  closeOnOverlayClick?: boolean;
  /** Close on Escape. Defaults to true. */
  closeOnEscape?: boolean;
  /** Show the built-in close button. */
  showClose?: boolean;
  /** Accessible label when no `Modal.Title` is rendered. */
  "aria-label"?: string;
}

export const ModalContent = forwardRef<HTMLDialogElement, ModalContentProps>(function ModalContent(
  {
    className,
    size = "md",
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showClose = true,
    role = "dialog",
    children,
    ...rest
  },
  forwardedRef,
) {
  const { open, setOpen, titleId, descriptionId } = useModal();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    } else if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [open]);

  return (
    <dialog
      ref={(node) => {
        dialogRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      role={role}
      aria-labelledby={rest["aria-label"] ? undefined : titleId}
      aria-describedby={rest["aria-label"] ? undefined : descriptionId}
      className={cx("ui-modal", `ui-modal--${size}`, className)}
      data-state={open ? "open" : "closed"}
      onCancel={(event) => {
        if (!closeOnEscape) event.preventDefault();
      }}
      onClose={() => setOpen(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current && closeOnOverlayClick) setOpen(false);
      }}
      {...rest}
    >
      <div className="ui-modal__panel">
        {showClose ? (
          <button
            type="button"
            className="ui-modal__close"
            onClick={() => setOpen(false)}
            aria-label="Close dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        ) : null}
        {children}
      </div>
    </dialog>
  );
});
ModalContent.displayName = "Modal.Content";

export type ModalHeaderProps = HTMLAttributes<HTMLDivElement>;
export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(function ModalHeader(
  { className, ...rest },
  ref,
) {
  return <header ref={ref} className={cx("ui-modal__header", className)} {...rest} />;
});

export type ModalTitleProps = HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" };
export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(function ModalTitle(
  { className, as: As = "h2", ...rest },
  ref,
) {
  const { titleId } = useModal();
  return <As ref={ref} id={titleId} className={cx("ui-modal__title", className)} {...rest} />;
});

export type ModalDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export const ModalDescription = forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  function ModalDescription({ className, ...rest }, ref) {
    const { descriptionId } = useModal();
    return <p ref={ref} id={descriptionId} className={cx("ui-modal__description", className)} {...rest} />;
  },
);

export type ModalBodyProps = HTMLAttributes<HTMLDivElement>;
export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(function ModalBody(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("ui-modal__body", className)} {...rest} />;
});

export type ModalFooterProps = HTMLAttributes<HTMLDivElement>;
export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(function ModalFooter(
  { className, ...rest },
  ref,
) {
  return <footer ref={ref} className={cx("ui-modal__footer", className)} {...rest} />;
});

export type ModalCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;
export const ModalClose = forwardRef<HTMLButtonElement, ModalCloseProps>(function ModalClose(
  { type = "button", onClick, ...rest },
  ref,
) {
  const { setOpen } = useModal();
  return (
    <button
      ref={ref}
      type={type}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
      {...rest}
    />
  );
});
ModalClose.displayName = "Modal.Close";

/** Compound modal dialog. */
export const Modal = Object.assign(ModalRoot, {
  Trigger: ModalTrigger,
  Content: ModalContent,
  Header: ModalHeader,
  Title: ModalTitle,
  Description: ModalDescription,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
});
