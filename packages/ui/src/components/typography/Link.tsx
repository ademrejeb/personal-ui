import { forwardRef, type AnchorHTMLAttributes } from "react";
import { cx } from "../../utilities/cx";
import { ExternalLink } from "lucide-react";

export type LinkVariant = "default" | "subtle" | "standalone";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  /**
   * Marks the link as leaving the current site: adds `target="_blank"` and
   * `rel="noopener noreferrer"` and renders an external indicator. Auto-detected
   * when `href` is an absolute URL with a different origin (client only), or set
   * explicitly to avoid any ambiguity during SSR.
   */
  external?: boolean;
  /** Hide the external icon while keeping external behavior. */
  hideExternalIcon?: boolean;
}

function isExternalHref(href: string | undefined): boolean {
  if (!href || !/^https?:\/\//i.test(href)) return false;
  if (typeof window === "undefined") return true;
  try {
    return new URL(href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

/** Accessible anchor with consistent styling and external-link handling. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { className, variant = "default", external, hideExternalIcon, href, target, rel, children, ...rest },
  ref,
) {
  const isExternal = external ?? isExternalHref(href);
  const resolvedTarget = isExternal ? (target ?? "_blank") : target;
  const resolvedRel = isExternal
    ? rel ?? "noopener noreferrer"
    : rel;

  return (
    <a
      ref={ref}
      href={href}
      target={resolvedTarget}
      rel={resolvedRel}
      data-external={isExternal || undefined}
      className={cx("ui-link", `ui-link--${variant}`, className)}
      {...rest}
    >
      {children}
      {isExternal && !hideExternalIcon ? (
        <ExternalLink className="ui-link__external-icon" aria-hidden="true" focusable="false" />
      ) : null}
    </a>
  );
});
Link.displayName = "Link";
