import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type WatermarkSlot = "root" | "layer";
export type WatermarkClassNames = SlotClassNames<WatermarkSlot>;

export interface WatermarkProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color">,
    SlotConfig<WatermarkSlot> {
  /** Repeated text. Ignored when `image` is set. */
  text?: string;
  /** Repeated image URL. */
  image?: string;
  /** Tile size in px. */
  gap?: number;
  fontSize?: number;
  rotate?: number;
  opacity?: number;
  /** CSS colour for the text. Defaults to the muted foreground token. */
  color?: string;
  /** Overlay stacking order. */
  zIndex?: number;
  children?: ReactNode;
}

/**
 * Repeating text or image watermark rendered as an inline SVG pattern, so it
 * inherits the theme colour and stays crisp at any zoom level.
 */
export const Watermark = forwardRef<HTMLDivElement, WatermarkProps>(function Watermark(
  {
    className,
    children,
    text = "Personal UI",
    image,
    gap = 120,
    fontSize = 14,
    rotate = -22,
    opacity = 0.12,
    color,
    zIndex,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const patternId = `ui-watermark-${useId().replace(/[:]/g, "")}`;
  const tile = Math.max(gap, fontSize * 2);

  return (
    <div
      ref={ref}
      className={slotClass(
        config,
        "root",
        "ui-watermark",
        children == null && "ui-watermark--standalone",
        className,
      )}
      {...rest}
    >
      {children}
      <svg
        className={slotClass(config, "layer", "ui-watermark__layer")}
        aria-hidden="true"
        focusable="false"
        style={{ opacity, zIndex, color }}
      >
        <defs>
          <pattern
            id={patternId}
            width={tile}
            height={tile}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${rotate})`}
          >
            {image ? (
              <image
                href={image}
                x={tile / 2 - fontSize}
                y={tile / 2 - fontSize}
                width={fontSize * 2}
                height={fontSize * 2}
                preserveAspectRatio="xMidYMid meet"
              />
            ) : (
              <text
                x={tile / 2}
                y={tile / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fontSize}
                fill="currentColor"
              >
                {text}
              </text>
            )}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
});
Watermark.displayName = "Watermark";
