import { navigate } from "../lib/router";
import { groupedRegistry, registry } from "../registry";

export function OverviewView() {
  const groups = groupedRegistry();

  return (
    <div className="lab-content">
      <header className="lab-hero">
        <div className="lab-hero__eyebrow">
          <span className="lab-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}>
            DESIGN SYSTEM
          </span>
        </div>
        <h1 className="lab-hero__title">Component Lab</h1>
        <p className="lab-hero__description">
          An interactive workbench for every component in Personal UI. Tune props, copy generated
          JSX, inspect design tokens, and preview light and dark themes.
        </p>
      </header>

      <div className="lab-row" style={{ marginTop: "var(--ui-p-space-6)" }}>
        <div className="lab-stat">
          <span className="lab-stat__value">{registry.length}</span>
          <span className="lab-stat__label">components</span>
        </div>
        <div className="lab-stat">
          <span className="lab-stat__value">{groups.length}</span>
          <span className="lab-stat__label">categories</span>
        </div>
        <div className="lab-stat">
          <span className="lab-stat__value">{registry.reduce((n, e) => n + (e.props?.length ?? 0), 0)}</span>
          <span className="lab-stat__label">documented props</span>
        </div>
      </div>

      {groups.map((group) => (
        <section className="lab-section" key={group.category}>
          <h2 className="lab-section__title">{group.category}</h2>
          <div className="lab-grid">
            {group.entries.map((entry) => (
              <a
                key={entry.id}
                className="lab-card"
                href={`#/components/${entry.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(`/components/${entry.id}`);
                }}
              >
                <span className="lab-card__title">{entry.name}</span>
                <span className="lab-card__desc">{entry.description}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
