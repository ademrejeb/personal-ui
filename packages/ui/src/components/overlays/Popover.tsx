import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utilities/cx";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { useControllableState } from "../../hooks/useControllableState";
import type { Placement } from "../../utilities/position";

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  contentId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);
const usePopover = (): PopoverContextValue => {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("Popover subcomponents must be used within a <Popover>.");
  return ctx;
};

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

/** Root provider for a popover. Controlled and uncontrolled. */
export function Popover({ open, defaultOpen = false, onOpenChange, children }: PopoverProps): ReactNode {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentId = useId();

  const value = useMemo<PopoverContextValue>(
    () => ({
      open: isOpen,
      setOpen,
      toggle: () => setOpen(!isOpen),
      contentId,
      triggerRef,
    }),
    [isOpen, setOpen, contentId],
  );

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

export type PopoverTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(function PopoverTrigger(
  { type = "button", onClick, ...rest },
  ref,
) {
  const { open, toggle, contentId, triggerRef } = usePopover();
  return (
    <button
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      type={type}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
      {...rest}
    />
  );
});
PopoverTrigger.displayName = "Popover.Trigger";

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  placement?: Placement;
  offset?: number;
  matchTriggerWidth?: boolean;
  /** Move focus into the popover when it opens. */
  autoFocus?: boolean;
  /** Close when interacting outside. Defaults to true. */
  closeOnOutside?: boolean;
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  {
    className,
    placement = "bottom-start",
    offset = 8,
    matchTriggerWidth = false,
    autoFocus = false,
    closeOnOutside = true,
    style,
    children,
    ...rest
  },
  ref,
) {
  const { open, setOpen, contentId, triggerRef } = usePopover();

  return (
    <FloatingLayer
      ref={ref}
      open={open}
      anchorRef={triggerRef}
      placement={placement}
      offset={offset}
      matchTriggerWidth={matchTriggerWidth}
      keepOpenRefs={[triggerRef]}
      onDismiss={() => setOpen(false)}
      dismissOnOutside={closeOnOutside}
      returnFocusRef={triggerRef}
      focusOnOpen={autoFocus}
      id={contentId}
      role="dialog"
      className={cx("ui-popover", className)}
      style={style}
      {...rest}
    >
      {children}
    </FloatingLayer>
  );
});
PopoverContent.displayName = "Popover.Content";
