import { forwardRef, type SVGAttributes } from "react";
import { cx } from "../../utilities/cx";

export interface SparklineProps extends Omit<SVGAttributes<SVGSVGElement>, "children" | "height" | "width"> {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  /** Fill the area beneath the line. */
  area?: boolean;
  /** Accessible description; when omitted the sparkline is decorative. */
  label?: string;
  smooth?: boolean;
}

function buildPath(points: [number, number][], smooth: boolean): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  if (!smooth) return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

  // Catmull-Rom → cubic Bézier smoothing.
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/** Minimal inline trend visualization rendered as a single SVG path. */
export const Sparkline = forwardRef<SVGSVGElement, SparklineProps>(function Sparkline(
  {
    className,
    data,
    width = 120,
    height = 32,
    strokeWidth = 1.5,
    area = false,
    label,
    smooth = true,
    ...rest
  },
  ref,
) {
  const padding = strokeWidth;
  const max = Math.max(...data, 0);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points: [number, number][] = data.map((value, index) => [
    padding + index * stepX,
    height - padding - ((value - min) / range) * (height - padding * 2),
  ]);

  const line = buildPath(points, smooth);
  const areaPath =
    area && points.length > 1
      ? `${line} L ${points[points.length - 1][0]} ${height} L ${points[0][0]} ${height} Z`
      : "";

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cx("ui-sparkline", className)}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="none"
      {...rest}
    >
      {area ? <path className="ui-sparkline__area" d={areaPath} /> : null}
      <path className="ui-sparkline__line" d={line} fill="none" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});
Sparkline.displayName = "Sparkline";
