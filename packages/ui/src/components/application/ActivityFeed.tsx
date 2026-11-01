import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export interface ActivityFeedItem {
  id?: string;
  avatar?: ReactNode;
  icon?: ReactNode;
  actor?: ReactNode;
  action: ReactNode;
  target?: ReactNode;
  timestamp: ReactNode;
}

export interface ActivityFeedProps extends HTMLAttributes<HTMLUListElement> {
  items: ActivityFeedItem[];
}

/** Timestamped list of activity records. */
export const ActivityFeed = forwardRef<HTMLUListElement, ActivityFeedProps>(function ActivityFeed(
  { className, items, ...rest },
  ref,
) {
  return (
    <ul ref={ref} className={cx("ui-activity-feed", className)} {...rest}>
      {items.map((item, index) => (
        <li key={item.id ?? index} className="ui-activity-feed__item">
          <span className="ui-activity-feed__marker" aria-hidden="true">
            {item.avatar ?? item.icon}
          </span>
          <div className="ui-activity-feed__body">
            <p className="ui-activity-feed__text">
              {item.actor != null ? (
                <span className="ui-activity-feed__actor">{item.actor}</span>
              ) : null}{" "}
              {item.action}
              {item.target != null ? (
                <>
                  {" "}
                  <span className="ui-activity-feed__target">{item.target}</span>
                </>
              ) : null}
            </p>
            <time className="ui-activity-feed__timestamp">{item.timestamp}</time>
          </div>
        </li>
      ))}
    </ul>
  );
});
ActivityFeed.displayName = "ActivityFeed";
