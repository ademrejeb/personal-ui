import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { Search } from "lucide-react";
import { cx } from "../../utilities/cx";
import { Portal } from "../../primitives/Portal";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  /** Optional heading used to group results. */
  group?: string;
  keywords?: string[];
  icon?: ReactNode;
  shortcut?: ReactNode;
  disabled?: boolean;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect: (item: CommandPaletteItem) => void;
  items: CommandPaletteItem[];
  placeholder?: string;
  label?: string;
  emptyMessage?: ReactNode;
  /** Content pinned to the bottom of the panel, e.g. hints. */
  footer?: ReactNode;
  loading?: boolean;
  className?: string;
}

function matches(item: CommandPaletteItem, query: string): boolean {
  if (!query) return true;
  const haystack = [item.label, item.description, item.group, ...(item.keywords ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((token) => haystack.includes(token));
}

/** Filterable keyboard command palette. Provide the items; wire the hotkey yourself. */
export function CommandPalette({
  open,
  onOpenChange,
  onSelect,
  items,
  placeholder = "Type a command or search…",
  label = "Command palette",
  emptyMessage = "No matching commands",
  footer,
  loading = false,
  className,
}: CommandPaletteProps): ReactNode {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listId = useId();

  useScrollLock(open);
  useFocusTrap(panelRef, open);
  useEscapeKey(() => onOpenChange?.(false), open);

  const close = () => onOpenChange?.(false);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      inputRef.current?.focus();
    }
  }, [open]);

  const results = useMemo(
    () => (open ? items.filter((item) => matches(item, query.trim())) : []),
    [open, items, query],
  );

  const selectable = results.filter((item) => !item.disabled);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const move = (direction: 1 | -1) => {
    if (!selectable.length) return;
    setActive((current) => {
      const index = Math.max(0, selectable.findIndex((item) => item === results[current]));
      return results.indexOf(selectable[(index + direction + selectable.length) % selectable.length]);
    });
  };

  const commit = (item: CommandPaletteItem | undefined) => {
    if (!item || item.disabled) return;
    onSelect(item);
    close();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        break;
      case "Home":
        event.preventDefault();
        if (selectable.length) setActive(results.indexOf(selectable[0]));
        break;
      case "End":
        event.preventDefault();
        if (selectable.length) setActive(results.indexOf(selectable[selectable.length - 1]));
        break;
      case "Enter":
        event.preventDefault();
        commit(results[active]);
        break;
      default:
        break;
    }
  };

  if (!open) return null;

  const groups = results.reduce<Map<string, CommandPaletteItem[]>>((acc, item) => {
    const key = item.group ?? "";
    const list = acc.get(key) ?? [];
    list.push(item);
    acc.set(key, list);
    return acc;
  }, new Map());

  const activeId = results[active] ? `${listId}-${results[active].id}` : undefined;

  return (
    <Portal>
      <div
        className="ui-command"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={cx("ui-command__panel", className)}
          onKeyDown={handleKeyDown}
        >
          <div className="ui-command__search">
            <Search size={16} className="ui-command__search-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              className="ui-command__input"
              value={query}
              placeholder={placeholder}
              aria-label={label}
              aria-controls={listId}
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              role="combobox"
              aria-expanded
              autoComplete="off"
              autoFocus
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div id={listId} role="listbox" aria-label={label} className="ui-command__list">
            {loading ? (
              <div className="ui-command__status">Loading…</div>
            ) : results.length === 0 ? (
              <div className="ui-command__status">{emptyMessage}</div>
            ) : (
              Array.from(groups.entries()).map(([group, groupItems]) => (
                <div key={group} className="ui-command__group">
                  {group ? <div className="ui-command__group-label">{group}</div> : null}
                  {groupItems.map((item) => {
                    const index = results.indexOf(item);
                    const isActive = index === active;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        id={`${listId}-${item.id}`}
                        role="option"
                        aria-selected={isActive}
                        aria-disabled={item.disabled || undefined}
                        className="ui-command__item"
                        data-active={isActive || undefined}
                        data-disabled={item.disabled || undefined}
                        onMouseMove={() => setActive(index)}
                        onClick={() => commit(item)}
                      >
                        {item.icon ? (
                          <span className="ui-command__item-icon" aria-hidden="true">
                            {item.icon}
                          </span>
                        ) : null}
                        <span className="ui-command__item-body">
                          <span className="ui-command__item-label">{item.label}</span>
                          {item.description ? (
                            <span className="ui-command__item-description">{item.description}</span>
                          ) : null}
                        </span>
                        {item.shortcut ? (
                          <span className="ui-command__item-shortcut">{item.shortcut}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {footer ? <div className="ui-command__footer">{footer}</div> : null}
        </div>
      </div>
    </Portal>
  );
}
