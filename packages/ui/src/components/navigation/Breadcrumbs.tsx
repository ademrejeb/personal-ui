import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cx } from "../../utilities/cx";

export interface BreadcrumbItemData {
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItemData[];
  separator?: ReactNode;
  /** Collapse middle items when the trail exceeds this length. */
  maxItems?: number;
  /** Accessible label for the navigation landmark. */
  label?: string;
}

function isExternal(href: string | undefined): boolean {
  return !!href && /^https?:\/\//i.test(href) && typeof window !== "undefined" && !href.startsWith(window.location.origin);
}

/** Hierarchical page trail navigation. */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { className, items, separator, maxItems, label = "Breadcrumb", ...rest },
  ref,
) {
  const sep = separator ?? <ChevronRight className="ui-breadcrumbs__separator-icon" size={14} aria-hidden="true" />;

  let visible = items.map((item, index) => ({ item, index }));
  if (maxItems && items.length > maxItems) {
    const first = visible.slice(0, 1);
    const last = visible.slice(-(maxItems - 2));
    const collapsed = { item: { label: "…" } as BreadcrumbItemData, index: -1 };
    visible = [...first, collapsed, ...last];
  }

  return (
    <nav ref={ref} aria-label={label} className={cx("ui-breadcrumbs", className)} {...rest}>
      <ol className="ui-breadcrumbs__list">
        {visible.map(({ item, index }, i) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index === -1 ? `ellipsis-${i}` : (item.href ?? index)} className="ui-breadcrumbs__item">
              {index === -1 ? (
                <span className="ui-breadcrumbs__ellipsis" aria-hidden="true">
                  {item.label}
                </span>
              ) : isLast || !item.href ? (
                <span
                  className="ui-breadcrumbs__current"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                <a
                  className="ui-breadcrumbs__link"
                  href={item.href}
                  onClick={item.onClick}
                  target={isExternal(item.href) ? "_blank" : undefined}
                  rel={isExternal(item.href) ? "noopener noreferrer" : undefined}
                >
                  {item.icon}
                  {item.label}
                </a>
              )}
              {!isLast ? (
                <span className="ui-breadcrumbs__separator" aria-hidden="true">
                  {sep}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
Breadcrumbs.displayName = "Breadcrumbs";
