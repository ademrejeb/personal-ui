import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ArrowDown } from "lucide-react";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type MessageScrollerSlot =
  | "root"
  | "viewport"
  | "content"
  | "empty"
  | "scrollButton";
export type MessageScrollerClassNames = SlotClassNames<MessageScrollerSlot>;

export interface MessageScrollerHandle {
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  scrollToTop: (behavior?: ScrollBehavior) => void;
  getViewport: () => HTMLDivElement | null;
}

export interface MessageScrollerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    SlotConfig<MessageScrollerSlot> {
  children?: ReactNode;
  /** Keep the view pinned to the newest message when content grows. */
  autoScroll?: boolean;
  /** Distance from the bottom that still counts as "at the bottom". */
  threshold?: number;
  onReachTop?: () => void;
  onReachBottom?: () => void;
  showScrollButton?: boolean;
  scrollButtonLabel?: string;
  emptyState?: ReactNode;
  maxHeight?: string | number;
  viewportClassName?: string;
  label?: string;
}

/**
 * A chat transcript viewport that stays pinned to the newest message, shows a
 * "jump to latest" button when scrolled up, and exposes imperative scroll
 * helpers. The viewport is keyboard focusable so it can be scrolled without a
 * pointer.
 */
export const MessageScroller = forwardRef<MessageScrollerHandle, MessageScrollerProps>(
  function MessageScroller(
    {
      className,
      children,
      autoScroll = true,
      threshold = 48,
      onReachTop,
      onReachBottom,
      showScrollButton = true,
      scrollButtonLabel = "Scroll to latest",
      emptyState,
      maxHeight = "24rem",
      viewportClassName,
      label = "Messages",
      unstyled = false,
      classNames,
      ...rest
    },
    ref,
  ) {
    const config = slotConfig(unstyled, classNames);
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const atBottomRef = useRef(true);
    const [atBottom, setAtBottom] = useState(true);
    const [atTop, setAtTop] = useState(true);
    const empty = Children.count(children) === 0;

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
      const node = viewportRef.current;
      if (!node) return;
      if (typeof node.scrollTo === "function") node.scrollTo({ top: node.scrollHeight, behavior });
      else node.scrollTop = node.scrollHeight;
      atBottomRef.current = true;
      setAtBottom(true);
    }, []);

    const scrollToTop = useCallback((behavior: ScrollBehavior = "smooth") => {
      const node = viewportRef.current;
      if (!node) return;
      if (typeof node.scrollTo === "function") node.scrollTo({ top: 0, behavior });
      else node.scrollTop = 0;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        scrollToBottom,
        scrollToTop,
        getViewport: () => viewportRef.current,
      }),
      [scrollToBottom, scrollToTop],
    );

    useEffect(() => {
      if (autoScroll) scrollToBottom("auto");
    }, [autoScroll, scrollToBottom]);

    useEffect(() => {
      const node = viewportRef.current;
      if (!node || typeof MutationObserver === "undefined") return;
      const observer = new MutationObserver(() => {
        if (autoScroll && atBottomRef.current) scrollToBottom("auto");
      });
      observer.observe(node, { childList: true, subtree: true, characterData: true });
      return () => observer.disconnect();
    }, [autoScroll, scrollToBottom]);

    const handleScroll = () => {
      const node = viewportRef.current;
      if (!node) return;
      const bottom = node.scrollHeight - node.scrollTop - node.clientHeight <= threshold;
      const top = node.scrollTop <= threshold;
      atBottomRef.current = bottom;
      setAtBottom(bottom);
      setAtTop(top);
      if (bottom) onReachBottom?.();
      if (top) onReachTop?.();
    };

    return (
      <div
        className={slotClass(config, "root", "ui-message-scroller", className)}
        {...rest}
      >
        <div
          ref={viewportRef}
          role="log"
          aria-label={label}
          aria-live="polite"
          // A scroll container must be keyboard reachable (axe
          // scrollable-region-focusable); the log role itself is not interactive.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          data-at-bottom={atBottom || undefined}
          data-at-top={atTop || undefined}
          className={slotClass(
            config,
            "viewport",
            "ui-message-scroller__viewport",
            viewportClassName,
          )}
          style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }}
          onScroll={handleScroll}
        >
          {empty ? (
            <div className={slotClass(config, "empty", "ui-message-scroller__empty")}>
              {emptyState}
            </div>
          ) : (
            <div className={slotClass(config, "content", "ui-message-scroller__content")}>
              {children}
            </div>
          )}
        </div>
        {showScrollButton && !atBottom && !empty ? (
          <button
            type="button"
            className={slotClass(config, "scrollButton", "ui-message-scroller__scroll-button")}
            aria-label={scrollButtonLabel}
            title={scrollButtonLabel}
            onClick={() => scrollToBottom()}
          >
            <ArrowDown size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    );
  },
);
MessageScroller.displayName = "MessageScroller";
