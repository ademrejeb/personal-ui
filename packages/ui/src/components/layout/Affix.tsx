import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useEventCallback } from "../../hooks/useEventCallback";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type AffixSlot = "root" | "content";
export type AffixClassNames = SlotClassNames<AffixSlot>;

export interface AffixProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange">,
    SlotConfig<AffixSlot> {
  /** Distance from the top of the scroll container at which the content sticks. */
  offsetTop?: number;
  /** Scroll container. Defaults to the window. */
  target?: () => HTMLElement | Window | null;
  /** Fires when the affixed state changes. */
  onChange?: (affixed: boolean) => void;
  /** Distance from the bottom of the viewport at which to stop sticking. */
  offsetBottom?: number;
}

/**
 * Pins its content to the top of the viewport (or a scroll container) once the
 * page scrolls past it. A placeholder preserves the original layout height.
 */
export const Affix = forwardRef<HTMLDivElement, AffixProps>(function Affix(
  {
    className,
    children,
    offsetTop = 0,
    offsetBottom,
    target,
    onChange,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [affixed, setAffixed] = useState(false);
  const [style, setStyle] = useState<CSSProperties | undefined>();
  const [placeholderHeight, setPlaceholderHeight] = useState<number | undefined>();
  const affixedRef = useRef(false);
  const notify = useEventCallback((next: boolean) => onChange?.(next));

  useEffect(() => {
    const scrollTarget = target?.() ?? window;
    const isWindow = scrollTarget === window;

    const update = () => {
      const root = rootRef.current;
      if (!root) return;

      const containerTop = isWindow
        ? 0
        : (scrollTarget as HTMLElement).getBoundingClientRect().top;
      const box = root.getBoundingClientRect();
      const stickAt = containerTop + offsetTop;
      const shouldAffix = box.top < stickAt;

      if (!shouldAffix) {
        if (affixedRef.current) {
          affixedRef.current = false;
          setAffixed(false);
          setStyle(undefined);
          setPlaceholderHeight(undefined);
          notify(false);
        }
        return;
      }

      const height = root.offsetHeight;
      const maxTop =
        offsetBottom != null && typeof window !== "undefined"
          ? window.innerHeight - offsetBottom - height
          : undefined;
      const top = maxTop != null ? Math.min(stickAt, maxTop) : stickAt;

      affixedRef.current = true;
      setAffixed(true);
      setPlaceholderHeight(height);
      setStyle({ position: "fixed", top, left: box.left, width: box.width });
      notify(true);
    };

    update();
    scrollTarget.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scrollTarget.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [notify, offsetBottom, offsetTop, target]);

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={slotClass(config, "root", "ui-affix", className)}
      data-affixed={affixed || undefined}
      style={affixed && placeholderHeight != null ? { minHeight: placeholderHeight } : undefined}
      {...rest}
    >
      <div
        className={slotClass(config, "content", "ui-affix__content")}
        data-affixed={affixed || undefined}
        style={style}
      >
        {children}
      </div>
    </div>
  );
});
Affix.displayName = "Affix";
