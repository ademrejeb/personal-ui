import {
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { Check } from "lucide-react";
import { cx } from "../../utilities/cx";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { useControllableState } from "../../hooks/useControllableState";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import type { Placement } from "../../utilities/position";

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const MenuContext = createContext<MenuContextValue | null>(null);
const useMenu = (): MenuContextValue => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("DropdownMenu subcomponents must be used within a <DropdownMenu>.");
  return ctx;
};

export interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

function DropdownMenuRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: DropdownMenuProps): ReactNode {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentId = useId();

  const value = useMemo<MenuContextValue>(
    () => ({ open: isOpen, setOpen, contentId, triggerRef }),
    [isOpen, setOpen, contentId],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

type TriggerChildProps = {
  ref?: Ref<HTMLElement>;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLElement>) => void;
  "aria-haspopup"?: string;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
};

export interface DropdownMenuTriggerProps {
  children: ReactElement;
}

/** Wraps a single trigger element, wiring menu-open behavior onto it. */
export const DropdownMenuTrigger = forwardRef<HTMLElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger({ children }, forwardedRef) {
    const { open, setOpen, contentId, triggerRef } = useMenu();
    const child = children as ReactElement<TriggerChildProps>;
    const childProps = child.props;
    const mergedRef = useMergedRefs<HTMLElement>(triggerRef, childProps.ref, forwardedRef);

    return cloneElement(child, {
      ref: mergedRef,
      "aria-haspopup": "menu",
      "aria-expanded": open,
      "aria-controls": open ? contentId : undefined,
      onClick: (event: MouseEvent<HTMLElement>) => {
        childProps.onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
      },
      onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
        childProps.onKeyDown?.(event);
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen(true);
        }
      },
    } as TriggerChildProps);
  },
);
DropdownMenuTrigger.displayName = "DropdownMenu.Trigger";

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  placement?: Placement;
  offset?: number;
  /** Align the menu width to the trigger. */
  matchTriggerWidth?: boolean;
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent(
    { className, placement = "bottom-start", offset = 4, matchTriggerWidth = false, style, children, ...rest },
    forwardedRef,
  ) {
    const { open, setOpen, contentId, triggerRef } = useMenu();

    return (
      <FloatingLayer
        ref={forwardedRef}
        open={open}
        anchorRef={triggerRef}
        placement={placement}
        offset={offset}
        matchTriggerWidth={matchTriggerWidth}
        keepOpenRefs={[triggerRef]}
        onDismiss={() => setOpen(false)}
        returnFocusRef={triggerRef}
        focusOnOpen
        respectAutoFocusAttr
        id={contentId}
        role="menu"
        tabIndex={-1}
        aria-orientation="vertical"
        className={cx("ui-menu", className)}
        style={style}
        {...rest}
      >
        {children}
      </FloatingLayer>
    );
  },
);
DropdownMenuContent.displayName = "DropdownMenu.Content";

export interface DropdownMenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  onSelect?: (event: Event) => void;
  disabled?: boolean;
  danger?: boolean;
  icon?: ReactNode;
  shortcut?: ReactNode;
  /** Reserve checkbox space; pair with `checked` for selectable items. */
  checked?: boolean;
  closeOnSelect?: boolean;
}

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  function DropdownMenuItem(
    {
      className,
      onSelect,
      disabled = false,
      danger = false,
      icon,
      shortcut,
      checked,
      closeOnSelect = true,
      children,
      onClick,
      ...rest
    },
    ref,
  ) {
    const { setOpen, triggerRef } = useMenu();

    const select = (nativeEvent: Event) => {
      if (disabled) return;
      onSelect?.(nativeEvent);
      if (closeOnSelect) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    return (
      <div
        ref={ref}
        role={checked !== undefined ? "menuitemcheckbox" : "menuitem"}
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        aria-checked={checked}
        data-danger={danger || undefined}
        data-disabled={disabled || undefined}
        className={cx("ui-menu__item", className)}
        onClick={(event) => {
          onClick?.(event);
          select(event.nativeEvent);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            select(new Event("select"));
          }
        }}
        {...rest}
      >
        {checked !== undefined ? (
          <span className="ui-menu__indicator" aria-hidden="true">
            {checked ? <Check size={14} /> : null}
          </span>
        ) : icon ? (
          <span className="ui-menu__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="ui-menu__label">{children}</span>
        {shortcut ? <span className="ui-menu__shortcut">{shortcut}</span> : null}
      </div>
    );
  },
);
DropdownMenuItem.displayName = "DropdownMenu.Item";

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuSeparator({ className, ...rest }, ref) {
    return <div ref={ref} role="separator" className={cx("ui-menu__separator", className)} {...rest} />;
  },
);
DropdownMenuSeparator.displayName = "DropdownMenu.Separator";

export const DropdownMenuLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuLabel({ className, ...rest }, ref) {
    return <div ref={ref} className={cx("ui-menu__label-group", className)} {...rest} />;
  },
);
DropdownMenuLabel.displayName = "DropdownMenu.Label";

/** Compound contextual action menu. */
export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Separator: DropdownMenuSeparator,
  Label: DropdownMenuLabel,
});
