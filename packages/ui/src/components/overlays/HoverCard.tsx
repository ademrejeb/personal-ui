import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";
import { useHoverCard, type HoverCardApi, type UseHoverCardOptions } from "../../hooks/useHoverCard";
import type { Placement } from "../../utilities/position";

export type HoverCardSlot = "trigger" | "content";

export type HoverCardClassNames = SlotClassNames<HoverCardSlot>;

interface HoverCardContextValue {
  api: HoverCardApi;
  config: SlotConfig<HoverCardSlot>;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null);
const useHoverCardContext = (): HoverCardContextValue => {
  const ctx = useContext(HoverCardContext);
  if (!ctx) throw new Error("HoverCard subcomponents must be used within a <HoverCard>.");
  return ctx;
};

export interface HoverCardProps extends UseHoverCardOptions, SlotConfig<HoverCardSlot> {
  children: ReactNode;
}

/** Root provider for a hover card. Controlled and uncontrolled. */
function HoverCardRoot({
  children,
  unstyled = false,
  classNames,
  ...options
}: HoverCardProps): ReactNode {
  const config = useMemo(() => slotConfig(unstyled, classNames), [unstyled, classNames]);
  const api = useHoverCard(options);
  const triggerRef = useRef<HTMLElement | null>(null);
  const value = useMemo(() => ({ api, config, triggerRef }), [api, config]);

  return <HoverCardContext.Provider value={value}>{children}</HoverCardContext.Provider>;
}
HoverCardRoot.displayName = "HoverCard";

export type HoverCardTriggerProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Hover/focus target wrapper. Wrap a focusable element (link, button, or an
 * avatar with a `tabIndex`) so keyboard users can reach the card as well.
 */
export const HoverCardTrigger = forwardRef<HTMLSpanElement, HoverCardTriggerProps>(
  function HoverCardTrigger({ className, children, ...rest }, ref) {
    const { api, config, triggerRef } = useHoverCardContext();

    return (
      <span
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={slotClass(config, "trigger", "ui-hovercard__trigger", className)}
        {...api.getTriggerProps(rest)}
      >
        {children}
      </span>
    );
  },
);
HoverCardTrigger.displayName = "HoverCard.Trigger";

export interface HoverCardContentProps extends HTMLAttributes<HTMLDivElement> {
  placement?: Placement;
  offset?: number;
  /** Render a pointer arrow aimed at the trigger. */
  arrow?: boolean;
}

export const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(
  function HoverCardContent(
    { className, placement = "bottom", offset = 10, arrow = true, children, ...rest },
    ref,
  ) {
    const { api, config, triggerRef } = useHoverCardContext();

    return (
      <FloatingLayer
        ref={ref}
        open={api.open}
        anchorRef={triggerRef}
        placement={placement}
        offset={arrow ? offset + 6 : offset}
        keepOpenRefs={[triggerRef]}
        onDismiss={() => api.setOpen(false)}
        dismissOnOutside={false}
        returnFocusRef={triggerRef}
        id={api.contentId}
        role="dialog"
        aria-labelledby={api.triggerId}
        className={slotClass(config, "content", "ui-hovercard", className)}
        {...api.getContentProps(rest)}
      >
        {arrow ? <span className="ui-hovercard__arrow" aria-hidden="true" /> : null}
        {children}
      </FloatingLayer>
    );
  },
);
HoverCardContent.displayName = "HoverCard.Content";

/** Rich preview card revealed on hover or focus of its trigger. */
export const HoverCard = Object.assign(HoverCardRoot, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
});
