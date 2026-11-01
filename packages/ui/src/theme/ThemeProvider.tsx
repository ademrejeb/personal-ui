import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { canUseDOM } from "../utilities/dom";
import { useEventCallback } from "../hooks/useEventCallback";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  /** The user's chosen preference, including "system". */
  theme: Theme;
  /** The concrete theme currently applied ("light" or "dark"). */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  /** Switches between light and dark based on the current resolved theme. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  /** localStorage key used to persist the choice. */
  storageKey?: string;
  /** Element that receives the `data-theme` attribute. Defaults to `<html>`. */
  target?: HTMLElement | null;
  /** Suppress CSS transitions during a theme change to avoid color flashing. */
  disableTransitionOnChange?: boolean;
}

function readStoredTheme(storageKey: string): Theme | null {
  if (!canUseDOM()) return null;
  try {
    const value = window.localStorage.getItem(storageKey);
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {
    /* storage may be unavailable (privacy mode, SSR) */
  }
  return null;
}

function getSystemTheme(): ResolvedTheme {
  if (!canUseDOM()) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const TRANSITION_BLOCK = `*,*::before,*::after{transition:none!important}`;

function disableTransitions(target: HTMLElement): () => void {
  const doc = target.ownerDocument;
  const style = doc.createElement("style");
  style.appendChild(doc.createTextNode(TRANSITION_BLOCK));
  doc.head.appendChild(style);
  // The guard is removed on the next frame *and* on cleanup, so removal must be
  // idempotent: a second removeChild would throw and unmount the React tree.
  return () => style.remove();
}

function applyTheme(target: HTMLElement, theme: Theme): void {
  target.setAttribute("data-theme", theme);
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "adem.rejeb-theme",
  target,
  disableTransitionOnChange = true,
}: ThemeProviderProps): ReactNode {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme(storageKey) ?? defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Track system preference changes so `theme === "system"` stays live.
  useEffect(() => {
    if (!canUseDOM()) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystemTheme(mql.matches ? "dark" : "light");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    if (!canUseDOM()) return;
    const el = target ?? document.documentElement;
    const restore = disableTransitionOnChange ? disableTransitions(el) : undefined;
    applyTheme(el, theme);
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      /* ignore write failures */
    }
    // Restore transitions on the next frame so the swap is not animated.
    const raf = requestAnimationFrame(() => restore?.());
    return () => {
      cancelAnimationFrame(raf);
      restore?.();
    };
  }, [theme, target, storageKey, disableTransitionOnChange]);

  const setTheme = useEventCallback((next: Theme) => setThemeState(next));

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const current = prev === "system" ? systemTheme : prev;
      return current === "dark" ? "light" : "dark";
    });
  }, [systemTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Reads and updates the active theme. Must be used within a `ThemeProvider`.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a <ThemeProvider>.");
  }
  return context;
}

/** Non-throwing accessor for optional consumers (e.g. utilities). */
export function useOptionalTheme(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
