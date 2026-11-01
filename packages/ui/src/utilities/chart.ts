/**
 * Chart geometry shared by LineChart, AreaChart, BarChart and DonutChart.
 * Everything here is pure math over a viewBox, so charts never measure the DOM
 * and render identically on the server.
 */

export interface ChartSeriesInput {
  name: string;
  data: number[];
  /** Defaults to the next entry of `CHART_COLORS`. */
  color?: string;
}

/** Layer C series palette; override `--ui-chart-*` to re-skin every chart. */
export const CHART_COLORS: readonly string[] = [
  "var(--ui-chart-1)",
  "var(--ui-chart-2)",
  "var(--ui-chart-3)",
  "var(--ui-chart-4)",
  "var(--ui-chart-5)",
  "var(--ui-chart-6)",
];

export function chartColor(index: number, colors: readonly string[] = CHART_COLORS): string {
  return colors[index % colors.length];
}

export interface ChartPoint {
  x: number;
  y: number;
}

/** Inclusive numeric extent, with a non-zero span so scales never divide by zero. */
export function extent(values: number[], fallback: [number, number] = [0, 1]): [number, number] {
  if (values.length === 0) return fallback;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? [min, min + 1] : [min, max];
}

/**
 * Round tick values covering `[min, max]`. The axis always includes zero so bar
 * charts measure from a true baseline.
 */
export function niceTicks(max: number, min = 0, count = 4): number[] {
  const top = Math.max(max, min);
  if (top === min) return [min, min + 1];
  const rawStep = (top - min) / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const step =
    (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= top + step / 2; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }
  return ticks;
}

export function scaleLinear(
  domain: [number, number],
  range: [number, number],
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
}

/** SVG path through points, optionally smoothed with Catmull-Rom → Bézier. */
export function linePath(points: ChartPoint[], smooth = false): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (!smooth) {
    return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

/** Close a line path down to a baseline to make an area. */
export function areaPath(points: ChartPoint[], baseline: number, smooth = false): string {
  if (points.length === 0) return "";
  const line = linePath(points, smooth);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

/** Running totals so stacked series can be drawn bottom-up. */
export function stackSeries(series: number[][]): number[][] {
  const rows = Math.max(0, ...series.map((entry) => entry.length));
  const totals = new Array<number>(rows).fill(0);
  return series.map((values) =>
    Array.from({ length: rows }, (_, index) => {
      totals[index] += values[index] ?? 0;
      return totals[index];
    }),
  );
}

/** Largest total in a stack, used for the y domain. */
export function stackTotal(series: number[][]): number {
  return Math.max(0, ...stackSeries(series).map((row) => Math.max(0, ...row)));
}

export function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): ChartPoint {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

export interface DonutSlice {
  startAngle: number;
  endAngle: number;
}

/** Cumulative angles (degrees, 0 = 12 o'clock) for each value. */
export function sliceAngles(values: number[]): DonutSlice[] {
  const total = values.reduce((sum, value) => sum + Math.max(0, value), 0) || 1;
  let cursor = 0;
  return values.map((value) => {
    const startAngle = cursor;
    cursor += (Math.max(0, value) / total) * 360;
    return { startAngle, endAngle: cursor };
  });
}

export interface ArcGeometry {
  cx: number;
  cy: number;
  outerRadius: number;
  innerRadius: number;
  startAngle: number;
  endAngle: number;
}

/** Stroke-free donut segment as a filled path, so it scales without clipping. */
export function arcPath({
  cx,
  cy,
  outerRadius,
  innerRadius,
  startAngle,
  endAngle,
}: ArcGeometry): string {
  const sweep = Math.min(359.999, Math.max(0, endAngle - startAngle));
  const end = startAngle + sweep;
  const largeArc = sweep > 180 ? 1 : 0;

  const outerStart = polarPoint(cx, cy, outerRadius, startAngle);
  const outerEnd = polarPoint(cx, cy, outerRadius, end);
  const innerEnd = polarPoint(cx, cy, innerRadius, end);
  const innerStart = polarPoint(cx, cy, innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

/** Compact axis labels: 1200 → "1.2k". */
export function formatChartValue(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${Number((value / 1_000_000).toFixed(1))}M`;
  if (abs >= 1_000) return `${Number((value / 1_000).toFixed(1))}k`;
  return String(Number(value.toFixed(2)));
}

/** Round a coordinate so server and client markup match byte for byte. */
export function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
