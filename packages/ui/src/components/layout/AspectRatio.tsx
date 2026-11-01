import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** `16 / 9`, `"16/9"`, or `4/3`. Defaults to 16/9. */
  ratio?: number | string;
}

function toAspectRatio(ratio: number | string): string {
  if (typeof ratio === "number") return String(ratio);
  return ratio.replace(/\s+/g, "");
}

/** Constrains children to a fixed aspect ratio using the native CSS property. */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { className, ratio = 16 / 9, style, children, ...rest },
  ref,
) {
  const computed: CSSProperties = { aspectRatio: toAspectRatio(ratio) };
  return (
    <div ref={ref} className={cx("ui-aspect-ratio", className)} style={{ ...computed, ...style }} {...rest}>
      {children}
    </div>
  );
});
AspectRatio.displayName = "AspectRatio";
