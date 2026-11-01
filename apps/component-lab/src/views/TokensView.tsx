import { useMemo, useState } from "react";
import { Input, useTheme } from "@adem.rejeb/ui";
import {
  TOKEN_GROUPS,
  classifyToken,
  looksLikeColor,
  readCssVariables,
  type CssVariable,
} from "../lib/tokens";

export function TokensView() {
  const { resolvedTheme } = useTheme();
  const [query, setQuery] = useState("");

  const variables = useMemo(() => {
    void resolvedTheme;
    return readCssVariables();
  }, [resolvedTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return variables;
    return variables.filter(
      (variable) =>
        variable.name.toLowerCase().includes(q) || variable.value.toLowerCase().includes(q),
    );
  }, [variables, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, CssVariable[]>();
    for (const variable of filtered) {
      const group = classifyToken(variable.name);
      const list = map.get(group) ?? [];
      list.push(variable);
      map.set(group, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="lab-content">
      <header className="lab-hero">
        <div className="lab-hero__eyebrow">
          <span className="lab-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}>
            TOKENS
          </span>
        </div>
        <h1 className="lab-hero__title">Design tokens</h1>
        <p className="lab-hero__description">
          {variables.length} live custom properties, resolved from <code>:root</code> for the current{" "}
          {resolvedTheme} theme.
        </p>
      </header>

      <div className="lab-section">
        <Input
          type="search"
          placeholder="Filter tokens by name or value…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Filter tokens"
        />
      </div>

      {TOKEN_GROUPS.map((group) => {
        const list = grouped.get(group);
        if (!list || list.length === 0) return null;
        return (
          <section className="lab-section" key={group}>
            <h2 className="lab-section__title">
              {group} <span className="lab-muted">({list.length})</span>
            </h2>
            <div className="lab-token-grid">
              {list.map((variable) => (
                <div className="lab-token" key={variable.name}>
                  {looksLikeColor(variable.value) ? (
                    <span
                      className="lab-token__swatch"
                      style={{ background: `var(${variable.name})` }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="lab-token__meta">
                    <span className="lab-token__name">{variable.name}</span>
                    <br />
                    <span className="lab-token__value">{variable.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
