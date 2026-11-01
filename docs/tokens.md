# Tokens

All styling is driven by CSS custom properties, defined in `packages/ui/src/tokens/`. They are organised in three layers so that themes can be swapped without touching component CSS.

```
tokens.css
├─ primitives.css   Layer A — raw values
├─ semantic.css     Layer B — themed roles
└─ component.css    Layer C — per-component knobs
```

## Layer A — primitives

Context-free raw values, prefixed `--ui-p-*`. Components never reference these directly.

| Group | Examples |
| --- | --- |
| Neutral ramp | `--ui-p-neutral-0` … `--ui-p-neutral-950` |
| Accent | `--ui-p-accent-50` … `--ui-p-accent-900` |
| Hues | `--ui-p-green-*`, `--ui-p-amber-*`, `--ui-p-red-*`, `--ui-p-blue-*` |
| Typography | `--ui-p-font-sans`, `--ui-p-font-mono`, `--ui-p-text-3xs` … `--ui-p-text-5xl`, `--ui-p-weight-*`, `--ui-p-leading-*`, `--ui-p-tracking-*` |
| Spacing (4px base) | `--ui-p-space-0-5` … `--ui-p-space-24`, plus `--ui-p-space-px` |
| Radii | `--ui-p-radius-xs` … `--ui-p-radius-2xl`, `--ui-p-radius-full` |
| Borders | `--ui-p-border-thin`, `--ui-p-border-thick` |
| Control heights | `--ui-p-control-xs` … `--ui-p-control-xl` |
| Elevation | `--ui-p-shadow-sm` … `--ui-p-shadow-xl` |
| Motion | `--ui-p-duration-*`, `--ui-p-ease-*` |
| Z-index | `--ui-p-z-base` … `--ui-p-z-max` |
| Layout | `--ui-p-container-*`, `--ui-p-content-measure` |

## Layer B — semantic

Intent-named roles, prefixed `--ui-*`. These are what themes redefine and what components consume.

| Group | Examples |
| --- | --- |
| Surfaces | `--ui-background`, `--ui-background-subtle`, `--ui-surface`, `--ui-surface-raised`, `--ui-surface-overlay`, `--ui-surface-inset` |
| Foreground | `--ui-foreground`, `--ui-muted`, `--ui-muted-strong`, `--ui-subtle` |
| Borders | `--ui-border`, `--ui-border-strong`, `--ui-border-subtle` |
| Primary | `--ui-primary`, `--ui-primary-hover`, `--ui-primary-active`, `--ui-primary-foreground`, `--ui-primary-text`, `--ui-primary-subtle`, `--ui-primary-subtle-foreground` |
| Status | `--ui-success*`, `--ui-warning*`, `--ui-danger*`, `--ui-info*` (each with `-foreground` / `-subtle` / `-subtle-foreground` variants) |
| Focus | `--ui-focus-ring`, `--ui-focus-ring-width`, `--ui-focus-ring-offset` |

`semantic.css` declares the dark theme on `:root` and `[data-theme="dark"]`, and the light theme on `[data-theme="light"]`. Subtle backgrounds are derived with `color-mix(in oklab, …)`.

`--ui-primary` / `--ui-danger` are **fill** colours (they carry white text, e.g. a solid button), so they must stay dark enough for the white label. When the same accent is used as **text** on a surface — links, `--ui-primary` link buttons, stepper error labels — use `--ui-primary-text` / `--ui-danger-text`, which pick a lighter step in the dark theme and match the fill step in light. This keeps every combination at ≥ 4.5:1.

## Layer C — component

Per-component knobs, prefixed with the component name. Examples:

- `--ui-control-radius`, `--ui-control-pad-x-md`, `--ui-control-border-width`, `--ui-control-gap`
- `--ui-button-font-weight`, `--ui-button-focus-ring`
- `--ui-input-pad-x`, `--ui-input-placeholder`
- `--ui-card-pad`, `--ui-card-radius`
- `--ui-overlay-pad`, `--ui-overlay-radius`, `--ui-overlay-shadow`
- `--ui-table-cell-pad-x`, `--ui-table-row-hover`, `--ui-table-row-selected`, `--ui-table-header-bg`
- `--ui-toast-width`, `--ui-toast-radius`
- `--ui-tooltip-bg`, `--ui-tooltip-fg`, `--ui-tooltip-radius`

Override any of these to retune a component without rewriting its CSS:

```css
:root {
  --ui-control-radius: var(--ui-p-radius-full);
  --ui-card-pad: var(--ui-p-space-6);
}
```

## Using tokens in your own CSS

Because every token is a normal custom property, application styles can reuse the system directly:

```css
.my-panel {
  background: var(--ui-surface);
  color: var(--ui-foreground);
  border: var(--ui-p-border-thin) solid var(--ui-border);
  border-radius: var(--ui-p-radius-lg);
  padding: var(--ui-p-space-4);
}
```

## Introspection

The component lab's **Tokens** view reads every `--ui-*` custom property from the live document, classifies it (colour, spacing, radius, …), and renders it. Use it to verify a token exists and to copy its resolved value.
