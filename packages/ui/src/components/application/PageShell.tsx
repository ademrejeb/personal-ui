import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";
import type { ContainerSize } from "../layout/Container";

export interface PageShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional persistent sidebar region. */
  sidebar?: ReactNode;
  /** Sticky top region (typically a Navbar or PageHeader). */
  header?: ReactNode;
  /** Sub-header toolbar region. */
  toolbar?: ReactNode;
  footer?: ReactNode;
  /** Max content width; pass null to fill. */
  maxWidth?: ContainerSize | null;
  padded?: boolean;
}

/** Consistent page structure: optional sidebar, sticky header, and content. */
export const PageShell = forwardRef<HTMLDivElement, PageShellProps>(function PageShell(
  {
    className,
    sidebar,
    header,
    toolbar,
    footer,
    maxWidth = "lg",
    padded = true,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      data-has-sidebar={sidebar != null || undefined}
      className={cx("ui-page-shell", className)}
      {...rest}
    >
      <div className="ui-page-shell__body">
        {sidebar}
        <div className="ui-page-shell__main">
          {header != null ? <div className="ui-page-shell__header">{header}</div> : null}
          {toolbar != null ? <div className="ui-page-shell__toolbar">{toolbar}</div> : null}
          <main className="ui-page-shell__content" data-padded={padded || undefined}>
            <div
              className={cx("ui-page-shell__container", maxWidth && `ui-container--${maxWidth}`)}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
      {footer != null ? <footer className="ui-page-shell__footer">{footer}</footer> : null}
    </div>
  );
});
PageShell.displayName = "PageShell";
