import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";
import { Spinner } from "./Spinner";

export interface LoadingOverlayProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  loading?: boolean;
  /** Accessible label announced while loading. */
  label?: string;
  /** Apply a backdrop blur to the content behind the overlay. */
  blur?: boolean;
  /** Prevent interaction with the content beneath. */
  blocking?: boolean;
  children?: ReactNode;
}

/**
 * Contextual loading state that wraps content and overlays a spinner. Sets
 * `aria-busy` on the region and keeps content in the DOM so layout is stable.
 */
export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  function LoadingOverlay(
    { className, loading = false, label = "Loading", blur = false, blocking = true, children, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        aria-busy={loading || undefined}
        className={cx("ui-loading-overlay", blur && "ui-loading-overlay--blur", className)}
        {...rest}
      >
        {children}
        {loading ? (
          <div
            className="ui-loading-overlay__scrim"
            data-blocking={blocking || undefined}
            role="status"
            aria-live="polite"
          >
            <Spinner size="lg" decorative />
            <span className="ui-loading-overlay__label">{label}</span>
          </div>
        ) : null}
      </div>
    );
  },
);
LoadingOverlay.displayName = "LoadingOverlay";
