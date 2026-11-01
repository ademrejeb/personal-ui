import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useTheme, type Theme } from "../../theme/ThemeProvider";
import { ToggleGroup, ToggleGroupItem } from "../actions/ToggleGroup";
import { Button } from "../actions/Button";

export interface ThemeToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** "icon" cycles light/dark; "system" adds a system option in a segmented group. */
  variant?: "icon" | "segmented";
  showLabel?: boolean;
}

const LABELS: Record<Theme, string> = { light: "Light", dark: "Dark", system: "System" };

/**
 * Cycles or selects the active theme. Reads and writes through `useTheme`, so
 * it must be rendered within a `ThemeProvider`.
 */
export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(function ThemeToggle(
  { className, variant = "icon", showLabel = false, ...rest },
  ref,
) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === "segmented") {
    return (
      <ToggleGroup
        type="single"
        value={theme}
        onValueChange={(value) => setTheme((value || "system") as Theme)}
        aria-label="Color theme"
        className={cx("ui-theme-toggle", className)}
      >
        <ToggleGroupItem value="light" aria-label="Light theme">
          <Sun size={16} aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" aria-label="Dark theme">
          <Moon size={16} aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="system" aria-label="System theme">
          <Monitor size={16} aria-hidden="true" />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }

  const icon: ReactNode = resolvedTheme === "dark" ? <Moon size={16} /> : <Sun size={16} />;
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className={cx("ui-theme-toggle", className)}
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme (currently ${LABELS[theme]})`}
      {...rest}
    >
      <span className="ui-theme-toggle__icon" aria-hidden="true">
        {icon}
      </span>
      {showLabel ? <span>{LABELS[theme]}</span> : null}
    </Button>
  );
});
ThemeToggle.displayName = "ThemeToggle";
