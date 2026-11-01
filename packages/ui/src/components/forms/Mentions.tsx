import {
  forwardRef,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { useControllableState } from "../../hooks/useControllableState";
import { mergeRefs } from "../../utilities/mergeRefs";
import { useFieldControl } from "./field-utils";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";
import type { ControlSize } from "../../types";
import type { Placement } from "../../utilities/position";

export interface MentionOption {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
  avatar?: ReactNode;
  disabled?: boolean;
}

export type MentionsSlot =
  | "root"
  | "control"
  | "popup"
  | "list"
  | "option"
  | "optionAvatar"
  | "optionLabel"
  | "optionDescription"
  | "empty";
export type MentionsClassNames = SlotClassNames<MentionsSlot>;

export interface MentionsProps
  extends Omit<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      "value" | "defaultValue" | "onChange" | "size" | "children" | "onSelect"
    >,
    SlotConfig<MentionsSlot> {
  options: MentionOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Character that opens the suggestion list. Defaults to `@`. */
  trigger?: string;
  size?: ControlSize;
  invalid?: boolean;
  onSelect?: (option: MentionOption) => void;
  filterOption?: (option: MentionOption, query: string) => boolean;
  emptyText?: ReactNode;
  placement?: Placement;
}

interface MentionQuery {
  start: number;
  text: string;
}

const defaultFilter = (option: MentionOption, query: string): boolean => {
  const needle = query.toLowerCase();
  const label = typeof option.label === "string" ? option.label : option.value;
  return (
    option.value.toLowerCase().includes(needle) || label.toLowerCase().includes(needle)
  );
};

/**
 * A textarea with `@mention` autocomplete. The popup is a `FloatingLayer`, so
 * dismissal, positioning, and focus stay consistent with the other pickers.
 */
export const Mentions = forwardRef<HTMLTextAreaElement, MentionsProps>(function Mentions(
  {
    className,
    options,
    value,
    defaultValue = "",
    onValueChange,
    trigger = "@",
    size = "md",
    invalid,
    onSelect,
    filterOption = defaultFilter,
    emptyText = "No matches",
    placement = "bottom-start",
    id,
    disabled,
    required,
    "aria-describedby": describedBy,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const field = useFieldControl({ id, invalid, disabled, required, "aria-describedby": describedBy });
  const [text, setText] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [query, setQuery] = useState<MentionQuery | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const listId = useId();

  const matches = useMemo(
    () => options.filter((option) => !option.disabled && filterOption(option, query?.text ?? "")),
    [filterOption, options, query?.text],
  );

  const open = query !== null;

  const detect = (node: HTMLTextAreaElement) => {
    const caret = node.selectionStart ?? 0;
    const before = node.value.slice(0, caret);
    const index = before.lastIndexOf(trigger);
    if (index < 0) {
      setQuery(null);
      return;
    }
    const token = before.slice(index + trigger.length);
    const boundary = index === 0 || /\s/.test(before[index - 1]);
    if (!boundary || /\s/.test(token)) {
      setQuery(null);
      return;
    }
    setQuery({ start: index, text: token });
    setActiveIndex(0);
  };

  const select = (option: MentionOption) => {
    if (!query) return;
    const before = text.slice(0, query.start);
    const after = text.slice(query.start + trigger.length + query.text.length);
    const inserted = `${trigger}${option.value} `;
    const next = `${before}${inserted}${after}`;
    setText(next);
    setQuery(null);
    onSelect?.(option);
    const caret = before.length + inserted.length;
    setTimeout(() => {
      const target = textareaRef.current;
      if (!target) return;
      target.focus();
      target.setSelectionRange(caret, caret);
    }, 0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (matches.length ? (prev + 1) % matches.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        matches.length ? (prev - 1 + matches.length) % matches.length : 0,
      );
    } else if (event.key === "Enter" || event.key === "Tab") {
      if (matches[activeIndex]) {
        event.preventDefault();
        select(matches[activeIndex]);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      setQuery(null);
    }
  };

  return (
    <div
      ref={rootRef}
      className={slotClass(config, "root", "ui-mentions", className)}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-open={open || undefined}
    >
      <textarea
        {...rest}
        ref={mergeRefs(textareaRef, ref)}
        id={field.id}
        disabled={field.disabled || undefined}
        required={field.required || undefined}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        aria-activedescendant={
          open && matches[activeIndex] ? `${listId}-${activeIndex}` : undefined
        }
        data-size={size}
        className={slotClass(config, "control", "ui-textarea", "ui-control", "ui-mentions__control")}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          detect(event.target);
        }}
        onKeyDown={(event) => {
          rest.onKeyDown?.(event);
          if (!event.defaultPrevented) onKeyDown(event);
        }}
        onClick={(event) => {
          rest.onClick?.(event);
          detect(event.currentTarget);
        }}
      />
      <FloatingLayer
        open={open}
        anchorRef={rootRef}
        placement={placement}
        offset={6}
        matchTriggerWidth
        keepOpenRefs={[rootRef]}
        onDismiss={() => setQuery(null)}
        id={listId}
        role="listbox"
        aria-label="Mention suggestions"
        className={slotClass(config, "popup", "ui-mentions__popup")}
      >
        <div className={slotClass(config, "list", "ui-mentions__list")}>
          {matches.length ? (
            matches.map((option, index) => (
              <button
                key={option.value}
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                data-active={index === activeIndex || undefined}
                className={slotClass(config, "option", "ui-mentions__option")}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(option)}
              >
                {option.avatar != null ? (
                  <span
                    className={slotClass(config, "optionAvatar", "ui-mentions__avatar")}
                    aria-hidden="true"
                  >
                    {option.avatar}
                  </span>
                ) : null}
                <span className={slotClass(config, "optionLabel", "ui-mentions__option-label")}>
                  {option.label ?? option.value}
                </span>
                {option.description != null ? (
                  <span
                    className={slotClass(
                      config,
                      "optionDescription",
                      "ui-mentions__option-description",
                    )}
                  >
                    {option.description}
                  </span>
                ) : null}
              </button>
            ))
          ) : (
            <div className={slotClass(config, "empty", "ui-mentions__empty")}>{emptyText}</div>
          )}
        </div>
      </FloatingLayer>
    </div>
  );
});
Mentions.displayName = "Mentions";
