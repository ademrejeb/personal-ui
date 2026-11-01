import {
  cloneElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";
import { cx } from "../../utilities/cx";
import { Portal } from "../../primitives/Portal";
import { useControllableState } from "../../hooks/useControllableState";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { getFocusableElements } from "../../utilities/dom";
import { focusFirst } from "../../utilities/focus";
import { computePositionAtPoint, type Coords, type Point } from "../../utilities/position";

interface ContextMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  point: Point;
  openAt: (point: Point) => void;
  contentId: string;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);
const useContextMenu = (): ContextMenuContextValue => {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) throw new Error("ContextMenu subcomponents must be used within a <ContextMenu>.");
  return ctx;
};

export interface ContextMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

function ContextMenuRoot({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: ContextMenuProps): ReactNode {
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 });
  const contentId = useRef(`context-menu-${Math.random().toString(36).slice(2)}`).current;

  const openAt = useCallback(
    (next: Point) => {
      setPoint(next);
      setOpen(true);
    },
    [setOpen],
  );

  return (
    <ContextMenuContext.Provider value={{ open, setOpen, point, openAt, contentId }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

export interface ContextMenuTriggerProps {
  children: ReactElement;
}

export const ContextMenuTrigger = forwardRef<HTMLElement, ContextMenuTriggerProps>(
  function ContextMenuTrigger({ children }, ref) {
    const { openAt, open } = useContextMenu();
    const childProps = children.props as {
      ref?: unknown;
      onContextMenu?: (event: ReactMouseEvent) => void;
    };

    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      ref,
      "aria-haspopup": "menu",
      "aria-expanded": open,
      onContextMenu: (event: ReactMouseEvent) => {
        childProps.onContextMenu?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        openAt({ x: event.clientX, y: event.clientY });
      },
    });
  },
);
ContextMenuTrigger.displayName = "ContextMenu.Trigger";

export interface ContextMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Clamp the menu inside the viewport. Defaults to true. */
  constrain?: boolean;
}

export const ContextMenuContent = forwardRef<HTMLDivElement, ContextMenuContentProps>(
  function ContextMenuContent(
    { className, style, constrain = true, children, ...rest },
    forwardedRef,
  ) {
    const { open, setOpen, point, contentId } = useContextMenu();
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [coords, setCoords] = useState<Coords>({ top: point.y, left: point.x });

    useEscapeKey(() => setOpen(false), open);

    // Place the menu at the pointer, clamped inside the viewport.
    useIsomorphicLayoutEffect(() => {
      if (!open) return;
      const node = menuRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setCoords(
        computePositionAtPoint(point, rect, {
          viewportWidth: constrain ? window.innerWidth : 0,
          viewportHeight: constrain ? window.innerHeight : 0,
        }),
      );
    }, [open, point, constrain]);

    useEffect(() => {
      if (!open) return;
      const onPointerDown = (event: PointerEvent) => {
        if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
      };
      const onScroll = () => setOpen(false);
      document.addEventListener("pointerdown", onPointerDown, true);
      window.addEventListener("scroll", onScroll, true);
      return () => {
        document.removeEventListener("pointerdown", onPointerDown, true);
        window.removeEventListener("scroll", onScroll, true);
      };
    }, [open, setOpen]);

    useEffect(() => {
      if (open && menuRef.current) focusFirst(menuRef.current);
    }, [open]);

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!menuRef.current) return;
      const items = getFocusableElements(menuRef.current);
      if (!items.length) return;
      const current = items.indexOf(document.activeElement as HTMLElement);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        items[(current + 1) % items.length].focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        items[(current - 1 + items.length) % items.length].focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        items[0].focus();
      } else if (event.key === "End") {
        event.preventDefault();
        items[items.length - 1].focus();
      }
    };

    if (!open) return null;

    return (
      <Portal>
        <div
          ref={(node) => {
            menuRef.current = node;
            if (typeof forwardedRef === "function") forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
          }}
          id={contentId}
          role="menu"
          tabIndex={-1}
          className={cx("ui-menu", "ui-context-menu", className)}
          style={{ position: "fixed", top: coords.top, left: coords.left, ...style }}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          {children}
        </div>
      </Portal>
    );
  },
);
ContextMenuContent.displayName = "ContextMenu.Content";

export interface ContextMenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  onSelect?: (event: Event) => void;
  disabled?: boolean;
  danger?: boolean;
  icon?: ReactNode;
  shortcut?: ReactNode;
  checked?: boolean;
}

export const ContextMenuItem = forwardRef<HTMLDivElement, ContextMenuItemProps>(
  function ContextMenuItem(
    { className, onSelect, disabled = false, danger = false, icon, shortcut, checked, children, onClick, ...rest },
    ref,
  ) {
    const { setOpen } = useContextMenu();
    const select = (event: Event) => {
      if (disabled) return;
      onSelect?.(event);
      setOpen(false);
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
            select(event.nativeEvent);
          }
        }}
        {...rest}
      >
        <span className="ui-menu__indicator" aria-hidden="true">
          {checked ? <Check size={14} /> : icon}
        </span>
        <span className="ui-menu__label">{children}</span>
        {shortcut ? <span className="ui-menu__shortcut">{shortcut}</span> : null}
      </div>
    );
  },
);
ContextMenuItem.displayName = "ContextMenu.Item";

export const ContextMenuSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ContextMenuSeparator({ className, ...rest }, ref) {
    return <div ref={ref} role="separator" className={cx("ui-menu__separator", className)} {...rest} />;
  },
);
ContextMenuSeparator.displayName = "ContextMenu.Separator";

/** Right-click (or long-press) menu positioned at the pointer. */
export const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  Separator: ContextMenuSeparator,
});
