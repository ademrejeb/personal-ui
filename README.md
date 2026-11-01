# Personal UI

A premium, accessible, token-driven React 19 + TypeScript design system, bundled with an interactive Storybook-style component lab.

- **`@adem.rejeb/ui`** - the library: 135 components across 10 categories, hand-written CSS, zero runtime dependencies beyond `react`, `react-dom`, and `lucide-react`.
- **`@adem.rejeb/component-lab`** — a Vite app with a schema-driven playground, live JSX code generation, a component catalog, a token inspector, and a theme switcher.

## Stack

| Concern | Choice |
| --- | --- |
| Runtime | React 19 (`forwardRef` throughout) |
| Language | TypeScript (strict) |
| Styling | Hand-written global CSS with `ui-` prefixed BEM classes and CSS custom-property tokens |
| Icons | `lucide-react` (individual imports, tree-shakeable) |
| Build | Vite (library mode) + a small CSS inliner script |
| Unit tests | Vitest + Testing Library + jsdom |
| E2E tests | Playwright (Chromium) |
| Lint / format | ESLint (flat config) + Prettier |

No component framework (Radix, MUI, Ant, Chakra, Mantine, …) and no utility CSS framework (Tailwind) is used — everything is authored in-house.

## Repository layout

```
ui/
├─ packages/ui/            @adem.rejeb/ui
│  ├─ src/tokens/          CSS custom properties (source of truth)
│  ├─ src/styles/          reset, base, and 9 component stylesheets
│  ├─ src/components/      layout, typography, actions, forms, feedback,
│  │                       overlays, navigation, data-display, application
│  ├─ src/hooks/           useFloating, useFocusTrap, useScrollLock, …
│  ├─ src/utilities/       cx, dom, focus, position, polymorphic, aria, …
│  ├─ src/primitives/      Portal
│  └─ scripts/build-css.mjs
├─ apps/component-lab/     @adem.rejeb/component-lab
│  └─ src/registry/        one file per category documenting all 135 components
├─ tests/                  Vitest suites (+ tests/e2e Playwright specs)
└─ docs/                   Architecture, theming, component catalog, lab guide
```

## Quick start

```bash
npm install          # installs all workspaces
npm run dev          # start the component lab at http://localhost:5173
```

Other scripts:

```bash
npm run build        # build the library, then the lab
npm run build:ui     # build @adem.rejeb/ui only (JS + styles.css + tokens.css)
npm run build:lab    # build the lab (static site)
npm run preview      # preview the built lab
npm run test         # Vitest unit + integration suites
npm run test:e2e     # Playwright end-to-end (requires: npx playwright install chromium)
npm run typecheck    # tsc across the workspace
npm run lint         # ESLint
npm run manifest     # regenerate docs/manifest.json from the lab registry
npm run format       # Prettier write
npm run clean        # remove dist artifacts
```

## Using the library

```tsx
import { ThemeProvider, Button, Card, CardHeader, Stack } from "@adem.rejeb/ui";
import "@adem.rejeb/ui/styles.css";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Card>
        <CardHeader title="Welcome" />
        <Stack gap={3}>
          <Button variant="primary">Get started</Button>
        </Stack>
      </Card>
    </ThemeProvider>
  );
}
```

See [`packages/ui/README.md`](packages/ui/README.md) for the full API surface and [`docs/`](docs/) for deeper guides. Next.js setup is covered in [`docs/nextjs.md`](docs/nextjs.md).

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — how the library and lab fit together.
- [`docs/nextjs.md`](docs/nextjs.md) — App Router and Pages Router setup, SSR theming, and client boundaries.
- [`docs/theming.md`](docs/theming.md) — themes, `data-theme`, and dark mode.
- [`docs/tokens.md`](docs/tokens.md) — the token system and naming conventions.
- [`docs/components.md`](docs/components.md) — the component catalog with import paths.
- [`docs/lab.md`](docs/lab.md) — using and extending the component lab.
- [`docs/agent-tooling.md`](docs/agent-tooling.md) — Graphify and Ponytail setup for coding agents.

## License

MIT
