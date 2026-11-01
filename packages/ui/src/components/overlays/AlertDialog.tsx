import { useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal, ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, type ModalSize } from "./Modal";
import { Button } from "../actions/Button";

export interface AlertDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  size?: ModalSize;
  children?: ReactNode;
  footer?: ReactNode;
}

/**
 * A dialog for confirmations and destructive actions. Uses `role="alertdialog"`,
 * disables backdrop dismissal, and does not render a corner close button.
 */
export function AlertDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  description,
  icon,
  size = "sm",
  children,
  footer,
}: AlertDialogProps): ReactNode {
  return (
    <Modal open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <ModalContent role="alertdialog" size={size} closeOnOverlayClick={false} showClose={false}>
        <ModalHeader>
          {icon !== undefined ? (
            <span className={`ui-alert-dialog__icon`} aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <ModalTitle>{title}</ModalTitle>
          {description != null ? <ModalDescription>{description}</ModalDescription> : null}
        </ModalHeader>
        {children != null ? <ModalBody>{children}</ModalBody> : null}
        {footer != null ? <ModalFooter>{footer}</ModalFooter> : null}
      </ModalContent>
    </Modal>
  );
}

export interface ConfirmationDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Called on confirm. Return a promise to keep the dialog busy until it settles. */
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  /** Render the confirm action as destructive. */
  danger?: boolean;
  loading?: boolean;
}

/** Prebuilt confirmation flow with cancel/confirm actions. */
export function ConfirmationDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
}: ConfirmationDialogProps): ReactNode {
  const [busy, setBusy] = useState(false);
  const isBusy = busy || loading;

  const close = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <AlertDialog
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      icon={danger ? <AlertTriangle size={20} /> : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={isBusy}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            loading={isBusy}
            onClick={async () => {
              if (!onConfirm) {
                onOpenChange?.(false);
                return;
              }
              const result = onConfirm();
              if (result instanceof Promise) {
                setBusy(true);
                try {
                  await result;
                } finally {
                  setBusy(false);
                }
              }
              onOpenChange?.(false);
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
