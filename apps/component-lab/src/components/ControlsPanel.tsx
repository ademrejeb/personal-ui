import { Input, Select, Switch, Textarea } from "@adem.rejeb/ui";
import type { Control, DemoState, DemoValue } from "../registry/types";

interface ControlsPanelProps {
  controls: Control[];
  state: DemoState;
  onChange: (name: string, value: DemoValue) => void;
  onReset: () => void;
}

export function ControlsPanel({ controls, state, onChange, onReset }: ControlsPanelProps) {
  return (
    <div className="lab-controls">
      <div className="lab-controls__header">
        <span className="lab-controls__title">Props</span>
        <button type="button" className="lab-navlink" onClick={onReset}>
          Reset
        </button>
      </div>

      {controls.map((control) => {
        const value = state[control.name];
        const label = control.label ?? control.name;

        if (control.type === "boolean") {
          return (
            <div className="lab-control lab-control--switch" key={control.name}>
              <span className="lab-control__label">{control.name}</span>
              <Switch
                size="sm"
                aria-label={label}
                checked={Boolean(value)}
                onChange={(event) => onChange(control.name, event.target.checked)}
              />
            </div>
          );
        }

        if (control.type === "select") {
          return (
            <div className="lab-control" key={control.name}>
              <label className="lab-control__label" htmlFor={`ctl-${control.name}`}>
                {control.name}
              </label>
              <Select
                id={`ctl-${control.name}`}
                size="sm"
                value={String(value ?? "")}
                onChange={(event) => {
                  const selected = control.options?.find(
                    (option) => String(option.value) === event.target.value,
                  );
                  onChange(control.name, selected ? selected.value : event.target.value);
                }}
              >
                {(control.options ?? []).map((option) => (
                  <option key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          );
        }

        return (
          <div className="lab-control" key={control.name}>
            <label className="lab-control__label" htmlFor={`ctl-${control.name}`}>
              {control.name}
            </label>
            {control.type === "textarea" ? (
              <Textarea
                id={`ctl-${control.name}`}
                size="sm"
                rows={3}
                placeholder={control.placeholder}
                value={String(value ?? "")}
                onChange={(event) => onChange(control.name, event.target.value)}
              />
            ) : (
              <Input
                id={`ctl-${control.name}`}
                size="sm"
                type={control.type === "number" ? "number" : "text"}
                min={control.min}
                max={control.max}
                step={control.step}
                placeholder={control.placeholder}
                value={value === undefined ? "" : String(value)}
                onChange={(event) =>
                  onChange(
                    control.name,
                    control.type === "number"
                      ? event.target.value === ""
                        ? undefined
                        : event.target.valueAsNumber
                      : event.target.value,
                  )
                }
              />
            )}
            {control.description ? (
              <span className="lab-control__desc">{control.description}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
