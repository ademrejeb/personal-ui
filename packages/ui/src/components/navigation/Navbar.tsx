import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Menu, X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";

interface NavbarContextValue {
  navId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const NavbarContext = createContext<NavbarContextValue | null>(null);
const useNavbar = (): NavbarContextValue => {
  const ctx = useContext(NavbarContext);
  if (!ctx) throw new Error("Navbar subcomponents must be used within a <Navbar>.");
  return ctx;
};

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  /** Menu open state (mobile). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  sticky?: boolean;
  bordered?: boolean;
}

function NavbarRoot({
  className,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  sticky = true,
  bordered = true,
  children,
  ...rest
}: NavbarProps): ReactNode {
  const navId = useId();
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <NavbarContext.Provider value={{ navId, open, setOpen }}>
      <header
        data-open={open || undefined}
        data-sticky={sticky || undefined}
        data-bordered={bordered || undefined}
        className={cx("ui-navbar", className)}
        {...rest}
      >
        {children}
      </header>
    </NavbarContext.Provider>
  );
}

export interface NavbarBrandProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Leading mark, e.g. a logo. */
  mark?: ReactNode;
}

export const NavbarBrand = forwardRef<HTMLAnchorElement, NavbarBrandProps>(function NavbarBrand(
  { className, mark, children, ...rest },
  ref,
) {
  return (
    <a ref={ref} className={cx("ui-navbar__brand", className)} {...rest}>
      {mark ? (
        <span className="ui-navbar__mark" aria-hidden="true">
          {mark}
        </span>
      ) : null}
      <span className="ui-navbar__brand-text">{children}</span>
    </a>
  );
});
NavbarBrand.displayName = "Navbar.Brand";

export interface NavbarToggleProps extends HTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const NavbarToggle = forwardRef<HTMLButtonElement, NavbarToggleProps>(function NavbarToggle(
  { className, label = "Toggle navigation", ...rest },
  ref,
) {
  const { open, setOpen, navId } = useNavbar();
  return (
    <button
      ref={ref}
      type="button"
      className={cx("ui-navbar__toggle", className)}
      aria-label={label}
      aria-expanded={open}
      aria-controls={navId}
      onClick={() => setOpen(!open)}
      {...rest}
    >
      {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
    </button>
  );
});
NavbarToggle.displayName = "Navbar.Toggle";

export type NavbarNavProps = HTMLAttributes<HTMLElement>;

export const NavbarNav = forwardRef<HTMLElement, NavbarNavProps>(function NavbarNav(
  { className, children, ...rest },
  ref,
) {
  const { navId, open } = useNavbar();
  return (
    <nav
      ref={ref}
      id={navId}
      data-open={open || undefined}
      className={cx("ui-navbar__nav", className)}
      {...rest}
    >
      {children}
    </nav>
  );
});
NavbarNav.displayName = "Navbar.Nav";

export interface NavbarLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
}

export const NavbarLink = forwardRef<HTMLAnchorElement, NavbarLinkProps>(function NavbarLink(
  { className, active = false, children, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      aria-current={active ? "page" : undefined}
      data-active={active || undefined}
      className={cx("ui-navbar__link", className)}
      {...rest}
    >
      {children}
    </a>
  );
});
NavbarLink.displayName = "Navbar.Link";

export type NavbarActionsProps = HTMLAttributes<HTMLDivElement>;

export const NavbarActions = forwardRef<HTMLDivElement, NavbarActionsProps>(
  function NavbarActions({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cx("ui-navbar__actions", className)} {...rest}>
        {children}
      </div>
    );
  },
);
NavbarActions.displayName = "Navbar.Actions";

/** Responsive top navigation bar with a collapsible menu on small screens. */
export const Navbar = Object.assign(NavbarRoot, {
  Brand: NavbarBrand,
  Toggle: NavbarToggle,
  Nav: NavbarNav,
  Link: NavbarLink,
  Actions: NavbarActions,
});
