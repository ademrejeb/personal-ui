import { useState } from "react";
import { Check, DollarSign, FileText, Hash, Star, Truck } from "lucide-react";
import {
  AreaChart,
  Attachment,
  Avatar,
  Badge,
  BarChart,
  Bubble,
  Button,
  Carousel,
  DataTable,
  DescriptionList,
  DonutChart,
  Image,
  Item,
  LineChart,
  List,
  MessageScroller,
  RelativeTime,
  Sparkline,
  StatCard,
  Table,
  Tag,
  Timeline,
} from "@personal-ui/ui";
import type { Column, DescriptionItem, SortState, Status } from "@personal-ui/ui";
import type { ComponentEntry } from "./types";
import { bool, num, pick, str } from "./demo";
import { jsx } from "../lib/jsx";

const IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%236366f1'/%3E%3Cstop offset='1' stop-color='%23ec4899'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='360' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' fill='white' font-family='sans-serif' font-size='34' text-anchor='middle' dominant-baseline='middle'%3EPersonal UI%3C/text%3E%3C/svg%3E";

function MessageScrollerDemo() {
  const [messages, setMessages] = useState([
    "Welcome to the channel.",
    "The new components are live.",
    "Scroll up to see earlier messages.",
  ]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ui-p-space-3)", width: "min(100%, 26rem)" }}>
      <MessageScroller maxHeight={260} emptyState="No messages yet">
        {messages.map((message, index) => (
          <Bubble
            key={`${message}-${index}`}
            align={index % 2 === 1 ? "end" : "start"}
            variant={index % 2 === 1 ? "primary" : "surface"}
            name={index % 2 === 1 ? "You" : "Ada"}
            time={`12:0${index}`}
          >
            {message}
          </Bubble>
        ))}
      </MessageScroller>
      <Button size="sm" onClick={() => setMessages((prev) => [...prev, `Message ${prev.length + 1}`])}>
        Add message
      </Button>
    </div>
  );
}

const AVATAR_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const avatarSizeOptions = AVATAR_SIZES.map((value) => ({ label: value, value }));

const BADGE_VARIANTS = ["neutral", "primary", "success", "warning", "danger", "info", "outline"] as const;
const badgeVariantOptions = BADGE_VARIANTS.map((value) => ({ label: value, value }));

const TAG_VARIANTS = ["neutral", "primary", "success", "warning", "danger", "info"] as const;
const tagVariantOptions = TAG_VARIANTS.map((value) => ({ label: value, value }));

const STATUS_OPTIONS = [
  { label: "none", value: "none" },
  { label: "neutral", value: "neutral" },
  { label: "success", value: "success" },
  { label: "warning", value: "warning" },
  { label: "danger", value: "danger" },
  { label: "info", value: "info" },
];

const ALIGN_OPTIONS = [
  { label: "start", value: "start" },
  { label: "center", value: "center" },
  { label: "end", value: "end" },
];

const ORIENTATION_OPTIONS = [
  { label: "horizontal", value: "horizontal" },
  { label: "vertical", value: "vertical" },
];

const LIST_VARIANT_OPTIONS = [
  { label: "plain", value: "plain" },
  { label: "bordered", value: "bordered" },
  { label: "divided", value: "divided" },
];

const TREND_OPTIONS = [
  { label: "none", value: "none" },
  { label: "up", value: "up" },
  { label: "down", value: "down" },
  { label: "flat", value: "flat" },
];

const SPARK_DATASET_OPTIONS = [
  { label: "up", value: "up" },
  { label: "down", value: "down" },
  { label: "volatile", value: "volatile" },
];

const PAGE_SIZE_OPTIONS = [
  { label: "None", value: 0 },
  { label: "3 rows", value: 3 },
  { label: "5 rows", value: 5 },
];

const DESCRIPTION_ITEMS: DescriptionItem[] = [
  { term: "Plan", description: "Pro" },
  { term: "Seats", description: "12" },
  { term: "Renewal", description: "Mar 1, 2026" },
  { term: "Region", description: "us-east-1" },
];

const SPARK_DATA: Record<string, number[]> = {
  up: [4, 6, 5, 9, 8, 12, 14, 13, 17],
  down: [18, 16, 17, 13, 12, 9, 10, 7, 5],
  volatile: [8, 3, 11, 6, 14, 5, 12, 9, 15],
};

interface Person {
  id: string;
  name: string;
  role: string;
  commits: number;
  /** Calendar date (date-only string) — sorts correctly without zone shifts. */
  joined: string;
  lastActive: string | null;
}

const PEOPLE: Person[] = [
  { id: "1", name: "Ada Lovelace", role: "Engineering", commits: 128, joined: "2024-03-11", lastActive: "2026-10-14" },
  { id: "2", name: "Grace Hopper", role: "Engineering", commits: 96, joined: "2023-12-31", lastActive: "2026-01-02" },
  { id: "3", name: "Alan Turing", role: "Research", commits: 74, joined: "2025-01-20", lastActive: null },
  { id: "4", name: "Katherine Johnson", role: "Research", commits: 61, joined: "2024-11-05", lastActive: "2026-09-30" },
  { id: "5", name: "Margaret Hamilton", role: "Engineering", commits: 143, joined: "2022-06-15", lastActive: "2026-10-01" },
];

const PEOPLE_COLUMNS: Column<Person>[] = [
  { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
  { id: "role", header: "Team", accessor: (row) => row.role, sortable: true },
  { id: "joined", header: "Joined", accessor: (row) => row.joined, sortable: true },
  { id: "lastActive", header: "Last active", accessor: (row) => row.lastActive, sortable: true },
  { id: "commits", header: "Commits", accessor: (row) => row.commits, sortable: true, align: "end" },
];

const DENSITY_OPTIONS = [
  { label: "default", value: "default" },
  { label: "compact", value: "compact" },
  { label: "comfortable", value: "comfortable" },
];

function DataTablePreview({
  selectable,
  pageSize,
  loading,
  stickyHeader,
  searchable,
  density,
  errorState,
}: {
  selectable: boolean;
  pageSize: number;
  loading: boolean;
  stickyHeader: boolean;
  searchable: boolean;
  density: "compact" | "default" | "comfortable";
  errorState: boolean;
}) {
  const [sort, setSort] = useState<SortState | null>({ columnId: "joined", direction: "asc" });

  return (
    <DataTable
      data={PEOPLE}
      columns={PEOPLE_COLUMNS}
      getRowId={(row) => row.id}
      sort={sort}
      onSortChange={setSort}
      selectable={selectable}
      loading={loading}
      stickyHeader={stickyHeader}
      searchable={searchable}
      searchPlaceholder="Search people…"
      density={density}
      striped
      error={errorState ? "Could not load contributors." : undefined}
      onRetry={() => undefined}
      pageSize={pageSize > 0 ? pageSize : undefined}
      pageSizeOptions={[3, 5, 10]}
      caption="Team contributors"
    />
  );
}

const CAROUSEL_ORIENTATION_OPTIONS = [
  { label: "horizontal", value: "horizontal" },
  { label: "vertical", value: "vertical" },
];

const CAROUSEL_SLIDES = [
  { title: "Tokens first", body: "Every colour, space and radius resolves through a token layer." },
  { title: "Accessible by default", body: "Region, roledescription and polite position updates come wired in." },
  { title: "Composable", body: "Controls, dots and slides can be rendered wherever your layout needs them." },
  { title: "Headless escape hatch", body: "unstyled plus the useCarousel hook when the markup is yours." },
  { title: "Motion aware", body: "Autoplay stops for prefers-reduced-motion and pauses on hover." },
];

function CarouselDemo({
  slidesPerView,
  orientation,
  loop,
  autoplay,
  dots,
  unstyled,
}: {
  slidesPerView: number;
  orientation: "horizontal" | "vertical";
  loop: boolean;
  autoplay: boolean;
  dots: boolean;
  unstyled: boolean;
}) {
  return (
    <div style={{ maxWidth: 460 }}>
      <Carousel
        count={CAROUSEL_SLIDES.length}
        label="Feature highlights"
        slidesPerView={slidesPerView}
        orientation={orientation}
        loop={loop}
        autoplay={autoplay ? 3000 : 0}
        showDots={dots}
        unstyled={unstyled}
      >
        {CAROUSEL_SLIDES.map((slide) => (
          <div key={slide.title} style={{ padding: "0 var(--ui-p-space-2)", height: "100%" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--ui-p-space-2)",
                height: "100%",
                minHeight: "8rem",
                padding: "var(--ui-p-space-4)",
                background: "var(--ui-surface-raised)",
                border: "var(--ui-p-border-thin) solid var(--ui-border)",
                borderRadius: "var(--ui-p-radius-md)",
              }}
            >
              <strong>{slide.title}</strong>
              <span style={{ color: "var(--ui-muted)" }}>{slide.body}</span>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}

/* ---- Charts ------------------------------------------------------------- */

const CHART_CATEGORIES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const CHART_SERIES = [
  { name: "Desktop", data: [4200, 5100, 4700, 6200, 5800, 7100] },
  { name: "Mobile", data: [2600, 3100, 3400, 3000, 3900, 4400] },
];

const DONUT_DATA = [
  { label: "Direct", value: 4200 },
  { label: "Search", value: 3100 },
  { label: "Social", value: 1800 },
  { label: "Referral", value: 900 },
];

const CHART_VARIANT_OPTIONS = [
  { label: "line", value: "line" },
  { label: "area", value: "area" },
];

function LineChartDemo({
  variant,
  smooth,
  grid,
  legend,
  unstyled,
}: {
  variant: "line" | "area";
  smooth: boolean;
  grid: boolean;
  legend: boolean;
  unstyled: boolean;
}) {
  const Chart = variant === "area" ? AreaChart : LineChart;
  return (
    <div style={{ maxWidth: 640 }}>
      <Chart
        series={CHART_SERIES}
        categories={CHART_CATEGORIES}
        label="Sessions per month by device"
        smooth={smooth}
        showGrid={grid}
        showLegend={legend}
        unstyled={unstyled}
      />
    </div>
  );
}

function BarChartDemo({
  stacked,
  grid,
  legend,
  unstyled,
}: {
  stacked: boolean;
  grid: boolean;
  legend: boolean;
  unstyled: boolean;
}) {
  return (
    <div style={{ maxWidth: 640 }}>
      <BarChart
        series={CHART_SERIES}
        categories={CHART_CATEGORIES}
        label="Sessions per month by device"
        stacked={stacked}
        showGrid={grid}
        showLegend={legend}
        unstyled={unstyled}
      />
    </div>
  );
}

function DonutChartDemo({
  thickness,
  legend,
  unstyled,
}: {
  thickness: number;
  legend: boolean;
  unstyled: boolean;
}) {
  return (
    <DonutChart
      data={DONUT_DATA}
      label="Traffic sources"
      centerLabel="sessions"
      thickness={thickness}
      showLegend={legend}
      unstyled={unstyled}
    />
  );
}

export const dataDisplayEntries: ComponentEntry[] = [
  {
    id: "avatar",
    name: "Avatar",
    category: "Data Display",
    description: "User or entity avatar with image, initials fallback, and a status indicator.",
    keywords: ["user", "profile", "initials", "image", "status"],
    controls: [
      { name: "name", type: "text", defaultValue: "Ada Lovelace" },
      { name: "size", type: "select", defaultValue: "md", options: avatarSizeOptions },
      {
        name: "shape",
        type: "select",
        defaultValue: "circle",
        options: [
          { label: "circle", value: "circle" },
          { label: "square", value: "square" },
        ],
      },
      { name: "status", type: "select", defaultValue: "none", options: STATUS_OPTIONS },
    ],
    render: (state) => {
      const status = str(state, "status", "none");
      return (
        <Avatar
          name={str(state, "name", "Ada Lovelace")}
          size={pick(state, "size", "md")}
          shape={pick(state, "shape", "circle")}
          status={status === "none" ? undefined : (status as Status)}
        />
      );
    },
    code: (state) => {
      const status = str(state, "status", "none");
      return [
        "<Avatar",
        `  name=${JSON.stringify(str(state, "name", "Ada Lovelace"))}`,
        pick(state, "size", "md") === "md" ? "" : `  size="${pick(state, "size", "md")}"`,
        pick(state, "shape", "circle") === "circle" ? "" : '  shape="square"',
        status === "none" ? "" : `  status="${status}"`,
        "/>",
      ]
        .filter((line) => line !== "")
        .join("\n");
    },
    props: [
      { name: "name", type: "string", description: "Accessible name and source for the initials fallback." },
      { name: "src", type: "string", description: "Image URL; falls back to initials when absent or broken." },
      { name: "alt", type: "string", description: "Overrides `name` as the accessible label." },
      {
        name: "size",
        type: '"xs" | "sm" | "md" | "lg" | "xl" | number',
        default: '"md"',
        description: "Token size or an explicit pixel size.",
      },
      { name: "shape", type: '"circle" | "square"', default: '"circle"', description: "Corner treatment." },
      { name: "status", type: "Status", description: "Optional status dot (neutral, success, warning, danger, info)." },
      { name: "fallback", type: "ReactNode", description: "Custom content when there is no image." },
    ],
    notes: [
      "Renders with role=\"img\" and an aria-label derived from name or alt.",
      "For overlapping stacks use AvatarGroup, which adds an overflow counter.",
    ],
  },
  {
    id: "badge",
    name: "Badge",
    category: "Data Display",
    description: "Compact status or metadata label with an optional dot or icon.",
    keywords: ["status", "label", "pill", "chip", "count"],
    children: "Badge",
    controls: [
      { name: "children", type: "text", label: "Label", defaultValue: "Badge" },
      { name: "variant", type: "select", defaultValue: "neutral", options: badgeVariantOptions },
      {
        name: "size",
        type: "select",
        defaultValue: "md",
        options: [
          { label: "sm", value: "sm" },
          { label: "md", value: "md" },
        ],
      },
      { name: "dot", type: "boolean", defaultValue: false },
      { name: "icon", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Badge
        variant={pick(state, "variant", "neutral")}
        size={pick(state, "size", "md")}
        dot={bool(state, "dot")}
        icon={bool(state, "icon") ? <Star size={12} /> : undefined}
      >
        {str(state, "children", "Badge")}
      </Badge>
    ),
    code: (state) =>
      jsx("Badge", {
        props: {
          variant:
            pick(state, "variant", "neutral") === "neutral" ? undefined : pick(state, "variant", "neutral"),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          dot: bool(state, "dot"),
          icon: bool(state, "icon") ? "<Star size={12} />" : false,
        },
        children: str(state, "children", "Badge"),
      }),
    props: [
      {
        name: "variant",
        type: '"neutral" | "primary" | "success" | "warning" | "danger" | "info" | "outline"',
        default: '"neutral"',
        description: "Semantic color treatment.",
      },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Badge height and font size." },
      { name: "dot", type: "boolean", default: "false", description: "Show a leading status dot." },
      { name: "icon", type: "ReactNode", description: "Leading icon, hidden from assistive tech." },
    ],
    notes: [
      "Exposes variant and size as data attributes for styling hooks.",
      "Use Tag instead when the label is removable.",
    ],
  },
  {
    id: "carousel",
    name: "Carousel",
    category: "Data Display",
    description: "Sliding viewport of slides with controls, page dots and keyboard/swipe navigation.",
    keywords: ["slider", "slideshow", "gallery", "swiper", "scroll"],
    controls: [
      { name: "slidesPerView", type: "number", label: "Slides per view", defaultValue: 1, min: 1, max: 3, step: 1 },
      { name: "orientation", type: "select", defaultValue: "horizontal", options: CAROUSEL_ORIENTATION_OPTIONS },
      { name: "loop", type: "boolean", defaultValue: true },
      { name: "autoplay", type: "boolean", defaultValue: false },
      { name: "dots", type: "boolean", defaultValue: true, label: "Show dots" },
      { name: "unstyled", type: "boolean", defaultValue: false, label: "Unstyled (headless)" },
    ],
    render: (state) => (
      <CarouselDemo
        slidesPerView={num(state, "slidesPerView", 1)}
        orientation={pick(state, "orientation", "horizontal") as "horizontal" | "vertical"}
        loop={bool(state, "loop", true)}
        autoplay={bool(state, "autoplay")}
        dots={bool(state, "dots", true)}
        unstyled={bool(state, "unstyled")}
      />
    ),
    code: (state) => {
      const slidesPerView = num(state, "slidesPerView", 1);
      const orientation = pick(state, "orientation", "horizontal");
      return [
        `<Carousel`,
        `  count={slides.length}`,
        `  label="Feature highlights"`,
        slidesPerView === 1 ? null : `  slidesPerView={${slidesPerView}}`,
        orientation === "horizontal" ? null : `  orientation="${orientation}"`,
        bool(state, "loop", true) ? null : `  loop={false}`,
        bool(state, "autoplay") ? `  autoplay={3000}` : null,
        bool(state, "dots", true) ? null : `  showDots={false}`,
        bool(state, "unstyled") ? `  unstyled` : null,
        `>`,
        `  {slides.map((slide) => (`,
        `    <article key={slide.title}>{slide.title}</article>`,
        `  ))}`,
        `</Carousel>`,
      ]
        .filter((line) => line !== null)
        .join("\n");
    },
    props: [
      { name: "count", type: "number", required: true, description: "Number of slides the carousel holds." },
      { name: "index / defaultIndex", type: "number", default: "0", description: "Controlled or initial active slide." },
      { name: "onIndexChange", type: "(index: number) => void", description: "Called whenever the active slide moves." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Scrolling axis." },
      { name: "loop", type: "boolean", default: "true", description: "Wrap around at either end." },
      { name: "slidesPerView", type: "number", default: "1", description: "Slides visible at once; sizes the dots' pages." },
      { name: "autoplay", type: "number", default: "0", description: "Interval in ms; disabled by default and under reduced motion." },
      { name: "label", type: "string", description: "Accessible name; supplying one makes the root a region landmark." },
      { name: "showControls / showDots", type: "boolean", default: "true / auto", description: "Toggle the built-in controls and dots." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<CarouselSlot, string>>", description: "Per-slot overrides: root, viewport, track, slide, controls, prev, next, dots, dot, dotMark, live." },
      { name: "Carousel.Slide / .Controls / .Dots", type: "component", description: "Optional parts for hand-composed carousels." },
    ],
    notes: [
      "Arrow keys scroll when focus is inside, Home/End jump to the ends, and pointer drags past 40px flip a slide.",
      "Only the slides in view stay in the accessibility tree and tab order — off-screen slides are inert.",
      "A polite status region announces “Slide n of m” as the active slide changes.",
      "Autoplay pauses on hover/focus and never starts under prefers-reduced-motion.",
    ],
  },
  {
    id: "line-chart",
    name: "Line / Area Chart",
    category: "Data Display",
    description: "Multi-series line chart with an optional area fill, grid, axis labels and legend.",
    keywords: ["chart", "graph", "line", "area", "trend", "series", "analytics"],
    controls: [
      { name: "variant", type: "select", defaultValue: "line", options: CHART_VARIANT_OPTIONS },
      { name: "smooth", type: "boolean", defaultValue: true },
      { name: "grid", type: "boolean", defaultValue: true, label: "Show grid" },
      { name: "legend", type: "boolean", defaultValue: true, label: "Show legend" },
      { name: "unstyled", type: "boolean", defaultValue: false, label: "Unstyled (headless)" },
    ],
    render: (state) => (
      <LineChartDemo
        variant={pick(state, "variant", "line") as "line" | "area"}
        smooth={bool(state, "smooth", true)}
        grid={bool(state, "grid", true)}
        legend={bool(state, "legend", true)}
        unstyled={bool(state, "unstyled")}
      />
    ),
    code: (state) => {
      const variant = pick(state, "variant", "line") as string;
      return [
        `<${variant === "area" ? "AreaChart" : "LineChart"}`,
        `  series={series}`,
        `  categories={categories}`,
        `  label="Sessions per month by device"`,
        bool(state, "smooth", true) ? null : `  smooth={false}`,
        bool(state, "grid", true) ? null : `  showGrid={false}`,
        bool(state, "legend", true) ? null : `  showLegend={false}`,
        bool(state, "unstyled") ? `  unstyled` : null,
        `/>`,
      ]
        .filter((line) => line !== null)
        .join("\n");
    },
    props: [
      { name: "series", type: "ChartSeriesInput[]", required: true, description: "`{ name, data, color? }` entries; missing colours fall back to the --ui-chart-* tokens." },
      { name: "categories", type: "string[]", required: true, description: "X-axis labels, one per data point." },
      { name: "label", type: "string", required: true, description: "Accessible name rendered as the SVG <title>." },
      { name: "variant", type: '"line" | "area"', default: '"line"', description: "Area fills beneath each line. `AreaChart` is the same component with the fill on." },
      { name: "height", type: "number", default: "240", description: "ViewBox height; the SVG scales to the container width." },
      { name: "smooth", type: "boolean", default: "true", description: "Catmull-Rom smoothing instead of straight segments." },
      { name: "showGrid / showDots / showLegend", type: "boolean", default: "true", description: "Toggle grid lines, point markers and the legend." },
      { name: "valueFormatter", type: "(value: number) => string", default: "formatChartValue", description: "Axis tick formatting; defaults to compact 1.2k style." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; the graphic and ARIA stay intact." },
      { name: "classNames", type: "Partial<Record<LineChartSlot, string>>", description: "Per-slot overrides: root, svg, grid, axis, axisLabel, area, line, dot, legend, legendItem, swatch, legendLabel." },
    ],
    notes: [
      "Pure math over a fixed viewBox — no DOM measurement, so server and client markup match.",
      "Series colours come from the --ui-chart-1…6 tokens and can be overridden per series.",
      "The SVG is a single `role=\"img\"` with a <title>; the legend carries the series names as text.",
    ],
  },
  {
    id: "bar-chart",
    name: "Bar Chart",
    category: "Data Display",
    description: "Grouped or stacked bar chart measured from a zero baseline.",
    keywords: ["chart", "graph", "bar", "column", "stacked", "series", "analytics"],
    controls: [
      { name: "stacked", type: "boolean", defaultValue: false },
      { name: "grid", type: "boolean", defaultValue: true, label: "Show grid" },
      { name: "legend", type: "boolean", defaultValue: true, label: "Show legend" },
      { name: "unstyled", type: "boolean", defaultValue: false, label: "Unstyled (headless)" },
    ],
    render: (state) => (
      <BarChartDemo
        stacked={bool(state, "stacked")}
        grid={bool(state, "grid", true)}
        legend={bool(state, "legend", true)}
        unstyled={bool(state, "unstyled")}
      />
    ),
    code: (state) =>
      [
        `<BarChart`,
        `  series={series}`,
        `  categories={categories}`,
        `  label="Sessions per month by device"`,
        bool(state, "stacked") ? `  stacked` : null,
        bool(state, "grid", true) ? null : `  showGrid={false}`,
        bool(state, "legend", true) ? null : `  showLegend={false}`,
        bool(state, "unstyled") ? `  unstyled` : null,
        `/>`,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    props: [
      { name: "series", type: "ChartSeriesInput[]", required: true, description: "One group of bars per series." },
      { name: "categories", type: "string[]", required: true, description: "X-axis labels; each category gets its own band." },
      { name: "label", type: "string", required: true, description: "Accessible name rendered as the SVG <title>." },
      { name: "stacked", type: "boolean", default: "false", description: "Stack series per category instead of grouping them side by side." },
      { name: "height / showGrid / showLegend / yTicks", type: "number | boolean", default: "240 / true / true / 4", description: "Geometry and chrome toggles." },
      { name: "valueFormatter", type: "(value: number) => string", default: "formatChartValue", description: "Axis tick formatting." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<BarChartSlot, string>>", description: "Per-slot overrides: root, svg, grid, axis, axisLabel, bar, legend, legendItem, swatch, legendLabel." },
    ],
    notes: [
      "Bars always start at zero: negative inputs are clamped so the baseline stays honest.",
      "Stacked mode uses running totals, so every category shares one bar width.",
    ],
  },
  {
    id: "donut-chart",
    name: "Donut Chart",
    category: "Data Display",
    description: "Ring chart with a centre metric and a legend that carries values and percentages.",
    keywords: ["chart", "graph", "donut", "pie", "ring", "distribution", "share"],
    controls: [
      { name: "thickness", type: "number", label: "Thickness", defaultValue: 0.38, min: 0.15, max: 0.6, step: 0.05 },
      { name: "legend", type: "boolean", defaultValue: true, label: "Show legend" },
      { name: "unstyled", type: "boolean", defaultValue: false, label: "Unstyled (headless)" },
    ],
    render: (state) => (
      <DonutChartDemo
        thickness={num(state, "thickness", 0.38)}
        legend={bool(state, "legend", true)}
        unstyled={bool(state, "unstyled")}
      />
    ),
    code: (state) => {
      const thickness = num(state, "thickness", 0.38);
      return [
        `<DonutChart`,
        `  data={data}`,
        `  label="Traffic sources"`,
        `  centerLabel="sessions"`,
        thickness === 0.38 ? null : `  thickness={${thickness}}`,
        bool(state, "legend", true) ? null : `  showLegend={false}`,
        bool(state, "unstyled") ? `  unstyled` : null,
        `/>`,
      ]
        .filter((line) => line !== null)
        .join("\n");
    },
    props: [
      { name: "data", type: "DonutDatum[]", required: true, description: "`{ label, value, color? }` slices; zero and negative values are ignored." },
      { name: "label", type: "string", required: true, description: "Accessible name rendered as the SVG <title>." },
      { name: "size", type: "number", default: "200", description: "Square pixel size of the ring." },
      { name: "thickness", type: "number", default: "0.38", description: "Ring thickness as a fraction of the radius." },
      { name: "centerValue / centerLabel", type: "string", description: "Centre metric; the value defaults to the formatted total." },
      { name: "valueFormatter", type: "(value: number) => string", default: "String", description: "Formats the legend values." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<DonutChartSlot, string>>", description: "Per-slot overrides: root, svg, slice, center, centerValue, centerLabel, legend, legendItem, swatch, legendLabel, legendValue." },
    ],
    notes: [
      "Slices are filled arcs rather than thick strokes, so they scale without clipping.",
      "A full circle renders as two nearly-closed arcs (359.999°) to avoid the SVG zero-arc edge case.",
      "The legend repeats every value and percentage, giving the graphic a text equivalent.",
    ],
  },
  {
    id: "data-table",
    name: "DataTable",
    category: "Data Display",
    description: "Production data table: date-correct sorting, optional pagination, selection, filtering, and states.",
    keywords: ["table", "grid", "sort", "select", "paginate", "columns", "filter", "server"],
    controls: [
      { name: "selectable", type: "boolean", defaultValue: false },
      { name: "searchable", type: "boolean", defaultValue: false },
      { name: "pageSize", type: "select", label: "Page size", defaultValue: 0, options: PAGE_SIZE_OPTIONS },
      { name: "density", type: "select", defaultValue: "default", options: DENSITY_OPTIONS },
      { name: "stickyHeader", type: "boolean", label: "Sticky header", defaultValue: false },
      { name: "loading", type: "boolean", defaultValue: false },
      { name: "error", type: "boolean", label: "Error state", defaultValue: false },
    ],
    render: (state) => (
      <DataTablePreview
        selectable={bool(state, "selectable")}
        searchable={bool(state, "searchable")}
        pageSize={num(state, "pageSize", 0)}
        density={pick(state, "density", "default") as "compact" | "default" | "comfortable"}
        loading={bool(state, "loading")}
        stickyHeader={bool(state, "stickyHeader")}
        errorState={bool(state, "error")}
      />
    ),
    code: (state) => {
      const pageSize = num(state, "pageSize", 0);
      return [
        "<DataTable",
        "  data={people}",
        "  columns={columns}",
        "  getRowId={(row) => row.id}",
        "  sort={sort}",
        "  onSortChange={setSort}",
        bool(state, "selectable") ? "  selectable" : "",
        bool(state, "searchable") ? '  searchable\n  searchPlaceholder="Search people…"' : "",
        (pick(state, "density", "default") as string) !== "default"
          ? `  density="${pick(state, "density", "default")}"`
          : "",
        bool(state, "stickyHeader") ? "  stickyHeader" : "",
        bool(state, "loading") ? "  loading" : "",
        pageSize > 0 ? `  pageSize={${pageSize}}\n  pageSizeOptions={[3, 5, 10]}` : "",
        '  caption="Team contributors"',
        "/>",
      ]
        .filter((line) => line !== "")
        .join("\n");
    },
    props: [
      { name: "data", type: "T[]", required: true, description: "Rows to render." },
      { name: "columns", type: "Column<T>[]", required: true, description: "Typed column definitions (accessor/cell/format/sortable/sortType/width/align…)." },
      { name: "getRowId", type: "(row: T, index: number) => string", description: "Stable row key; defaults to the index." },
      { name: "sort / defaultSort / onSortChange", type: "SortState | null", description: "Controlled or uncontrolled, tri-state sorting." },
      { name: "pagination", type: '"none" | "client" | "server"', default: '"none"', description: "Pagination mode; inferred as client when pageSize is set." },
      { name: "page / pageSize / pageSizeOptions / total", type: "number", description: "Pagination controls. total drives server page counts." },
      { name: "onPageChange / onPageSizeChange", type: "(n) => void", description: "Pagination callbacks; omit for uncontrolled." },
      { name: "selectable / selectAllScope", type: 'boolean | "page" | "all"', description: "Row selection; header toggles the page by default." },
      { name: "isRowSelectable", type: "(row, index) => boolean", description: "Exclude rows from selection (disabled checkboxes)." },
      { name: "searchable / globalFilter", type: "boolean | string", description: "Global text filtering; provide globalFilterFn for custom matching." },
      { name: "filters", type: "DataTableFilter[]", description: "Column filters driven by Column.filterFn." },
      { name: "loading / error / onRetry / emptyMessage", type: "boolean | ReactNode", description: "Loading, error (with retry), and empty states." },
      { name: "density / striped / bordered / stickyHeader", type: "variants", description: "Presentation options." },
    ],
    notes: [
      "Date sorting is calendar-correct: date-only strings compare in local calendar order and never shift zones.",
      "Empty/null/invalid values sort last in both directions; sorting is stable and never mutates `data`.",
      "Server mode renders the supplied slice as-is — sorting, filtering, and slicing belong to the consumer.",
      "Selection defaults to the visible page; use selectAllScope=\"all\" for client-side all-filtered selection.",
    ],
  },
  {
    id: "description-list",
    name: "DescriptionList",
    category: "Data Display",
    description: "Label/value information pairs rendered as a semantic description list.",
    keywords: ["definition", "key-value", "details", "metadata", "dl"],
    controls: [
      { name: "orientation", type: "select", defaultValue: "horizontal", options: ORIENTATION_OPTIONS },
      { name: "divided", type: "boolean", defaultValue: false },
      { name: "columns", type: "number", defaultValue: 0, min: 0, max: 4, step: 1 },
    ],
    render: (state) => {
      const columns = num(state, "columns", 0);
      return (
        <DescriptionList
          items={DESCRIPTION_ITEMS}
          orientation={pick(state, "orientation", "horizontal")}
          divided={bool(state, "divided")}
          columns={columns > 0 ? columns : undefined}
        />
      );
    },
    code: (state) => {
      const columns = num(state, "columns", 0);
      return [
        "<DescriptionList",
        `  orientation="${pick(state, "orientation", "horizontal")}"`,
        bool(state, "divided") ? "  divided" : "",
        columns > 0 ? `  columns={${columns}}` : "",
        "  items={[",
        '    { term: "Plan", description: "Pro" },',
        '    { term: "Seats", description: "12" },',
        '    { term: "Renewal", description: "Mar 1, 2026" },',
        "  ]}",
        "/>",
      ]
        .filter((line) => line !== "")
        .join("\n");
    },
    props: [
      { name: "items", type: "DescriptionItem[]", required: true, description: "List of { term, description } pairs." },
      {
        name: "orientation",
        type: '"vertical" | "horizontal"',
        default: '"horizontal"',
        description: "Stack term above description or place them side by side.",
      },
      { name: "divided", type: "boolean", default: "false", description: "Add separators between items." },
      { name: "columns", type: "number", description: "Lay items out in a multi-column grid." },
    ],
    notes: ["Renders a real <dl> with <dt>/<dd> for each item."],
  },
  {
    id: "list",
    name: "List",
    category: "Data Display",
    description: "Vertical list with plain, bordered, or divided variants and rich list items.",
    keywords: ["items", "menu", "rows", "listitem", "leading", "trailing"],
    controls: [
      { name: "variant", type: "select", defaultValue: "plain", options: LIST_VARIANT_OPTIONS },
      { name: "dense", type: "boolean", defaultValue: false },
      { name: "interactive", type: "boolean", defaultValue: false },
      { name: "selected", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <List variant={pick(state, "variant", "plain")} dense={bool(state, "dense")}>
        <List.Item
          leading={<FileText size={16} />}
          trailing={<span>2.4 MB</span>}
          interactive={bool(state, "interactive")}
          selected={bool(state, "selected")}
        >
          design-tokens.json
        </List.Item>
        <List.Item leading={<FileText size={16} />} trailing={<span>1.1 MB</span>} interactive={bool(state, "interactive")}>
          components.css
        </List.Item>
        <List.Item leading={<FileText size={16} />} interactive={bool(state, "interactive")}>
          README.md
        </List.Item>
      </List>
    ),
    code: (state) =>
      [
        `<List variant="${pick(state, "variant", "plain")}"${bool(state, "dense") ? " dense" : ""}>`,
        `  <List.Item${bool(state, "interactive") ? " interactive" : ""}${bool(state, "selected") ? " selected" : ""}>design-tokens.json</List.Item>`,
        `  <List.Item${bool(state, "interactive") ? " interactive" : ""}>components.css</List.Item>`,
        "</List>",
      ].join("\n"),
    props: [
      { name: "variant", type: '"plain" | "bordered" | "divided"', default: '"plain"', description: "Item separation style." },
      { name: "dense", type: "boolean", default: "false", description: "Reduce item padding." },
      { name: "List.Item leading", type: "ReactNode", description: "Content rendered before the label." },
      { name: "List.Item trailing", type: "ReactNode", description: "Content rendered after the label." },
      { name: "List.Item interactive", type: "boolean", default: "false", description: "Render the item as a pressed-state button." },
      { name: "List.Item selected", type: "boolean", description: "Mark the item as selected." },
    ],
    notes: [
      "List.Item becomes a <button> with aria-pressed when interactive is true.",
      "The leading slot is aria-hidden; keep meaningful content in the label.",
    ],
  },
  {
    id: "sparkline",
    name: "Sparkline",
    category: "Data Display",
    description: "Minimal inline trend chart rendered as a single SVG path.",
    keywords: ["chart", "trend", "graph", "mini", "svg"],
    controls: [
      { name: "dataset", type: "select", defaultValue: "up", options: SPARK_DATASET_OPTIONS },
      { name: "area", type: "boolean", defaultValue: false },
      { name: "smooth", type: "boolean", defaultValue: true },
      { name: "strokeWidth", type: "number", label: "Stroke", defaultValue: 1.5, min: 0.5, max: 4, step: 0.5 },
      { name: "width", type: "number", defaultValue: 120, min: 40, max: 320, step: 10 },
      { name: "height", type: "number", defaultValue: 32, min: 16, max: 120, step: 4 },
      { name: "label", type: "text", defaultValue: "Revenue trend" },
    ],
    render: (state) => (
      <Sparkline
        data={SPARK_DATA[pick(state, "dataset", "up")]}
        area={bool(state, "area")}
        smooth={bool(state, "smooth")}
        strokeWidth={num(state, "strokeWidth", 1.5)}
        width={num(state, "width", 120)}
        height={num(state, "height", 32)}
        label={str(state, "label", "Revenue trend")}
      />
    ),
    code: (state) => {
      const data = SPARK_DATA[pick(state, "dataset", "up")];
      return [
        "<Sparkline",
        `  data={[${data.join(", ")}]}`,
        bool(state, "area") ? "  area" : "",
        bool(state, "smooth") ? "" : "  smooth={false}",
        `  strokeWidth={${num(state, "strokeWidth", 1.5)}}`,
        `  width={${num(state, "width", 120)}}`,
        `  height={${num(state, "height", 32)}}`,
        `  label=${JSON.stringify(str(state, "label", "Revenue trend"))}`,
        "/>",
      ]
        .filter((line) => line !== "")
        .join("\n");
    },
    props: [
      { name: "data", type: "number[]", required: true, description: "Series of values to plot, left to right." },
      { name: "width", type: "number", default: "120", description: "SVG width in pixels." },
      { name: "height", type: "number", default: "32", description: "SVG height in pixels." },
      { name: "strokeWidth", type: "number", default: "1.5", description: "Line thickness." },
      { name: "area", type: "boolean", default: "false", description: "Fill the area beneath the line." },
      { name: "smooth", type: "boolean", default: "true", description: "Smooth the path with Catmull-Rom curves." },
      { name: "label", type: "string", description: "Accessible description; omit to render decoratively." },
    ],
    notes: [
      "Without a label the sparkline is aria-hidden and role=\"presentation\".",
      "Scales vertically against the min/max of the data, always including zero.",
    ],
  },
  {
    id: "stat-card",
    name: "StatCard",
    category: "Data Display",
    description: "Metric tile with a label, value, trend, and supporting information.",
    keywords: ["metric", "kpi", "statistic", "trend", "dashboard"],
    controls: [
      { name: "label", type: "text", defaultValue: "Monthly revenue" },
      { name: "value", type: "text", defaultValue: "$48,120" },
      { name: "trend", type: "select", defaultValue: "up", options: TREND_OPTIONS },
      { name: "positive", type: "boolean", defaultValue: true },
      { name: "description", type: "boolean", defaultValue: true },
      { name: "icon", type: "boolean", defaultValue: true },
    ],
    render: (state) => {
      const direction = str(state, "trend", "none");
      return (
        <StatCard
          label={str(state, "label", "Monthly revenue")}
          value={str(state, "value", "$48,120")}
          description={bool(state, "description") ? "vs. last month" : undefined}
          icon={bool(state, "icon") ? <DollarSign size={16} /> : undefined}
          trend={
            direction === "none"
              ? undefined
              : {
                  value: "+12.4%",
                  direction: direction as "up" | "down" | "flat",
                  positive: bool(state, "positive"),
                }
          }
        />
      );
    },
    code: (state) => {
      const direction = str(state, "trend", "none");
      return [
        "<StatCard",
        `  label=${JSON.stringify(str(state, "label", "Monthly revenue"))}`,
        `  value=${JSON.stringify(str(state, "value", "$48,120"))}`,
        bool(state, "description") ? '  description="vs. last month"' : "",
        direction === "none"
          ? ""
          : `  trend={{ value: "+12.4%", direction: "${direction}", positive: ${bool(state, "positive")} }}`,
        bool(state, "icon") ? "  icon={<DollarSign size={16} />}" : "",
        "/>",
      ]
        .filter((line) => line !== "")
        .join("\n");
    },
    props: [
      { name: "label", type: "ReactNode", required: true, description: "Metric caption." },
      { name: "value", type: "ReactNode", required: true, description: "Primary figure." },
      { name: "description", type: "ReactNode", description: "Supporting text such as the comparison window." },
      {
        name: "trend",
        type: "{ value: string; direction: \"up\" | \"down\" | \"flat\"; positive?: boolean }",
        description: "Directional delta with an icon; positive defaults to direction !== \"down\".",
      },
      { name: "icon", type: "ReactNode", description: "Leading icon in the header." },
      { name: "action", type: "ReactNode", description: "Trailing action in the footer." },
    ],
    notes: ["The trend is color-coded via data-positive, independent of the direction."],
  },
  {
    id: "table",
    name: "Table",
    category: "Data Display",
    description: "Semantic compound table with header, body, footer, caption, and cell alignment.",
    keywords: ["table", "grid", "rows", "cells", "thead", "tbody"],
    controls: [
      { name: "stickyHeader", type: "boolean", label: "Sticky header", defaultValue: false },
      { name: "responsive", type: "boolean", defaultValue: true },
      { name: "caption", type: "boolean", defaultValue: true },
      { name: "align", type: "select", label: "Role align", defaultValue: "start", options: ALIGN_OPTIONS },
    ],
    render: (state) => (
      <Table responsive={bool(state, "responsive")} stickyHeader={bool(state, "stickyHeader")}>
        {bool(state, "caption") ? <Table.Caption>Team members</Table.Caption> : null}
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head align={pick(state, "align", "start")}>Role</Table.Head>
            <Table.Head align="end">Commits</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Ada Lovelace</Table.Cell>
            <Table.Cell align={pick(state, "align", "start")}>Engineering</Table.Cell>
            <Table.Cell align="end">128</Table.Cell>
          </Table.Row>
          <Table.Row selected>
            <Table.Cell>Grace Hopper</Table.Cell>
            <Table.Cell align={pick(state, "align", "start")}>Engineering</Table.Cell>
            <Table.Cell align="end">96</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Alan Turing</Table.Cell>
            <Table.Cell align={pick(state, "align", "start")}>Research</Table.Cell>
            <Table.Cell align="end">74</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    ),
    code: (state) => {
      const align = pick(state, "align", "start");
      return [
        `<Table${bool(state, "responsive") ? "" : " responsive={false}"}${bool(state, "stickyHeader") ? " stickyHeader" : ""}>`,
        bool(state, "caption") ? "  <Table.Caption>Team members</Table.Caption>" : "",
        "  <Table.Header>",
        "    <Table.Row>",
        "      <Table.Head>Name</Table.Head>",
        align === "start" ? "      <Table.Head>Role</Table.Head>" : `      <Table.Head align="${align}">Role</Table.Head>`,
        '      <Table.Head align="end">Commits</Table.Head>',
        "    </Table.Row>",
        "  </Table.Header>",
        "  <Table.Body>",
        "    <Table.Row>",
        "      <Table.Cell>Ada Lovelace</Table.Cell>",
        "      <Table.Cell>Engineering</Table.Cell>",
        '      <Table.Cell align="end">128</Table.Cell>',
        "    </Table.Row>",
        "  </Table.Body>",
        "</Table>",
      ]
        .filter((line) => line !== "")
        .join("\n");
    },
    props: [
      { name: "responsive", type: "boolean", default: "true", description: "Wrap the table in a horizontally scrollable container." },
      { name: "stickyHeader", type: "boolean", default: "false", description: "Keep the header visible while scrolling." },
      { name: "Table.Header / Body / Footer", type: "TableSectionProps", description: "Semantic thead, tbody, and tfoot sections." },
      { name: "Table.Row", type: "{ selected?: boolean }", description: "Row with an optional selected state." },
      { name: "Table.Head / Cell align", type: '"start" | "center" | "end"', description: "Horizontal cell alignment." },
      { name: "Table.Caption", type: "ReactNode", description: "Accessible table caption." },
    ],
    notes: [
      "Header cells render with scope=\"col\" for screen readers.",
      "Use DataTable when you need sorting, selection, or pagination.",
    ],
  },
  {
    id: "tag",
    name: "Tag",
    category: "Data Display",
    description: "A label or removable token with an optional icon.",
    keywords: ["token", "chip", "removable", "label", "filter"],
    children: "Design",
    controls: [
      { name: "children", type: "text", label: "Label", defaultValue: "Design" },
      { name: "variant", type: "select", defaultValue: "neutral", options: tagVariantOptions },
      {
        name: "size",
        type: "select",
        defaultValue: "md",
        options: [
          { label: "sm", value: "sm" },
          { label: "md", value: "md" },
        ],
      },
      { name: "icon", type: "boolean", defaultValue: false },
      { name: "removable", type: "boolean", defaultValue: true },
    ],
    render: (state) => (
      <Tag
        variant={pick(state, "variant", "neutral")}
        size={pick(state, "size", "md")}
        icon={bool(state, "icon") ? <Hash size={12} /> : undefined}
        removable={bool(state, "removable")}
        onRemove={() => undefined}
      >
        {str(state, "children", "Design")}
      </Tag>
    ),
    code: (state) =>
      jsx("Tag", {
        props: {
          variant:
            pick(state, "variant", "neutral") === "neutral" ? undefined : pick(state, "variant", "neutral"),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          icon: bool(state, "icon") ? "<Hash size={12} />" : false,
          removable: bool(state, "removable") ? true : undefined,
          onRemove: bool(state, "removable") ? "handleRemove" : false,
        },
        children: str(state, "children", "Design"),
      }),
    props: [
      {
        name: "variant",
        type: '"neutral" | "primary" | "success" | "warning" | "danger" | "info"',
        default: '"neutral"',
        description: "Semantic color treatment.",
      },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Tag height and font size." },
      { name: "icon", type: "ReactNode", description: "Leading icon, hidden from assistive tech." },
      { name: "removable", type: "boolean", default: "false", description: "Show a remove button." },
      { name: "onRemove", type: "() => void", description: "Called when the remove button is pressed." },
      { name: "removeLabel", type: "string", default: '"Remove"', description: "Accessible label for the remove button." },
    ],
    notes: ["The remove affordance is a real button with an aria-label, not a clickable icon."],
  },
  {
    id: "timeline",
    name: "Timeline",
    category: "Data Display",
    description: "Chronological event list with a connector rail and status markers.",
    keywords: ["events", "history", "activity", "steps", "chronology"],
    controls: [
      { name: "showIcons", type: "boolean", label: "Show icons", defaultValue: true },
      { name: "showDescriptions", type: "boolean", label: "Show descriptions", defaultValue: true },
    ],
    render: (state) => {
      const showIcons = bool(state, "showIcons");
      const showDescriptions = bool(state, "showDescriptions");
      return (
        <Timeline
          items={[
            {
              title: "Order placed",
              timestamp: "09:24",
              status: "success",
              icon: showIcons ? <Check size={12} /> : undefined,
            },
            {
              title: "Payment confirmed",
              timestamp: "09:26",
              status: "success",
              description: showDescriptions ? "Visa ending 4242" : undefined,
              icon: showIcons ? <Check size={12} /> : undefined,
            },
            {
              title: "Shipped",
              timestamp: "11:02",
              status: "warning",
              description: showDescriptions ? "Arriving Thursday" : undefined,
              icon: showIcons ? <Truck size={12} /> : undefined,
            },
          ]}
        />
      );
    },
    code: (state) => {
      const description = bool(state, "showDescriptions") ? ', description: "Arriving Thursday"' : "";
      return [
        "<Timeline",
        "  items={[",
        '    { title: "Order placed", timestamp: "09:24", status: "success" },',
        '    { title: "Payment confirmed", timestamp: "09:26", status: "success" },',
        `    { title: "Shipped", timestamp: "11:02", status: "warning"${description} },`,
        "  ]}",
        "/>",
      ].join("\n");
    },
    props: [
      { name: "items", type: "TimelineItem[]", required: true, description: "Events to render in order." },
      { name: "TimelineItem.title", type: "ReactNode", required: true, description: "Event title." },
      { name: "TimelineItem.timestamp", type: "ReactNode", description: "Time shown opposite the title." },
      { name: "TimelineItem.description", type: "ReactNode", description: "Supporting detail below the title." },
      { name: "TimelineItem.status", type: "Status", description: "Marker color; defaults to neutral." },
      { name: "TimelineItem.icon", type: "ReactNode", description: "Icon rendered inside the marker." },
    ],
    notes: ["Renders an ordered list (<ol>) so the sequence is conveyed semantically."],
  },
  {
    id: "relative-time",
    name: "RelativeTime",
    category: "Data Display",
    description: "A semantic <time> with a live relative label and absolute tooltip.",
    keywords: ["time", "ago", "timestamp", "date", "relative"],
    controls: [
      { name: "minutes", type: "number", label: "Minutes ago", defaultValue: 12, min: 0, max: 100000, step: 1 },
      { name: "updateInterval", type: "number", label: "Update (ms)", defaultValue: 60000, min: 0, max: 600000, step: 1000 },
      { name: "showTitle", type: "boolean", defaultValue: true },
    ],
    render: (state) => (
      <RelativeTime
        value={new Date(Date.now() - num(state, "minutes", 12) * 60_000)}
        updateInterval={num(state, "updateInterval", 60000)}
        showTitle={bool(state, "showTitle")}
      />
    ),
    code: (state) =>
      `const value = new Date(Date.now() - ${num(state, "minutes", 12)} * 60_000);\n\n<RelativeTime value={value} />`,
    props: [
      { name: "value", type: "Date | number | string", required: true, description: "Timestamp to describe." },
      { name: "now", type: "Date", description: "Fixed reference time; disables the internal timer." },
      { name: "locale", type: "string", description: "BCP 47 locale for the relative and absolute text." },
      { name: "updateInterval", type: "number", default: "60000", description: "Recompute interval in ms; 0 disables it." },
      { name: "showTitle", type: "boolean", default: "true", description: "Expose the absolute timestamp as a native tooltip." },
      { name: "format", type: "(value: Date, now: Date) => string", description: "Custom relative formatter." },
    ],
    notes: [
      "Renders dateTime and title from the same Date, so the relative and absolute values never drift.",
      "Pass a fixed `now` in tests or SSR to keep output deterministic.",
      "The label refreshes on an interval by default; set updateInterval={0} to opt out.",
    ],
  },
  {
    id: "image",
    name: "Image",
    category: "Data Display",
    description: "An image with a loading state, fallback, caption, and an accessible lightbox preview.",
    keywords: ["image", "picture", "lightbox", "preview", "zoom", "media"],
    controls: [
      { name: "preview", type: "boolean", defaultValue: true },
      { name: "fit", type: "select", defaultValue: "cover", options: [
        { label: "cover", value: "cover" },
        { label: "contain", value: "contain" },
        { label: "fill", value: "fill" },
      ] },
      { name: "caption", type: "text", defaultValue: "A gradient placeholder" },
    ],
    render: (state) => (
      <div style={{ width: "min(100%, 28rem)" }}>
        <Image
          src={IMAGE_SRC}
          alt="Gradient placeholder"
          preview={bool(state, "preview")}
          fit={pick(state, "fit", "cover") as "cover" | "contain" | "fill"}
          ratio={16 / 9}
          caption={str(state, "caption", "")}
        />
      </div>
    ),
    props: [
      { name: "src / alt", type: "string", required: true, description: "Image source and accessible text." },
      { name: "preview", type: "boolean", default: "false", description: "Open a full-screen lightbox on click." },
      { name: "previewSrc", type: "string", description: "Higher-resolution source for the lightbox." },
      { name: "fallback", type: "ReactNode", description: "Rendered when the image fails to load." },
      { name: "caption", type: "ReactNode", description: "Caption under the frame." },
      { name: "fit", type: '"cover" | "contain" | "fill"', default: '"cover"', description: "object-fit mode." },
      { name: "ratio", type: "number", description: "Aspect ratio as width / height." },
    ],
    notes: [
      "The lightbox reuses Modal, so Escape, focus handling, and the close button come for free.",
      "The clickable frame is a real button with an accessible name derived from alt.",
      "Loading is lazy by default; override the native loading prop as needed.",
    ],
  },
  {
    id: "item",
    name: "Item",
    category: "Data Display",
    description: "A media + content + actions row for lists, menus, and cards.",
    keywords: ["item", "row", "list item", "media", "cell"],
    controls: [
      { name: "variant", type: "select", defaultValue: "outline", options: [
        { label: "default", value: "default" },
        { label: "outline", value: "outline" },
        { label: "muted", value: "muted" },
      ] },
      { name: "size", type: "select", defaultValue: "md", options: [
        { label: "sm", value: "sm" },
        { label: "md", value: "md" },
      ] },
    ],
    render: (state) => (
      <Item
        variant={pick(state, "variant", "outline") as "outline"}
        size={pick(state, "size", "md") as "md"}
        style={{ width: "min(100%, 26rem)" }}
      >
        <Item.Media>
          <Star size={18} aria-hidden="true" />
        </Item.Media>
        <Item.Content>
          <Item.Title>Design system review</Item.Title>
          <Item.Description>Ada and 3 others are reviewing the new tokens.</Item.Description>
        </Item.Content>
        <Item.Actions>
          <Button size="sm" variant="ghost">Open</Button>
        </Item.Actions>
      </Item>
    ),
    props: [
      { name: "variant", type: '"default" | "outline" | "muted"', default: '"default"', description: "Surface treatment." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Padding and gap scale." },
      { name: "Item.Media", type: "component", description: "Fixed-size icon or thumbnail slot." },
      { name: "Item.Content", type: "component", description: "Flexible column for title and description." },
      { name: "Item.Title / Item.Description", type: "component", description: "Primary and secondary text." },
      { name: "Item.Actions", type: "component", description: "Trailing actions, aligned to the end." },
    ],
    notes: [
      "Subcomponents read the root's classNames and unstyled config through context.",
      "Item.Media clips images to a rounded square and centers icons.",
    ],
  },
  {
    id: "attachment",
    name: "Attachment",
    category: "Data Display",
    description: "A file card with a type icon or thumbnail, size, upload progress, and remove/download actions.",
    keywords: ["attachment", "file", "upload", "document", "progress"],
    controls: [
      { name: "status", type: "select", defaultValue: "uploading", options: [
        { label: "idle", value: "idle" },
        { label: "uploading", value: "uploading" },
        { label: "done", value: "done" },
        { label: "error", value: "error" },
      ] },
      { name: "progress", type: "number", defaultValue: 64, min: 0, max: 100, step: 1 },
    ],
    render: (state) => (
      <Attachment
        name="design-system-audit.pdf"
        size={1_480_000}
        type="pdf"
        status={pick(state, "status", "uploading") as "uploading"}
        progress={num(state, "progress", 64)}
        onRemove={() => {}}
      />
    ),
    props: [
      { name: "name", type: "string", required: true, description: "File name shown and used for the type icon." },
      { name: "size", type: "number", description: "Size in bytes; formatted automatically." },
      { name: "type", type: "string", description: "MIME type or extension override." },
      { name: "status", type: '"idle" | "uploading" | "done" | "error"', default: '"idle"', description: "Upload state." },
      { name: "progress", type: "number", description: "Upload percentage; renders a progressbar." },
      { name: "thumbnail", type: "string", description: "Image URL replacing the type icon." },
      { name: "href", type: "string", description: "Turns the name into a download link." },
      { name: "onRemove", type: "() => void", description: "Shows a remove button." },
    ],
    notes: [
      "formatFileSize is exported for use in custom file lists.",
      "The progress bar is role=progressbar with aria-valuenow, not a decorative div.",
    ],
  },
  {
    id: "bubble",
    name: "Bubble",
    category: "Data Display",
    description: "A chat message bubble with an avatar, author name, timestamp, and delivery footer.",
    keywords: ["bubble", "chat", "message", "conversation", "comment"],
    controls: [
      { name: "align", type: "select", defaultValue: "start", options: [
        { label: "start", value: "start" },
        { label: "end", value: "end" },
      ] },
      { name: "variant", type: "select", defaultValue: "surface", options: [
        { label: "surface", value: "surface" },
        { label: "primary", value: "primary" },
        { label: "muted", value: "muted" },
      ] },
      { name: "name", type: "text", defaultValue: "Ada Lovelace" },
      { name: "time", type: "text", defaultValue: "12:04" },
    ],
    render: (state) => (
      <div style={{ width: "min(100%, 26rem)" }}>
        <Bubble
          align={pick(state, "align", "start") as "start"}
          variant={pick(state, "variant", "surface") as "surface"}
          name={str(state, "name", "Ada Lovelace")}
          time={str(state, "time", "12:04")}
          avatar={<Avatar name="Ada Lovelace" size="sm" />}
        >
          The new tokens look great in both themes.
        </Bubble>
      </div>
    ),
    props: [
      { name: "align", type: '"start" | "end"', default: '"start"', description: "Side of the conversation." },
      { name: "variant", type: '"surface" | "primary" | "muted"', default: '"surface"', description: "Bubble fill." },
      { name: "name / avatar", type: "ReactNode", description: "Author identity." },
      { name: "time / footer", type: "ReactNode", description: "Timestamp and delivery state or actions." },
      { name: "hideAvatar", type: "boolean", default: "false", description: "Keep alignment without the avatar column." },
    ],
    notes: [
      "The content tail is flattened on the speaker's side via a smaller corner radius.",
      "Primary bubbles use the fill token with the matching foreground, so contrast is preserved.",
    ],
  },
  {
    id: "message-scroller",
    name: "MessageScroller",
    category: "Data Display",
    description: "A chat transcript viewport that stays pinned to the newest message and offers a jump-to-latest button.",
    keywords: ["message", "scroller", "chat", "transcript", "scroll", "log"],
    render: () => <MessageScrollerDemo />,
    props: [
      { name: "children", type: "ReactNode", description: "Message bubbles or transcript content." },
      { name: "autoScroll", type: "boolean", default: "true", description: "Pin to the bottom when content grows." },
      { name: "threshold", type: "number", default: "48", description: "Distance from the bottom that counts as pinned." },
      { name: "onReachTop / onReachBottom", type: "() => void", description: "Load older or newer messages." },
      { name: "showScrollButton", type: "boolean", default: "true", description: "Show the jump-to-latest button." },
      { name: "emptyState", type: "ReactNode", description: "Shown when there are no children." },
      { name: "maxHeight", type: "string | number", default: '"24rem"', description: "Viewport height." },
    ],
    notes: [
      "The viewport is role=log with aria-live=polite and is keyboard focusable for scrolling.",
      "A MutationObserver keeps the view pinned only while the user is already at the bottom.",
      "The ref exposes scrollToBottom, scrollToTop, and getViewport.",
    ],
  },
];
