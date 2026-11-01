import { useRef } from "react";
import {
  Affix,
  AspectRatio,
  Box,
  Card,
  Container,
  Divider,
  Flex,
  Grid,
  Masonry,
  ScrollArea,
  SplitPane,
  Stack,
  Surface,
  VisuallyHidden,
  Watermark,
} from "@personal-ui/ui";
import type { ComponentEntry } from "./types";
import { bool, num, pick, str } from "./demo";
import { jsx } from "../lib/jsx";

function AffixDemo() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  return (
    <div
      ref={boxRef}
      style={{
        height: "14rem",
        overflow: "auto",
        padding: "var(--ui-p-space-4)",
        border: "1px solid var(--ui-border)",
        borderRadius: "var(--ui-p-radius-lg)",
        background: "var(--ui-surface)",
      }}
    >
      <Affix offsetTop={8} target={() => boxRef.current}>
        <div
          style={{
            padding: "var(--ui-p-space-2) var(--ui-p-space-3)",
            borderRadius: "var(--ui-p-radius-md)",
            background: "var(--ui-surface-raised)",
            fontSize: "var(--ui-p-text-sm)",
          }}
        >
          Pinned while scrolling
        </div>
      </Affix>
      <p style={{ marginTop: "var(--ui-p-space-4)", color: "var(--ui-muted)" }}>
        Scroll inside this box to pin the header to the top.
      </p>
      <div style={{ height: "24rem" }} />
    </div>
  );
}

const RATIO_OPTIONS = [
  { label: "16 / 9", value: "16/9" },
  { label: "4 / 3", value: "4/3" },
  { label: "1 / 1", value: "1/1" },
  { label: "3 / 2", value: "3/2" },
];

const AS_OPTIONS = [
  { label: "div", value: "div" },
  { label: "section", value: "section" },
  { label: "article", value: "article" },
  { label: "aside", value: "aside" },
];

const SPACE_OPTIONS = [
  { label: "0", value: 0 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "6", value: 6 },
  { label: "8", value: 8 },
];

const ALIGN_OPTIONS = [
  { label: "start", value: "start" },
  { label: "center", value: "center" },
  { label: "end", value: "end" },
  { label: "baseline", value: "baseline" },
  { label: "stretch", value: "stretch" },
];

const JUSTIFY_OPTIONS = [
  { label: "start", value: "start" },
  { label: "center", value: "center" },
  { label: "end", value: "end" },
  { label: "between", value: "between" },
  { label: "around", value: "around" },
  { label: "evenly", value: "evenly" },
];

const ELEVATION_OPTIONS = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
];

const CARD_TONE_OPTIONS = [
  { label: "surface", value: "surface" },
  { label: "raised", value: "raised" },
  { label: "inset", value: "inset" },
];

const SURFACE_TONE_OPTIONS = [
  { label: "surface", value: "surface" },
  { label: "raised", value: "raised" },
  { label: "inset", value: "inset" },
  { label: "transparent", value: "transparent" },
];

const RADIUS_OPTIONS = [
  { label: "none", value: "none" },
  { label: "sm", value: "sm" },
  { label: "md", value: "md" },
  { label: "lg", value: "lg" },
  { label: "xl", value: "xl" },
  { label: "full", value: "full" },
];

const CONTAINER_SIZE_OPTIONS = [
  { label: "sm", value: "sm" },
  { label: "md", value: "md" },
  { label: "lg", value: "lg" },
  { label: "xl", value: "xl" },
  { label: "full", value: "full" },
];

const FLEX_DIRECTION_OPTIONS = [
  { label: "row", value: "row" },
  { label: "row-reverse", value: "row-reverse" },
  { label: "column", value: "column" },
  { label: "column-reverse", value: "column-reverse" },
];

const STACK_DIRECTION_OPTIONS = [
  { label: "row", value: "row" },
  { label: "column", value: "column" },
];

const SCROLL_ORIENTATION_OPTIONS = [
  { label: "vertical", value: "vertical" },
  { label: "horizontal", value: "horizontal" },
  { label: "both", value: "both" },
];

const DIVIDER_ORIENTATION_OPTIONS = [
  { label: "horizontal", value: "horizontal" },
  { label: "vertical", value: "vertical" },
];

const COLUMN_OPTIONS = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
];

function asTag(value: string): "div" | "section" | "article" | "aside" | "span" {
  switch (value) {
    case "section":
    case "article":
    case "aside":
    case "span":
      return value;
    default:
      return "div";
  }
}

const SCROLL_ROWS = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
  "India",
  "Juliett",
  "Kilo",
  "Lima",
];

const GRID_ITEMS = [1, 2, 3, 4, 5, 6];

export const layoutEntries: ComponentEntry[] = [
  {
    id: "aspect-ratio",
    name: "AspectRatio",
    category: "Layout",
    description: "Constrains its children to a fixed aspect ratio using the native CSS aspect-ratio property.",
    keywords: ["ratio", "media", "image", "video", "responsive"],
    controls: [
      { name: "ratio", type: "select", defaultValue: "16/9", options: RATIO_OPTIONS },
      { name: "caption", type: "text", label: "Caption", defaultValue: "16 : 9" },
    ],
    render: (state) => (
      <AspectRatio ratio={pick(state, "ratio", "16/9")} style={{ width: 320, maxWidth: "100%" }}>
        <Surface
          tone="inset"
          padding={3}
          style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {str(state, "caption", "16 : 9")}
        </Surface>
      </AspectRatio>
    ),
    code: (state) =>
      jsx("AspectRatio", {
        props: { ratio: pick(state, "ratio", "16/9") },
        children: '<img src="..." alt="..." />',
      }),
    props: [
      { name: "ratio", type: 'number | string', default: "16 / 9", description: 'Accepts `16 / 9`, `"16/9"`, or `4/3`.' },
      {
        name: "...rest",
        type: "HTMLAttributes<HTMLDivElement>",
        description: "Native div props, including style and className.",
      },
    ],
    notes: [
      "Uses the native CSS aspect-ratio property — no padding-hack wrapper is needed.",
      "Let the child fill the box (e.g. width/height 100%) so it is measured against the ratio.",
    ],
  },
  {
    id: "box",
    name: "Box",
    category: "Layout",
    description: "The foundational polymorphic layout element: token padding on any intrinsic element via as.",
    keywords: ["primitive", "spacing", "polymorphic", "container"],
    controls: [
      { name: "as", type: "select", defaultValue: "div", options: AS_OPTIONS },
      { name: "padding", type: "select", defaultValue: 4, options: SPACE_OPTIONS },
      { name: "children", type: "text", label: "Label", defaultValue: "Box content" },
    ],
    render: (state) => {
      const padding = pick(state, "padding", 4);
      const content = str(state, "children", "Box content");
      const as = asTag(str(state, "as", "div"));
      if (as === "section") {
        return (
          <Box as="section" padding={padding}>
            {content}
          </Box>
        );
      }
      if (as === "article") {
        return (
          <Box as="article" padding={padding}>
            {content}
          </Box>
        );
      }
      if (as === "aside") {
        return (
          <Box as="aside" padding={padding}>
            {content}
          </Box>
        );
      }
      return (
        <Box padding={padding}>
          {content}
        </Box>
      );
    },
    code: (state) => {
      const as = asTag(str(state, "as", "div"));
      const padding = pick(state, "padding", 4);
      const label = str(state, "children", "Box content");
      const opening = as === "div" ? "<Box" : `<Box as="${as}"`;
      return `${opening} padding={${padding}}>${label}</Box>`;
    },
    props: [
      { name: "as", type: "ElementType", default: '"div"', description: "Element or component the box renders as." },
      { name: "padding", type: "Space", description: "Semantic padding step or raw CSS length." },
      { name: "className", type: "string", description: "Extra class names merged onto the element." },
      { name: "...rest", type: "intrinsic attributes", description: "All props of the selected element are forwarded." },
    ],
    notes: [
      "Polymorphic: `as=\"a\"` accepts `href`, `as=\"img\"` accepts `src`, and so on.",
      "Refs are forwarded to the underlying element.",
    ],
  },
  {
    id: "card",
    name: "Card",
    category: "Layout",
    description: "Compound container that groups related content into header, body, and footer sections.",
    keywords: ["panel", "container", "compound", "surface"],
    controls: [
      { name: "tone", type: "select", defaultValue: "surface", options: CARD_TONE_OPTIONS },
      { name: "bordered", type: "boolean", defaultValue: true },
      { name: "elevation", type: "select", defaultValue: 0, options: ELEVATION_OPTIONS },
      { name: "interactive", type: "boolean", defaultValue: false },
      { name: "title", type: "text", defaultValue: "Project settings" },
      { name: "body", type: "text", defaultValue: "Cards group related content and actions." },
    ],
    render: (state) => (
      <Card
        tone={pick(state, "tone", "surface")}
        bordered={bool(state, "bordered", true)}
        elevation={num(state, "elevation", 0) as 0 | 1 | 2 | 3}
        interactive={bool(state, "interactive")}
        style={{ width: 340, maxWidth: "100%" }}
      >
        <Card.Header>
          <Card.Title>{str(state, "title", "Project settings")}</Card.Title>
          <Card.Description>Manage your workspace preferences.</Card.Description>
        </Card.Header>
        <Card.Body>{str(state, "body", "Cards group related content and actions.")}</Card.Body>
        <Card.Footer>
          <Card.Actions>
            <span>Updated 2 days ago</span>
          </Card.Actions>
        </Card.Footer>
      </Card>
    ),
    code: (state) => {
      const attrs = [`tone="${pick(state, "tone", "surface")}"`];
      const elevation = num(state, "elevation", 0);
      if (elevation !== 0) attrs.push(`elevation={${elevation}}`);
      if (!bool(state, "bordered", true)) attrs.push("bordered={false}");
      if (bool(state, "interactive")) attrs.push("interactive");
      return [
        `<Card ${attrs.join(" ")}>`,
        "  <Card.Header>",
        `    <Card.Title>${str(state, "title", "Project settings")}</Card.Title>`,
        "    <Card.Description>Manage your workspace preferences.</Card.Description>",
        "  </Card.Header>",
        `  <Card.Body>${str(state, "body", "Cards group related content and actions.")}</Card.Body>`,
        "  <Card.Footer>",
        "    <Card.Actions>Updated 2 days ago</Card.Actions>",
        "  </Card.Footer>",
        "</Card>",
      ].join("\n");
    },
    props: [
      { name: "tone", type: '"surface" | "raised" | "inset"', default: '"surface"', description: "Background treatment." },
      { name: "bordered", type: "boolean", default: "true", description: "Draw a 1px border." },
      { name: "elevation", type: "0 | 1 | 2 | 3", default: "0", description: "Shadow depth." },
      { name: "padding", type: "Space", description: "Internal padding for the root; sections manage their own." },
      { name: "interactive", type: "boolean", default: "false", description: "Adds a hover/click affordance." },
    ],
    notes: [
      "Sub-components are available both as static members (`Card.Header`) and named exports (`CardHeader`).",
      "`Card.Title` renders an `h3` by default; change the level with its `as` prop.",
    ],
  },
  {
    id: "container",
    name: "Container",
    category: "Layout",
    description: "Centers content and constrains it to a readable max width with responsive gutters.",
    keywords: ["max-width", "wrapper", "page", "center"],
    controls: [
      { name: "size", type: "select", defaultValue: "lg", options: CONTAINER_SIZE_OPTIONS },
      { name: "gutter", type: "boolean", defaultValue: true },
    ],
    render: (state) => (
      <Container size={pick(state, "size", "lg")} gutter={bool(state, "gutter", true)}>
        <Surface tone="inset" padding={4}>
          Container content is centered and width-limited.
        </Surface>
      </Container>
    ),
    code: (state) => {
      const attrs = [`size="${pick(state, "size", "lg")}"`];
      if (!bool(state, "gutter", true)) attrs.push("gutter={false}");
      return [
        `<Container ${attrs.join(" ")}>`,
        '  <Surface tone="inset" padding={4}>Container content</Surface>',
        "</Container>",
      ].join("\n");
    },
    props: [
      { name: "size", type: '"sm" | "md" | "lg" | "xl" | "full"', default: '"lg"', description: "Max content width token." },
      { name: "gutter", type: "boolean", default: "true", description: "Add responsive horizontal gutters." },
      { name: "as", type: "ElementType", default: '"div"', description: "Polymorphic root element." },
    ],
    notes: ["Polymorphic via `as`; defaults to a centered `<div>`."],
  },
  {
    id: "divider",
    name: "Divider",
    category: "Layout",
    description: "A horizontal or vertical separator that can carry a centered label.",
    keywords: ["separator", "rule", "hr", "orient"],
    controls: [
      { name: "orientation", type: "select", defaultValue: "horizontal", options: DIVIDER_ORIENTATION_OPTIONS },
      { name: "label", type: "text", defaultValue: "or" },
      { name: "decorative", type: "boolean", defaultValue: false },
    ],
    render: (state) => {
      const decorative = bool(state, "decorative");
      if ((pick(state, "orientation", "horizontal") as string) === "vertical") {
        return (
          <Flex align="stretch" justify="center" gap={4} style={{ height: 96 }}>
            <span>Above</span>
            <Divider orientation="vertical" decorative={decorative} />
            <span>Below</span>
          </Flex>
        );
      }
      return (
        <Divider orientation="horizontal" decorative={decorative} label={str(state, "label", "or") || undefined} />
      );
    },
    code: (state) =>
      (pick(state, "orientation", "horizontal") as string) === "vertical"
        ? jsx("Divider", { props: { orientation: "vertical", decorative: bool(state, "decorative") } })
        : jsx("Divider", {
            props: {
              label: str(state, "label", "or") || undefined,
              decorative: bool(state, "decorative"),
            },
          }),
    props: [
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Layout axis." },
      { name: "label", type: "ReactNode", description: 'Optional centered content (e.g. "or"); horizontal only.' },
      { name: "decorative", type: "boolean", default: "false", description: "Remove the divider from the a11y tree." },
    ],
    notes: [
      "Without a label it is exposed to assistive tech as a semantic `separator` with orientation.",
      "Set `decorative` for purely visual rules so they are hidden from screen readers.",
    ],
  },
  {
    id: "flex",
    name: "Flex",
    category: "Layout",
    description: "General-purpose flexbox container with direction, gap, alignment, wrap, and inline options.",
    keywords: ["flexbox", "row", "column", "alignment"],
    controls: [
      { name: "direction", type: "select", defaultValue: "row", options: FLEX_DIRECTION_OPTIONS },
      { name: "gap", type: "select", defaultValue: 3, options: SPACE_OPTIONS },
      { name: "align", type: "select", defaultValue: "center", options: ALIGN_OPTIONS },
      { name: "justify", type: "select", defaultValue: "start", options: JUSTIFY_OPTIONS },
      { name: "wrap", type: "boolean", defaultValue: false },
      { name: "inline", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Flex
        direction={pick(state, "direction", "row")}
        gap={pick(state, "gap", 3)}
        align={pick(state, "align", "center")}
        justify={pick(state, "justify", "start")}
        wrap={bool(state, "wrap")}
        inline={bool(state, "inline")}
      >
        <Surface tone="inset" padding={3}>
          One
        </Surface>
        <Surface tone="inset" padding={3}>
          Two
        </Surface>
        <Surface tone="inset" padding={3}>
          Three
        </Surface>
      </Flex>
    ),
    code: (state) =>
      [
        `<Flex direction="${pick(state, "direction", "row")}" gap={${pick(state, "gap", 3)}} align="${pick(state, "align", "center")}" justify="${pick(state, "justify", "start")}"${bool(state, "wrap") ? " wrap" : ""}${bool(state, "inline") ? " inline" : ""}>`,
        "  <Surface padding={3}>One</Surface>",
        "  <Surface padding={3}>Two</Surface>",
        "  <Surface padding={3}>Three</Surface>",
        "</Flex>",
      ].join("\n"),
    props: [
      {
        name: "direction",
        type: '"row" | "row-reverse" | "column" | "column-reverse"',
        default: '"row"',
        description: "Main axis and direction.",
      },
      { name: "gap", type: "Space", default: "3", description: "Gap between children." },
      { name: "align", type: "Align", description: "Cross-axis alignment (flex-start, center, ...)." },
      { name: "justify", type: "Justify", description: "Main-axis distribution (start, between, ...)." },
      { name: "wrap", type: "boolean", default: "false", description: "Allow wrapping." },
      { name: "inline", type: "boolean", default: "false", description: "Render as inline-flex." },
      { name: "as", type: "ElementType", default: '"div"', description: "Polymorphic root element." },
    ],
    notes: ["Sibling utilities `Inline`, `Center`, and `Spacer` are also exported from the layout package."],
  },
  {
    id: "grid",
    name: "Grid",
    category: "Layout",
    description: "Responsive CSS grid with a fixed or auto-fit column count and token-driven gaps.",
    keywords: ["grid", "columns", "responsive", "auto-fit"],
    controls: [
      { name: "columns", type: "select", defaultValue: 3, options: COLUMN_OPTIONS },
      { name: "minItemWidth", type: "text", label: "Min item width", defaultValue: "" },
      { name: "gap", type: "select", defaultValue: 4, options: SPACE_OPTIONS },
    ],
    render: (state) => {
      const minItemWidth = str(state, "minItemWidth", "");
      return (
        <Grid
          columns={pick(state, "columns", 3)}
          minItemWidth={minItemWidth || undefined}
          gap={pick(state, "gap", 4)}
        >
          {GRID_ITEMS.map((item) => (
            <Surface key={item} tone="inset" padding={3}>
              Item {item}
            </Surface>
          ))}
        </Grid>
      );
    },
    code: (state) => {
      const minItemWidth = str(state, "minItemWidth", "");
      const sizing = minItemWidth ? `minItemWidth="${minItemWidth}"` : `columns={${pick(state, "columns", 3)}}`;
      return [
        `<Grid ${sizing} gap={${pick(state, "gap", 4)}}>`,
        ...GRID_ITEMS.map((item) => `  <Surface padding={3}>Item ${item}</Surface>`),
        "</Grid>",
      ].join("\n");
    },
    props: [
      { name: "columns", type: "number | string", default: "1", description: "Fixed column count or a template-columns value." },
      { name: "minItemWidth", type: "string", description: "Generate an auto-fit grid with items at least this wide." },
      { name: "gap", type: "Space", default: "4", description: "Gap used when row/column gaps are not set." },
      { name: "rowGap", type: "Space", description: "Override the row gap." },
      { name: "columnGap", type: "Space", description: "Override the column gap." },
      { name: "align", type: "Align", description: "Maps to align-items." },
      { name: "justify", type: "Justify", description: "Maps to justify-items." },
    ],
    notes: [
      "When `minItemWidth` is set it takes precedence over `columns`, producing `repeat(auto-fit, minmax(...))`.",
      "`align` maps to `align-items` and `justify` to `justify-items`.",
    ],
  },
  {
    id: "scroll-area",
    name: "ScrollArea",
    category: "Layout",
    description: "A styled scrolling container that themes the native scrollbar without custom scroll logic.",
    keywords: ["scroll", "overflow", "scrollbar"],
    controls: [
      { name: "orientation", type: "select", defaultValue: "vertical", options: SCROLL_ORIENTATION_OPTIONS },
      { name: "maxHeight", type: "number", label: "Max height", defaultValue: 180, min: 80, max: 400, step: 20 },
      { name: "hideScrollbar", type: "boolean", label: "Hide scrollbar", defaultValue: false },
    ],
    render: (state) => (
      <ScrollArea
        orientation={pick(state, "orientation", "vertical")}
        maxHeight={num(state, "maxHeight", 180)}
        hideScrollbar={bool(state, "hideScrollbar")}
        style={{ width: "100%" }}
      >
        <Stack gap={2}>
          {SCROLL_ROWS.map((row) => (
            <Surface key={row} tone="inset" padding={2}>
              {row}
            </Surface>
          ))}
        </Stack>
      </ScrollArea>
    ),
    code: (state) =>
      [
        `<ScrollArea orientation="${pick(state, "orientation", "vertical")}" maxHeight={${num(state, "maxHeight", 180)}}${bool(state, "hideScrollbar") ? " hideScrollbar" : ""}>`,
        "  <Stack gap={2}>",
        ...SCROLL_ROWS.map((row) => `    <Surface padding={2}>${row}</Surface>`),
        "  </Stack>",
        "</ScrollArea>",
      ].join("\n"),
    props: [
      { name: "orientation", type: '"vertical" | "horizontal" | "both"', default: '"vertical"', description: "Which axes can scroll." },
      { name: "maxHeight", type: "string | number", description: "Constrain the scroll box height." },
      { name: "hideScrollbar", type: "boolean", default: "false", description: "Hide the scrollbar visually but keep scrolling." },
    ],
    notes: [
      "Scrolling and keyboard behaviour are native; only the scrollbar appearance is themed.",
      "Avoid `hideScrollbar` unless the content remains obviously scrollable another way.",
    ],
  },
  {
    id: "stack",
    name: "Stack",
    category: "Layout",
    description: "One-dimensional layout primitive with token-driven gaps and alignment along a single axis.",
    keywords: ["vertical", "horizontal", "spacing", "flex"],
    controls: [
      { name: "direction", type: "select", defaultValue: "column", options: STACK_DIRECTION_OPTIONS },
      { name: "gap", type: "select", defaultValue: 4, options: SPACE_OPTIONS },
      { name: "align", type: "select", defaultValue: "stretch", options: ALIGN_OPTIONS },
      { name: "justify", type: "select", defaultValue: "start", options: JUSTIFY_OPTIONS },
      { name: "wrap", type: "boolean", defaultValue: false },
      { name: "inline", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Stack
        direction={pick(state, "direction", "column")}
        gap={pick(state, "gap", 4)}
        align={pick(state, "align", "stretch")}
        justify={pick(state, "justify", "start")}
        wrap={bool(state, "wrap")}
        inline={bool(state, "inline")}
        style={{ width: "100%" }}
      >
        <Surface tone="inset" padding={3}>
          First
        </Surface>
        <Surface tone="inset" padding={3}>
          Second
        </Surface>
        <Surface tone="inset" padding={3}>
          Third
        </Surface>
      </Stack>
    ),
    code: (state) =>
      [
        `<Stack direction="${pick(state, "direction", "column")}" gap={${pick(state, "gap", 4)}} align="${pick(state, "align", "stretch")}" justify="${pick(state, "justify", "start")}"${bool(state, "wrap") ? " wrap" : ""}${bool(state, "inline") ? " inline" : ""}>`,
        "  <Surface padding={3}>First</Surface>",
        "  <Surface padding={3}>Second</Surface>",
        "  <Surface padding={3}>Third</Surface>",
        "</Stack>",
      ].join("\n"),
    props: [
      { name: "direction", type: '"row" | "column"', default: '"column"', description: "Main axis." },
      { name: "gap", type: "Space", default: "4", description: "Gap between children." },
      { name: "rowGap", type: "Space", description: "Override the row gap." },
      { name: "columnGap", type: "Space", description: "Override the column gap." },
      { name: "align", type: "Align", description: "Cross-axis alignment." },
      { name: "justify", type: "Justify", description: "Main-axis distribution." },
      { name: "wrap", type: "boolean", default: "false", description: "Allow wrapping." },
      { name: "inline", type: "boolean", default: "false", description: "Render as inline-flex." },
      { name: "as", type: "ElementType", default: '"div"', description: "Polymorphic root element." },
    ],
    notes: ["Renders a flex container; use `direction=\"row\"` for a horizontal stack."],
  },
  {
    id: "surface",
    name: "Surface",
    category: "Layout",
    description: "A semantic surface with tone, border, radius, elevation, and padding.",
    keywords: ["panel", "background", "elevation", "radius"],
    controls: [
      { name: "tone", type: "select", defaultValue: "surface", options: SURFACE_TONE_OPTIONS },
      { name: "bordered", type: "boolean", defaultValue: true },
      { name: "elevation", type: "select", defaultValue: 0, options: ELEVATION_OPTIONS },
      { name: "radius", type: "select", defaultValue: "lg", options: RADIUS_OPTIONS },
      { name: "padding", type: "select", defaultValue: 6, options: SPACE_OPTIONS },
      { name: "interactive", type: "boolean", defaultValue: false },
      { name: "children", type: "text", label: "Text", defaultValue: "Surface content" },
    ],
    render: (state) => (
      <Surface
        tone={pick(state, "tone", "surface")}
        bordered={bool(state, "bordered", true)}
        elevation={num(state, "elevation", 0) as 0 | 1 | 2 | 3}
        radius={pick(state, "radius", "lg")}
        padding={pick(state, "padding", 6)}
        interactive={bool(state, "interactive")}
      >
        {str(state, "children", "Surface content")}
      </Surface>
    ),
    code: (state) =>
      [
        `<Surface tone="${pick(state, "tone", "surface")}" radius="${pick(state, "radius", "lg")}" elevation={${num(state, "elevation", 0)}} padding={${pick(state, "padding", 6)}}${bool(state, "bordered", true) ? "" : " bordered={false}"}${bool(state, "interactive") ? " interactive" : ""}>`,
        `  ${str(state, "children", "Surface content")}`,
        "</Surface>",
      ].join("\n"),
    props: [
      {
        name: "tone",
        type: '"surface" | "raised" | "inset" | "transparent"',
        default: '"surface"',
        description: "Background treatment.",
      },
      { name: "bordered", type: "boolean", default: "true", description: "Draw a 1px border." },
      { name: "elevation", type: "0 | 1 | 2 | 3", default: "0", description: "Shadow depth." },
      { name: "radius", type: '"none" | "sm" | "md" | "lg" | "xl" | "full"', default: '"lg"', description: "Corner radius token." },
      { name: "padding", type: "Space", description: "Internal padding." },
      { name: "interactive", type: "boolean", default: "false", description: "Adds hover affordance for clickable surfaces." },
    ],
    notes: ["The lower-level primitive behind Card; use it for custom panels and containers."],
  },
  {
    id: "visually-hidden",
    name: "VisuallyHidden",
    category: "Layout",
    description: "Hides content visually while keeping it available to assistive technology.",
    keywords: ["a11y", "screen reader", "sr-only", "accessibility"],
    controls: [
      { name: "children", type: "text", label: "Text", defaultValue: "Screen reader only" },
      { name: "focusable", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <>
        <VisuallyHidden focusable={bool(state, "focusable")}>
          {str(state, "children", "Screen reader only")}
        </VisuallyHidden>
        <span>This text is visually hidden — inspect the DOM to read it.</span>
      </>
    ),
    code: (state) =>
      jsx("VisuallyHidden", {
        props: { focusable: bool(state, "focusable") },
        children: str(state, "children", "Screen reader only"),
      }),
    props: [
      { name: "focusable", type: "boolean", default: "false", description: "Reveal the content when it receives focus (skip links)." },
      { name: "...rest", type: "HTMLAttributes<HTMLSpanElement>", description: "Native span props." },
    ],
    notes: [
      "Uses the standard clip technique — never `display: none` — so content stays in the a11y tree.",
      "Ideal for icon labels and skip links; pair `focusable` with a visible focus style.",
    ],
  },
  {
    id: "split-pane",
    name: "SplitPane",
    category: "Layout",
    description: "Two resizable panes with a draggable, keyboard-operable separator.",
    keywords: ["split", "resize", "panes", "divider", "layout", "workbench"],
    controls: [
      {
        name: "orientation",
        type: "select",
        defaultValue: "horizontal",
        options: [
          { label: "horizontal", value: "horizontal" },
          { label: "vertical", value: "vertical" },
        ],
      },
      { name: "defaultSize", type: "number", label: "Start size (%)", defaultValue: 40, min: 10, max: 90, step: 1 },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <div style={{ width: "100%", height: 220, border: "var(--ui-p-border-thin) solid var(--ui-border)", borderRadius: "var(--ui-control-radius)", overflow: "hidden" }}>
        <SplitPane
          orientation={pick(state, "orientation", "horizontal")}
          defaultSize={num(state, "defaultSize", 40)}
          disabled={bool(state, "disabled")}
          separatorLabel="Resize editor and preview"
          start={
            <div style={{ padding: 16, height: "100%", background: "var(--ui-surface-inset)" }}>
              Editor pane
            </div>
          }
          end={
            <div style={{ padding: 16, height: "100%", background: "var(--ui-surface)" }}>
              Preview pane
            </div>
          }
        />
      </div>
    ),
    code: (state) => {
      const orientation = pick(state, "orientation", "horizontal");
      return [
        "<SplitPane",
        `  orientation="${orientation}"`,
        `  defaultSize={${num(state, "defaultSize", 40)}}`,
        bool(state, "disabled") ? "  disabled" : null,
        '  start={<div style={{ padding: 16 }}>Editor pane</div>}',
        '  end={<div style={{ padding: 16 }}>Preview pane</div>}',
        "/>",
      ]
        .filter(Boolean)
        .join("\n");
    },
    props: [
      { name: "start / end", type: "ReactNode", required: true, description: "Pane content." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Split direction." },
      { name: "size / defaultSize", type: "number", default: "50", description: "First-pane size as a percentage." },
      { name: "onSizeChange", type: "(size: number) => void", description: "Fires while dragging or resizing by keyboard." },
      { name: "min / max", type: "number", default: "10 / 90", description: "Clamp range for the first pane." },
      { name: "step", type: "number", default: "2", description: "Keyboard resize step in percentage points." },
      { name: "disabled", type: "boolean", default: "false", description: "Disable dragging and keyboard resizing." },
      { name: "separatorLabel", type: "string", default: '"Resize panes"', description: "Accessible name for the separator." },
    ],
    notes: [
      "The separator is a focusable role=\"separator\" with aria-valuemin/max/now.",
      "Arrow keys resize, Home/End jump to min/max, and horizontal resizing respects RTL.",
      "Pointer drag uses pointer capture, so the handle keeps tracking outside the element.",
      "The headless behavior is exported as useSplitPane.",
    ],
  },
  {
    id: "affix",
    name: "Affix",
    category: "Layout",
    description: "Pins content to the top of the viewport or a scroll container after it scrolls past.",
    keywords: ["affix", "sticky", "pin", "scroll", "header"],
    render: () => <AffixDemo />,
    props: [
      { name: "offsetTop", type: "number", default: "0", description: "Distance from the top at which content sticks." },
      { name: "offsetBottom", type: "number", description: "Stop sticking this far from the viewport bottom." },
      { name: "target", type: "() => HTMLElement | Window | null", description: "Scroll container; defaults to the window." },
      { name: "onChange", type: "(affixed: boolean) => void", description: "Fires when the pinned state changes." },
      { name: "unstyled / classNames", type: "SlotConfig", description: "Drop built-in classes or target the root/content slots." },
    ],
    notes: [
      "A placeholder keeps the original layout height, so nothing jumps when the content becomes fixed.",
      "Pass target when the component scrolls inside a panel instead of the page.",
    ],
  },
  {
    id: "masonry",
    name: "Masonry",
    category: "Layout",
    description: "A CSS multi-column masonry layout that preserves each item's natural height.",
    keywords: ["masonry", "columns", "gallery", "pinterest", "grid"],
    controls: [
      { name: "columns", type: "number", defaultValue: 3, min: 1, max: 5, step: 1 },
      { name: "gap", type: "select", defaultValue: "md", options: [
        { label: "sm", value: "sm" },
        { label: "md", value: "md" },
        { label: "lg", value: "lg" },
      ] },
    ],
    render: (state) => (
      <div style={{ width: "min(100%, 34rem)" }}>
        <Masonry columns={num(state, "columns", 3)} gap={pick(state, "gap", "md") as "sm" | "md" | "lg"}>
          {[92, 140, 72, 168, 116, 84, 152, 104].map((height, index) => (
            <div
              key={index}
              style={{
                height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--ui-p-radius-md)",
                background: "var(--ui-surface-raised)",
                color: "var(--ui-muted)",
                fontSize: "var(--ui-p-text-sm)",
              }}
            >
              {height}px
            </div>
          ))}
        </Masonry>
      </div>
    ),
    props: [
      { name: "columns", type: "number", default: "3", description: "Number of columns." },
      { name: "columnWidth", type: "number", description: "Responsive mode: minimum column width in px." },
      { name: "gap", type: '"sm" | "md" | "lg"', default: '"md"', description: "Column and row spacing." },
      { name: "unstyled / classNames", type: "SlotConfig", description: "Target the root or item slots." },
    ],
    notes: [
      "Layout is pure CSS columns, so there is no measurement or reflow loop.",
      "Items use break-inside: avoid so cards are never split across columns.",
    ],
  },
  {
    id: "watermark",
    name: "Watermark",
    category: "Layout",
    description: "Repeating text or image watermark rendered as a theme-aware SVG pattern.",
    keywords: ["watermark", "overlay", "pattern", "brand", "security"],
    controls: [
      { name: "text", type: "text", defaultValue: "Personal UI" },
      { name: "opacity", type: "number", defaultValue: 0.12, min: 0, max: 1, step: 0.02 },
      { name: "rotate", type: "number", defaultValue: -22, min: -90, max: 90, step: 1 },
      { name: "gap", type: "number", defaultValue: 120, min: 40, max: 240, step: 10 },
    ],
    render: (state) => (
      <Watermark
        text={str(state, "text", "Personal UI")}
        opacity={num(state, "opacity", 0.12)}
        rotate={num(state, "rotate", -22)}
        gap={num(state, "gap", 120)}
      >
        <div
          style={{
            width: "min(100%, 30rem)",
            height: "12rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--ui-p-radius-lg)",
            border: "1px solid var(--ui-border)",
            background: "var(--ui-surface)",
            color: "var(--ui-muted)",
          }}
        >
          Content behind the watermark
        </div>
      </Watermark>
    ),
    props: [
      { name: "text", type: "string", default: '"Personal UI"', description: "Repeated text." },
      { name: "image", type: "string", description: "Repeated image URL; takes precedence over text." },
      { name: "gap", type: "number", default: "120", description: "Tile size in px." },
      { name: "fontSize", type: "number", default: "14", description: "Text size in px." },
      { name: "rotate", type: "number", default: "-22", description: "Pattern rotation in degrees." },
      { name: "opacity", type: "number", default: "0.12", description: "Layer opacity." },
      { name: "color", type: "string", description: "CSS colour; defaults to the muted token." },
      { name: "zIndex", type: "number", description: "Overlay stacking order." },
    ],
    notes: [
      "The pattern is inline SVG, so it inherits currentColor and stays crisp when zoomed.",
      "The layer is pointer-events: none, so content underneath stays interactive.",
    ],
  },
];
