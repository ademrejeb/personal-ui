import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { cx } from "../../utilities/cx";

export interface StatTrend {
  value: string;
  direction: "up" | "down" | "flat";
  /** Whether the trend is positive (e.g. up is good). */
  positive?: boolean;
}

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  trend?: StatTrend;
  icon?: ReactNode;
  action?: ReactNode;
}

const TREND_ICON = {
  up: <ArrowUpRight size={14} />,
  down: <ArrowDownRight size={14} />,
  flat: <ArrowRight size={14} />,
} as const;

/** Metric tile with label, value, trend, and supporting information. */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  { className, label, value, description, trend, icon, action, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("ui-stat-card", className)} {...rest}>
      <div className="ui-stat-card__header">
        <span className="ui-stat-card__label">{label}</span>
        {icon ? (
          <span className="ui-stat-card__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="ui-stat-card__value">{value}</div>
      {(trend || description || action) && (
        <div className="ui-stat-card__footer">
          {trend ? (
            <span
              className="ui-stat-card__trend"
              data-direction={trend.direction}
              data-positive={(trend.positive ?? trend.direction !== "down") || undefined}
            >
              <span aria-hidden="true">{TREND_ICON[trend.direction]}</span>
              {trend.value}
            </span>
          ) : null}
          {description ? <span className="ui-stat-card__description">{description}</span> : null}
          {action ? <span className="ui-stat-card__action">{action}</span> : null}
        </div>
      )}
    </div>
  );
});
StatCard.displayName = "StatCard";
