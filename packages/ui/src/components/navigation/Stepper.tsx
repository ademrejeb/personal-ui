import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";

export type StepStatus = "complete" | "current" | "upcoming" | "error";

export interface StepperStep {
  id?: string;
  label: ReactNode;
  description?: ReactNode;
  /** Custom marker content (icon). Falls back to the step number / check. */
  icon?: ReactNode;
  disabled?: boolean;
  /** Marks the step as optional (shown to assistive tech). */
  optional?: boolean;
  /** Explicit status override; otherwise derived from `current`. */
  status?: StepStatus;
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  steps: StepperStep[];
  /** Zero-based index of the active step (controlled). */
  current?: number;
  /** Initial active step for uncontrolled usage. Defaults to 0. */
  defaultCurrent?: number;
  onStepClick?: (index: number) => void;
  orientation?: "horizontal" | "vertical";
  /** Allow navigating to other steps by clicking them. */
  clickable?: boolean;
  /** When true (default), only completed/previous steps are clickable. */
  linear?: boolean;
  label?: string;
}

function resolveStatus(step: StepperStep, index: number, current: number): StepStatus {
  if (step.status) return step.status;
  if (index < current) return "complete";
  if (index === current) return "current";
  return "upcoming";
}

/**
 * Progress indicator for multi-step workflows.
 *
 * The connector between steps is rendered inside the step indicator row, so it
 * is always aligned to the step markers regardless of how labels wrap or how
 * tall individual step content becomes.
 */
export const Stepper = forwardRef<HTMLElement, StepperProps>(function Stepper(
  {
    className,
    steps,
    current: currentProp,
    defaultCurrent = 0,
    onStepClick,
    orientation = "horizontal",
    clickable = false,
    linear = true,
    label = "Progress",
    ...rest
  },
  ref,
) {
  const [current, setCurrent] = useControllableState<number>({
    value: currentProp,
    defaultValue: defaultCurrent,
    onChange: undefined,
  });

  const goTo = (index: number) => {
    setCurrent(index);
    onStepClick?.(index);
  };

  return (
    <nav
      ref={ref}
      aria-label={label}
      data-orientation={orientation}
      className={cx("ui-stepper", `ui-stepper--${orientation}`, className)}
      {...rest}
    >
      <ol className="ui-stepper__list">
        {steps.map((step, index) => {
          const status = resolveStatus(step, index, current);
          const isLast = index === steps.length - 1;
          const withinReach = !linear || index <= current;
          const isInteractive = clickable && !step.disabled && withinReach;
          const markerContent =
            status === "complete" && !step.icon ? (
              <Check size={14} />
            ) : status === "error" && !step.icon ? (
              <X size={14} />
            ) : step.icon != null ? (
              step.icon
            ) : (
              index + 1
            );

          const inner = (
            <>
              <span className="ui-stepper__indicator">
                <span className="ui-stepper__marker" aria-hidden="true">
                  {markerContent}
                </span>
                {!isLast ? <span className="ui-stepper__connector" aria-hidden="true" /> : null}
              </span>
              <span className="ui-stepper__text">
                <span className="ui-stepper__label">
                  {step.label}
                  {step.optional ? <span className="ui-stepper__optional"> (optional)</span> : null}
                </span>
                {step.description != null ? (
                  <span className="ui-stepper__description">{step.description}</span>
                ) : null}
              </span>
            </>
          );

          return (
            <li
              key={step.id ?? index}
              className="ui-stepper__item"
              data-state={status}
              aria-current={status === "current" ? "step" : undefined}
            >
              {isInteractive ? (
                <button
                  type="button"
                  className="ui-stepper__button"
                  onClick={() => goTo(index)}
                  disabled={step.disabled}
                >
                  {inner}
                </button>
              ) : (
                <div className="ui-stepper__static" aria-disabled={step.disabled || undefined}>
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
Stepper.displayName = "Stepper";
