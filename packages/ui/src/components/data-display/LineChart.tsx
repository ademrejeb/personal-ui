import { forwardRef, useId, useMemo, type SVGAttributes } from "react";
import {
  areaPath as buildAreaPath,
  chartColor,
  extent,
  formatChartValue,
  linePath as buildLinePath,
  niceTicks,
  round,
  scaleLinear,
  type ChartPoint,
  type ChartSeriesInput,
} from "../../utilities/chart";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";

export type LineChartSlot =
  | "root"
  | "svg"
  | "grid"
  | "axis"
  | "axisLabel"
  | "area"
  | "line"
  | "dot"
  | "legend"
  | "legendItem"
  | "swatch"
  | "legendLabel";

export type LineChartClassNames = SlotClassNames<LineChartSlot>;

export interface LineChartProps
  extends Omit<SVGAttributes<SVGSVGElement>, "children">,
    SlotConfig<LineChartSlot> {
  series: ChartSeriesInput[];
  categories: string[];
  /** `area` fills beneath each line. */
  variant?: "line" | "area";
  /** Draw an area chart. Shorthand for `variant="area"`. */
  area?: boolean;
  height?: number;
  smooth?: boolean;
  showGrid?: boolean;
  showDots?: boolean;
  showLegend?: boolean;
  yTicks?: number;
  valueFormatter?: (value: number) => string;
  /** Accessible name; charts are images to assistive technology. */
  label: string;
}

const VIEW_WIDTH = 720;

/**
 * Multi-series line or area chart. Series colours come from the `--ui-chart-*`
 * tokens, the viewBox does the scaling, and the legend doubles as the text
 * alternative for the graphic.
 */
export const LineChart = forwardRef<SVGSVGElement, LineChartProps>(function LineChart(
  {
    series,
    categories,
    variant,
    area = false,
    height = 240,
    smooth = true,
    showGrid = true,
    showDots = true,
    showLegend = true,
    yTicks = 4,
    valueFormatter = formatChartValue,
    label,
    className,
    classNames,
    unstyled = false,
    ...rest
  },
  ref,
) {
  const config = useMemo(() => slotConfig(unstyled, classNames), [unstyled, classNames]);
  const titleId = useId();
  const isArea = area || variant === "area";

  const padTop = 12;
  const padRight = 12;
  const padBottom = 28;
  const padLeft = 44;

  const geometry = useMemo(() => {
    const allValues = series.flatMap((entry) => entry.data);
    const [dataMin, dataMax] = extent(allValues, [0, 1]);
    const ticks = niceTicks(dataMax, Math.min(0, dataMin), yTicks);
    const domain: [number, number] = [ticks[0], ticks[ticks.length - 1]];
    const y = scaleLinear(domain, [height - padBottom, padTop]);
    const x = scaleLinear([0, Math.max(1, categories.length - 1)], [padLeft, VIEW_WIDTH - padRight]);
    const baseline = y(Math.max(0, domain[0]));

    return {
      ticks,
      baseline,
      x,
      y,
      lines: series.map((entry, seriesIndex) => {
        const points: ChartPoint[] = entry.data.map((value, index) => ({
          x: round(x(index)),
          y: round(y(value)),
        }));
        return {
          name: entry.name,
          color: entry.color ?? chartColor(seriesIndex),
          points,
          line: buildLinePath(points, smooth),
          area: buildAreaPath(points, baseline, smooth),
        };
      }),
    };
  }, [series, categories.length, height, smooth, padBottom, padTop, padLeft, padRight, yTicks]);

  return (
    <div className={slotClass(config, "root", "ui-chart")}>
      <svg
        ref={ref}
        viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
        role="img"
        aria-labelledby={titleId}
        preserveAspectRatio="xMidYMid meet"
        className={slotClass(config, "svg", "ui-chart__svg", className)}
        {...rest}
      >
        <title id={titleId}>{label}</title>

        {showGrid &&
          geometry.ticks.map((tick) => (
            <line
              key={tick}
              x1={padLeft}
              x2={VIEW_WIDTH - padRight}
              y1={round(geometry.y(tick))}
              y2={round(geometry.y(tick))}
              className={slotClass(config, "grid", "ui-chart__grid-line")}
            />
          ))}

        {geometry.ticks.map((tick) => (
          <text
            key={tick}
            x={padLeft - 8}
            y={round(geometry.y(tick))}
            textAnchor="end"
            dominantBaseline="middle"
            className={slotClass(config, "axisLabel", "ui-chart__axis-label")}
          >
            {valueFormatter(tick)}
          </text>
        ))}

        {categories.map((category, index) => (
          <text
            key={category + index}
            x={round(geometry.x(index))}
            y={height - padBottom + 16}
            textAnchor="middle"
            className={slotClass(config, "axisLabel", "ui-chart__axis-label")}
          >
            {category}
          </text>
        ))}

        {geometry.lines.map((entry) => (
          <g key={entry.name}>
            {isArea && (
              <path
                d={entry.area}
                className={slotClass(config, "area", "ui-chart__area")}
                style={{ fill: entry.color }}
                data-series={entry.name}
              />
            )}
            <path
              d={entry.line}
              className={slotClass(config, "line", "ui-chart__line")}
              style={{ stroke: entry.color }}
              data-series={entry.name}
            />
            {showDots &&
              entry.points.map((point) => (
                <circle
                  key={`${point.x}-${point.y}`}
                  cx={point.x}
                  cy={point.y}
                  r={3}
                  className={slotClass(config, "dot", "ui-chart__dot")}
                  style={{ fill: entry.color }}
                />
              ))}
          </g>
        ))}
      </svg>

      {showLegend && series.length > 0 && (
        <ul className={slotClass(config, "legend", "ui-chart__legend")}>
          {geometry.lines.map((entry) => (
            <li key={entry.name} className={slotClass(config, "legendItem", "ui-chart__legend-item")}>
              <span
                aria-hidden="true"
                className={slotClass(config, "swatch", "ui-chart__swatch")}
                style={{ backgroundColor: entry.color }}
              />
              <span className={slotClass(config, "legendLabel", "ui-chart__legend-label")}>
                {entry.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export type AreaChartProps = Omit<LineChartProps, "area" | "variant">;

/** Area chart: a `LineChart` with the fill turned on. */
export const AreaChart = forwardRef<SVGSVGElement, AreaChartProps>(function AreaChart(props, ref) {
  return <LineChart {...props} ref={ref} variant="area" />;
});
