import { forwardRef, useId, useMemo, type SVGAttributes } from "react";
import { arcPath, chartColor, round, sliceAngles } from "../../utilities/chart";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";

export type DonutChartSlot =
  | "root"
  | "svg"
  | "slice"
  | "center"
  | "centerValue"
  | "centerLabel"
  | "legend"
  | "legendItem"
  | "swatch"
  | "legendLabel"
  | "legendValue";

export type DonutChartClassNames = SlotClassNames<DonutChartSlot>;

export interface DonutDatum {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps
  extends Omit<SVGAttributes<SVGSVGElement>, "children">,
    SlotConfig<DonutChartSlot> {
  data: DonutDatum[];
  /** Rendered size in pixels; the chart is square. */
  size?: number;
  /** Ring thickness as a fraction of the radius. */
  thickness?: number;
  /** Big number in the middle (defaults to the total). */
  centerValue?: string;
  /** Caption under the centre value. */
  centerLabel?: string;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
  /** Accessible name; the chart is an image to assistive technology. */
  label: string;
}

const PERCENT = (value: number, total: number) => `${round((value / (total || 1)) * 100, 1)}%`;

/** Ring chart with a centre label and a legend carrying the real numbers. */
export const DonutChart = forwardRef<SVGSVGElement, DonutChartProps>(function DonutChart(
  {
    data,
    size = 200,
    thickness = 0.38,
    centerValue,
    centerLabel,
    showLegend = true,
    valueFormatter = (value) => String(value),
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

  const geometry = useMemo(() => {
    const total = data.reduce((sum, entry) => sum + Math.max(0, entry.value), 0);
    const outerRadius = size / 2;
    const innerRadius = outerRadius * (1 - thickness);
    const slices = sliceAngles(data.map((entry) => entry.value)).map((slice, index) => ({
      ...slice,
      label: data[index].label,
      value: data[index].value,
      color: data[index].color ?? chartColor(index),
    }));
    return { total, outerRadius, innerRadius, slices };
  }, [data, size, thickness]);

  return (
    <div className={slotClass(config, "root", "ui-chart ui-chart--donut")}>
      <div className="ui-chart__donut-wrap" style={{ width: size, height: size }}>
        <svg
          ref={ref}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-labelledby={titleId}
          className={slotClass(config, "svg", "ui-chart__svg", className)}
          {...rest}
        >
          <title id={titleId}>{label}</title>
          <g>
            {geometry.slices.map((slice) => (
              <path
                key={slice.label}
                d={arcPath({
                  cx: size / 2,
                  cy: size / 2,
                  outerRadius: geometry.outerRadius,
                  innerRadius: geometry.innerRadius,
                  startAngle: slice.startAngle,
                  endAngle: slice.endAngle,
                })}
                className={slotClass(config, "slice", "ui-chart__slice")}
                style={{ fill: slice.color }}
                data-label={slice.label}
              />
            ))}
          </g>
        </svg>
        {(centerValue != null || centerLabel != null) && (
          <div className={slotClass(config, "center", "ui-chart__donut-center")} aria-hidden="true">
            <span className={slotClass(config, "centerValue", "ui-chart__donut-value")}>
              {centerValue ?? valueFormatter(geometry.total)}
            </span>
            {centerLabel != null && (
              <span className={slotClass(config, "centerLabel", "ui-chart__donut-caption")}>
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {showLegend && (
        <ul className={slotClass(config, "legend", "ui-chart__legend ui-chart__legend--stacked")}>
          {geometry.slices.map((slice) => (
            <li key={slice.label} className={slotClass(config, "legendItem", "ui-chart__legend-item")}>
              <span
                aria-hidden="true"
                className={slotClass(config, "swatch", "ui-chart__swatch")}
                style={{ backgroundColor: slice.color }}
              />
              <span className={slotClass(config, "legendLabel", "ui-chart__legend-label")}>
                {slice.label}
              </span>
              <span className={slotClass(config, "legendValue", "ui-chart__legend-value")}>
                {valueFormatter(Math.max(0, slice.value))} · {PERCENT(Math.max(0, slice.value), geometry.total)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
