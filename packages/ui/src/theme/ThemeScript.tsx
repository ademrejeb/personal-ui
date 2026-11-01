import type { Theme } from "./ThemeProvider";

export interface ThemeScriptProps {
  /** localStorage key used by `ThemeProvider`. */
  storageKey?: string;
  /** Theme applied when nothing is stored. */
  defaultTheme?: Theme;
  /** CSP nonce for the inline script. */
  nonce?: string;
}

/** JSON-encode a value for safe embedding inside an inline script. */
function serialize(value: string): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * Inline script that applies the stored theme before the first paint. Render it
 * once in the document head (Next.js `app/layout.tsx`, `pages/_document.tsx`) to
 * prevent a light/dark flash on SSR pages.
 *
 * It reads the same key and writes the same `data-theme` attribute as
 * `ThemeProvider`, so the two stay in sync.
 */
export function ThemeScript({
  storageKey = "personal-ui-theme",
  defaultTheme = "system",
  nonce,
}: ThemeScriptProps) {
  const script = `(function(){try{var k=${serialize(storageKey)};var d=${serialize(
    defaultTheme,
  )};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"&&t!=="system")t=d;document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: script }} />;
}
