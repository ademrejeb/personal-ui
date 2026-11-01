import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";

interface NavigationMenuContextValue {
  openValue: string | null;
  setOpenValue: (value: string | null) => void;
  registerTrigger: (value: string, el: HTMLButtonElement | null) => void;
  focusSibling: (value: string, direction: 1 | -1) => void;
}

const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null);
const useNavigationMenu = (): NavigationMenuContextValue => {
  const ctx = useContext(NavigationMenuContext);
  if (!ctx) throw new Error("NavigationMenu subcomponents must be used within a <NavigationMenu>.");
  return ctx;
};

export interface NavigationMenuProps
  extends Omit<HTMLAttributes<HTMLElement>, "defaultValue"> {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Delay before closing when the pointer leaves. Defaults to 120ms. */
  closeDelay?: number;
}

function NavigationMenuRoot({
  className,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  closeDelay = 120,
  children,
  onMouseLeave,
  ...rest
}: NavigationMenuProps): ReactNode {
  const [openValue, setOpenValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const order = useRef<string[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerTrigger = useCallback((value: string, el: HTMLButtonElement | null) => {
    if (el) {
      triggers.current.set(value, el);
      if (!order.current.includes(value)) order.current.push(value);
    } else {
      triggers.current.delete(value);
    }
  }, []);

  const focusSibling = useCallback((value: string, direction: 1 | -1) => {
    const list = order.current;
    const index = list.indexOf(value);
    if (index === -1) return;
    const next = list[(index + direction + list.length) % list.length];
    setOpenValue(next);
    triggers.current.get(next)?.focus();
  }, [setOpenValue]);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  return (
    <NavigationMenuContext.Provider
      value={{ openValue, setOpenValue, registerTrigger, focusSibling }}
    >
      <nav
        className={cx("ui-navmenu", className)}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
          cancelClose();
          closeTimer.current = setTimeout(() => setOpenValue(null), closeDelay);
        }}
        {...rest}
      >
        {children}
      </nav>
    </NavigationMenuContext.Provider>
  );
}

export type NavigationMenuListProps = HTMLAttributes<HTMLUListElement>;

export const NavigationMenuList = forwardRef<HTMLUListElement, NavigationMenuListProps>(
  function NavigationMenuList({ className, children, ...rest }, ref) {
    return (
      <ul ref={ref} className={cx("ui-navmenu__list", className)} {...rest}>
        {children}
      </ul>
    );
  },
);
NavigationMenuList.displayName = "NavigationMenu.List";

export interface NavigationMenuItemProps extends HTMLAttributes<HTMLLIElement> {
  value: string;
}

export const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  function NavigationMenuItem({ className, value, children, ...rest }, ref) {
    return (
      <li ref={ref} data-value={value} className={cx("ui-navmenu__item", className)} {...rest}>
        {children}
      </li>
    );
  },
);
NavigationMenuItem.displayName = "NavigationMenu.Item";

export interface NavigationMenuTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
}

export const NavigationMenuTrigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  function NavigationMenuTrigger({ className, value, children, onKeyDown, ...rest }, ref) {
    const { openValue, setOpenValue, registerTrigger, focusSibling } = useNavigationMenu();
    const open = openValue === value;

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          focusSibling(value, 1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          focusSibling(value, -1);
          break;
        case "ArrowDown":
        case "Enter":
        case " ":
          event.preventDefault();
          setOpenValue(value);
          break;
        case "Escape":
          if (open) {
            event.preventDefault();
            setOpenValue(null);
          }
          break;
        default:
          break;
      }
    };

    return (
      <button
        ref={(node) => {
          registerTrigger(value, node);
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        type="button"
        className={cx("ui-navmenu__trigger", className)}
        aria-expanded={open}
        aria-haspopup="true"
        data-open={open || undefined}
        onClick={() => setOpenValue(open ? null : value)}
        onMouseEnter={() => {
          if (openValue !== null && openValue !== value) setOpenValue(value);
        }}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
        <ChevronDown size={14} className="ui-navmenu__chevron" aria-hidden="true" />
      </button>
    );
  },
);
NavigationMenuTrigger.displayName = "NavigationMenu.Trigger";

export interface NavigationMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  function NavigationMenuContent({ className, value, children, ...rest }, ref) {
    const { openValue, setOpenValue } = useNavigationMenu();
    if (openValue !== value) return null;
    return (
      <div
        ref={ref}
        className={cx("ui-navmenu__content", className)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setOpenValue(null);
          }
        }}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
NavigationMenuContent.displayName = "NavigationMenu.Content";

export type NavigationMenuLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  function NavigationMenuLink({ className, children, ...rest }, ref) {
    return (
      <a ref={ref} className={cx("ui-navmenu__link", className)} {...rest}>
        {children}
      </a>
    );
  },
);
NavigationMenuLink.displayName = "NavigationMenu.Link";

/** Horizontal navigation with hover/click panels, one panel open at a time. */
export const NavigationMenu = Object.assign(NavigationMenuRoot, {
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Trigger: NavigationMenuTrigger,
  Content: NavigationMenuContent,
  Link: NavigationMenuLink,
});
