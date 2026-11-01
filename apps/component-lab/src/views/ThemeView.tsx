import { useMemo } from "react";
import { Badge, ThemeToggle, useTheme } from "@adem.rejeb/ui";
import { readCssVariables } from "../lib/tokens";

const COLOR_ROLES = [
  "--ui-background",
  "--ui-background-subtle",
  "--ui-surface",
  "--ui-surface-raised",
  "--ui-surface-overlay",
  "--ui-surface-inset",
  "--ui-foreground",
  "--ui-muted",
  "--ui-muted-strong",
  "--ui-subtle",
  "--ui-border",
  "--ui-border-strong",
  "--ui-primary",
  "--ui-primary-hover",
  "--ui-primary-active",
  "--ui-primary-subtle",
  "--ui-success",
  "--ui-warning",
  "--ui-danger",
  "--ui-info",
  "--ui-focus-ring",
  "--ui-selection",
];

const TEXT_SIZES = [
  "--ui-p-text-2xs",
  "--ui-p-text-xs",
  "--ui-p-text-sm",
  "--ui-p-text-md",
  "--ui-p-text-lg",
  "--ui-p-text-xl",
  "--ui-p-text-2xl",
  "--ui-p-text-3xl",
];

const RADII = [
  "--ui-p-radius-xs",
  "--ui-p-radius-sm",
  "--ui-p-radius-md",
  "--ui-p-radius-lg",
  "--ui-p-radius-xl",
  "--ui-p-radius-2xl",
  "--ui-p-radius-full",
];

const SHADOWS = [
  "--ui-p-shadow-sm",
  "--ui-p-shadow-md",
  "--ui-p-shadow-lg",
  "--ui-p-shadow-xl",
];

export function ThemeView() {
  const { theme, resolvedTheme } = useTheme();

  const value = useMemo(() => {
    void resolvedTheme;
    const map = new Map<string, string>();
    for (const variable of readCssVariables()) map.set(variable.name, variable.value);
    return (name: string) => map.get(name) ?? "";
  }, [resolvedTheme]);

  return (
    <div className="lab-content">
      <header className="lab-hero">
        <div className="lab-hero__eyebrow">
          <span className="lab-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}>
            THEME
          </span>
        </div>
        <h1 className="lab-hero__title">Theme &amp; tokens</h1>
        <p className="lab-hero__description">
          Switch appearance and watch every semantic token, type ramp, radius, and elevation update
          instantly.
        </p>
        <div className="lab-row" style={{ marginTop: "var(--ui-p-space-4)" }}>
          <ThemeToggle variant="segmented" />
          <Badge variant="neutral" size="sm">
            preference: {theme}
          </Badge>
          <Badge variant="info" size="sm">
            resolved: {resolvedTheme}
          </Badge>
        </div>
      </header>

      <section className="lab-section">
        <h2 className="lab-section__title">Color roles</h2>
        <div className="lab-token-grid">
          {COLOR_ROLES.map((name) => (
            <div className="lab-token" key={name}>
              <span
                className="lab-token__swatch"
                style={{ background: `var(${name})` }}
                aria-hidden="true"
              />
              <span className="lab-token__meta">
                <span className="lab-token__name">{name}</span>
                <br />
                <span className="lab-token__value">{value(name)}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="lab-section">
        <h2 className="lab-section__title">Type scale</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ui-p-space-3)" }}>
          {TEXT_SIZES.map((token) => (
            <div className="lab-row" key={token} style={{ alignItems: "baseline" }}>
              <span className="lab-token__name" style={{ width: "9rem", flex: "none" }}>
                {token}
              </span>
              <span style={{ fontSize: `var(${token})`, lineHeight: 1.2 }}>
                The quick brown fox
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="lab-section">
        <h2 className="lab-section__title">Radius</h2>
        <div className="lab-row">
          {RADII.map((token) => (
            <div key={token} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span
                style={{
                  width: "4rem",
                  height: "4rem",
                  background: "var(--ui-primary-subtle)",
                  border: "1px solid var(--ui-border)",
                  borderRadius: `var(${token})`,
                }}
              />
              <span className="lab-token__name">{token.replace("--ui-p-radius-", "")}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lab-section">
        <h2 className="lab-section__title">Elevation</h2>
        <div className="lab-row">
          {SHADOWS.map((token) => (
            <div
              key={token}
              style={{
                display: "flex",
                alignItems: "flex-end",
                width: "8rem",
                height: "6rem",
                padding: "0.75rem",
                background: "var(--ui-surface)",
                border: "1px solid var(--ui-border)",
                borderRadius: "var(--ui-p-radius-lg)",
                boxShadow: `var(${token})`,
              }}
            >
              <span className="lab-token__name">{token.replace("--ui-p-shadow-", "")}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
