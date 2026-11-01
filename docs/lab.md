# The component lab

The lab (`apps/component-lab`) is a Storybook-style Vite app for browsing, exercising, and documenting the design system. It reads a central **registry** and renders everything from it — the catalog, the playground, generated code, and prop tables all come from the same source of truth.

## Running it

```bash
npm run dev          # http://localhost:5173
npm run build:lab    # static build into apps/component-lab/dist
npm run preview      # serve the production build
```

## Views

| Route | What it does |
| --- | --- |
| Overview | Lists every category and its components. |
| Component | A live playground: editable controls on the left, preview + generated code on the right, plus a props table and notes. |
| Tokens | Reads every `--ui-*` custom property from the live document and groups them. |
| Theme | Switches between light / dark / system and shows the effect immediately. |

Press **Ctrl/⌘ + K** (or click the search control) to open the command palette and jump to any component.

## How the registry works

Each entry is a `ComponentEntry` (`src/registry/types.ts`):

```ts
import type { ComponentEntry } from "./types";

export const myEntries: ComponentEntry[] = [
  {
    id: "button",
    name: "Button",
    category: "Actions",
    description: "Triggers an action.",
    keywords: ["cta", "action"],
    children: "Click me",
    controls: [
      { name: "variant", type: "select", defaultValue: "primary",
        options: [ { label: "Primary", value: "primary" },
                   { label: "Ghost", value: "ghost" } ] },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Button variant={pick(state, "variant", "primary")} disabled={bool(state, "disabled")}>
        {str(state, "children", "Click me")}
      </Button>
    ),
    props: [
      { name: "variant", type: "'primary' | 'ghost'", default: "'primary'", description: "Visual style." },
    ],
    notes: ["Button renders a native <button>."],
  },
];
```

### Control types

`text`, `textarea`, `number`, `boolean`, `select`. Each control declares a `defaultValue`; `initialState(entry)` builds the starting playground state from the schema.

### Reading state

Helpers in `src/registry/demo.ts`:

- `str(state, key, fallback)` — string value.
- `bool(state, key, fallback)` — boolean value.
- `num(state, key, fallback)` — number value.
- `pick(state, key, fallback)` — enumerable value (typed by the fallback literal).

> `pick`'s return type is the literal type of `fallback`, so comparing it to a different literal needs a cast: `(pick(state, "variant", "primary") as string) === "ghost"`.

### Code generation

If an entry omits `code`, the lab generates JSX from the current state via `generateCode` (`src/lib/jsx.ts`). Formatting rules: numbers render as `{n}`; strings starting with `<`, `{`, or `[` render as raw `{…}` expressions; other strings are JSON-quoted. Provide a `code` function for hand-authored or multi-part snippets.

## Adding a component

1. Add a `ComponentEntry` to the appropriate category file in `src/registry/`.
2. If the category file is new, add its entries array to `src/registry/index.ts` (the aggregator that flattens the registry, powers search, and exposes `getEntry` / `groupedRegistry`).
3. Run the lab — the component appears automatically in the catalog, command palette, and playground.

The registry integrity test (`tests/lab/registry.test.tsx`) checks that every entry has a unique id, a description, the required fields, and that its `render` produces output, so a malformed entry fails CI rather than the UI.
