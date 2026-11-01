import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type Ref,
  type ReactNode,
} from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../actions/Button";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { mergeRefs } from "../../utilities/mergeRefs";
import { useControllableState } from "../../hooks/useControllableState";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";
import type { Placement } from "../../utilities/position";

export type PopconfirmTone = "default" | "danger";
export type PopconfirmSlot =
  | "content"
  | "body"
  | "icon"
  | "text"
  | "title"
  | "description"
  | "actions";
export type PopconfirmClassNames = SlotClassNames<PopconfirmSlot>;

interface TriggerElementProps {
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  ref?: Ref<HTMLElement>;
  "aria-haspopup"?: string;
  "aria-expanded"?: boolean;
}

export interface PopconfirmProps
  extends SlotConfig<PopconfirmSlot> {
  /** The element that opens the confirmation. Must accept a ref and onClick. */
  children: ReactElement<TriggerElementProps>;
  title: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  offset?: number;
  tone?: PopconfirmTone;
  icon?: ReactNode;
  /** Prevent opening the confirmation. */
  disabled?: boolean;
  showCancel?: boolean;
  className?: string;
}

/**
 * A compact confirmation popover anchored to its trigger. The confirm action is
 * explicit, so destructive operations do not need a full modal.
 */
export const Popconfirm = forwardRef<HTMLDivElement, PopconfirmProps>(function Popconfirm(
  {
    children,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    open,
    defaultOpen = false,
    onOpenChange,
    placement = "top",
    offset = 8,
    tone = "default",
    icon,
    disabled = false,
    showCancel = true,
    className,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const close = (next: boolean) => {
    if (next !== isOpen) setOpen(next);
  };

  const trigger = useMemo(() => {
    if (!isValidElement(children)) return children;
    const element = children as ReactElement<TriggerElementProps>;
    return cloneElement(element, {
      ref: mergeRefs(triggerRef, element.props.ref),
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      onClick: (event: ReactMouseEvent<HTMLElement>) => {
        element.props.onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        setOpen(!isOpen);
      },
    });
  }, [children, disabled, isOpen, setOpen]);

  return (
    <>
      {trigger}
      <FloatingLayer
        ref={ref}
        open={isOpen}
        anchorRef={triggerRef}
        placement={placement}
        offset={offset}
        keepOpenRefs={[triggerRef]}
        onDismiss={() => {
          close(false);
          onCancel?.();
        }}
        returnFocusRef={triggerRef}
        focusOnOpen
        role="alertdialog"
        aria-labelledby={titleId}
        aria-describedby={description != null ? descriptionId : undefined}
        className={slotClass(config, "content", "ui-popconfirm", className)}
        {...rest}
      >
        <div className={slotClass(config, "body", "ui-popconfirm__body")}>
          <span className={slotClass(config, "icon", "ui-popconfirm__icon")} aria-hidden="true">
            {icon ?? <AlertTriangle size={18} />}
          </span>
          <div className={slotClass(config, "text", "ui-popconfirm__text")}>
            <div id={titleId} className={slotClass(config, "title", "ui-popconfirm__title")}>
              {title}
            </div>
            {description != null ? (
              <div
                id={descriptionId}
                className={slotClass(config, "description", "ui-popconfirm__description")}
              >
                {description}
              </div>
            ) : null}
          </div>
        </div>
        <div className={slotClass(config, "actions", "ui-popconfirm__actions")}>
          {showCancel ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                close(false);
                onCancel?.();
              }}
            >
              {cancelText}
            </Button>
          ) : null}
          <Button
            size="sm"
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => {
              close(false);
              onConfirm?.();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </FloatingLayer>
    </>
  );
});
Popconfirm.displayName = "Popconfirm";
