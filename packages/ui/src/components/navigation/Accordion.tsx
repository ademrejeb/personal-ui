import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";

interface AccordionContextValue {
  type: "single" | "multiple";
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  collapsible: boolean;
  disabled: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
const useAccordion = (): AccordionContextValue => {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion subcomponents must be used within an <Accordion>.");
  return ctx;
};

interface AccordionCommonProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  disabled?: boolean;
  /** Allow closing the currently open single-type item. */
  collapsible?: boolean;
}

export type AccordionProps = AccordionCommonProps &
  (
    | {
        type: "single";
        value?: string;
        defaultValue?: string;
        onValueChange?: (value: string | undefined) => void;
      }
    | {
        type: "multiple";
        value?: string[];
        defaultValue?: string[];
        onValueChange?: (value: string[]) => void;
      }
  );

function AccordionRoot(props: AccordionProps): ReactNode {
  const {
    className,
    disabled = false,
    collapsible = true,
    children,
    ...common
  } = props;
  const type = props.type;

  const valueProp = props.value;
  const controlled = useMemo<string[] | undefined>(() => {
    if (valueProp === undefined) return undefined;
    return Array.isArray(valueProp) ? valueProp : [valueProp];
  }, [valueProp]);

  const defaultProp = props.defaultValue;
  const defaultValue = useMemo<string[]>(() => {
    if (defaultProp === undefined) return [];
    return Array.isArray(defaultProp) ? defaultProp : [defaultProp];
  }, [defaultProp]);

  const [openValues, setOpenValues] = useControllableState<string[]>({
    value: controlled,
    defaultValue,
    onChange: (next) => {
      if (type === "single") {
        (props.onValueChange as ((value: string | undefined) => void) | undefined)?.(next[0]);
      } else {
        (props.onValueChange as ((value: string[]) => void) | undefined)?.(next);
      }
    },
  });

  const context = useMemo<AccordionContextValue>(
    () => ({
      type,
      isOpen: (value) => openValues.includes(value),
      toggle: (value) => {
        setOpenValues((prev) => {
          if (type === "single") {
            if (prev[0] === value) return collapsible ? [] : prev;
            return [value];
          }
          return prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];
        });
      },
      collapsible,
      disabled,
    }),
    [type, openValues, setOpenValues, collapsible, disabled],
  );

  return (
    <AccordionContext.Provider value={context}>
      <div data-accordion="" className={cx("ui-accordion", className)} {...common}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextValue {
  value: string;
  open: boolean;
  baseId: string;
  disabled: boolean;
  toggle: () => void;
}
const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);
const useAccordionItem = (): AccordionItemContextValue => {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) throw new Error("Accordion.Item subcomponents must be used within an <Accordion.Item>.");
  return ctx;
};

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { className, value, disabled = false, children, ...rest },
  ref,
) {
  const group = useAccordion();
  const baseId = useId();
  const isDisabled = disabled || group.disabled;

  const itemValue = useMemo<AccordionItemContextValue>(
    () => ({
      value,
      open: group.isOpen(value),
      baseId,
      disabled: isDisabled,
      toggle: () => group.toggle(value),
    }),
    [value, group, baseId, isDisabled],
  );

  return (
    <AccordionItemContext.Provider value={itemValue}>
      <div
        ref={ref}
        data-state={itemValue.open ? "open" : "closed"}
        data-disabled={isDisabled || undefined}
        className={cx("ui-accordion__item", className)}
        {...rest}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
});
AccordionItem.displayName = "Accordion.Item";

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon rendered on the right; defaults to a chevron. */
  indicator?: ReactNode;
}

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    { className, indicator, children, onClick, onKeyDown, ...rest },
    ref,
  ) {
    const { value, open, baseId, disabled, toggle } = useAccordionItem();

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      const triggers = Array.from(
        event.currentTarget
          .closest("[data-accordion]")
          ?.querySelectorAll<HTMLButtonElement>(".ui-accordion__trigger:not([disabled])") ?? [],
      );
      if (triggers.length === 0) return;
      const current = triggers.indexOf(event.currentTarget);
      let next = current;
      if (event.key === "ArrowDown") next = (current + 1) % triggers.length;
      else if (event.key === "ArrowUp") next = (current - 1 + triggers.length) % triggers.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = triggers.length - 1;
      else return;
      event.preventDefault();
      triggers[next]?.focus();
    };

    return (
      <h3 className="ui-accordion__heading">
        <button
          ref={ref}
          type="button"
          id={`${baseId}-trigger`}
          aria-expanded={open}
          aria-controls={`${baseId}-panel`}
          disabled={disabled}
          data-state={open ? "open" : "closed"}
          data-value={value}
          className={cx("ui-accordion__trigger", className)}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) toggle();
          }}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          <span className="ui-accordion__trigger-text">{children}</span>
          <span className="ui-accordion__indicator" aria-hidden="true">
            {indicator ?? <ChevronDown size={16} />}
          </span>
        </button>
      </h3>
    );
  },
);
AccordionTrigger.displayName = "Accordion.Trigger";

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
}

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ className, forceMount = false, children, ...rest }, ref) {
    const { open, baseId } = useAccordionItem();
    if (!open && !forceMount) return null;
    return (
      <div
        ref={ref}
        id={`${baseId}-panel`}
        role="region"
        aria-labelledby={`${baseId}-trigger`}
        hidden={!open}
        data-state={open ? "open" : "closed"}
        className={cx("ui-accordion__content", className)}
        {...rest}
      >
        <div className="ui-accordion__content-inner">{children}</div>
      </div>
    );
  },
);
AccordionContent.displayName = "Accordion.Content";

/** Compound accordion supporting single or multiple expanded panels. */
export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});
