import type { ReactNode } from "react";
import { Check, Loader2 } from "lucide-react";
import { cx } from "../../utilities/cx";
import { VisuallyHidden } from "../layout/VisuallyHidden";
import { getOptionText, type OptionGroup, type SelectOption } from "./select-core";

export interface RenderOptionState {
  selected: boolean;
  active: boolean;
  disabled: boolean;
}

export interface SelectListboxProps<T extends string | number> {
  listboxId: string;
  groups: OptionGroup<T>[];
  multiple?: boolean;
  isSelected: (option: SelectOption<T>, index: number) => boolean;
  onSelect: (option: SelectOption<T>, index: number) => void;
  onActiveIndexChange: (index: number) => void;
  getOptionId: (index: number) => string;
  activeIndex: number;
  label: string;
  loading?: boolean;
  error?: ReactNode;
  emptyMessage?: ReactNode;
  loadingMessage?: ReactNode;
  renderOption?: (option: SelectOption<T>, state: RenderOptionState) => ReactNode;
  maxHeight?: number;
}

/**
 * Shared listbox rendering for Combobox and MultiSelect. Assumes options are
 * already filtered/grouped and that `getOptionId` indices match the visual
 * flattened order.
 */
export function SelectListbox<T extends string | number>({
  listboxId,
  groups,
  multiple = false,
  isSelected,
  onSelect,
  onActiveIndexChange,
  getOptionId,
  activeIndex,
  label,
  loading = false,
  error,
  emptyMessage = "No results",
  loadingMessage = "Loading…",
  renderOption,
  maxHeight = 320,
}: SelectListboxProps<T>): ReactNode {
  let index = -1;
  const isEmpty = groups.every((group) => group.options.length === 0);

  return (
    <div
      id={listboxId}
      role="listbox"
      aria-label={label}
      aria-multiselectable={multiple || undefined}
      className="ui-listbox"
      style={{ maxHeight }}
      data-loading={loading || undefined}
    >
      {loading ? (
        <div className="ui-listbox__status">
          <Loader2 size={16} className="ui-listbox__spinner" aria-hidden="true" />
          <span>{loadingMessage}</span>
        </div>
      ) : error ? (
        <div className="ui-listbox__status ui-listbox__status--error" role="alert">
          {error}
        </div>
      ) : isEmpty ? (
        <div className="ui-listbox__status">{emptyMessage}</div>
      ) : (
        groups.map((group) => (
          <div
            key={group.label || "__ungrouped"}
            className="ui-listbox__group"
            role={group.label ? "group" : "presentation"}
            aria-label={group.label || undefined}
          >
            {group.label ? (
              <div className="ui-listbox__group-label" aria-hidden="true">
                {group.label}
              </div>
            ) : null}
            {group.options.map((option) => {
              index += 1;
              const optionIndex = index;
              const selected = isSelected(option, optionIndex);
              const active = optionIndex === activeIndex;
              const disabled = Boolean(option.disabled);
              return (
                <div
                  key={String(option.value)}
                  id={getOptionId(optionIndex)}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={disabled || undefined}
                  data-active={active || undefined}
                  data-selected={selected || undefined}
                  data-disabled={disabled || undefined}
                  className={cx("ui-listbox__option", multiple && "ui-listbox__option--multi")}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => {
                    if (!disabled) onActiveIndexChange(optionIndex);
                  }}
                  onClick={() => {
                    if (!disabled) onSelect(option, optionIndex);
                  }}
                >
                  {renderOption ? (
                    renderOption(option, { selected, active, disabled })
                  ) : (
                    <>
                      {multiple ? (
                        <span className="ui-listbox__checkbox" aria-hidden="true">
                          {selected ? <Check size={12} /> : null}
                        </span>
                      ) : option.icon ? (
                        <span className="ui-listbox__icon" aria-hidden="true">
                          {option.icon}
                        </span>
                      ) : null}
                      <span className="ui-listbox__labels">
                        <span className="ui-listbox__label">
                          {option.label ?? getOptionText(option)}
                        </span>
                        {option.description != null ? (
                          <span className="ui-listbox__description">{option.description}</span>
                        ) : null}
                      </span>
                      {!multiple ? (
                        <span className="ui-listbox__check" aria-hidden="true">
                          {selected ? <Check size={14} /> : null}
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
      {loading ? <VisuallyHidden role="status">{loadingMessage}</VisuallyHidden> : null}
    </div>
  );
}
