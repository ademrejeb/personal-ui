import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  Download,
  File,
  FileArchive,
  FileAudio,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  X,
} from "lucide-react";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type AttachmentStatus = "idle" | "uploading" | "done" | "error";
export type AttachmentSlot =
  | "root"
  | "thumbnail"
  | "icon"
  | "body"
  | "name"
  | "meta"
  | "progress"
  | "progressFill"
  | "error"
  | "actions"
  | "remove";
export type AttachmentClassNames = SlotClassNames<AttachmentSlot>;

/** Human-readable file size (e.g. `1.4 MB`). */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = unit === 0 || value >= 10 ? Math.round(value) : Number(value.toFixed(1));
  return `${rounded} ${units[unit]}`;
}

const ICONS: Record<string, ReactNode> = {
  image: <FileImage />,
  video: <FileVideo />,
  audio: <FileAudio />,
  archive: <FileArchive />,
  sheet: <FileSpreadsheet />,
  code: <FileCode2 />,
  text: <FileText />,
};

function iconFor(name: string, type?: string): ReactNode {
  const ext = (type ?? name.split(".").pop() ?? "").toLowerCase();
  if (/^(png|jpe?g|gif|webp|avif|svg)$/.test(ext) || type?.startsWith("image/")) return ICONS.image;
  if (/^(mp4|mov|webm|avi|mkv)$/.test(ext) || type?.startsWith("video/")) return ICONS.video;
  if (/^(mp3|wav|ogg|flac|m4a)$/.test(ext) || type?.startsWith("audio/")) return ICONS.audio;
  if (/^(zip|rar|7z|tar|gz)$/.test(ext)) return ICONS.archive;
  if (/^(csv|xls|xlsx|ods)$/.test(ext)) return ICONS.sheet;
  if (/^(js|jsx|ts|tsx|json|css|html|md|py|rb|go|rs)$/.test(ext)) return ICONS.code;
  if (/^(txt|pdf|doc|docx|rtf)$/.test(ext)) return ICONS.text;
  return <File />;
}

const STATUS_LABELS: Record<AttachmentStatus, string> = {
  idle: "Ready",
  uploading: "Uploading",
  done: "Uploaded",
  error: "Failed",
};

export interface AttachmentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick">,
    SlotConfig<AttachmentSlot> {
  name: string;
  /** Size in bytes. */
  size?: number;
  /** MIME type or extension used to choose the icon. */
  type?: string;
  href?: string;
  thumbnail?: string;
  status?: AttachmentStatus;
  /** Upload progress from 0 to 100. */
  progress?: number;
  error?: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}

/**
 * A file attachment card with type icon or thumbnail, size, upload progress,
 * error state, and optional download/remove actions.
 */
export const Attachment = forwardRef<HTMLDivElement, AttachmentProps>(function Attachment(
  {
    className,
    name,
    size,
    type,
    href,
    thumbnail,
    status = "idle",
    progress,
    error,
    onRemove,
    removeLabel,
    actions,
    icon,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const meta = [size != null ? formatFileSize(size) : null, STATUS_LABELS[status]]
    .filter(Boolean)
    .join(" · ");
  const clamped = progress == null ? undefined : Math.min(100, Math.max(0, progress));

  return (
    <div
      ref={ref}
      data-status={status}
      className={slotClass(config, "root", "ui-attachment", className)}
      {...rest}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt=""
          className={slotClass(config, "thumbnail", "ui-attachment__thumbnail")}
        />
      ) : (
        <span className={slotClass(config, "icon", "ui-attachment__icon")} aria-hidden="true">
          {icon ?? iconFor(name, type)}
        </span>
      )}
      <div className={slotClass(config, "body", "ui-attachment__body")}>
        <div className={slotClass(config, "name", "ui-attachment__name")}>
          {href ? (
            <a href={href} download={name}>
              {name}
              <Download size={13} aria-hidden="true" />
            </a>
          ) : (
            name
          )}
        </div>
        <div className={slotClass(config, "meta", "ui-attachment__meta")}>{meta}</div>
        {status === "uploading" && clamped != null ? (
          <div
            className={slotClass(config, "progress", "ui-attachment__progress")}
            role="progressbar"
            aria-label={`Uploading ${name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clamped}
          >
            <div
              className={slotClass(config, "progressFill", "ui-attachment__progress-fill")}
              style={{ width: `${clamped}%` }}
            />
          </div>
        ) : null}
        {error != null ? (
          <div className={slotClass(config, "error", "ui-attachment__error")}>{error}</div>
        ) : null}
      </div>
      {actions != null ? (
        <div className={slotClass(config, "actions", "ui-attachment__actions")}>{actions}</div>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          className={slotClass(config, "remove", "ui-attachment__remove")}
          aria-label={removeLabel ?? `Remove ${name}`}
          onClick={onRemove}
        >
          <X size={15} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});
Attachment.displayName = "Attachment";
