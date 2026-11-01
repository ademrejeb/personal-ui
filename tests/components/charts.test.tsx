import { render, screen } from "@testing-library/react";
import {
  AreaChart,
  BarChart,
  DonutChart,
  LineChart,
  arcPath,
  chartColor,
  formatChartValue,
  niceTicks,
  scaleLinear,
  sliceAngles,
  stackSeries,
  stackTotal,
} from "@adem.rejeb/ui";

const CATEGORIES = ["Jan", "Feb", "Mar"];
const SERIES = [
  { name: "Desktop", data: [10, 20, 30] },
  { name: "Mobile", data: [5, 15, 25] },
];

describe("chart utilities", () => {
  it("rounds ticks up to cover the maximum and includes zero", () => {
    const ticks = niceTicks(93, 0, 4);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(93);
    expect(ticks.length).toBeGreaterThan(1);
  });

  it("maps a domain onto a flipped pixel range", () => {
    const y = scaleLinear([0, 100], [200, 0]);
    expect(y(0)).toBe(200);
    expect(y(100)).toBe(0);
    expect(y(50)).toBe(100);
  });

  it("accumulates stacked series bottom-up", () => {
    const stacked = stackSeries([
      [1, 2],
      [3, 4],
    ]);
    expect(stacked).toEqual([
      [1, 2],
      [4, 6],
    ]);
    expect(stackTotal([
      [1, 2],
      [3, 4],
    ])).toBe(6);
  });

  it("cycles the series palette and compacts axis values", () => {
    expect(chartColor(0)).toBe(chartColor(6));
    expect(chartColor(1)).not.toBe(chartColor(0));
    expect(formatChartValue(1200)).toBe("1.2k");
    expect(formatChartValue(2_400_000)).toBe("2.4M");
    expect(formatChartValue(7)).toBe("7");
  });

  it("derives cumulative donut angles and closes full circles", () => {
    const slices = sliceAngles([1, 1, 2]);
    expect(slices[0]).toEqual({ startAngle: 0, endAngle: 90 });
    expect(slices[2].endAngle).toBe(360);

    const full = sliceAngles([10]);
    expect(full[0].endAngle).toBe(360);
    expect(arcPath({ cx: 0, cy: 0, outerRadius: 10, innerRadius: 6, ...full[0] })).not.toContain("NaN");
  });
});

describe("LineChart", () => {
  it("exposes a labelled image with a legend and one path per series", () => {
    const { container } = render(
      <LineChart series={SERIES} categories={CATEGORIES} label="Sessions per month" />,
    );

    expect(screen.getByRole("img", { name: "Sessions per month" })).toBeInTheDocument();
    expect(screen.getByText("Desktop")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();

    const paths = container.querySelectorAll(".ui-chart__line");
    expect(paths).toHaveLength(2);
    expect(paths[0]).toHaveAttribute("data-series", "Desktop");
    expect(paths[0].getAttribute("d")).not.toContain("NaN");
  });

  it("adds area fills only for the area variant", () => {
    const { container, unmount } = render(
      <LineChart series={SERIES} categories={CATEGORIES} label="Trend" />,
    );
    expect(container.querySelectorAll(".ui-chart__area")).toHaveLength(0);
    unmount();

    const { container: areaContainer } = render(
      <AreaChart series={SERIES} categories={CATEGORIES} label="Trend" />,
    );
    expect(areaContainer.querySelectorAll(".ui-chart__area")).toHaveLength(2);
  });

  it("honours unstyled and per-slot classNames", () => {
    const { container } = render(
      <LineChart
        series={SERIES}
        categories={CATEGORIES}
        label="Trend"
        unstyled
        classNames={{ legendItem: "custom-item" }}
      />,
    );
    expect(container.querySelector(".ui-chart")).toBeNull();
    expect(container.querySelectorAll("svg")).toHaveLength(1);
    expect(screen.getByText("Desktop").closest("li")).toHaveClass("custom-item");
  });
});

describe("BarChart", () => {
  it("renders one bar per series and category", () => {
    const { container } = render(
      <BarChart series={SERIES} categories={CATEGORIES} label="Sessions per month" />,
    );
    expect(container.querySelectorAll(".ui-chart__bar")).toHaveLength(6);
    container.querySelectorAll(".ui-chart__bar").forEach((bar) => {
      expect(bar.getAttribute("height")).not.toContain("NaN");
      expect(Number(bar.getAttribute("height"))).toBeGreaterThanOrEqual(0);
    });
  });

  it("keeps the same bar count when stacked", () => {
    const { container } = render(
      <BarChart series={SERIES} categories={CATEGORIES} label="Sessions per month" stacked />,
    );
    const bars = container.querySelectorAll(".ui-chart__bar");
    expect(bars).toHaveLength(6);

    const lastCategory = Array.from(bars).filter((bar) => bar.getAttribute("data-series") === "Mobile");
    expect(Number(lastCategory[2].getAttribute("y"))).toBeLessThan(Number(lastCategory[0].getAttribute("y")));
  });
});

describe("DonutChart", () => {
  const DATA = [
    { label: "Direct", value: 60 },
    { label: "Search", value: 40 },
  ];

  it("renders a slice per datum plus a legend with values", () => {
    const { container } = render(<DonutChart data={DATA} label="Traffic sources" />);
    expect(container.querySelectorAll(".ui-chart__slice")).toHaveLength(2);
    expect(screen.getByRole("img", { name: "Traffic sources" })).toBeInTheDocument();
    expect(screen.getByText(/Direct/)).toBeInTheDocument();
    expect(screen.getByText("60 · 60%")).toBeInTheDocument();
  });

  it("renders the centre metric and skips it when not requested", () => {
    const { unmount } = render(
      <DonutChart data={DATA} label="Traffic sources" centerLabel="sessions" />,
    );
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("sessions")).toBeInTheDocument();
    unmount();

    const { container } = render(<DonutChart data={DATA} label="Traffic sources" />);
    expect(container.querySelector(".ui-chart__donut-center")).toBeNull();
  });
});
