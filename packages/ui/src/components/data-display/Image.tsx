import {
  forwardRef,
  useState,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import { ImageOff } from "lucide-react";
import { Modal } from "../overlays/Modal";
import {
  slotClass,
  slotConfig,
  type SlotClassNames,
  type SlotConfig,
} from "../../utilities/slots";

export type ImageFit = "cover" | "contain" | "fill";
export type ImageSlot =
  | "root"
  | "frame"
  | "trigger"
  | "image"
  | "fallback"
  | "caption"
  | "preview";
export type ImageClassNames = SlotClassNames<ImageSlot>;

export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "onLoad" | "onError">,
    SlotConfig<ImageSlot> {
  src: string;
  alt: string;
  /** Rendered when the image fails to load. */
  fallback?: ReactNode;
  /** Open a full-screen lightbox on click. */
  preview?: boolean;
  /** Higher-resolution source for the lightbox. */
  previewSrc?: string;
  caption?: ReactNode;
  fit?: ImageFit;
  /** Aspect ratio as width / height (e.g. `16 / 9`). */
  ratio?: number;
  onLoad?: ImgHTMLAttributes<HTMLImageElement>["onLoad"];
  onError?: ImgHTMLAttributes<HTMLImageElement>["onError"];
}

/**
 * An image with a loading state, fallback, optional caption, and an accessible
 * lightbox preview built on the design system's `Modal`.
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    className,
    src,
    alt,
    fallback,
    preview = false,
    previewSrc,
    caption,
    fit = "cover",
    ratio,
    onLoad,
    onError,
    style,
    unstyled = false,
    classNames,
    ...rest
  },
  ref,
) {
  const config = slotConfig(unstyled, classNames);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [open, setOpen] = useState(false);

  const image = (
    <img
      {...rest}
      ref={ref}
      src={src}
      alt={alt}
      loading={rest.loading ?? "lazy"}
      data-fit={fit}
      data-status={status}
      className={slotClass(config, "image", "ui-image__img")}
      style={{ aspectRatio: ratio }}
      onLoad={(event) => {
        setStatus("loaded");
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus("error");
        onError?.(event);
      }}
    />
  );

  return (
    <figure
      className={slotClass(config, "root", "ui-image", className)}
      data-preview={preview || undefined}
      style={style}
    >
      <div className={slotClass(config, "frame", "ui-image__frame")}>
        {status === "error" && fallback ? (
          <span className={slotClass(config, "fallback", "ui-image__fallback")} role="img" aria-label={alt}>
            {fallback}
          </span>
        ) : preview ? (
          <button
            type="button"
            className={slotClass(config, "trigger", "ui-image__trigger")}
            aria-label={`Preview image: ${alt}`}
            onClick={() => setOpen(true)}
          >
            {image}
          </button>
        ) : (
          image
        )}
        {status === "error" && !fallback ? (
          <span className={slotClass(config, "fallback", "ui-image__fallback")} role="img" aria-label={alt}>
            <ImageOff size={24} aria-hidden="true" />
          </span>
        ) : null}
      </div>
      {caption != null ? (
        <figcaption className={slotClass(config, "caption", "ui-image__caption")}>
          {caption}
        </figcaption>
      ) : null}
      {preview ? (
        <Modal open={open} onOpenChange={setOpen}>
          <Modal.Content size="full" aria-label={`Image preview: ${alt}`}>
            <img
              src={previewSrc ?? src}
              alt={alt}
              className={slotClass(config, "preview", "ui-image__preview")}
            />
          </Modal.Content>
        </Modal>
      ) : null}
    </figure>
  );
});
Image.displayName = "Image";
