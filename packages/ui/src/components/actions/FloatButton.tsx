import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { ArrowUp } from "lucide-react";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type FloatButtonPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";
export type FloatButtonShape = "circle" | "square";
export type FloatButtonVariant = "default" | "primary";
export type FloatButtonSlot = "root" | "icon" | "label" | "description" | "badge";
export type FloatButtonClassNames = SlotClassNames<FloatButtonSlot>;

export interface FloatButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    SlotConfig<FloatButtonSlot> {
  icon?: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  /** Native tooltip text; also the accessible name when no label is given. */
  tooltip?: string;
  badge?: number | string;
  shape?: FloatButtonShape;
  variant?: FloatButtonVariant;
  position?: FloatButtonPosition;
  /** Scrolls to the top of the page (or `target`) when pressed. */
  backTop?: boolean;
  target?: () => HTMLElement | Window | null;
  /** Distance from the viewport edge in px, for stacking several buttons. */
  offset?: number;
  visible?: boolean;
}

/**
 * A fixed action button for global actions (help, chat, back-to-top). Renders a
 * pill when `label` is set and a circle otherwise.
 */
export const FloatButton = forwardRef<HTMLButtonElement, FloatButtonProps>(function FloatButton(
  {
    className,
    icon,
    label,
    description,
    tooltip,
    badge,
    shape = "circle",
    variant = "default",
    position = "bottom-right",
    backTop = false,
    target,
    offset = 0,
    visible = true,
    onClick,
    "aria-label": ariaLabel,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const resolvedIcon = icon ?? (backTop ? <ArrowUp size={20} /> : null);
  const hasVisibleText = label != null || description != null;
  const fallbackName = tooltip ?? (backTop ? "Back to top" : undefined);
  // With visible text the content is the accessible name (so the badge and
  // description are announced too). For icon-only buttons fall back to the
  // tooltip/back-to-top label and fold the badge count into it.
  const accessibleName =
    ariaLabel ??
    (hasVisibleText
      ? undefined
      : fallbackName != null && badge != null
        ? `${fallbackName} ${badge}`
        : fallbackName);

  if (!visible) return null;

  return (
    <button
      ref={ref}
      type="button"
      aria-label={accessibleName}
      title={tooltip ?? (backTop ? "Back to top" : undefined)}
      data-position={position}
      data-shape={label != null ? "pill" : shape}
      data-variant={variant}
      className={slotClass(config, "root", "ui-float-button", className)}
      style={{ "--ui-float-button-offset": `${offset}px` } as CSSProperties}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !backTop) return;
        const node = target?.() ?? window;
        if (node === window) window.scrollTo({ top: 0, behavior: "smooth" });
        else (node as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
      }}
      {...rest}
    >
      {resolvedIcon != null ? (
        <span className={slotClass(config, "icon", "ui-float-button__icon")} aria-hidden="true">
          {resolvedIcon}
        </span>
      ) : null}
      {label != null || description != null ? (
        <span className={slotClass(config, "label", "ui-float-button__label")}>
          {label}
          {description != null ? (
            <span className={slotClass(config, "description", "ui-float-button__description")}>
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
      {badge != null ? (
        <>
          {" "}
          <span className={slotClass(config, "badge", "ui-float-button__badge")}>{badge}</span>
        </>
      ) : null}
    </button>
  );
});
FloatButton.displayName = "FloatButton";
