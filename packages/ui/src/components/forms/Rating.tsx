import {
  useId,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Star } from "lucide-react";
import { useControllableState } from "../../hooks/useControllableState";
import { mergeRefs } from "../../utilities/mergeRefs";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";
import type { ControlSize } from "../../types";

export type RatingSlot = "root" | "item" | "input" | "icon";

export type RatingClassNames = SlotClassNames<RatingSlot>;

export interface RatingProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    SlotConfig<RatingSlot> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Number of stars. */
  max?: number;
  size?: ControlSize;
  disabled?: boolean;
  /** Renders a static value with no interactive controls. */
  readOnly?: boolean;
  /** Clicking the current value clears the rating back to zero. */
  allowClear?: boolean;
  /** Shared radio name, useful when the rating sits inside a form. */
  name?: string;
  /** Accessible name for the group (or the image when read-only). */
  label?: string;
  /** Custom glyph; defaults to a filled/empty lucide star. */
  icon?: ReactNode;
  renderIcon?: (state: { filled: boolean; index: number }) => ReactNode;
}

/**
 * Star rating built on a native radio group, so arrow keys, focus handling and
 * form submission come from the platform. Hover previews the hovered value.
 */
export const Rating = forwardRef<HTMLDivElement, RatingProps>(function Rating(
  {
    value,
    defaultValue = 0,
    onValueChange,
    max = 5,
    size = "md",
    disabled = false,
    readOnly = false,
    allowClear = true,
    name,
    label,
    icon,
    renderIcon,
    className,
    classNames,
    unstyled = false,
    ...rest
  },
  ref,
) {
  const config = useMemo(() => slotConfig(unstyled, classNames), [unstyled, classNames]);
  const [rating, setRating] = useControllableState<number>({ value, defaultValue, onChange: onValueChange });
  const [hovered, setHovered] = useState(0);
  const generatedName = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Native listener: the hover preview is not an interaction, so the group does
  // not need to become focusable just to reset it.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const reset = () => setHovered(0);
    node.addEventListener("mouseleave", reset);
    return () => node.removeEventListener("mouseleave", reset);
  }, []);

  const stars = Array.from({ length: max }, (_, index) => index + 1);
  const shown = hovered || rating;
  const glyph = (filled: boolean, index: number) =>
    renderIcon ? (
      renderIcon({ filled, index })
    ) : (
      <Star
        size={size === "lg" || size === "xl" ? 24 : size === "sm" || size === "xs" ? 16 : 20}
        fill={filled ? "currentColor" : "none"}
        aria-hidden="true"
      />
    );

  if (readOnly) {
    return (
      <div
        ref={ref}
        role="img"
        aria-label={label ? `${label}: ${rating} out of ${max}` : `${rating} out of ${max}`}
        data-size={size}
        data-readonly
        className={slotClass(config, "root", "ui-rating", className)}
        {...rest}
      >
        {stars.map((star) => (
          <span
            key={star}
            className={slotClass(
              config,
              "icon",
              "ui-rating__icon",
              star <= rating && "ui-rating__icon--filled",
            )}
            aria-hidden="true"
          >
            {icon ?? glyph(star <= rating, star - 1)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={mergeRefs(rootRef, ref)}
      role="radiogroup"
      aria-label={label}
      data-size={size}
      data-disabled={disabled || undefined}
      className={slotClass(config, "root", "ui-rating", className)}
      {...rest}
    >
      {stars.map((star) => {
        const filled = star <= shown;
        return (
          <label
            key={star}
            className={slotClass(
              config,
              "item",
              "ui-rating__item",
              star <= shown && "ui-rating__item--active",
            )}
            data-star={star}
            onMouseEnter={() => setHovered(star)}
          >
            <input
              type="radio"
              className={slotClass(config, "input", "ui-rating__input")}
              name={name ?? generatedName}
              value={star}
              checked={rating === star}
              disabled={disabled}
              aria-label={star === 1 ? "1 star" : `${star} stars`}
              onChange={() => setRating(star)}
              onClick={() => {
                // A radio does not emit `change` when it is already checked, so
                // clearing has to happen on the click itself.
                if (allowClear && rating === star) setRating(0);
              }}
            />
            <span
              className={slotClass(
                config,
                "icon",
                "ui-rating__icon",
                filled && "ui-rating__icon--filled",
              )}
              aria-hidden="true"
            >
              {icon ?? glyph(filled, star - 1)}
            </span>
          </label>
        );
      })}
    </div>
  );
});
