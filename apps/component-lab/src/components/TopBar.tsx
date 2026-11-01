import { Blocks, LayoutGrid, Palette, Search } from "lucide-react";
import { ThemeToggle, VersionBadge } from "@adem.rejeb/ui";
import { navigate, type Route } from "../lib/router";
import pkg from "../../package.json";

interface TopBarProps {
  active: Route["view"];
  onOpenSearch: () => void;
}

const LINKS: { view: Route["view"]; label: string; href: string; icon: typeof LayoutGrid }[] = [
  { view: "overview", label: "Overview", href: "#/", icon: LayoutGrid },
  { view: "tokens", label: "Tokens", href: "#/tokens", icon: Palette },
  { view: "theme", label: "Theme", href: "#/theme", icon: Blocks },
];

export function TopBar({ active, onOpenSearch }: TopBarProps) {
  return (
    <header className="lab-topbar">
      <a className="lab-brand" href="#/">
        <span className="lab-brand__mark" aria-hidden="true" />
        <span>Personal UI</span>
      </a>

      <button type="button" className="lab-search" onClick={onOpenSearch}>
        <Search size={16} aria-hidden="true" />
        <span className="lab-search__text">Search components…</span>
        <kbd className="lab-kbd" aria-hidden="true">
          Ctrl K
        </kbd>
      </button>

      <div className="lab-topbar__spacer" />

      <nav className="lab-topbar__nav" aria-label="Primary">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.view}
              className="lab-navlink"
              href={link.href}
              aria-current={active === link.view ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                navigate(link.href);
              }}
            >
              <Icon size={16} aria-hidden="true" />
              {link.label}
            </a>
          );
        })}
      </nav>

      <ThemeToggle variant="segmented" className="lab-theme" />
      <VersionBadge version={`v${pkg.version}`} environment="lab" tone="info" />
    </header>
  );
}
