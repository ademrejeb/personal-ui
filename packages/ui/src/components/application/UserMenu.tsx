import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "../../utilities/cx";
import { Avatar } from "../data-display/Avatar";
import { DropdownMenu } from "../overlays/DropdownMenu";
import type { ControlSize } from "../../types";
import type { Placement } from "../../utilities/position";

export interface UserMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  danger?: boolean;
  onSelect?: () => void;
  /** Draw a divider above this item. */
  separatorBefore?: boolean;
}

export interface UserMenuProps {
  name: string;
  email?: string;
  /** Avatar image URL; falls back to initials. */
  src?: string;
  items: UserMenuItem[];
  onSelect?: (item: UserMenuItem) => void;
  /** Pinned below the items, e.g. a sign-out link. */
  footer?: ReactNode;
  placement?: Placement;
  size?: ControlSize | number;
  /** Show the name next to the avatar in the trigger. Defaults to false. */
  showName?: boolean;
  className?: string;
}

/** Account menu: avatar trigger, user header, and a list of actions. */
export function UserMenu({
  name,
  email,
  src,
  items,
  onSelect,
  footer,
  placement = "bottom-end",
  size = "md",
  showName = false,
  className,
}: UserMenuProps): ReactNode {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger>
        <button
          type="button"
          className={cx("ui-usermenu__trigger", className)}
          aria-label={`${name} — account menu`}
        >
          <Avatar src={src} name={name} size={size} />
          {showName ? <span className="ui-usermenu__name">{name}</span> : null}
          <ChevronDown size={14} className="ui-usermenu__chevron" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content placement={placement} className="ui-usermenu__content">
        <div className="ui-usermenu__header">
          <Avatar src={src} name={name} size="lg" />
          <span className="ui-usermenu__identity">
            <span className="ui-usermenu__identity-name">{name}</span>
            {email ? <span className="ui-usermenu__identity-email">{email}</span> : null}
          </span>
        </div>
        <DropdownMenu.Separator />
        {items.map((item) => {
          const content = (
            <>
              {item.icon ? <span className="ui-menu__icon">{item.icon}</span> : null}
              <span className="ui-menu__label">{item.label}</span>
            </>
          );
          return (
            <div key={item.id}>
              {item.separatorBefore ? <DropdownMenu.Separator /> : null}
              {item.href ? (
                <a
                  href={item.href}
                  role="menuitem"
                  tabIndex={-1}
                  data-danger={item.danger || undefined}
                  className="ui-menu__item ui-usermenu__link"
                  onClick={() => onSelect?.(item)}
                >
                  {content}
                </a>
              ) : (
                <DropdownMenu.Item
                  danger={item.danger}
                  icon={item.icon}
                  onSelect={() => {
                    item.onSelect?.();
                    onSelect?.(item);
                  }}
                >
                  {item.label}
                </DropdownMenu.Item>
              )}
            </div>
          );
        })}
        {footer ? (
          <>
            <DropdownMenu.Separator />
            <div className="ui-usermenu__footer">{footer}</div>
          </>
        ) : null}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
