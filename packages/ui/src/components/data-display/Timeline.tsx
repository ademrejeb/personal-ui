import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";
import type { Status } from "../../types";

export interface TimelineItem {
  title: ReactNode;
  timestamp?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  status?: Status;
}

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
}

/** Chronological event list with a connector rail. */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { className, items, ...rest },
  ref,
) {
  return (
    <ol ref={ref} className={cx("ui-timeline", className)} {...rest}>
      {items.map((item, index) => (
        <li key={index} className="ui-timeline__item">
          <span className="ui-timeline__rail" aria-hidden="true">
            <span
              className="ui-timeline__marker"
              data-status={item.status ?? "neutral"}
            >
              {item.icon}
            </span>
          </span>
          <div className="ui-timeline__content">
            <div className="ui-timeline__header">
              <span className="ui-timeline__title">{item.title}</span>
              {item.timestamp != null ? (
                <time className="ui-timeline__timestamp">{item.timestamp}</time>
              ) : null}
            </div>
            {item.description != null ? (
              <div className="ui-timeline__description">{item.description}</div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
});
Timeline.displayName = "Timeline";
