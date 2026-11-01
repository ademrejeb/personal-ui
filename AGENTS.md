# AGENTS.md

Guidance for agents and humans working in this repository.

## What this is

A personal React 19 + TypeScript design system (`@personal-ui/ui`) plus an
interactive documentation app (`@personal-ui/component-lab`). It is a single npm
workspaces monorepo.

```
packages/ui/                 the library (source of truth for components + CSS)
apps/component-lab/          the docs / playground app
tests/                       Vitest + Testing Library suites
docs/                        architecture, tokens, theming, audit, manifest
scripts/                     build-css.mjs, build-manifest.mjs
```

## Commands

Run from the repository root.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Component lab dev server (http://localhost:5173). |
| `npm run build` | Build the library **and** the lab. |
| `npm run build:ui` | Build only `@personal-ui/ui` (JS + `dist/styles.css` + `dist/tokens.css`). |
| `npm run build:lab` | Build only the lab. |
| `npm run preview` | Preview the built lab (port 4173, used by Playwright). |
| `npm test` | Run the full Vitest suite once. |
| `npm run test:watch` | Vitest in watch mode. |
| `npm run test:e2e` | Playwright end-to-end suite. |
| `npm run typecheck` | `tsc --noEmit` across the whole monorepo (includes tests + lab). |
| `npm run lint` | ESLint (flat config) across the repo. |
| `npm run manifest` | Regenerate `docs/manifest.json` from the lab registry. |

**Definition of done for any change:** `npm run typecheck`, `npm run lint`,
`npm test`, and `npm run build` all pass.

## Conventions

- **No CSS-in-JS, no Tailwind, no component frameworks.** Styling is global,
  hand-written, token-driven CSS. Components own BEM-ish class names prefixed
  with `ui-` (`ui-card__title`, `ui-button--ghost`).
- **Tokens are the only source of colours, spacing, radii, type, and motion.**
  Never hard-code a hex, px radius, or ms duration. See `docs/tokens.md`.
  Layers: A primitives (`--ui-p-*`), B semantic (`--ui-*`, theme-aware),
  C component (`--ui-<comp>-*`). Dark is the default theme; `data-theme` on
  `<html>` switches between `light`, `dark`, and `system`.
- **`forwardRef` for every component.** Compound components are assembled with
  `Object.assign(Root, { Sub })` and subcomponents read shared state from a
  local `createContext`. There is no `asChild`; the polymorphic `as` prop exists
  only on layout/typography primitives via `polymorphicForwardRef`.
- **Styles live in one place per feature area**: `packages/ui/src/styles/components/*.css`.
  Import tokens and components through the documented entry points; never reach
  into another module's internals.
- **Icons come from `lucide-react`** as individual named imports, or through the
  `Icon` wrapper + `iconRegistry` for the curated set.
- **Every overlays/picker/select popup is a `FloatingLayer`** (`primitives/FloatingLayer.tsx`).
  It owns Portal + `useFloating` positioning, outside/Escape dismissal, focus
  return, and auto-focus; pass the trigger's ref as `anchorRef` and keep the
  component's own keyboard model. Do not hand-roll positioning or dismissal.

## TypeScript gotchas

- Strict mode with `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch`, and `verbatimModuleSyntax` — use `import type`
  for type-only imports.
- `useFloating` returns `RefObject<HTMLElement | null>`, which is **not**
  assignable to `Ref<HTMLDivElement>`. Use a callback ref:
  `ref={(node) => { anchorRef.current = node; }}`.
- Empty `interface X extends Y {}` triggers `no-empty-object-type`; use a
  `type X = Y` alias instead.

## Testing notes

- `tests/` mirrors the source layout (`tests/components`, `tests/utilities`);
  `tests/e2e` holds the Playwright suites.
- The lab registry has a contract test that renders **every** entry through the
  theme provider and asserts code generation output; a new lab demo must not
  throw in jsdom.
- jsdom has no layout engine — never assert on measured geometry in unit tests.
- `tests/e2e/a11y.spec.ts` runs axe-core (from `node_modules/axe-core`) in a real
  browser: a curated sample in every project plus **every** manifest component on
  chromium. A new component must clear it. The three document-level landmark
  uniqueness rules are disabled on purpose — the lab is one page that nests demo
  `<main>` elements. Report callout text, not just failures, when adding rules.
- `tests/e2e/visual.spec.ts` keeps committed chromium baselines for the
  responsive layout components (Navbar/Sidebar/Stepper × desktop/tablet/mobile).
  Regenerate deliberately with `npx playwright test --project=chromium
  tests/e2e/visual.spec.ts --update-snapshots` and eyeball the diff.

## Accessibility & contrast

- `--ui-primary` / `--ui-danger` are **fill** colours (white text on top): they
  must stay dark enough for a 4.5:1 white label. When you need the same accent as
  **text** on a surface (links, link-buttons, error labels) use
  `--ui-primary-text` / `--ui-danger-text`, which step lighter in the dark theme.
  Every combination must clear 4.5:1 — the axe suite enforces it.

## Adding a component

1. Implement `packages/ui/src/components/<area>/<Name>.tsx`, export from that
   area's `index.ts` (root `src/index.ts` re-exports each area).
2. Add CSS to the matching `styles/components/*.css`.
3. Add tests under `tests/`.
4. Add a lab demo entry in `apps/component-lab/src/registry/<area>.tsx` with
   `props`/`notes`, then run `npm run manifest`.
5. Run the full verification set above.

## Documentation

`docs/audit.md` tracks the phased upgrade checklist and current status; keep it
current. `docs/manifest.json` is generated — do not edit it by hand.

## Working style (Ponytail)

The repo vendors the Ponytail ruleset as a project skill
(`.opencode/skills/ponytail/SKILL.md`, MIT). Apply it to every coding task:
understand the code the change touches, then take the smallest change that fully
solves the task.

- Reuse existing components, tokens, helpers, and patterns before writing new
  code. Do not add a dependency for a few lines.
- No unrequested abstractions, options, config, or "for later" code. Deletion
  beats addition; keep the repo's existing structure.
- Never cut validation at trust boundaries, error handling that prevents data
  loss, security, accessibility, or tests for non-trivial logic.
- Mark a deliberate shortcut with `shortcut: <limit>, <when to upgrade>`.
- `/ponytail lite|full|ultra|off` switches intensity; `/ponytail-review` and
  `/ponytail-audit` review a diff or the whole repo.

## Graphify

The repo has a local code knowledge graph at `graphify-out/` (generated, not
committed). The project-scoped skill lives in `.opencode/skills/graphify/`
(Apache-2.0 / MIT), with a first-shell-command reminder plugin in
`.opencode/plugins/graphify.js`.

- Build or refresh it with `npm run graph:update` (wraps
  `python -m graphify update .`; AST-only, no LLM, no API key).
- Before grepping for a codebase question, run
  `npm run graph:query -- "<question>"`. Use `npm run graph:explain -- "<concept>"`
  and `npm run graph:path -- "A" "B"` for focused relationships.
- If the CLI is on PATH, the equivalent commands are `graphify query`,
  `graphify explain`, `graphify path`, and `graphify update .`.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review, and
  `graphify-out/wiki/index.md` if a wiki was exported.
- After changing code, run `npm run graph:update` so the graph stays current.
- Setup and rationale: `docs/agent-tooling.md`.
