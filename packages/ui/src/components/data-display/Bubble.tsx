import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type BubbleAlign = "start" | "end";
export type BubbleVariant = "surface" | "primary" | "muted";
export type BubbleSlot =
  | "root"
  | "avatar"
  | "body"
  | "name"
  | "content"
  | "footer"
  | "time";
export type BubbleClassNames = SlotClassNames<BubbleSlot>;

export interface BubbleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content">,
    SlotConfig<BubbleSlot> {
  children?: ReactNode;
  /** Side the bubble sits on. `end` is the current user. */
  align?: BubbleAlign;
  variant?: BubbleVariant;
  name?: ReactNode;
  avatar?: ReactNode;
  /** Timestamp or delivery state shown under the bubble. */
  footer?: ReactNode;
  time?: ReactNode;
  /** Hide the avatar column while keeping alignment. */
  hideAvatar?: boolean;
}

/**
 * A chat message bubble with an optional avatar, author name, timestamp, and
 * footer (delivery state or actions).
 */
export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(function Bubble(
  {
    className,
    children,
    align = "start",
    variant = "surface",
    name,
    avatar,
    footer,
    time,
    hideAvatar = false,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);

  return (
    <div
      ref={ref}
      data-align={align}
      data-variant={variant}
      className={slotClass(config, "root", "ui-bubble", className)}
      {...rest}
    >
      {!hideAvatar ? (
        <div className={slotClass(config, "avatar", "ui-bubble__avatar")} aria-hidden="true">
          {avatar}
        </div>
      ) : null}
      <div className={slotClass(config, "body", "ui-bubble__body")}>
        {name != null ? (
          <div className={slotClass(config, "name", "ui-bubble__name")}>{name}</div>
        ) : null}
        <div className={slotClass(config, "content", "ui-bubble__content")}>{children}</div>
        {footer != null || time != null ? (
          <div className={slotClass(config, "footer", "ui-bubble__footer")}>
            {time != null ? (
              <span className={slotClass(config, "time", "ui-bubble__time")}>{time}</span>
            ) : null}
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
});
Bubble.displayName = "Bubble";
