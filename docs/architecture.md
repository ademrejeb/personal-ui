# Architecture

The repository is an npm-workspaces monorepo with two publishable-facing units and a shared test suite.

```
packages/ui              @adem.rejeb/ui         the design system library
apps/component-lab       @adem.rejeb/component-lab   the showcase / playground
tests/                   Vitest suites and Playwright specs
```

## The library (`packages/ui`)

### Layered source

| Folder | Responsibility |
| --- | --- |
| `src/tokens/` | CSS custom properties in three layers (A primitives → B semantic → C component). Source of truth for every design decision. |
| `src/styles/` | `reset.css`, `base.css`, and one stylesheet per component category. |
| `src/components/` | React components, grouped by category. |
| `src/hooks/` | Reusable headless behaviour (floating positioning, focus trap, scroll lock, media queries, `useSelection`, …). |
| `src/utilities/` | Pure helpers (`cx`, focus, DOM, positioning, ARIA ids, polymorphism, `selection`, `compare`, `date`, `format`). |
| `src/primitives/` | Cross-cutting building blocks: `Portal` and `FloatingLayer` (the single portaled, positioned, dismissible layer used by every overlay, picker, and select control). |
| `src/theme/` | `ThemeProvider` and theme context. |

### Build pipeline

```
vite build                       → dist/index.js (ES, externals: react, react-dom,
                                    react/jsx-runtime, lucide-react)
tsc -p tsconfig.build.json       → dist/index.d.ts (declarations)
node scripts/build-css.mjs       → dist/styles.css (inlined @import graph)
                                    dist/tokens.css (tokens only)
```

The library ships **JavaScript plus plain CSS**. There is no CSS-in-JS runtime and no CSS modules; consumers import `@adem.rejeb/ui/styles.css` once and every component class is globally available. This keeps the runtime footprint minimal and makes theming a matter of overriding custom properties.

### Component conventions

- **`forwardRef` everywhere** so consumers can attach refs to the rendered DOM node.
- **Compound components** are assembled with `Object.assign(Root, { Sub })` and re-exported both ways: `Card` carries `Card.Header`, etc., and each part is also a named export.
- **Polymorphism** is limited to layout/typography primitives via an `as` prop (`polymorphicForwardRef`). Interactive controls render native elements and do not accept `as`.
- **No `asChild`.** Composition is done with explicit props and children.
- **Class names** follow `ui-<block>__<element>--<modifier>` BEM, all namespaced with `ui-`.

### Shared types

`ControlSize`, `Size`, `Status`, `Align`, `Justify`, and `Space` live in `src/types.ts` and are re-exported from the root.

## The component lab (`apps/component-lab`)

A Vite single-page app that documents and exercises the library.

- **Registry** (`src/registry/`): one file per category. Each `ComponentEntry` describes a component — its controls, default `render`, generated `code`, prop docs, and notes. The lab renders whatever the registry declares, so adding a component entry is enough to make it appear in the catalog and playground.
- **Codegen** (`src/lib/jsx.ts`): renders an entry's current control values into readable JSX, formatting numbers as `{n}` and expression strings (`<`, `{`, `[`) as raw `{…}`.
- **Router** (`src/lib/router.ts`): a tiny hash router with `overview`, `tokens`, `theme`, and `component/:id` routes.
- **Token inspector** (`src/lib/tokens.ts`): reads the live CSS custom properties off `document.documentElement` and groups/classifies them.

The lab imports the library through Vite aliases (`@adem.rejeb/ui` → library source, `@adem.rejeb/ui/styles.css` → `styles/index.css`), so it always reflects the current source.

## Testing

- **Vitest + Testing Library (jsdom)** for components and the registry. `tests/setup.ts` installs `jest-dom` matchers and jsdom polyfills (`HTMLDialogElement`, `matchMedia`, `requestAnimationFrame`).
- **Playwright** for the lab's end-to-end flows, run against a production build served by `vite preview`.
