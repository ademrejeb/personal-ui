import {
  createContext,
  useContext,
  useId,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";
import { DropdownMenu, type DropdownMenuContentProps, type DropdownMenuItemProps } from "./DropdownMenu";

interface MenuBarContextValue {
  openValue: string | null;
  setOpenValue: (value: string | null) => void;
  registerTrigger: (value: string, el: HTMLButtonElement | null) => void;
  /**
   * Move focus to the neighbouring menu. `open` mirrors whether the bar is
   * currently active so arrow keys only open a menu once the bar is engaged.
   */
  focusSibling: (value: string, direction: 1 | -1, open: boolean) => void;
}

const MenuBarContext = createContext<MenuBarContextValue | null>(null);
const useMenuBar = (): MenuBarContextValue => {
  const ctx = useContext(MenuBarContext);
  if (!ctx) throw new Error("MenuBar.Menu must be used within a <MenuBar>.");
  return ctx;
};

export interface MenuBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}

function MenuBarRoot({
  className,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  children,
  ...rest
}: MenuBarProps): ReactNode {
  const [openValue, setOpenValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const order = useRef<string[]>([]);

  return (
    <MenuBarContext.Provider
      value={{
        openValue,
        setOpenValue,
        registerTrigger: (value, el) => {
          if (el) {
            triggers.current.set(value, el);
            if (!order.current.includes(value)) order.current.push(value);
          } else {
            triggers.current.delete(value);
          }
        },
        focusSibling: (value, direction, open) => {
          const list = order.current;
          const index = list.indexOf(value);
          if (index === -1) return;
          const next = list[(index + direction + list.length) % list.length];
          if (open) setOpenValue(next);
          triggers.current.get(next)?.focus();
        },
      }}
    >
      <div role="menubar" className={cx("ui-menubar", className)} {...rest}>
        {children}
      </div>
    </MenuBarContext.Provider>
  );
}

export interface MenuBarMenuProps {
  /** Stable id; falls back to an auto-generated one. */
  value?: string;
  label: ReactNode;
  children: ReactNode;
}

function MenuBarMenu({ value, label, children }: MenuBarMenuProps): ReactNode {
  const autoId = useId();
  const id = value ?? autoId;
  const { openValue, setOpenValue, registerTrigger, focusSibling } = useMenuBar();
  const open = openValue === id;

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusSibling(id, 1, openValue !== null);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusSibling(id, -1, openValue !== null);
        break;
      default:
        break;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={(next) => setOpenValue(next ? id : null)}>
      <DropdownMenu.Trigger>
        <button
          ref={(node) => registerTrigger(id, node)}
          type="button"
          role="menuitem"
          className="ui-menubar__trigger"
          aria-haspopup="menu"
          aria-expanded={open}
          data-open={open || undefined}
          onMouseEnter={() => {
            if (openValue !== null && openValue !== id) setOpenValue(id);
          }}
          onKeyDown={handleKeyDown}
        >
          {label}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content placement="bottom-start">{children}</DropdownMenu.Content>
    </DropdownMenu>
  );
}

export type MenuBarItemProps = DropdownMenuItemProps;
export const MenuBarItem = DropdownMenu.Item;
export type MenuBarContentProps = DropdownMenuContentProps;
export const MenuBarSeparator = DropdownMenu.Separator;

/** Desktop menu bar: a row of dropdown menus with left/right arrow navigation. */
export const MenuBar = Object.assign(MenuBarRoot, {
  Menu: MenuBarMenu,
  Item: MenuBarItem,
  Separator: MenuBarSeparator,
});
