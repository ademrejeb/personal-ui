import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";

interface TabsContextValue {
  baseId: string;
  value: string | undefined;
  setValue: (value: string) => void;
  orientation: "horizontal" | "vertical";
  activationMode: "automatic" | "manual";
  register: (value: string) => () => void;
  tabbable: (value: string) => boolean;
}

const TabsContext = createContext<TabsContextValue | null>(null);
const useTabs = (): TabsContextValue => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs subcomponents must be used within a <Tabs>.");
  return ctx;
};

const tabId = (baseId: string, value: string): string => `${baseId}-tab-${value}`;
const panelId = (baseId: string, value: string): string => `${baseId}-panel-${value}`;

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  /** "automatic" selects a tab when it receives focus; "manual" requires activation. */
  activationMode?: "automatic" | "manual";
}

function TabsRoot({
  className,
  value,
  defaultValue = "",
  onValueChange,
  orientation = "horizontal",
  activationMode = "automatic",
  children,
  ...rest
}: TabsProps): ReactNode {
  const baseId = useId();
  const [order, setOrder] = useState<string[]>([]);
  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const register = useCallback((tabValue: string) => {
    setOrder((prev) => (prev.includes(tabValue) ? prev : [...prev, tabValue]));
    return () => setOrder((prev) => prev.filter((v) => v !== tabValue));
  }, []);

  const tabbableValue = selected || order[0];

  const context = useMemo<TabsContextValue>(
    () => ({
      baseId,
      value: selected || undefined,
      setValue: setSelected,
      orientation,
      activationMode,
      register,
      tabbable: (tabValue) => tabValue === tabbableValue,
    }),
    [baseId, selected, setSelected, orientation, activationMode, register, tabbableValue],
  );

  return (
    <TabsContext.Provider value={context}>
      <div
        data-orientation={orientation}
        className={cx("ui-tabs", `ui-tabs--${orientation}`, className)}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export const TabsList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TabsList(
  { className, onKeyDown, ...rest },
  ref,
) {
  const { orientation, activationMode, setValue } = useTabs();

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const keys = [nextKey, prevKey, "Home", "End"];
    if (!keys.includes(event.key)) return;

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    );
    if (tabs.length === 0) return;
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    let targetIndex = current;
    if (event.key === nextKey) targetIndex = (current + 1) % tabs.length;
    if (event.key === prevKey) targetIndex = (current - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") targetIndex = 0;
    if (event.key === "End") targetIndex = tabs.length - 1;
    const target = tabs[targetIndex];
    if (!target) return;
    event.preventDefault();
    target.focus();
    if (activationMode === "automatic") {
      const value = target.dataset.value;
      if (value) setValue(value);
    }
  };

  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      className={cx("ui-tabs__list", className)}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  );
});
TabsList.displayName = "Tabs.List";

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { className, value, children, onClick, ...rest },
  ref,
) {
  const { baseId, value: selected, setValue, register, tabbable } = useTabs();
  const isSelected = selected === value;

  useEffect(() => register(value), [register, value]);

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={tabId(baseId, value)}
      aria-selected={isSelected}
      aria-controls={panelId(baseId, value)}
      tabIndex={tabbable(value) ? 0 : -1}
      data-value={value}
      data-state={isSelected ? "active" : "inactive"}
      className={cx("ui-tabs__trigger", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setValue(value);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = "Tabs.Trigger";

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Keep the panel mounted when inactive (hidden with `hidden`). */
  forceMount?: boolean;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { className, value, forceMount = false, children, ...rest },
  ref,
) {
  const { baseId, value: selected } = useTabs();
  const isSelected = selected === value;

  if (!isSelected && !forceMount) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={panelId(baseId, value)}
      aria-labelledby={tabId(baseId, value)}
      tabIndex={0}
      hidden={!isSelected}
      data-state={isSelected ? "active" : "inactive"}
      className={cx("ui-tabs__content", className)}
      {...rest}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = "Tabs.Content";

/** Compound tabs with roving tab order and full keyboard support. */
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});
