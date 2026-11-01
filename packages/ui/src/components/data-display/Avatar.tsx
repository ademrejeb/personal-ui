import {
  forwardRef,
  useState,
  Children,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utilities/cx";
import type { Status } from "../../types";

type AvatarSizeToken = "xs" | "sm" | "md" | "lg" | "xl";
const SIZE_PX: Record<AvatarSizeToken, number> = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };

function initials(name: string | undefined): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  /** Used for initials fallback and as the accessible name. */
  name?: string;
  size?: AvatarSizeToken | number;
  status?: Status;
  shape?: "circle" | "square";
  /** Custom fallback content when there is no image or it fails to load. */
  fallback?: ReactNode;
}

/** User/entity avatar with image, initials fallback, and status. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { className, src, alt, name, size = "md", status, shape = "circle", fallback, ...rest },
  ref,
) {
  const [errored, setErrored] = useState(false);
  const px = typeof size === "number" ? size : SIZE_PX[size];
  const showImage = src && !errored;
  const label = alt ?? name;

  return (
    <span
      ref={ref}
      data-size={typeof size === "number" ? undefined : size}
      className={cx("ui-avatar", `ui-avatar--${shape}`, className)}
      style={{ width: px, height: px, fontSize: Math.max(10, px * 0.38) }}
      role="img"
      aria-label={label}
      {...rest}
    >
      {showImage ? (
        <img className="ui-avatar__image" src={src} alt="" onError={() => setErrored(true)} />
      ) : (
        <span
          className="ui-avatar__fallback"
          data-initials={fallback ? undefined : initials(name) || undefined}
          aria-hidden={label ? true : undefined}
        >
          {fallback}
        </span>
      )}
      {status ? (
        <span className="ui-avatar__status" data-status={status} aria-hidden="true" />
      ) : null}
    </span>
  );
});
Avatar.displayName = "Avatar";

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum avatars shown before an overflow counter. */
  max?: number;
  size?: AvatarSizeToken | number;
  /** Negative overlap in px between avatars. */
  spacing?: number;
}

/** Overlapping stack of avatars with an overflow counter. */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { className, max = 4, size = "md", spacing = 8, children, ...rest },
  ref,
) {
  const items = Children.toArray(children);
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;
  const px = typeof size === "number" ? size : SIZE_PX[size];

  return (
    <div
      ref={ref}
      role="group"
      className={cx("ui-avatar-group", className)}
      style={{ gap: 0 }}
      {...rest}
    >
      {visible.map((child, index) => (
        <span
          key={index}
          className="ui-avatar-group__item"
          style={{ marginInlineStart: index === 0 ? 0 : -spacing, zIndex: visible.length - index }}
        >
          {child}
        </span>
      ))}
      {overflow > 0 ? (
        <span
          className="ui-avatar-group__item ui-avatar-group__overflow"
          style={{ marginInlineStart: -spacing, width: px, height: px, fontSize: Math.max(10, px * 0.32) }}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
});
AvatarGroup.displayName = "AvatarGroup";
