import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { useControllableState } from "../../hooks/useControllableState";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";

export type CollapsibleSlot =
  | "root"
  | "trigger"
  | "triggerText"
  | "indicator"
  | "content"
  | "contentInner";

export type CollapsibleClassNames = SlotClassNames<CollapsibleSlot>;

export interface UseCollapsibleOptions {
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export interface CollapsibleApi {
  open: boolean;
  disabled: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  triggerId: string;
  contentId: string;
  /** ARIA/DOM wiring for a custom trigger element. */
  getTriggerProps: (props?: ButtonHTMLAttributes<HTMLButtonElement>) => ButtonHTMLAttributes<HTMLButtonElement>;
  /** ARIA/DOM wiring for a custom content element. */
  getContentProps: (props?: HTMLAttributes<HTMLDivElement>) => HTMLAttributes<HTMLDivElement>;
}

/**
 * Headless single-disclosure state. Same contract as `<Collapsible>`: controlled
 * or uncontrolled, with stable trigger/content ids and ARIA wiring. Use it
 * directly when you want your own markup.
 */
export function useCollapsible({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
}: UseCollapsibleOptions = {}): CollapsibleApi {
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;

  return useMemo<CollapsibleApi>(
    () => ({
      open,
      disabled,
      setOpen,
      toggle: () => setOpen(!open),
      triggerId,
      contentId,
      getTriggerProps: (props) => ({
        type: "button",
        ...props,
        id: props?.id ?? triggerId,
        disabled: disabled || props?.disabled,
        "aria-expanded": open,
        "aria-controls": contentId,
        "data-state": open ? "open" : "closed",
        "data-disabled": disabled || undefined,
        onClick: (event) => {
          props?.onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          setOpen(!open);
        },
      }),
      getContentProps: (props) => ({
        ...props,
        id: props?.id ?? contentId,
        role: props?.role ?? "region",
        // Falls back to the trigger's text unless the consumer names it another way.
        "aria-labelledby":
          props?.["aria-labelledby"] ?? (props?.["aria-label"] ? undefined : triggerId),
        hidden: !open,
        "data-state": open ? "open" : "closed",
      }),
    }),
    [open, disabled, setOpen, triggerId, contentId],
  );
}

interface CollapsibleContextValue {
  api: CollapsibleApi;
  config: SlotConfig<CollapsibleSlot>;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);
const useCollapsibleContext = (): CollapsibleContextValue => {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error("Collapsible subcomponents must be used within a <Collapsible>.");
  return ctx;
};

export interface CollapsibleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    SlotConfig<CollapsibleSlot> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

function CollapsibleRoot({
  className,
  classNames,
  unstyled = false,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  children,
  ...rest
}: CollapsibleProps): ReactNode {
  const config = useMemo(() => slotConfig(unstyled, classNames), [unstyled, classNames]);
  const api = useCollapsible({ open, defaultOpen, onOpenChange, disabled });
  const value = useMemo(() => ({ api, config }), [api, config]);

  return (
    <CollapsibleContext.Provider value={value}>
      <div
        data-collapsible=""
        data-state={api.open ? "open" : "closed"}
        data-disabled={disabled || undefined}
        className={slotClass(config, "root", "ui-collapsible", className)}
        {...rest}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

export interface CollapsibleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon rendered on the trailing edge; defaults to a chevron. */
  indicator?: ReactNode;
}

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ className, indicator, children, ...rest }, ref) {
    const { api, config } = useCollapsibleContext();

    return (
      <button
        ref={ref}
        className={slotClass(config, "trigger", "ui-collapsible__trigger", className)}
        {...api.getTriggerProps(rest)}
      >
        <span className={slotClass(config, "triggerText", "ui-collapsible__trigger-text")}>
          {children}
        </span>
        <span
          className={slotClass(config, "indicator", "ui-collapsible__indicator")}
          aria-hidden="true"
        >
          {indicator ?? <ChevronDown size={16} />}
        </span>
      </button>
    );
  },
);
CollapsibleTrigger.displayName = "Collapsible.Trigger";

export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Keep the content in the DOM while closed (useful for animations/SSR). */
  forceMount?: boolean;
}

export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ className, forceMount = false, children, ...rest }, ref) {
    const { api, config } = useCollapsibleContext();
    if (!api.open && !forceMount) return null;

    return (
      <div
        ref={ref}
        className={slotClass(config, "content", "ui-collapsible__content", className)}
        {...api.getContentProps(rest)}
      >
        <div className={slotClass(config, "contentInner", "ui-collapsible__content-inner")}>
          {children}
        </div>
      </div>
    );
  },
);
CollapsibleContent.displayName = "Collapsible.Content";

/** Single collapsible panel — the disclosure primitive behind Accordion. */
export const Collapsible = Object.assign(CollapsibleRoot, {
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
});
