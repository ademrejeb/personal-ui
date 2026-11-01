import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utilities/cx";

export interface SettingsSectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

/** Grouped block of settings rows with a title and description. */
export const SettingsSection = forwardRef<HTMLElement, SettingsSectionProps>(
  function SettingsSection({ className, title, description, actions, children, ...rest }, ref) {
    return (
      <section ref={ref} className={cx("ui-settings-section", className)} {...rest}>
        <div className="ui-settings-section__header">
          <div>
            <h2 className="ui-settings-section__title">{title}</h2>
            {description != null ? (
              <p className="ui-settings-section__description">{description}</p>
            ) : null}
          </div>
          {actions != null ? <div className="ui-settings-section__actions">{actions}</div> : null}
        </div>
        <div className="ui-settings-section__body">{children}</div>
      </section>
    );
  },
);
SettingsSection.displayName = "SettingsSection";

export interface SettingsRowProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  description?: ReactNode;
  /** The control on the trailing side. */
  control?: ReactNode;
  /** Associate the row label with a control id. */
  htmlFor?: string;
  /** Stack the control beneath the description. */
  orientation?: "horizontal" | "vertical";
}

/** A single label/description + control row. */
export const SettingsRow = forwardRef<HTMLDivElement, SettingsRowProps>(function SettingsRow(
  { className, label, description, control, htmlFor, orientation = "horizontal", children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      data-orientation={orientation}
      className={cx("ui-settings-row", `ui-settings-row--${orientation}`, className)}
      {...rest}
    >
      <div className="ui-settings-row__text">
        <label className="ui-settings-row__label" htmlFor={htmlFor}>
          {label}
        </label>
        {description != null ? (
          <p className="ui-settings-row__description">{description}</p>
        ) : null}
      </div>
      <div className="ui-settings-row__control">{control ?? children}</div>
    </div>
  );
});
SettingsRow.displayName = "SettingsRow";
