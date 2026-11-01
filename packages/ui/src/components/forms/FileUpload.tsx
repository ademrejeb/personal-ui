import {
  forwardRef,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { UploadCloud, X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { formatFileSize } from "../../utilities/format";
import { useControllableState } from "../../hooks/useControllableState";
import { mergeDescribedBy } from "../../utilities/aria";
import { useFieldControl } from "./field-utils";

export interface FileUploadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  multiple?: boolean;
  /** Comma-separated accept list, e.g. `"image/*,.pdf"`. */
  accept?: string;
  /** Max size per file in bytes. */
  maxSize?: number;
  /** Max number of files. Defaults to 1 unless `multiple`. */
  maxFiles?: number;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  label?: string;
  /** Replaces the default "drop files here" copy. */
  hint?: ReactNode;
  /** Renders a custom drop-zone body. */
  children?: ReactNode;
}

function defaultHint(multiple: boolean, accept?: string): string {
  const type = accept ? ` (${accept})` : "";
  return multiple
    ? `Drag and drop files here, or browse${type}`
    : `Drag and drop a file here, or browse${type}`;
}

/** Accessible drag-and-drop file input with a removable file list. */
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  {
    value: valueProp,
    defaultValue = [],
    onChange,
    multiple = false,
    accept,
    maxSize,
    maxFiles,
    disabled,
    invalid,
    required,
    name,
    label = "Upload files",
    hint,
    children,
    id,
    className,
    "aria-describedby": describedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, disabled, required, "aria-describedby": describedBy });
  const descriptionId = useId();
  const [files, setFiles] = useControllableState<File[]>({
    value: valueProp,
    defaultValue,
    onChange,
  });
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const limit = maxFiles ?? (multiple ? Infinity : 1);

  const acceptFiles = (incoming: File[]) => {
    const accepted: File[] = [];
    let rejection: string | null = null;
    for (const file of incoming) {
      if (maxSize != null && file.size > maxSize) {
        rejection = `“${file.name}” exceeds the ${formatFileSize(maxSize)} limit.`;
        continue;
      }
      accepted.push(file);
    }
    const next = multiple ? [...files, ...accepted].slice(0, limit) : accepted.slice(0, 1);
    setError(rejection);
    setFiles(next);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []);
    if (incoming.length) acceptFiles(incoming);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (field.disabled) return;
    const incoming = Array.from(event.dataTransfer.files ?? []);
    if (incoming.length) acceptFiles(incoming);
  };

  const openPicker = () => {
    if (field.disabled) return;
    inputRef.current?.click();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div
      ref={ref}
      className={cx("ui-fileupload", className)}
      data-invalid={field.invalid || error ? true : undefined}
      data-disabled={field.disabled || undefined}
      data-dragging={dragging || undefined}
      {...rest}
    >
      <div
        role="button"
        tabIndex={field.disabled ? -1 : 0}
        aria-disabled={field.disabled || undefined}
        aria-describedby={mergeDescribedBy(field.describedBy, descriptionId)}
        className="ui-fileupload__dropzone"
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDragOver={(event) => {
          event.preventDefault();
          if (!field.disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <UploadCloud size={22} className="ui-fileupload__icon" aria-hidden="true" />
        <span className="ui-fileupload__hint">{children ?? hint ?? defaultHint(multiple, accept)}</span>
      </div>

      <input
        ref={inputRef}
        id={field.id}
        name={name}
        type="file"
        className="ui-fileupload__input"
        aria-label={label}
        accept={accept}
        multiple={multiple}
        disabled={field.disabled}
        required={field.required && files.length === 0}
        tabIndex={-1}
        onChange={handleInputChange}
      />

      <p id={descriptionId} className="ui-fileupload__status" role="status">
        {error ??
          (files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : null)}
      </p>

      {files.length ? (
        <ul className="ui-fileupload__list">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="ui-fileupload__item">
              <span className="ui-fileupload__name">{file.name}</span>
              <span className="ui-fileupload__size">{formatFileSize(file.size)}</span>
              <button
                type="button"
                className="ui-fileupload__remove"
                aria-label={`Remove ${file.name}`}
                disabled={field.disabled}
                onClick={() => removeFile(index)}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});
FileUpload.displayName = "FileUpload";
