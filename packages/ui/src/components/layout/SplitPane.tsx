import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { useSplitPane, type SplitOrientation } from "../../hooks/useSplitPane";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type SplitPaneSlot = "root" | "pane" | "handle" | "grip";
export type SplitPaneClassNames = SlotClassNames<SplitPaneSlot>;

export interface SplitPaneProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    SlotConfig<SplitPaneSlot> {
  start: ReactNode;
  end: ReactNode;
  orientation?: SplitOrientation;
  /** Controlled first-pane size, as a percentage. */
  size?: number;
  defaultSize?: number;
  onSizeChange?: (size: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Accessible name for the resize separator. */
  separatorLabel?: string;
  startClassName?: string;
  endClassName?: string;
}

/**
 * Two resizable panes with a draggable, keyboard-operable separator. The
 * headless behavior is `useSplitPane`.
 */
export const SplitPane = forwardRef<HTMLDivElement, SplitPaneProps>(function SplitPane(
  {
    className,
    start,
    end,
    orientation = "horizontal",
    size,
    defaultSize,
    onSizeChange,
    min,
    max,
    step,
    disabled = false,
    separatorLabel = "Resize panes",
    startClassName,
    endClassName,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const { size: currentSize, containerRef, handleProps } = useSplitPane({
    size,
    defaultSize,
    onSizeChange,
    min,
    max,
    step,
    orientation,
    disabled,
  });
  const mergedRef = useMergedRefs<HTMLDivElement>(containerRef, ref);

  return (
    <div
      ref={mergedRef}
      className={slotClass(config, "root", "ui-split-pane", `ui-split-pane--${orientation}`, className)}
      data-orientation={orientation}
      data-disabled={disabled || undefined}
      {...rest}
    >
      <div
        className={slotClass(config, "pane", "ui-split-pane__pane", startClassName)}
        style={{ flexBasis: `${currentSize}%` }}
      >
        {start}
      </div>
      <div
        {...handleProps}
        aria-label={separatorLabel}
        className={slotClass(config, "handle", "ui-split-pane__handle")}
        data-orientation={orientation}
      >
        <span className={slotClass(config, "grip", "ui-split-pane__grip")} aria-hidden="true" />
      </div>
      <div
        className={slotClass(config, "pane", "ui-split-pane__pane", endClassName)}
        style={{ flex: 1 }}
      >
        {end}
      </div>
    </div>
  );
});
SplitPane.displayName = "SplitPane";
