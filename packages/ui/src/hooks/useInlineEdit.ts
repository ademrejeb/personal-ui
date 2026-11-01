import {
  useCallback,
  useRef,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { useControllableState, type SetStateAction } from "./useControllableState";
import { useEventCallback } from "./useEventCallback";

export interface UseInlineEditOptions {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  /** Controlled editing state. */
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** Enter inserts a newline; Ctrl/Cmd+Enter submits. */
  multiline?: boolean;
  /** Commit on blur. Default true. */
  submitOnBlur?: boolean;
}

export interface InlineEditInputProps {
  value: string;
  disabled: boolean;
  readOnly: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export interface UseInlineEditResult {
  value: string;
  setValue: (next: SetStateAction<string>) => void;
  editing: boolean;
  begin: () => void;
  cancel: () => void;
  commit: () => void;
  inputProps: InlineEditInputProps;
  triggerProps: {
    type: "button";
    onClick: () => void;
    disabled: boolean;
  };
}

/**
 * Headless click-to-edit state: controlled/uncontrolled value and editing mode,
 * Enter/Escape handling, and blur-to-commit. The styled `InlineEdit` component is
 * one consumer; build your own UI with these prop bags.
 */
export function useInlineEdit({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onCancel,
  editing: controlledEditing,
  defaultEditing = false,
  onEditingChange,
  disabled = false,
  readOnly = false,
  multiline = false,
  submitOnBlur = true,
}: UseInlineEditOptions = {}): UseInlineEditResult {
  const [value, setValue] = useControllableState({
    value: controlledValue,
    defaultValue,
    onChange: onValueChange,
  });
  const [editing, setEditing] = useControllableState({
    value: controlledEditing,
    defaultValue: defaultEditing,
    onChange: onEditingChange,
  });

  const previousValue = useRef(value);
  const skipBlur = useRef(false);
  const submit = useEventCallback((next: string) => onSubmit?.(next));
  const cancelCallback = useEventCallback(() => onCancel?.());

  const begin = useCallback(() => {
    if (disabled || readOnly) return;
    previousValue.current = value;
    setEditing(true);
  }, [disabled, readOnly, setEditing, value]);

  const cancel = useCallback(() => {
    skipBlur.current = true;
    setValue(previousValue.current);
    setEditing(false);
    cancelCallback();
  }, [cancelCallback, setEditing, setValue]);

  const commit = useCallback(() => {
    setEditing(false);
    submit(value);
  }, [setEditing, submit, value]);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(event.target.value);
    },
    [setValue],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
        return;
      }
      if (event.key === "Enter" && (!multiline || event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        commit();
      }
    },
    [cancel, commit, multiline],
  );

  const onBlur = useCallback(() => {
    if (skipBlur.current) {
      skipBlur.current = false;
      return;
    }
    if (submitOnBlur) commit();
  }, [commit, submitOnBlur]);

  return {
    value,
    setValue,
    editing,
    begin,
    cancel,
    commit,
    inputProps: { value, disabled, readOnly, onChange, onKeyDown, onBlur },
    triggerProps: { type: "button", onClick: begin, disabled: disabled || readOnly },
  };
}
