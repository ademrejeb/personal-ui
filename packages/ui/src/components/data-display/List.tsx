import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  variant?: "plain" | "bordered" | "divided";
  dense?: boolean;
}

const ListRoot = forwardRef<HTMLUListElement, ListProps>(function List(
  { className, variant = "plain", dense = false, ...rest },
  ref,
) {
  return (
    <ul
      ref={ref}
      data-variant={variant}
      data-dense={dense || undefined}
      className={cx("ui-list", `ui-list--${variant}`, className)}
      {...rest}
    />
  );
});
ListRoot.displayName = "List";

export interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  leading?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  interactive?: boolean;
  onSelect?: () => void;
}

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  { className, leading, trailing, selected, interactive = false, onSelect, children, ...rest },
  ref,
) {
  const content = (
    <>
      {leading != null ? (
        <span className="ui-list__leading" aria-hidden="true">
          {leading}
        </span>
      ) : null}
      <span className="ui-list__content">{children}</span>
      {trailing != null ? <span className="ui-list__trailing">{trailing}</span> : null}
    </>
  );

  return (
    <li
      ref={ref}
      data-selected={selected || undefined}
      data-interactive={interactive || undefined}
      className={cx("ui-list__item", className)}
      {...rest}
    >
      {interactive ? (
        <button type="button" className="ui-list__button" onClick={onSelect} aria-pressed={selected}>
          {content}
        </button>
      ) : (
        <div className="ui-list__static">{content}</div>
      )}
    </li>
  );
});
ListItem.displayName = "List.Item";

export const List = Object.assign(ListRoot, { Item: ListItem });
