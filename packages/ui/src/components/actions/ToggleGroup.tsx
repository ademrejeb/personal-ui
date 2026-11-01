import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../../utilities/cx";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";
import { useControllableState } from "../../hooks/useControllableState";
import { useMergedRefs } from "../../hooks/useMergedRefs";

interface ToggleGroupContextValue {
  type: "single" | "multiple";
  isSelected: (value: string) => boolean;
  toggle: (value: string) => void;
  tabbable: (value: string) => boolean;
  register: (value: string) => () => void;
  size: ButtonSize;
  variant: ButtonVariant;
  disabled: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);
const useToggleGroup = (): ToggleGroupContextValue => {
  const ctx = useContext(ToggleGroupContext);
  if (!ctx) throw new Error("ToggleGroup.Item must be used within a <ToggleGroup>.");
  return ctx;
};

interface ToggleGroupCommonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  attached?: boolean;
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
}

export type ToggleGroupProps = ToggleGroupCommonProps &
  (
    | {
        type?: "single";
        value?: string;
        defaultValue?: string;
        onValueChange?: (value: string) => void;
      }
    | {
        type: "multiple";
        value?: string[];
        defaultValue?: string[];
        onValueChange?: (value: string[]) => void;
      }
  );

/**
 * A group of related toggle buttons supporting single or multiple selection,
 * with roving tab order and arrow-key navigation.
 */
export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  props,
  ref,
) {
  const {
    className,
    size = "md",
    variant = "secondary",
    disabled = false,
    attached = false,
    orientation = "horizontal",
    fullWidth = false,
    type = "single",
    value: valueProp,
    defaultValue: defaultValueProp,
    onValueChange,
    ...common
  } = props;

  const [order, setOrder] = useState<string[]>([]);

  const controlled = useMemo<string[] | undefined>(() => {
    if (valueProp === undefined) return undefined;
    return Array.isArray(valueProp) ? valueProp : [valueProp];
  }, [valueProp]);

  const defaultValue = useMemo<string[]>(() => {
    if (defaultValueProp === undefined) return [];
    return Array.isArray(defaultValueProp) ? defaultValueProp : [defaultValueProp];
  }, [defaultValueProp]);

  const [selected, setSelected] = useControllableState<string[]>({
    value: controlled,
    defaultValue,
    onChange: (next) => {
      if (type === "single") {
        (onValueChange as ((value: string) => void) | undefined)?.(next[0] ?? "");
      } else {
        (onValueChange as ((value: string[]) => void) | undefined)?.(next);
      }
    },
  });

  const register = useCallback((value: string) => {
    setOrder((prev) => (prev.includes(value) ? prev : [...prev, value]));
    return () => setOrder((prev) => prev.filter((v) => v !== value));
  }, []);

  const tabbableValue = selected.length > 0 ? selected[0] : order[0];

  const context = useMemo<ToggleGroupContextValue>(
    () => ({
      type,
      isSelected: (value) => selected.includes(value),
      toggle: (value) => {
        if (type === "single") {
          setSelected((prev) => (prev[0] === value ? [] : [value]));
        } else {
          setSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
          );
        }
      },
      tabbable: (value) => value === tabbableValue,
      register,
      size,
      variant,
      disabled,
    }),
    [type, selected, setSelected, tabbableValue, register, size, variant, disabled],
  );

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>("[data-toggle-item]:not(:disabled)"),
    );
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % items.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (current - 1 + items.length) % items.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;
    const target = items[next];
    if (target) {
      event.preventDefault();
      target.focus();
    }
  };

  return (
    <ToggleGroupContext.Provider value={context}>
      <div
        ref={ref}
        role="group"
        data-orientation={orientation}
        className={cx(
          "ui-toggle-group",
          `ui-toggle-group--${orientation}`,
          attached && "ui-toggle-group--attached",
          fullWidth && "ui-toggle-group--block",
          className,
        )}
        onKeyDown={handleKeyDown}
        {...common}
      />
    </ToggleGroupContext.Provider>
  );
});
ToggleGroup.displayName = "ToggleGroup";

export interface ToggleGroupItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange"> {
  value: string;
  children?: ReactNode;
}

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem({ className, value, children, disabled, ...rest }, ref) {
    const group = useToggleGroup();
    const { register } = group;
    const selected = group.isSelected(value);
    const isDisabled = disabled || group.disabled;

    const localRef = useRef<HTMLButtonElement | null>(null);
    const mergedRef = useMergedRefs(ref, localRef);

    useEffect(() => register(value), [register, value]);

    return (
      <Button
        ref={mergedRef}
        variant={group.variant}
        size={group.size}
        disabled={isDisabled}
        aria-pressed={selected}
        data-toggle-item=""
        data-value={value}
        data-state={selected ? "on" : "off"}
        tabIndex={group.tabbable(value) ? 0 : -1}
        className={cx("ui-toggle-group__item", className)}
        onClick={() => group.toggle(value)}
        {...rest}
      >
        {children}
      </Button>
    );
  },
);
ToggleGroupItem.displayName = "ToggleGroup.Item";
