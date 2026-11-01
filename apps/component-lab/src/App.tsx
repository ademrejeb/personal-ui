import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { CommandPalette } from "./components/CommandPalette";
import { ComponentView } from "./views/ComponentView";
import { OverviewView } from "./views/OverviewView";
import { TokensView } from "./views/TokensView";
import { ThemeView } from "./views/ThemeView";
import { useRoute } from "./lib/router";
import { getEntry } from "./registry";

export function App() {
  const route = useRoute();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  let content;
  if (route.view === "component") {
    const entry = getEntry(route.id);
    content = entry ? (
      <ComponentView key={entry.id} entry={entry} />
    ) : (
      <div className="lab-content">
        <div className="lab-empty">
          <h1 className="lab-hero__title">Not found</h1>
          <p>No component named “{route.id}”.</p>
          <a className="lab-navlink" href="#/">
            Back to overview
          </a>
        </div>
      </div>
    );
  } else if (route.view === "tokens") {
    content = <TokensView />;
  } else if (route.view === "theme") {
    content = <ThemeView />;
  } else {
    content = <OverviewView />;
  }

  return (
    <div className="lab">
      <TopBar active={route.view} onOpenSearch={() => setPaletteOpen(true)} />
      <div className="lab__body">
        <Sidebar route={route} />
        <main className="lab__main">{content}</main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
