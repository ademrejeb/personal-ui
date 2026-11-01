# @personal-ui/ui

A premium, accessible, token-driven React 19 design system.

- **135 components** across 10 categories, all `forwardRef`-enabled and tree-shakeable.
- **Zero styling framework** — hand-written CSS driven entirely by CSS custom-property tokens.
- **Dark mode by default**, with `light`, `dark`, and `system` modes.
- **A11y-first** — semantic markup, focus management, and ARIA wiring baked in.
- **Next.js ready** — the published bundle declares `"use client"` and ships an SSR theme script.

## Install

```bash
npm install @personal-ui/ui react react-dom lucide-react
```

`react`, `react-dom`, and `lucide-react` are peer dependencies (`react`/`react-dom` `^19`).

## Styles

Import the theme once, at your app entry:

```ts
import "@personal-ui/ui/styles.css"; // reset + tokens + all component styles
```

or, if you only want the design tokens (bring your own reset):

```ts
import "@personal-ui/ui/tokens.css";
```

The stylesheet is plain CSS with no preprocessor. Everything is scoped by `ui-` prefixed BEM class names, so it will not collide with your application styles.

## Next.js

The package is a drop-in for the App Router and the Pages Router. See
[`../../docs/nextjs.md`](../../docs/nextjs.md) for full examples.

```tsx
// app/layout.tsx
import "@personal-ui/ui/styles.css";
import { ThemeProvider, ThemeScript } from "@personal-ui/ui";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider defaultTheme="system">{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

The published entry starts with `"use client"`, so no `transpilePackages`, CSS
loader, or provider wrapper is required.

## Usage

```tsx
import { ThemeProvider } from "@personal-ui/ui";
import "@personal-ui/ui/styles.css";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      {/* your app */}
    </ThemeProvider>
  );
}
```

Then use components anywhere below the provider:

```tsx
import { Button, Card, CardHeader, Stack, Text } from "@personal-ui/ui";

<Card>
  <CardHeader title="Team" subtitle="3 members" />
  <Stack gap={4}>
    <Text tone="muted">Invite teammates to collaborate.</Text>
    <Button variant="primary">Invite</Button>
  </Stack>
</Card>;
```

## Theming

`ThemeProvider` manages the active theme and writes a `data-theme` attribute (`"light"` or `"dark"`) onto `<html>` (configurable via `target`).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultTheme` | `"light" \| "dark" \| "system"` | `"system"` | Initial preference when nothing is stored. |
| `storageKey` | `string` | `"personal-ui-theme"` | `localStorage` key for persistence. |
| `target` | `HTMLElement \| null` | `<html>` | Element that receives `data-theme`. |
| `disableTransitionOnChange` | `boolean` | `true` | Suppress color transitions during swaps. |

Read and control it with `useTheme()`:

```tsx
const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
```

`useOptionalTheme()` returns `null` instead of throwing when used outside a provider.

See [`../../docs/theming.md`](../../docs/theming.md) and [`../../docs/tokens.md`](../../docs/tokens.md).

## Components

Every component is exported from the package root. Compound components expose their parts as static members (e.g. `Card.Header`, `Tabs.List`) and are also individually importable.

### Layout
`Affix` · `AspectRatio` · `Box` · `Card` · `Container` · `Divider` · `Flex` · `Grid` · `Masonry` · `ScrollArea` · `SplitPane` · `Stack` · `Surface` · `VisuallyHidden` · `Watermark`

### Typography
`Blockquote` · `Code` · `CodeBlock` · `Heading` · `Kbd` · `Label` · `Link` · `Text` · `Truncate`

### Actions
`Button` · `IconButton` · `ButtonGroup` · `ToggleButton` · `ToggleGroup` · `CopyButton` · `FloatButton`

### Forms
`Checkbox` · `Fieldset` · `FormActions` · `FormField` · `InlineEdit` · `Input` · `InputGroup` · `InputOTP` · `Mentions` · `NumberInput` · `PasswordInput` · `RadioGroup` · `SearchInput` · `Select` · `Slider` · `Switch` · `Textarea`

### Feedback
`Alert` · `CircularProgress` · `EmptyState` · `InlineMessage` · `LoadingOverlay` · `Meter` · `Notification` · `Progress` · `Result` · `Skeleton` · `Spinner` · `StatusIndicator` · `Toast`

### Overlays
`AlertDialog` · `DropdownMenu` · `Modal` · `Popover` · `Popconfirm` · `Sheet` · `Tooltip` · `Tour`

> Note: `Popover` is **not** compound — use the named exports `PopoverTrigger` and `PopoverContent`.

### Navigation
`Accordion` · `Anchor` · `Breadcrumbs` · `Pagination` · `Stepper` · `Tabs`

### Data display
`Attachment` · `Avatar` · `Badge` · `Bubble` · `DataTable` · `DescriptionList` · `Image` · `Item` · `List` · `MessageScroller` · `RelativeTime` · `Sparkline` · `StatCard` · `Table` · `Tag` · `Timeline`

### Application
`ActivityFeed` · `PageHeader` · `PageShell` · `SettingsSection` · `ThemeToggle` · `Toolbar` · `VersionBadge`

For interactive prop tables and live previews of every component, run the component lab (`npm run dev`). See [`../../docs/components.md`](../../docs/components.md) for the catalog with import paths.

## Shared types

```ts
import type { ControlSize, Size, Status, Align, Justify, Space } from "@personal-ui/ui";
```

- `ControlSize = "xs" | "sm" | "md" | "lg" | "xl"`
- `Size = "sm" | "md" | "lg"`
- `Status = "neutral" | "success" | "warning" | "danger" | "info"`

## Hooks

`useControllableState`, `useDisclosure`, `useEventCallback`, `useMergedRefs`, `useIsomorphicLayoutEffect`, `useMediaQuery`, `useReducedMotion`, `useBreakpoint`, `useCopyToClipboard`, `useDebouncedValue`, `useOutsideInteraction`, `useClickOutside`, `useEscapeKey`, `useFocusTrap`, `useScrollLock`, `useFloating`, `useInlineEdit`, `useSplitPane`.

Headless hooks return state plus ready-to-spread prop bags, so you can build a
custom presentation without reimplementing behavior:

```tsx
const { open, onToggle, setOpen } = useDisclosure();
const { editing, begin, commit, inputProps, triggerProps } = useInlineEdit();
const { size, handleProps, containerRef } = useSplitPane({ defaultSize: 40 });
```

## Utilities

`cx`, `canUseDOM`, `contains`, `getFocusableElements`, `getOwnerDocument`, `getOwnerWindow`, `isHTMLElement`, `mergeRefs`, `copyText`, `debounce`, `throttle`, `focusFirst`, `focusElement`, `restoreFocus`, `trapTabKey`, `computePosition`, `mergeDescribedBy`, `idSuffix`, `optionId`, `spaceVar`, `alignToCss`, `justifyToCss`, `formatRelativeTime`.

## Polymorphism

Layout and typography primitives accept an `as` prop:

```tsx
<Text as="span">Inline</Text>
<Stack as="ul" gap={2}>{/* … */}</Stack>
```

Actions and form controls render native `<button>` / `<input>` elements and do not support `as`.

## License

MIT
