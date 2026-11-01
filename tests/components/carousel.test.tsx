import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Carousel } from "@personal-ui/ui";

const SLIDES = ["One", "Two", "Three", "Four", "Five"];

function Example(props: Partial<React.ComponentProps<typeof Carousel>> = {}) {
  return (
    <Carousel count={SLIDES.length} label="Featured" loop={false} {...props}>
      {SLIDES.map((slide) => (
        <div key={slide}>{slide}</div>
      ))}
    </Carousel>
  );
}

describe("Carousel", () => {
  it("exposes an ARIA carousel region with labelled slides", () => {
    render(<Example />);
    const region = screen.getByRole("region", { name: "Featured" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");

    const slide = screen.getByRole("group", { name: "1 of 5" });
    expect(slide).toHaveAttribute("aria-roledescription", "slide");
    expect(slide).toHaveAttribute("data-state", "active");
  });

  it("falls back to a plain group when no label is given", () => {
    const { container } = render(<Example label={undefined} />);
    const root = container.firstElementChild as HTMLElement;

    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(root).toHaveAttribute("role", "group");
    expect(root).toHaveAttribute("aria-roledescription", "carousel");
  });

  it("moves with the next/prev buttons and reports the live position", async () => {
    const user = userEvent.setup();
    render(<Example />);

    expect(screen.getByRole("status")).toHaveTextContent("Slide 1 of 5");
    await user.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByRole("status")).toHaveTextContent("Slide 2 of 5");
    expect(screen.getByRole("group", { name: "2 of 5" })).toHaveAttribute("data-state", "active");

    await user.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(screen.getByRole("status")).toHaveTextContent("Slide 1 of 5");
  });

  it("disables the matching control at each end when not looping", () => {
    render(<Example />);
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next slide" })).toBeEnabled();
  });

  it("wraps around when loop is enabled", async () => {
    const user = userEvent.setup();
    render(<Example loop />);

    await user.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(screen.getByRole("status")).toHaveTextContent("Slide 5 of 5");
    await user.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByRole("status")).toHaveTextContent("Slide 1 of 5");
  });

  it("moves one slide at a time and jumps to the end on End", async () => {
    render(<Example />);
    const region = screen.getByRole("region", { name: "Featured" });

    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("Slide 2 of 5");
    fireEvent.keyDown(region, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("Slide 5 of 5");
    fireEvent.keyDown(region, { key: "Home" });
    expect(screen.getByRole("status")).toHaveTextContent("Slide 1 of 5");
  });

  it("hands control to the index prop and calls onIndexChange", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Example index={2} onIndexChange={onIndexChange} />);

    expect(screen.getByRole("status")).toHaveTextContent("Slide 3 of 5");
    await user.click(screen.getByRole("button", { name: "Next slide" }));
    expect(onIndexChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("status")).toHaveTextContent("Slide 3 of 5");
  });

  it("pages the dots by slidesPerView", async () => {
    const user = userEvent.setup();
    render(<Example slidesPerView={2} />);

    const dots = screen.getAllByRole("button", { name: /^Go to page/ });
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute("aria-current", "true");

    await user.click(dots[2]);
    // The last page clamps to the final slide view, not past it.
    expect(screen.getByRole("status")).toHaveTextContent("Slide 4 of 5");
  });

  it("hides off-screen slides from the a11y tree and the tab order", () => {
    const { container } = render(<Example slidesPerView={2} />);
    const slides = container.querySelectorAll<HTMLElement>(".ui-carousel__slide");

    expect(slides[0]).not.toHaveAttribute("aria-hidden");
    expect(slides[1]).not.toHaveAttribute("aria-hidden");
    expect(slides[2]).toHaveAttribute("aria-hidden", "true");
    expect(slides[2]).toHaveAttribute("inert");
    expect(screen.queryByRole("group", { name: "3 of 5" })).not.toBeInTheDocument();
  });

  it("supports unstyled and per-slot class overrides", () => {
    const { container } = render(
      <Example unstyled classNames={{ slide: "my-slide" }} />,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).not.toHaveClass("ui-carousel");
    expect(container.querySelectorAll(".my-slide")).toHaveLength(5);
    expect(screen.getByRole("region", { name: "Featured" })).toBeInTheDocument();
  });
});
