# @adem.rejeb/component-lab

An interactive Storybook-style app for the [`@adem.rejeb/ui`](../../packages/ui) design system.

## Features

- **Schema-driven playground** — every component is described once in a registry and the lab renders editable controls, a live preview, generated JSX, a props table, and usage notes from it.
- **Live code generation** — as you edit controls, the JSX snippet stays in sync.
- **Component catalog** - all 135 components, grouped by the 10 categories.
- **Command palette** — Ctrl/⌘ + K to jump to any component.
- **Token inspector** — reads the resolved `--ui-*` custom properties from the live document.
- **Theme switcher** — light / dark / system, applied instantly.

## Run

From the repository root:

```bash
npm run dev          # start the dev server (http://localhost:5173)
npm run build:lab    # static production build → dist/
npm run preview      # serve the production build
```

The app aliases `@adem.rejeb/ui` to the library **source** (`packages/ui/src/index.ts`) and `@adem.rejeb/ui/styles.css` to `packages/ui/src/styles/index.css`, so changes to the library are reflected without a rebuild.

## Structure

```
src/
├─ App.tsx               route shell (overview / component / tokens / theme)
├─ main.tsx              entry, wraps the app in ThemeProvider
├─ lab.css               lab chrome styles (separate from library styles)
├─ components/           TopBar, Sidebar, CommandPalette, ControlsPanel,
│                        PropsTable, CodePanel, Playground
├─ views/                OverviewView, ComponentView, TokensView, ThemeView
├─ lib/                  router, jsx codegen, token reader
└─ registry/             ComponentEntry definitions — one file per category
```

## Extending

See [`../../docs/lab.md`](../../docs/lab.md) for the registry contract and a step-by-step guide to adding a component.
