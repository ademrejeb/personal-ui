import {
  forwardRef,
  useEffect,
  useRef,
  type ChangeEventHandler,
  type FocusEventHandler,
  type HTMLAttributes,
  type KeyboardEventHandler,
} from "react";
import { Check, Pencil, X } from "lucide-react";
import { useInlineEdit } from "../../hooks/useInlineEdit";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type InlineEditSlot =
  | "root"
  | "trigger"
  | "value"
  | "icon"
  | "input"
  | "actions"
  | "action";
export type InlineEditClassNames = SlotClassNames<InlineEditSlot>;

export interface InlineEditProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "onSubmit">,
    SlotConfig<InlineEditSlot> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  /** Controlled editing state. */
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  /** Accessible name for the value being edited. */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  submitOnBlur?: boolean;
  selectOnFocus?: boolean;
  size?: "sm" | "md" | "lg";
  /** Show explicit save/cancel buttons while editing. */
  showActions?: boolean;
  editLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
}

/**
 * Click-to-edit text. Enter saves, Escape cancels, blur saves by default; the
 * headless logic lives in `useInlineEdit`.
 */
export const InlineEdit = forwardRef<HTMLDivElement, InlineEditProps>(function InlineEdit(
  {
    className,
    value,
    defaultValue,
    onValueChange,
    onSubmit,
    onCancel,
    editing: controlledEditing,
    defaultEditing,
    onEditingChange,
    label,
    placeholder = "Click to edit",
    disabled = false,
    readOnly = false,
    multiline = false,
    submitOnBlur = true,
    selectOnFocus = true,
    size = "md",
    showActions = false,
    editLabel = "Edit",
    saveLabel = "Save",
    cancelLabel = "Cancel",
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const edit = useInlineEdit({
    value,
    defaultValue,
    onValueChange,
    onSubmit,
    onCancel,
    editing: controlledEditing,
    defaultEditing,
    onEditingChange,
    disabled,
    readOnly,
    multiline,
    submitOnBlur,
  });
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!edit.editing) return;
    const node = inputRef.current;
    node?.focus();
    if (selectOnFocus) node?.select();
  }, [edit.editing, selectOnFocus]);

  const triggerLabel = label ? `${editLabel} ${label}` : editLabel;
  const triggerDescription = `${triggerLabel}: ${edit.value || placeholder}`;

  if (edit.editing) {
    const common = {
      ref: (node: HTMLInputElement | HTMLTextAreaElement | null) => {
        inputRef.current = node;
      },
      value: edit.inputProps.value,
      disabled: edit.inputProps.disabled,
      readOnly: edit.inputProps.readOnly,
      placeholder,
      "aria-label": label ?? editLabel,
      "data-size": size,
      className: slotClass(config, "input", "ui-control", "ui-inline-edit__input"),
    };

    return (
      <div
        ref={ref}
        className={slotClass(config, "root", "ui-inline-edit", className)}
        data-size={size}
        data-editing="true"
        {...rest}
      >
        {multiline ? (
          <textarea
            {...common}
            rows={3}
            onChange={edit.inputProps.onChange as ChangeEventHandler<HTMLTextAreaElement>}
            onKeyDown={edit.inputProps.onKeyDown as KeyboardEventHandler<HTMLTextAreaElement>}
            onBlur={edit.inputProps.onBlur as FocusEventHandler<HTMLTextAreaElement>}
          />
        ) : (
          <input
            {...common}
            type="text"
            onChange={edit.inputProps.onChange as ChangeEventHandler<HTMLInputElement>}
            onKeyDown={edit.inputProps.onKeyDown as KeyboardEventHandler<HTMLInputElement>}
            onBlur={edit.inputProps.onBlur as FocusEventHandler<HTMLInputElement>}
          />
        )}
        {showActions ? (
          <span className={slotClass(config, "actions", "ui-inline-edit__actions")}>
            <button
              type="button"
              className={slotClass(config, "action", "ui-inline-edit__action")}
              aria-label={saveLabel}
              title={saveLabel}
              onMouseDown={(event) => event.preventDefault()}
              onClick={edit.commit}
            >
              <Check size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={slotClass(config, "action", "ui-inline-edit__action")}
              aria-label={cancelLabel}
              title={cancelLabel}
              onMouseDown={(event) => event.preventDefault()}
              onClick={edit.cancel}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={slotClass(config, "root", "ui-inline-edit", className)}
      data-size={size}
      {...rest}
    >
      <button
        {...edit.triggerProps}
        className={slotClass(config, "trigger", "ui-inline-edit__trigger")}
        aria-label={triggerDescription}
        title={triggerLabel}
      >
        <span
          className={slotClass(
            config,
            "value",
            "ui-inline-edit__value",
            !edit.value && "ui-inline-edit__value--empty",
          )}
        >
          {edit.value || placeholder}
        </span>
        <Pencil
          className={slotClass(config, "icon", "ui-inline-edit__icon")}
          size={14}
          aria-hidden="true"
        />
      </button>
    </div>
  );
});
InlineEdit.displayName = "InlineEdit";
