import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronLeft, X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";

interface SidebarContextValue {
  sidebarId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);
const useSidebar = (): SidebarContextValue => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("Sidebar subcomponents must be used within a <Sidebar>.");
  return ctx;
};

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Mobile drawer open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Desktop collapsed (icon rail) state. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  side?: "start" | "end";
  bordered?: boolean;
}

function SidebarRoot({
  className,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  side = "start",
  bordered = true,
  children,
  ...rest
}: SidebarProps): ReactNode {
  const sidebarId = useId();
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [collapsed, setCollapsed] = useControllableState<boolean>({
    value: collapsedProp,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  });

  return (
    <SidebarContext.Provider
      value={{
        sidebarId,
        open,
        setOpen,
        collapsed,
        toggleCollapsed: () => setCollapsed(!collapsed),
      }}
    >
      <div className="ui-sidebar-root" data-side={side}>
        <div
          className="ui-sidebar__backdrop"
          data-open={open || undefined}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <aside
          id={sidebarId}
          data-open={open || undefined}
          data-collapsed={collapsed || undefined}
          data-bordered={bordered || undefined}
          className={cx("ui-sidebar", className)}
          {...rest}
        >
          {children}
        </aside>
      </div>
    </SidebarContext.Provider>
  );
}

export type SidebarHeaderProps = HTMLAttributes<HTMLDivElement>;

export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  function SidebarHeader({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cx("ui-sidebar__header", className)} {...rest}>
        {children}
      </div>
    );
  },
);
SidebarHeader.displayName = "Sidebar.Header";

export type SidebarNavProps = HTMLAttributes<HTMLElement>;

export const SidebarNav = forwardRef<HTMLElement, SidebarNavProps>(function SidebarNav(
  { className, children, ...rest },
  ref,
) {
  return (
    <nav ref={ref} className={cx("ui-sidebar__nav", className)} {...rest}>
      {children}
    </nav>
  );
});
SidebarNav.displayName = "Sidebar.Nav";

export interface SidebarSectionProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
}

export const SidebarSection = forwardRef<HTMLDivElement, SidebarSectionProps>(
  function SidebarSection({ className, label, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cx("ui-sidebar__section", className)} {...rest}>
        {label != null ? (
          <div className="ui-sidebar__section-label">{label}</div>
        ) : null}
        {children}
      </div>
    );
  },
);
SidebarSection.displayName = "Sidebar.Section";

export interface SidebarLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  icon?: ReactNode;
  /** Optional trailing content, e.g. a badge. */
  trailing?: ReactNode;
}

export const SidebarLink = forwardRef<HTMLAnchorElement, SidebarLinkProps>(function SidebarLink(
  { className, active = false, icon, trailing, children, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      aria-current={active ? "page" : undefined}
      data-active={active || undefined}
      className={cx("ui-sidebar__link", className)}
      {...rest}
    >
      {icon ? (
        <span className="ui-sidebar__link-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="ui-sidebar__link-label">{children}</span>
      {trailing ? <span className="ui-sidebar__link-trailing">{trailing}</span> : null}
    </a>
  );
});
SidebarLink.displayName = "Sidebar.Link";

export type SidebarFooterProps = HTMLAttributes<HTMLDivElement>;

export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  function SidebarFooter({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cx("ui-sidebar__footer", className)} {...rest}>
        {children}
      </div>
    );
  },
);
SidebarFooter.displayName = "Sidebar.Footer";

export interface SidebarToggleProps extends HTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const SidebarToggle = forwardRef<HTMLButtonElement, SidebarToggleProps>(
  function SidebarToggle({ className, label = "Collapse sidebar", ...rest }, ref) {
    const { collapsed, toggleCollapsed } = useSidebar();
    return (
      <button
        ref={ref}
        type="button"
        className={cx("ui-sidebar__toggle", className)}
        aria-label={label}
        aria-pressed={collapsed}
        onClick={toggleCollapsed}
        {...rest}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
    );
  },
);
SidebarToggle.displayName = "Sidebar.Toggle";

export interface SidebarCloseProps extends HTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const SidebarClose = forwardRef<HTMLButtonElement, SidebarCloseProps>(
  function SidebarClose({ className, label = "Close sidebar", ...rest }, ref) {
    const { setOpen } = useSidebar();
    return (
      <button
        ref={ref}
        type="button"
        className={cx("ui-sidebar__close", className)}
        aria-label={label}
        onClick={() => setOpen(false)}
        {...rest}
      >
        <X size={18} aria-hidden="true" />
      </button>
    );
  },
);
SidebarClose.displayName = "Sidebar.Close";

/** Responsive sidebar: a persistent rail on desktop and an off-canvas drawer on mobile. */
export const Sidebar = Object.assign(SidebarRoot, {
  Header: SidebarHeader,
  Nav: SidebarNav,
  Section: SidebarSection,
  Link: SidebarLink,
  Footer: SidebarFooter,
  Toggle: SidebarToggle,
  Close: SidebarClose,
});
