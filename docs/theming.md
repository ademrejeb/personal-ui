# Theming

The theme is expressed as a `data-theme` attribute on `<html>` (or any element you choose). All component styling derives from the semantic tokens in that scope, so switching the attribute restyles the whole tree.

## ThemeProvider

```tsx
import { ThemeProvider } from "@personal-ui/ui";
import "@personal-ui/ui/styles.css";

<ThemeProvider defaultTheme="dark">
  <App />
</ThemeProvider>;
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultTheme` | `"light" \| "dark" \| "system"` | `"system"` | Used when nothing is stored. |
| `storageKey` | `string` | `"personal-ui-theme"` | `localStorage` persistence key. |
| `target` | `HTMLElement \| null` | `<html>` | Receives `data-theme`. |
| `disableTransitionOnChange` | `boolean` | `true` | Injects a temporary `transition: none` rule during the swap to avoid colour flashing. |

The provider also listens to `prefers-color-scheme` so that `theme === "system"` resolves live when the OS changes.

## useTheme

```tsx
const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
```

- `theme` — the preference, including `"system"`.
- `resolvedTheme` — the concrete `"light"` or `"dark"` in effect.
- `setTheme(next)` — set the preference (`"light"`, `"dark"`, or `"system"`).
- `toggleTheme()` — flip between light and dark.

`useOptionalTheme()` returns `null` outside a provider instead of throwing — useful for utilities.

A ready-made control is available as the `ThemeToggle` component.

## SSR and first paint

On server-rendered pages, the HTML is painted before React hydrates. Render
`ThemeScript` once in the document head so the stored preference is applied to
`<html data-theme>` before that first paint:

```tsx
import { ThemeProvider, ThemeScript } from "@personal-ui/ui";

<html lang="en" suppressHydrationWarning>
  <head>
    <ThemeScript />
  </head>
  <body>
    <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
  </body>
</html>;
```

`ThemeScript` uses the same `storageKey` and `defaultTheme` defaults as
`ThemeProvider`; pass the same values to both when customising them. See
[`nextjs.md`](nextjs.md) for App Router and Pages Router examples.

## Theme resolution order

1. `[data-theme="dark"]` or `[data-theme="light"]` — an explicit choice.
2. No attribute, or `[data-theme="system"]` — follows `prefers-color-scheme`.
3. Default is **dark** (the canonical default).

## Customising a theme

Because themes only redefine Layer B tokens, you can retune the palette without touching component CSS. For example, to warm up the dark surface colours:

```css
[data-theme="dark"] {
  --ui-surface: #14110f;
  --ui-surface-raised: #1c1815;
  --ui-border: #2b2521;
}
```

To add a whole new named theme, define its tokens under a new attribute value and point `target`/`data-theme` at it:

```css
[data-theme="midnight"] {
  --ui-background: #05060a;
  --ui-surface: #0b0e17;
  --ui-primary: #7c8cff;
  /* …all Layer B roles… */
}
```

Then render with that value. See [`tokens.md`](tokens.md) for the full list of Layer B roles.

A custom theme must keep both contrast pairs intact: white text on the `--ui-primary` / `--ui-danger` **fills**, and the `--ui-primary-text` / `--ui-danger-text` variants against the surfaces they sit on. `tests/e2e/a11y.spec.ts` is the gate.

## Reduced motion

Components respect user preferences where motion is involved. The `useReducedMotion()` hook exposes `prefers-reduced-motion` when you need it in custom code.
