import {
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  useRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { Portal } from "../../primitives/Portal";
import { useControllableState } from "../../hooks/useControllableState";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useMergedRefs } from "../../hooks/useMergedRefs";

export type SheetSide = "left" | "right" | "top" | "bottom";

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  titleId: string;
  descriptionId: string;
}

const SheetContext = createContext<SheetContextValue | null>(null);
const useSheet = (): SheetContextValue => {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("Sheet subcomponents must be used within a <Sheet>.");
  return ctx;
};

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

function SheetRoot({ open, defaultOpen = false, onOpenChange, children }: SheetProps): ReactNode {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const contentId = useId();
  const titleId = useId();
  const descriptionId = useId();

  const value = useMemo<SheetContextValue>(
    () => ({ open: isOpen, setOpen, contentId, titleId, descriptionId }),
    [isOpen, setOpen, contentId, titleId, descriptionId],
  );

  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

type TriggerChildProps = {
  ref?: Ref<HTMLElement>;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

export interface SheetTriggerProps {
  children: ReactElement;
}

export const SheetTrigger = forwardRef<HTMLElement, SheetTriggerProps>(function SheetTrigger(
  { children },
  forwardedRef,
) {
  const { open, setOpen } = useSheet();
  const child = children as ReactElement<TriggerChildProps>;
  const childProps = child.props;
  const mergedRef = useMergedRefs<HTMLElement>(childProps.ref, forwardedRef);

  return cloneElement(child, {
    ref: mergedRef,
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    onClick: (event: MouseEvent<HTMLElement>) => {
      childProps.onClick?.(event);
      if (!event.defaultPrevented) setOpen(true);
    },
  } as TriggerChildProps);
});
SheetTrigger.displayName = "Sheet.Trigger";

export interface SheetContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: SheetSide;
  size?: "sm" | "md" | "lg" | "full";
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
}

export const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(function SheetContent(
  { className, side = "right", size = "md", showClose = true, closeOnOverlayClick = true, children, ...rest },
  forwardedRef,
) {
  const { open, setOpen, contentId, titleId, descriptionId } = useSheet();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useScrollLock(open);
  useEscapeKey(() => setOpen(false), open);
  useFocusTrap(panelRef, open);

  if (!open) return null;

  return (
    <Portal>
      <div className="ui-sheet">
        <div
          className="ui-sheet__overlay"
          onClick={() => closeOnOverlayClick && setOpen(false)}
          aria-hidden="true"
        />
        <div
          ref={(node) => {
            panelRef.current = node;
            if (typeof forwardedRef === "function") forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
          }}
          id={contentId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          data-side={side}
          data-size={size}
          className={cx("ui-sheet__panel", `ui-sheet__panel--${side}`, className)}
          {...rest}
        >
          {showClose ? (
            <button
              type="button"
              className="ui-sheet__close"
              onClick={() => setOpen(false)}
              aria-label="Close panel"
            >
              <X size={18} aria-hidden="true" />
            </button>
          ) : null}
          {children}
        </div>
      </div>
    </Portal>
  );
});
SheetContent.displayName = "Sheet.Content";

export type SheetHeaderProps = HTMLAttributes<HTMLDivElement>;
export const SheetHeader = forwardRef<HTMLDivElement, SheetHeaderProps>(function SheetHeader(
  { className, ...rest },
  ref,
) {
  return <header ref={ref} className={cx("ui-sheet__header", className)} {...rest} />;
});

export type SheetTitleProps = HTMLAttributes<HTMLHeadingElement>;
export const SheetTitle = forwardRef<HTMLHeadingElement, SheetTitleProps>(function SheetTitle(
  { className, ...rest },
  ref,
) {
  const { titleId } = useSheet();
  return <h2 ref={ref} id={titleId} className={cx("ui-sheet__title", className)} {...rest} />;
});

export type SheetDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export const SheetDescription = forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  function SheetDescription({ className, ...rest }, ref) {
    const { descriptionId } = useSheet();
    return <p ref={ref} id={descriptionId} className={cx("ui-sheet__description", className)} {...rest} />;
  },
);

export type SheetBodyProps = HTMLAttributes<HTMLDivElement>;
export const SheetBody = forwardRef<HTMLDivElement, SheetBodyProps>(function SheetBody(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx("ui-sheet__body", className)} {...rest} />;
});

export type SheetFooterProps = HTMLAttributes<HTMLDivElement>;
export const SheetFooter = forwardRef<HTMLDivElement, SheetFooterProps>(function SheetFooter(
  { className, ...rest },
  ref,
) {
  return <footer ref={ref} className={cx("ui-sheet__footer", className)} {...rest} />;
});

export type SheetCloseProps = HTMLAttributes<HTMLButtonElement>;
export const SheetClose = forwardRef<HTMLButtonElement, SheetCloseProps>(function SheetClose(
  { className, children, ...rest },
  ref,
) {
  const { setOpen } = useSheet();
  return (
    <button ref={ref} type="button" className={cx(className)} onClick={() => setOpen(false)} {...rest}>
      {children}
    </button>
  );
});
SheetClose.displayName = "Sheet.Close";

/** Compound side/bottom panel overlay. */
export const Sheet = Object.assign(SheetRoot, {
  Trigger: SheetTrigger,
  Content: SheetContent,
  Header: SheetHeader,
  Title: SheetTitle,
  Description: SheetDescription,
  Body: SheetBody,
  Footer: SheetFooter,
  Close: SheetClose,
});
