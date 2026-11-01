# Using Personal UI with Next.js

`@adem.rejeb/ui` ships a single ESM bundle that starts with `"use client"` and
externalises `react`, `react-dom`, and `lucide-react`. That means Next.js treats
the package as a client boundary automatically — no `transpilePackages`, custom
webpack config, or CSS-in-JS setup is required.

## Install

```bash
npm install @adem.rejeb/ui react react-dom lucide-react
```

## App Router

Import the stylesheet once in the root layout, render `ThemeScript` in the head
so the stored theme is applied before first paint, and wrap the app in
`ThemeProvider`.

```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import "@adem.rejeb/ui/styles.css";
import { ThemeProvider, ThemeScript } from "@adem.rejeb/ui";

export default function RootLayout({ children }: { children: ReactNode }) {
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

Then use components in any page or component:

```tsx
// app/page.tsx
import { Button, Card, CardHeader, Stack, Text } from "@adem.rejeb/ui";

export default function Page() {
  return (
    <Card>
      <CardHeader title="Team" subtitle="3 members" />
      <Stack gap={4}>
        <Text tone="muted">Invite teammates to collaborate.</Text>
        <Button variant="primary">Invite</Button>
      </Stack>
    </Card>
  );
}
```

`ThemeScript` reads the same `localStorage` key and writes the same `data-theme`
attribute as `ThemeProvider`, so there is no light/dark flash on first load. Pass
`storageKey` and `defaultTheme` to both if you customise them.

### Server Components

The whole package is a client boundary, so importing a component into a Server
Component is fine: Next.js renders it on the client. Keep data fetching in the
Server Component and pass plain, serialisable props down.

```tsx
// app/users/page.tsx (Server Component)
import { UserTable } from "./user-table";

export default async function UsersPage() {
  const users = await getUsers();
  return <UserTable users={users} />;
}
```

```tsx
// app/users/user-table.tsx (Client Component)
"use client";

import { DataTable } from "@adem.rejeb/ui";

export function UserTable({ users }: { users: User[] }) {
  return <DataTable rows={users} columns={columns} />;
}
```

Event handlers, hooks, and controlled state must live in a Client Component (or a
file that imports them). Components that only render markup can stay in Server
Components.

## Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import "@adem.rejeb/ui/styles.css";
import { ThemeProvider } from "@adem.rejeb/ui";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

```tsx
// pages/_document.tsx
import { Head, Html, Main, NextScript } from "next/document";
import { ThemeScript } from "@adem.rejeb/ui";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <ThemeScript />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

## Styles

- `@adem.rejeb/ui/styles.css` — reset, tokens, base, and every component style.
  Import it once at the app entry.
- `@adem.rejeb/ui/tokens.css` — tokens only, if you bring your own reset.

Global CSS imports are supported in the App Router root layout and in
`pages/_app.tsx`. Do not import the stylesheet from a component that may render
more than once.

## Theming

```tsx
"use client";

import { useTheme } from "@adem.rejeb/ui";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <select value={theme} onChange={(event) => setTheme(event.target.value as "light" | "dark" | "system")}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}
```

`ThemeProvider` writes `data-theme` onto `<html>` by default. If you need a
different target, pass `target`.

## Headless components

Interactive components pair a styled wrapper with a headless hook. Use the hook
when you need different markup but the same behavior:

```tsx
"use client";

import { useDisclosure } from "@adem.rejeb/ui";

export function Details() {
  const { open, onToggle } = useDisclosure();
  return (
    <>
      <button type="button" onClick={onToggle} aria-expanded={open}>
        Details
      </button>
      {open ? <div>Custom panel</div> : null}
    </>
  );
}
```

Available hooks include `useDisclosure`, `useInlineEdit`, `useSplitPane`,
`useSelection`, `useTree`, `useCascader`, `useTransfer`, `useInputMask`,
`useColorPicker`, `useCarousel`, and `useHoverCard`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Styles are missing | Import `@adem.rejeb/ui/styles.css` once in the root layout or `_app.tsx`. |
| Light flash before hydration | Render `ThemeScript` in the document head. |
| “useState only works in a Client Component” | Add `"use client"` to the file that owns the hook or event handler, or move that component into its own client file. |
| Icons are missing | Install `lucide-react`; it is a required peer dependency. |
| Theme does not change | Confirm `ThemeProvider` is above the component and only one provider is mounted. |
