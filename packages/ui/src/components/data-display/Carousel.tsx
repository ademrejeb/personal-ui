import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCarousel, type CarouselApi, type CarouselOrientation } from "../../hooks/useCarousel";
import { cx } from "../../utilities/cx";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";

export type CarouselSlot =
  | "root"
  | "viewport"
  | "track"
  | "slide"
  | "controls"
  | "prev"
  | "next"
  | "dots"
  | "dot"
  | "dotMark"
  | "live";

export type CarouselClassNames = SlotClassNames<CarouselSlot>;

export interface CarouselProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    SlotConfig<CarouselSlot> {
  /** Number of slides. */
  count: number;
  /** Controlled active slide. */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  orientation?: CarouselOrientation;
  /** Wrap around at either end. Defaults to `true`. */
  loop?: boolean;
  /** Slides visible at once. Defaults to `1`. */
  slidesPerView?: number;
  /** Autoplay interval in ms; `0` disables. */
  autoplay?: number;
  pauseOnHover?: boolean;
  /** Accessible name; providing one promotes the root to a `region` landmark. */
  label?: string;
  /** Render the previous/next buttons. Defaults to `true`. */
  showControls?: boolean;
  /** Render the page dots. Defaults to more than one page. */
  showDots?: boolean;
  /** One element per slide, or a single element for a one-slide carousel. */
  children?: ReactNode;
  prevIcon?: ReactNode;
  nextIcon?: ReactNode;
}

interface CarouselContextValue {
  api: CarouselApi;
  config: SlotConfig<CarouselSlot>;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

const useCarouselContext = (): CarouselContextValue => {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error("Carousel subcomponents must be used within a <Carousel>.");
  return ctx;
};

const slideStyle = (slidesPerView: number, style?: React.CSSProperties): React.CSSProperties => {
  const basis = `${100 / Math.max(1, slidesPerView)}%`;
  return { flexBasis: basis, maxWidth: basis, ...style };
};

function CarouselRoot({
  className,
  classNames,
  unstyled = false,
  count,
  index,
  defaultIndex,
  onIndexChange,
  orientation = "horizontal",
  loop = true,
  slidesPerView = 1,
  autoplay = 0,
  pauseOnHover = true,
  label,
  showControls = true,
  showDots,
  prevIcon,
  nextIcon,
  children,
  ...rest
}: CarouselProps): ReactNode {
  const config = useMemo(() => slotConfig(unstyled, classNames), [unstyled, classNames]);
  const api = useCarousel({
    count,
    index,
    defaultIndex,
    onIndexChange,
    orientation,
    loop,
    slidesPerView,
    autoplay,
    pauseOnHover,
    label,
  });
  const liveId = useId();
  const value = useMemo(() => ({ api, config }), [api, config]);
  const withDots = showDots ?? api.pages > 1;
  const step = 100 / Math.max(1, slidesPerView);
  const slides = Array.isArray(children) ? children : [children];

  return (
    <CarouselContext.Provider value={value}>
      <div
        className={slotClass(config, "root", "ui-carousel", className)}
        {...api.getRootProps(rest)}
      >
        <div
          className={slotClass(config, "viewport", "ui-carousel__viewport")}
          {...api.getViewportProps()}
        >
          <div
            className={slotClass(config, "track", "ui-carousel__track")}
            {...api.getTrackProps({
              style: {
                transform:
                  orientation === "horizontal"
                    ? `translateX(-${api.index * step}%)`
                    : `translateY(-${api.index * step}%)`,
              },
            })}
          >
            {Array.from({ length: count }, (_, slideIndex) => (
              <div
                key={slideIndex}
                className={slotClass(config, "slide", "ui-carousel__slide")}
                style={slideStyle(slidesPerView)}
                {...api.getSlideProps(slideIndex)}
              >
                {slides[slideIndex] ?? null}
              </div>
            ))}
          </div>
        </div>

        {showControls && (
          <div className={slotClass(config, "controls", "ui-carousel__controls")}>
            <button
              className={slotClass(config, "prev", "ui-carousel__control ui-carousel__control--prev")}
              {...api.getPrevProps()}
            >
              {prevIcon ?? <ChevronLeft size={18} />}
            </button>
            <button
              className={slotClass(config, "next", "ui-carousel__control ui-carousel__control--next")}
              {...api.getNextProps()}
            >
              {nextIcon ?? <ChevronRight size={18} />}
            </button>
          </div>
        )}

        {withDots && (
          <div className={slotClass(config, "dots", "ui-carousel__dots")}>
            {Array.from({ length: api.pages }, (_, page) => (
              <button
                key={page}
                className={slotClass(config, "dot", "ui-carousel__dot")}
                {...api.getDotProps(page)}
              >
                <span
                  className={slotClass(config, "dotMark", "ui-carousel__dot-mark")}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        )}

        <div
          id={liveId}
          role="status"
          aria-live="polite"
          // Always visually hidden: this status text is behavioural, not styling.
          className={cx("ui-visually-hidden", classNames?.live)}
        >
          {api.liveMessage}
        </div>
      </div>
    </CarouselContext.Provider>
  );
}

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
  /** Zero-based slide position; must be unique within the carousel. */
  index: number;
}

/**
 * A single slide. Only needed for hand-composed carousels — `<Carousel>` wraps
 * its `children` automatically.
 */
export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide({ className, index, style, children, ...rest }, ref) {
    const { api, config } = useCarouselContext();

    return (
      <div
        ref={ref}
        className={slotClass(config, "slide", "ui-carousel__slide", className)}
        style={slideStyle(api.slidesPerView, style)}
        {...api.getSlideProps(index, rest)}
      >
        {children}
      </div>
    );
  },
);
CarouselSlide.displayName = "Carousel.Slide";

export interface CarouselControlsProps extends HTMLAttributes<HTMLDivElement> {
  prevIcon?: ReactNode;
  nextIcon?: ReactNode;
}

/** Standalone prev/next controls, for layouts that put them outside the root. */
export const CarouselControls = forwardRef<HTMLDivElement, CarouselControlsProps>(
  function CarouselControls({ className, prevIcon, nextIcon, ...rest }, ref) {
    const { api, config } = useCarouselContext();

    return (
      <div
        ref={ref}
        className={slotClass(config, "controls", "ui-carousel__controls", className)}
        {...rest}
      >
        <button
          className={slotClass(config, "prev", "ui-carousel__control ui-carousel__control--prev")}
          {...api.getPrevProps()}
        >
          {prevIcon ?? <ChevronLeft size={18} />}
        </button>
        <button
          className={slotClass(config, "next", "ui-carousel__control ui-carousel__control--next")}
          {...api.getNextProps()}
        >
          {nextIcon ?? <ChevronRight size={18} />}
        </button>
      </div>
    );
  },
);
CarouselControls.displayName = "Carousel.Controls";

export type CarouselDotsProps = HTMLAttributes<HTMLDivElement>;

/** Standalone page dots. */
export const CarouselDots = forwardRef<HTMLDivElement, CarouselDotsProps>(
  function CarouselDots({ className, ...rest }, ref) {
    const { api, config } = useCarouselContext();

    return (
      <div
        ref={ref}
        className={slotClass(config, "dots", "ui-carousel__dots", className)}
        {...rest}
      >
        {Array.from({ length: api.pages }, (_, page) => (
          <button
            key={page}
            className={slotClass(config, "dot", "ui-carousel__dot")}
            {...api.getDotProps(page)}
          >
            <span
              className={slotClass(config, "dotMark", "ui-carousel__dot-mark")}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    );
  },
);
CarouselDots.displayName = "Carousel.Dots";

/** A sliding viewport of slides, with controls, dots and an ARIA carousel role. */
export const Carousel = Object.assign(CarouselRoot, {
  Slide: CarouselSlide,
  Controls: CarouselControls,
  Dots: CarouselDots,
});
