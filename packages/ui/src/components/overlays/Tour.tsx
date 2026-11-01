import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { Button } from "../actions/Button";
import { Portal } from "../../primitives/Portal";
import { useControllableState } from "../../hooks/useControllableState";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { canUseDOM } from "../../utilities/dom";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";
import type { Placement } from "../../utilities/position";

export type TourSlot =
  | "root"
  | "mask"
  | "spotlight"
  | "card"
  | "header"
  | "title"
  | "description"
  | "content"
  | "footer"
  | "indicator"
  | "actions"
  | "close";
export type TourClassNames = SlotClassNames<TourSlot>;

export type TourTarget = string | HTMLElement | (() => HTMLElement | null);

export interface TourStep {
  /** CSS selector, element, or resolver for the highlighted element. */
  target?: TourTarget;
  title: ReactNode;
  description?: ReactNode;
  /** Extra content under the description (forms, media). */
  content?: ReactNode;
  placement?: Placement;
}

export interface TourProps extends SlotConfig<TourSlot> {
  steps: TourStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  current?: number;
  defaultCurrent?: number;
  onCurrentChange?: (index: number) => void;
  onFinish?: () => void;
  onClose?: () => void;
  /** Dim the page behind the spotlight. Defaults to true. */
  mask?: boolean;
  /** Close when the mask is clicked. Defaults to false. */
  maskClosable?: boolean;
  /** Scroll the target into view when a step becomes active. Defaults to true. */
  scrollIntoView?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  skipLabel?: string;
  className?: string;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function resolveTarget(target: TourTarget | undefined): HTMLElement | null {
  if (!target || !canUseDOM()) return null;
  if (typeof target === "string") return document.querySelector<HTMLElement>(target);
  if (typeof target === "function") return target();
  return target;
}

function cardStyle(rect: TargetRect, placement: Placement): CSSProperties {
  const gap = 12;
  const width = 340;
  const side = placement.split("-")[0];
  const maxLeft = canUseDOM() ? window.innerWidth - width - 16 : rect.left;

  if (side === "top" || side === "bottom") {
    const left = Math.max(16, Math.min(rect.left + rect.width / 2 - width / 2, maxLeft));
    return side === "top"
      ? { top: rect.top - gap, left, transform: "translateY(-100%)" }
      : { top: rect.top + rect.height + gap, left };
  }

  if (side === "left") {
    return { top: rect.top, left: rect.left - gap, transform: "translateX(-100%)" };
  }

  return { top: rect.top, left: rect.left + rect.width + gap };
}

/**
 * Guided product tour: spotlights a target, positions a step card next to it,
 * and steps through `TourStep[]`. The overlay is portaled and restores focus on
 * close. Targets that are missing render the card centered.
 */
export const Tour = forwardRef<HTMLDivElement, TourProps>(function Tour(
  {
    steps,
    open,
    defaultOpen = false,
    onOpenChange,
    current,
    defaultCurrent = 0,
    onCurrentChange,
    onFinish,
    onClose,
    mask = true,
    maskClosable = false,
    scrollIntoView = true,
    prevLabel = "Back",
    nextLabel = "Next",
    finishLabel = "Finish",
    skipLabel = "Skip",
    className,
    unstyled = false,
    classNames,
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [index, setIndex] = useControllableState<number>({
    value: current,
    defaultValue: defaultCurrent,
    onChange: onCurrentChange,
  });
  const [rect, setRect] = useState<TargetRect | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const step = steps[index];
  const last = index >= steps.length - 1;

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  useEscapeKey(close, isOpen);

  useEffect(() => {
    if (!isOpen) {
      if (restoreRef.current?.focus) restoreRef.current.focus();
      restoreRef.current = null;
      return;
    }
    restoreRef.current = document.activeElement as HTMLElement | null;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const element = resolveTarget(step?.target);
    if (element && scrollIntoView && typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
    const measure = () => {
      const node = resolveTarget(step?.target);
      if (!node) {
        setRect(null);
        return;
      }
      const box = node.getBoundingClientRect();
      setRect({ top: box.top, left: box.left, width: box.width, height: box.height });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [isOpen, index, step?.target, scrollIntoView]);

  useEffect(() => {
    if (!isOpen) return;
    cardRef.current?.focus();
  }, [isOpen, index]);

  if (!isOpen || !step) return null;

  const side = step.placement ?? "bottom";

  return (
    <Portal>
      <div className={slotClass(config, "root", "ui-tour", className)}>
        {mask ? (
          <div
            className={slotClass(config, "mask", "ui-tour__mask")}
            data-dim={!rect || undefined}
            onClick={maskClosable ? close : undefined}
            aria-hidden="true"
          />
        ) : null}
        {rect ? (
          <div
            className={slotClass(config, "spotlight", "ui-tour__spotlight")}
            data-mask={mask || undefined}
            style={{
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
            }}
            aria-hidden="true"
          />
        ) : null}
        <div
          ref={(node) => {
            cardRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          data-placement={side.split("-")[0]}
          data-center={rect ? undefined : true}
          className={slotClass(config, "card", "ui-tour__card")}
          style={rect ? cardStyle(rect, side) : undefined}
        >
          <div className={slotClass(config, "header", "ui-tour__header")}>
            <div id={titleId} className={slotClass(config, "title", "ui-tour__title")}>
              {step.title}
            </div>
            <button
              type="button"
              className={slotClass(config, "close", "ui-tour__close")}
              onClick={close}
              aria-label={skipLabel}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          {step.description != null ? (
            <div className={slotClass(config, "description", "ui-tour__description")}>
              {step.description}
            </div>
          ) : null}
          {step.content != null ? (
            <div className={slotClass(config, "content", "ui-tour__content")}>{step.content}</div>
          ) : null}
          <div className={slotClass(config, "footer", "ui-tour__footer")}>
            <span className={slotClass(config, "indicator", "ui-tour__indicator")}>
              {index + 1} / {steps.length}
            </span>
            <div className={slotClass(config, "actions", "ui-tour__actions")}>
              {index > 0 ? (
                <Button size="sm" variant="ghost" onClick={() => setIndex(index - 1)}>
                  {prevLabel}
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  if (last) {
                    setOpen(false);
                    onFinish?.();
                  } else {
                    setIndex(index + 1);
                  }
                }}
              >
                {last ? finishLabel : nextLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
});
Tour.displayName = "Tour";
