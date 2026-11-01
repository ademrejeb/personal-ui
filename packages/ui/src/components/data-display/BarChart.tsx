import { forwardRef, useId, useMemo, type SVGAttributes } from "react";
import {
  chartColor,
  formatChartValue,
  niceTicks,
  round,
  scaleLinear,
  stackSeries,
  stackTotal,
  type ChartSeriesInput,
} from "../../utilities/chart";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";

export type BarChartSlot =
  | "root"
  | "svg"
  | "grid"
  | "axis"
  | "axisLabel"
  | "bar"
  | "legend"
  | "legendItem"
  | "swatch"
  | "legendLabel";

export type BarChartClassNames = SlotClassNames<BarChartSlot>;

export interface BarChartProps
  extends Omit<SVGAttributes<SVGSVGElement>, "children">,
    SlotConfig<BarChartSlot> {
  series: ChartSeriesInput[];
  categories: string[];
  /** Stack the series per category instead of grouping them. */
  stacked?: boolean;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  yTicks?: number;
  valueFormatter?: (value: number) => string;
  /** Accessible name; the chart is an image to assistive technology. */
  label: string;
}

const VIEW_WIDTH = 720;

/** Grouped or stacked bar chart, drawn from a zero baseline. */
export const BarChart = forwardRef<SVGSVGElement, BarChartProps>(function BarChart(
  {
    series,
    categories,
    stacked = false,
    height = 240,
    showGrid = true,
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

  const padTop = 12;
  const padRight = 12;
  const padBottom = 28;
  const padLeft = 44;

  const geometry = useMemo(() => {
    const seriesValues = series.map((entry) => entry.data);
    const totals = stacked
      ? Array.from({ length: categories.length }, (_, index) =>
          seriesValues.reduce((sum, values) => sum + (values[index] ?? 0), 0),
        )
      : categories.map((_, index) =>
          Math.max(0, ...seriesValues.map((values) => values[index] ?? 0)),
        );
    const maxValue = stacked
      ? stackTotal(seriesValues)
      : Math.max(0, ...totals);
    const ticks = niceTicks(maxValue, 0, yTicks);
    const y = scaleLinear([ticks[0], ticks[ticks.length - 1]], [height - padBottom, padTop]);

    const bandWidth = (VIEW_WIDTH - padLeft - padRight) / Math.max(1, categories.length);
    const bandPad = Math.min(12, bandWidth * 0.2);
    const innerWidth = bandWidth - bandPad * 2;
    const perSeries = stacked ? 1 : Math.max(1, series.length);
    const barWidth = innerWidth / perSeries;
    const baseline = round(y(0));
    const running = stacked ? stackSeries(seriesValues) : null;

    const bars: Array<{
      key: string;
      seriesName: string;
      color: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }> = [];

    series.forEach((entry, seriesIndex) => {
      categories.forEach((_, categoryIndex) => {
        const value = Math.max(0, entry.data[categoryIndex] ?? 0);
        const bandStart = padLeft + categoryIndex * bandWidth + bandPad;
        const x = bandStart + seriesIndex * barWidth;
        const stackedTop = running
          ? y(running[seriesIndex][categoryIndex])
          : y(value);
        const stackedBottom = running && seriesIndex > 0
          ? y(running[seriesIndex - 1][categoryIndex])
          : y(0);
        const top = stacked ? round(stackedTop) : round(y(value));
        const bottom = stacked ? round(stackedBottom) : baseline;
        bars.push({
          key: `${entry.name}-${categoryIndex}`,
          seriesName: entry.name,
          color: entry.color ?? chartColor(seriesIndex),
          x: round(x),
          y: top,
          width: round(Math.max(2, barWidth - 2)),
          height: round(Math.max(0, bottom - top)),
        });
      });
    });

    return { ticks, y, bars, bandWidth };
  }, [series, categories, stacked, height, yTicks, padBottom, padTop, padLeft, padRight]);

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
            x={round(padLeft + index * geometry.bandWidth + geometry.bandWidth / 2)}
            y={height - padBottom + 16}
            textAnchor="middle"
            className={slotClass(config, "axisLabel", "ui-chart__axis-label")}
          >
            {category}
          </text>
        ))}

        {geometry.bars.map((bar) => (
          <rect
            key={bar.key}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            rx={3}
            className={slotClass(config, "bar", "ui-chart__bar")}
            style={{ fill: bar.color }}
            data-series={bar.seriesName}
          />
        ))}
      </svg>

      {showLegend && series.length > 0 && (
        <ul className={slotClass(config, "legend", "ui-chart__legend")}>
          {series.map((entry, index) => (
            <li key={entry.name} className={slotClass(config, "legendItem", "ui-chart__legend-item")}>
              <span
                aria-hidden="true"
                className={slotClass(config, "swatch", "ui-chart__swatch")}
                style={{ backgroundColor: entry.color ?? chartColor(index) }}
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
