import {
  forwardRef,
  useEffect,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { canUseDOM } from "../../utilities/dom";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export interface AnchorItem {
  /** id of the section to track. */
  id: string;
  title: ReactNode;
  /** Override the default `#id` href. */
  href?: string;
  children?: AnchorItem[];
}

export type AnchorSlot = "root" | "list" | "item" | "link";
export type AnchorClassNames = SlotClassNames<AnchorSlot>;

export interface AnchorProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange">,
    SlotConfig<AnchorSlot> {
  items: AnchorItem[];
  activeId?: string;
  defaultActiveId?: string;
  onActiveChange?: (id: string) => void;
  /** Sticky offset and scroll landing offset in px. */
  offsetTop?: number;
  /** Pin the navigation while the page scrolls. Defaults to true. */
  sticky?: boolean;
  label?: string;
}

/**
 * A table-of-contents anchor with scroll-spy. The active section is tracked with
 * an IntersectionObserver; links scroll smoothly while respecting `offsetTop`.
 */
export const Anchor = forwardRef<HTMLElement, AnchorProps>(function Anchor(
  {
    className,
    items,
    activeId,
    defaultActiveId,
    onActiveChange,
    offsetTop = 96,
    sticky = true,
    label = "On this page",
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const [active, setActive] = useControllableState<string>({
    value: activeId,
    defaultValue: defaultActiveId ?? "",
    onChange: onActiveChange,
  });
  const [observed, setObserved] = useState<Record<string, IntersectionObserverEntry>>({});

  useEffect(() => {
    if (!canUseDOM() || typeof IntersectionObserver === "undefined") return;
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element != null);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setObserved((prev) => {
          const next = { ...prev };
          for (const entry of entries) next[entry.target.id] = entry;
          return next;
        });
      },
      { rootMargin: `-${offsetTop}px 0px -55% 0px`, threshold: 0 },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [items, offsetTop]);

  useEffect(() => {
    const visible = items
      .map((item) => observed[item.id])
      .filter((entry): entry is IntersectionObserverEntry => Boolean(entry?.isIntersecting))
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible[0]) setActive(visible[0].target.id);
  }, [items, observed, setActive]);

  const go = (event: MouseEvent<HTMLAnchorElement>, item: AnchorItem) => {
    if (!canUseDOM()) return;
    const element = document.getElementById(item.id);
    if (!element) return;
    event.preventDefault();
    const top = element.getBoundingClientRect().top + window.scrollY - offsetTop;
    window.scrollTo({ top, behavior: "smooth" });
    setActive(item.id);
    if (typeof history !== "undefined") history.replaceState(null, "", `#${item.id}`);
  };

  const renderItems = (list: AnchorItem[], depth = 0): ReactNode => (
    <ul className={slotClass(config, "list", "ui-anchor__list")} data-depth={depth || undefined}>
      {list.map((item) => {
        const isActive = active === item.id;
        return (
          <li key={item.id} className={slotClass(config, "item", "ui-anchor__item")}>
            <a
              href={item.href ?? `#${item.id}`}
              aria-current={isActive ? "location" : undefined}
              data-active={isActive || undefined}
              className={slotClass(config, "link", "ui-anchor__link")}
              onClick={(event) => go(event, item)}
            >
              {item.title}
            </a>
            {item.children?.length ? renderItems(item.children, depth + 1) : null}
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav
      ref={ref}
      aria-label={label}
      data-sticky={sticky || undefined}
      style={sticky ? { top: offsetTop } : undefined}
      className={slotClass(config, "root", "ui-anchor", className)}
      {...rest}
    >
      {renderItems(items)}
    </nav>
  );
});
Anchor.displayName = "Anchor";
