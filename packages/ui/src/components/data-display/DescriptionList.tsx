import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export interface DescriptionItem {
  term: ReactNode;
  description: ReactNode;
}

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  items: DescriptionItem[];
  orientation?: "vertical" | "horizontal";
  divided?: boolean;
  columns?: number;
}

/** Label/value information pairs rendered as a semantic `dl`. */
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(
  function DescriptionList(
    { className, items, orientation = "horizontal", divided = false, columns, ...rest },
    ref,
  ) {
    return (
      <dl
        ref={ref}
        data-orientation={orientation}
        className={cx("ui-description-list", `ui-description-list--${orientation}`, divided && "ui-description-list--divided", className)}
        style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
        {...rest}
      >
        {items.map((item, index) => (
          <div className="ui-description-list__item" key={index}>
            <dt className="ui-description-list__term">{item.term}</dt>
            <dd className="ui-description-list__description">{item.description}</dd>
          </div>
        ))}
      </dl>
    );
  },
);
DescriptionList.displayName = "DescriptionList";
