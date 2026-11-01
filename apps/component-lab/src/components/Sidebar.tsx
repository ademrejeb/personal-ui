import { navigate, type Route } from "../lib/router";
import { groupedRegistry } from "../registry";

interface SidebarProps {
  route: Route;
}

export function Sidebar({ route }: SidebarProps) {
  const groups = groupedRegistry();
  const activeId = route.view === "component" ? route.id : undefined;

  return (
    <aside className="lab-sidebar" aria-label="Components">
      {groups.map((group) => (
        <div className="lab-sidebar__group" key={group.category}>
          <p className="lab-sidebar__title">{group.category}</p>
          <div className="lab-sidebar__list">
            {group.entries.map((entry) => (
              <a
                key={entry.id}
                className="lab-sidebar__link"
                href={`#/components/${entry.id}`}
                aria-current={activeId === entry.id ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(`/components/${entry.id}`);
                }}
              >
                <span>{entry.name}</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
