import {
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type LiHTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { mergeRefs } from "../utilities/mergeRefs";

export interface CascaderOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  children?: CascaderOption[];
}

export interface CascaderColumn {
  /** Zero-based depth of the column. */
  level: number;
  options: CascaderOption[];
}

export interface UseCascaderOptions {
  options: CascaderOption[];
  /** Controlled path of option values. */
  value?: string[] | null;
  defaultValue?: string[] | null;
  onChange?: (path: string[] | null, option: CascaderOption | null) => void;
  /** Commit parent rows too, instead of only drilling into them. */
  changeOnSelect?: boolean;
  /** How a parent row opens its child column. */
  expandTrigger?: "click" | "hover";
  disabled?: boolean;
  readOnly?: boolean;
}

export interface CascaderTriggerPropBag extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  [dataAttribute: `data-${string}`]: unknown;
}

export interface CascaderPopupPropBag extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  [dataAttribute: `data-${string}`]: unknown;
}

export interface CascaderColumnPropBag extends HTMLAttributes<HTMLUListElement> {
  "data-level": number;
}

export interface CascaderOptionPropBag extends LiHTMLAttributes<HTMLLIElement> {
  "data-level": number;
}

export interface UseCascaderResult {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Id of the popup, referenced by the trigger's `aria-controls`. */
  popupId: string;
  activePath: string[];
  columns: CascaderColumn[];
  /** Option the keyboard/`aria-activedescendant` is pointing at. */
  focusedOption: CascaderOption | null;
  /** Resolved chain of the committed selection. */
  selectedPath: CascaderOption[];
  selectedOption: CascaderOption | null;
  valuePath: string[] | null;
  anchorRef: RefObject<HTMLButtonElement | null>;
  setFocusedValue: (value: string | null) => void;
  activate: (option: CascaderOption, level: number) => void;
  hover: (option: CascaderOption, level: number) => void;
  clear: () => void;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  getTriggerProps: (props?: CascaderTriggerPropBag) => CascaderTriggerPropBag;
  getPopupProps: (props?: CascaderPopupPropBag) => CascaderPopupPropBag;
  getColumnProps: (level: number, props?: HTMLAttributes<HTMLUListElement>) => CascaderColumnPropBag;
  getOptionProps: (
    option: CascaderOption,
    level: number,
    props?: LiHTMLAttributes<HTMLLIElement>,
  ) => CascaderOptionPropBag;
}

/** Follow a path of values down the option tree. Stops at the first miss. */
export function resolveCascaderPath(
  options: CascaderOption[],
  path: readonly string[],
): CascaderOption[] {
  const chain: CascaderOption[] = [];
  let level = options;
  for (const value of path) {
    const found = level.find((option) => option.value === value);
    if (!found) break;
    chain.push(found);
    level = found.children ?? [];
  }
  return chain;
}

export function findCascaderOption(
  options: CascaderOption[],
  path: readonly string[],
): CascaderOption | null {
  const chain = resolveCascaderPath(options, path);
  return chain.length === path.length && chain.length > 0 ? chain[chain.length - 1] : null;
}

function firstEnabled(options: CascaderOption[]): string | null {
  return options.find((option) => !option.disabled)?.value ?? null;
}

/**
 * Headless cascader: column drill-down, roving highlight, and keyboard rules.
 * Focus stays on the trigger (`role="combobox"`) while the popup is open and
 * `aria-activedescendant` points into the focused column, so the whole widget is
 * one tab stop.
 */
export function useCascader({
  options,
  value,
  defaultValue = null,
  onChange,
  changeOnSelect = false,
  expandTrigger = "click",
  disabled = false,
  readOnly = false,
}: UseCascaderOptions): UseCascaderResult {
  const popupId = `${useId()}-cascader`;
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [internalPath, setInternalPath] = useState<string[] | null>(defaultValue);
  const valuePath = value !== undefined ? value : internalPath;

  const [open, setOpen] = useState(false);
  const [activePath, setActivePath] = useState<string[]>([]);
  const [focusedValue, setFocusedValue] = useState<string | null>(null);

  const selectedPath = useMemo(
    () => (valuePath ? resolveCascaderPath(options, valuePath) : []),
    [options, valuePath],
  );
  const selectedOption = selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : null;

  const columns = useMemo<CascaderColumn[]>(() => {
    const chain = resolveCascaderPath(options, activePath);
    const levels: CascaderOption[][] = [options];
    for (const option of chain) {
      if (option.children?.length) levels.push(option.children);
    }
    return levels.map((levelOptions, level) => ({ level, options: levelOptions }));
  }, [options, activePath]);

  const lastColumn = columns[columns.length - 1];
  const focusedOption = useMemo(() => {
    if (!lastColumn) return null;
    const match = focusedValue
      ? lastColumn.options.find((option) => option.value === focusedValue && !option.disabled)
      : null;
    if (match) return match;
    return lastColumn.options.find((option) => !option.disabled) ?? null;
  }, [lastColumn, focusedValue]);

  const openMenu = () => {
    if (disabled || readOnly) return;
    setActivePath(valuePath ?? []);
    setFocusedValue(valuePath && valuePath.length > 0 ? valuePath[valuePath.length - 1] : null);
    setOpen(true);
  };

  const closeMenu = () => {
    setOpen(false);
    anchorRef.current?.focus();
  };

  const commit = (path: string[], option: CascaderOption) => {
    if (value === undefined) setInternalPath(path);
    onChange?.(path, option);
    closeMenu();
  };

  const clear = () => {
    if (value === undefined) setInternalPath(null);
    onChange?.(null, null);
  };

  const activate = (option: CascaderOption, level: number) => {
    if (option.disabled) return;
    const path = [...activePath.slice(0, level), option.value];
    const isLeaf = !option.children || option.children.length === 0;
    if (isLeaf || changeOnSelect) {
      commit(path, option);
      return;
    }
    setActivePath(path);
    setFocusedValue(firstEnabled(option.children ?? []));
  };

  const hover = (option: CascaderOption, level: number) => {
    if (expandTrigger !== "hover" || option.disabled || !option.children?.length) return;
    setActivePath([...activePath.slice(0, level), option.value]);
    setFocusedValue(firstEnabled(option.children));
  };

  const moveFocus = (direction: 1 | -1) => {
    if (!lastColumn) return;
    const enabled = lastColumn.options.filter((option) => !option.disabled);
    if (enabled.length === 0) return;
    const currentIndex = focusedOption ? enabled.indexOf(focusedOption) : -1;
    const nextIndex =
      currentIndex === -1
        ? direction === 1
          ? 0
          : enabled.length - 1
        : (currentIndex + direction + enabled.length) % enabled.length;
    setFocusedValue(enabled[nextIndex].value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveFocus(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(-1);
        break;
      case "Home":
        event.preventDefault();
        setFocusedValue(lastColumn ? firstEnabled(lastColumn.options) : null);
        break;
      case "End":
        event.preventDefault();
        if (lastColumn) {
          const enabled = lastColumn.options.filter((option) => !option.disabled);
          setFocusedValue(enabled.length > 0 ? enabled[enabled.length - 1].value : null);
        }
        break;
      case "ArrowRight":
      case "Enter":
      case " ": {
        if (!focusedOption) return;
        event.preventDefault();
        if (event.key !== "ArrowRight" || focusedOption.children?.length) {
          activate(focusedOption, columns.length - 1);
        }
        break;
      }
      case "ArrowLeft":
        if (activePath.length > 0) {
          event.preventDefault();
          const parentPath = activePath.slice(0, -1);
          setActivePath(parentPath);
          setFocusedValue(activePath[activePath.length - 1]);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const optionId = (level: number, option: CascaderOption) =>
    `${popupId}-option-${level}-${columns[level]?.options.indexOf(option) ?? 0}`;

  return {
    open,
    setOpen,
    popupId,
    activePath,
    columns,
    focusedOption,
    selectedPath,
    selectedOption,
    valuePath,
    anchorRef,
    setFocusedValue,
    activate,
    hover,
    clear,
    handleKeyDown,
    getTriggerProps: (props = {}) => ({
      ...props,
      ref: mergeRefs(anchorRef, props.ref),
      id: props.id,
      type: "button",
      role: "combobox",
      "aria-haspopup": "listbox",
      "aria-expanded": open,
      "aria-controls": open ? popupId : undefined,
      "aria-activedescendant":
        open && focusedOption ? optionId(columns.length - 1, focusedOption) : undefined,
      disabled: disabled || props.disabled,
      onClick: (event) => {
        props.onClick?.(event);
        if (event.defaultPrevented || readOnly) return;
        if (open) setOpen(false);
        else openMenu();
      },
      onKeyDown: (event) => {
        props.onKeyDown?.(event);
        if (event.defaultPrevented) return;
        handleKeyDown(event);
      },
    }),
    getPopupProps: (props = {}) => ({
      ...props,
      id: popupId,
    }),
    getColumnProps: (level, props = {}) => ({
      ...props,
      role: "listbox",
      "aria-label": `Level ${level + 1}`,
      "data-level": level,
    }),
    getOptionProps: (option, level, props = {}) => ({
      ...props,
      id: optionId(level, option),
      role: "option",
      "aria-selected": activePath[level] === option.value,
      "aria-disabled": option.disabled || undefined,
      "data-level": level,
      "data-disabled": option.disabled || undefined,
      onMouseDown: (event) => {
        props.onMouseDown?.(event);
        event.preventDefault();
      },
      onMouseEnter: (event) => {
        props.onMouseEnter?.(event);
        hover(option, level);
      },
      onClick: (event) => {
        props.onClick?.(event);
        activate(option, level);
      },
    }),
  };
}
