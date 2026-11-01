import type { ElementType } from "react";
import {
  Blockquote,
  Code,
  CodeBlock,
  Heading,
  Kbd,
  Label,
  Link,
  Text,
  Truncate,
} from "@personal-ui/ui";
import type {
  HeadingAlign,
  HeadingLevel,
  HeadingSize,
  HeadingTone,
  LinkVariant,
  TextAlign,
  TextSize,
  TextTone,
  TextWeight,
} from "@personal-ui/ui";
import type { ComponentEntry } from "./types";
import { bool, num, pick, str } from "./demo";
import { jsx } from "../lib/jsx";

const BLOCKQUOTE_TEXT =
  "Design is not just what it looks like and feels like. Design is how it works.";
const TEXT_SAMPLE = "The quick brown fox jumps over the lazy dog.";
const TRUNCATE_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const CODE_SAMPLE = `import { Button } from "@personal-ui/ui";

export function App() {
  return <Button variant="primary">Click me</Button>;
}`;

const headingLevelOptions = [1, 2, 3, 4, 5, 6].map((value) => ({ label: `h${value}`, value }));
const headingSizeOptions = [
  { label: "auto", value: "auto" },
  { label: "display", value: "display" },
  { label: "2xl", value: "2xl" },
  { label: "xl", value: "xl" },
  { label: "lg", value: "lg" },
  { label: "md", value: "md" },
  { label: "sm", value: "sm" },
];
const headingToneOptions = [
  { label: "default", value: "default" },
  { label: "muted", value: "muted" },
  { label: "primary", value: "primary" },
  { label: "danger", value: "danger" },
];
const headingAlignOptions = [
  { label: "auto", value: "auto" },
  { label: "left", value: "left" },
  { label: "center", value: "center" },
  { label: "right", value: "right" },
];
const headingAsOptions = [
  { label: "auto", value: "auto" },
  { label: "h1", value: "h1" },
  { label: "h2", value: "h2" },
  { label: "h3", value: "h3" },
  { label: "div", value: "div" },
  { label: "p", value: "p" },
];

const linkVariantOptions = [
  { label: "default", value: "default" },
  { label: "subtle", value: "subtle" },
  { label: "standalone", value: "standalone" },
];

const textSizeOptions = ["2xs", "xs", "sm", "md", "lg", "xl"].map((value) => ({ label: value, value }));
const textToneOptions = [
  "default",
  "muted",
  "subtle",
  "primary",
  "success",
  "warning",
  "danger",
  "info",
].map((value) => ({ label: value, value }));
const textWeightOptions = ["regular", "medium", "semibold", "bold"].map((value) => ({ label: value, value }));
const textAlignOptions = ["left", "center", "right"].map((value) => ({ label: value, value }));
const textLeadingOptions = ["tight", "snug", "normal", "relaxed"].map((value) => ({ label: value, value }));
const textAsOptions = ["span", "p", "div", "strong", "em", "label"].map((value) => ({ label: value, value }));

export const typographyEntries: ComponentEntry[] = [
  {
    id: "blockquote",
    name: "Blockquote",
    category: "Typography",
    description: "Styled quotation with an optional attribution, wrapped in a figure.",
    keywords: ["quote", "citation", "figure", "blockquote"],
    controls: [
      { name: "children", type: "textarea", label: "Quote", defaultValue: BLOCKQUOTE_TEXT },
      { name: "attribution", type: "text", label: "Attribution", defaultValue: "Steve Jobs" },
    ],
    render: (state) => (
      <Blockquote attribution={str(state, "attribution", "Steve Jobs") || undefined}>
        {str(state, "children", BLOCKQUOTE_TEXT)}
      </Blockquote>
    ),
    code: (state) =>
      jsx("Blockquote", {
        props: {
          attribution: str(state, "attribution", "Steve Jobs") || undefined,
        },
        children: str(state, "children", BLOCKQUOTE_TEXT),
      }),
    props: [
      { name: "attribution", type: "ReactNode", description: "Attribution shown after the quote." },
      {
        name: "...rest",
        type: "BlockquoteHTMLAttributes<HTMLQuoteElement>",
        description: "Native blockquote attributes forwarded to the element.",
      },
    ],
    notes: ["The quote and attribution are grouped in a <figure>/<figcaption> pair for correct semantics."],
  },
  {
    id: "code",
    name: "Code",
    category: "Typography",
    description: "Inline code token with a subtle background, rendering a native code element.",
    keywords: ["code", "inline", "token", "monospace"],
    controls: [
      { name: "children", type: "text", label: "Content", defaultValue: "npm install @personal-ui/ui" },
    ],
    render: (state) => <Code>{str(state, "children", "npm install @personal-ui/ui")}</Code>,
    code: (state) =>
      jsx("Code", {
        children: str(state, "children", "npm install @personal-ui/ui"),
      }),
    props: [
      {
        name: "...rest",
        type: "HTMLAttributes<HTMLElement>",
        description: "Native code element attributes.",
      },
    ],
    notes: ["Use CodeBlock for multi-line, copyable samples."],
  },
  {
    id: "code-block",
    name: "CodeBlock",
    category: "Typography",
    description: "Formatted, copyable code with an optional filename header, line numbers, and wrapping.",
    keywords: ["code", "snippet", "copy", "pre", "highlight"],
    controls: [
      { name: "code", type: "textarea", label: "Code", defaultValue: CODE_SAMPLE },
      { name: "language", type: "text", defaultValue: "tsx" },
      { name: "filename", type: "text", defaultValue: "App.tsx" },
      { name: "showLineNumbers", type: "boolean", label: "Line numbers", defaultValue: false },
      { name: "copyable", type: "boolean", defaultValue: true },
      { name: "wrap", type: "boolean", defaultValue: false },
      { name: "maxHeight", type: "text", label: "Max height", defaultValue: "" },
    ],
    render: (state) => (
      <CodeBlock
        code={str(state, "code", CODE_SAMPLE)}
        language={str(state, "language", "tsx") || undefined}
        filename={str(state, "filename", "App.tsx") || undefined}
        showLineNumbers={bool(state, "showLineNumbers")}
        copyable={bool(state, "copyable", true)}
        wrap={bool(state, "wrap")}
        maxHeight={str(state, "maxHeight", "") || undefined}
      />
    ),
    code: (state) =>
      jsx("CodeBlock", {
        props: {
          code: str(state, "code", CODE_SAMPLE),
          language: str(state, "language", "tsx") || undefined,
          filename: str(state, "filename", "App.tsx") || undefined,
          showLineNumbers: bool(state, "showLineNumbers"),
          copyable: bool(state, "copyable", true),
          wrap: bool(state, "wrap"),
          maxHeight: str(state, "maxHeight", "") || undefined,
        },
      }),
    props: [
      { name: "code", type: "string", description: "Raw code. Falls back to string children when omitted." },
      { name: "language", type: "string", description: "Language label shown in the header." },
      { name: "filename", type: "string", description: "Filename shown in the header." },
      { name: "showLineNumbers", type: "boolean", default: "false", description: "Render a line-number gutter." },
      { name: "copyable", type: "boolean", default: "true", description: "Show the copy button." },
      { name: "wrap", type: "boolean", default: "false", description: "Wrap long lines instead of scrolling." },
      { name: "maxHeight", type: "string | number", description: "Constrain the scroll area height." },
    ],
    notes: ["Copy success is announced through a polite live region, so screen readers hear it too."],
  },
  {
    id: "heading",
    name: "Heading",
    category: "Typography",
    description: "Semantic heading whose visual scale is decoupled from its accessibility level.",
    keywords: ["title", "h1", "h2", "display", "semantic"],
    controls: [
      { name: "children", type: "text", label: "Text", defaultValue: "Build accessible interfaces" },
      { name: "level", type: "select", defaultValue: 2, options: headingLevelOptions },
      { name: "size", type: "select", defaultValue: "auto", options: headingSizeOptions },
      { name: "tone", type: "select", defaultValue: "default", options: headingToneOptions },
      { name: "align", type: "select", defaultValue: "auto", options: headingAlignOptions },
      { name: "as", type: "select", label: "As", defaultValue: "auto", options: headingAsOptions },
    ],
    render: (state) => {
      const size = pick<HeadingSize | "auto">(state, "size", "auto");
      const align = pick<HeadingAlign | "auto">(state, "align", "auto");
      const as = pick(state, "as", "auto");
      return (
        <Heading
          level={pick<HeadingLevel>(state, "level", 2)}
          size={size === "auto" ? undefined : size}
          tone={pick<HeadingTone>(state, "tone", "default")}
          align={align === "auto" ? undefined : align}
          as={as === "auto" ? undefined : (as as ElementType)}
        >
          {str(state, "children", "Build accessible interfaces")}
        </Heading>
      );
    },
    code: (state) => {
      const level = pick<HeadingLevel>(state, "level", 2);
      const size = pick<HeadingSize | "auto">(state, "size", "auto");
      const tone = pick<HeadingTone>(state, "tone", "default");
      const align = pick<HeadingAlign | "auto">(state, "align", "auto");
      const as = pick(state, "as", "auto");
      return jsx("Heading", {
        props: {
          level: level === 2 ? undefined : level,
          size: size === "auto" ? undefined : size,
          tone: tone === "default" ? undefined : tone,
          align: align === "auto" ? undefined : align,
          as: as === "auto" ? undefined : as,
        },
        children: str(state, "children", "Build accessible interfaces"),
      });
    },
    props: [
      { name: "level", type: "1 | 2 | 3 | 4 | 5 | 6", default: "2", description: "Semantic heading level; renders h1–h6." },
      { name: "size", type: '"display" | "2xl" | "xl" | "lg" | "md" | "sm"', description: "Visual size, independent of level." },
      { name: "tone", type: '"default" | "muted" | "primary" | "danger"', default: '"default"', description: "Text color treatment." },
      { name: "align", type: '"left" | "center" | "right"', description: "Text alignment." },
      { name: "as", type: "ElementType", description: "Override the rendered element without changing the a11y level." },
    ],
    notes: ["Set level for document structure and size for appearance; the two are intentionally separate."],
  },
  {
    id: "label",
    name: "Label",
    category: "Typography",
    description: "Accessible form label with required, optional, disabled, and hint affordances.",
    keywords: ["label", "form", "required", "optional", "field"],
    controls: [
      { name: "children", type: "text", label: "Text", defaultValue: "Email address" },
      { name: "required", type: "boolean", defaultValue: false },
      { name: "optional", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
      { name: "hint", type: "text", label: "Hint", defaultValue: "" },
    ],
    render: (state) => (
      <Label
        required={bool(state, "required")}
        optional={bool(state, "optional")}
        disabled={bool(state, "disabled")}
        hint={str(state, "hint", "") || undefined}
      >
        {str(state, "children", "Email address")}
      </Label>
    ),
    code: (state) =>
      jsx("Label", {
        props: {
          required: bool(state, "required"),
          optional: bool(state, "optional"),
          disabled: bool(state, "disabled"),
          hint: str(state, "hint", "") || undefined,
        },
        children: str(state, "children", "Email address"),
      }),
    props: [
      { name: "required", type: "boolean", default: "false", description: "Shows an asterisk and announces \"(required)\"." },
      { name: "optional", type: "boolean", default: "false", description: "Shows an \"(optional)\" hint when not required." },
      { name: "disabled", type: "boolean", default: "false", description: "Dims the label to match a disabled control." },
      { name: "hint", type: "ReactNode", description: "Optional trailing helper text." },
    ],
    notes: ["A native label cannot be required; the state is conveyed visually and to assistive tech."],
  },
  {
    id: "link",
    name: "Link",
    category: "Typography",
    description: "Accessible anchor with visual variants and automatic external-link handling.",
    keywords: ["anchor", "href", "external", "navigation"],
    controls: [
      { name: "children", type: "text", label: "Text", defaultValue: "View the documentation" },
      { name: "href", type: "text", label: "Href", defaultValue: "https://opencode.ai/docs" },
      { name: "variant", type: "select", defaultValue: "default", options: linkVariantOptions },
      { name: "external", type: "boolean", defaultValue: false },
      { name: "hideExternalIcon", type: "boolean", label: "Hide external icon", defaultValue: false },
    ],
    render: (state) => (
      <Link
        href={str(state, "href", "https://opencode.ai/docs")}
        variant={pick<LinkVariant>(state, "variant", "default")}
        external={bool(state, "external")}
        hideExternalIcon={bool(state, "hideExternalIcon")}
      >
        {str(state, "children", "View the documentation")}
      </Link>
    ),
    code: (state) => {
      const variant = pick<LinkVariant>(state, "variant", "default");
      return jsx("Link", {
        props: {
          href: str(state, "href", "https://opencode.ai/docs"),
          variant: variant === "default" ? undefined : variant,
          external: bool(state, "external"),
          hideExternalIcon: bool(state, "hideExternalIcon"),
        },
        children: str(state, "children", "View the documentation"),
      });
    },
    props: [
      { name: "variant", type: '"default" | "subtle" | "standalone"', default: '"default"', description: "Visual treatment." },
      { name: "external", type: "boolean", description: "Force external handling (target/rel and an indicator icon)." },
      { name: "hideExternalIcon", type: "boolean", description: "Keep external behavior but hide the icon." },
      {
        name: "...rest",
        type: "AnchorHTMLAttributes<HTMLAnchorElement>",
        description: "Native anchor attributes including href.",
      },
    ],
    notes: ["Cross-origin absolute hrefs are detected as external on the client; set external explicitly for SSR."],
  },
  {
    id: "text",
    name: "Text",
    category: "Typography",
    description: "Polymorphic text primitive with size, tone, weight, alignment, and leading options.",
    keywords: ["body", "copy", "paragraph", "polymorphic", "span"],
    controls: [
      { name: "children", type: "textarea", label: "Text", defaultValue: TEXT_SAMPLE },
      { name: "size", type: "select", defaultValue: "sm", options: textSizeOptions },
      { name: "tone", type: "select", defaultValue: "default", options: textToneOptions },
      { name: "weight", type: "select", defaultValue: "regular", options: textWeightOptions },
      { name: "align", type: "select", defaultValue: "left", options: textAlignOptions },
      { name: "leading", type: "select", defaultValue: "normal", options: textLeadingOptions },
      { name: "mono", type: "boolean", defaultValue: false },
      { name: "truncate", type: "boolean", defaultValue: false },
      { name: "as", type: "select", label: "As", defaultValue: "span", options: textAsOptions },
    ],
    render: (state) => {
      const as = pick(state, "as", "span") as "span" | "p" | "div" | "strong" | "em" | "label";
      return (
        <Text
          as={as}
          size={pick<TextSize>(state, "size", "sm")}
          tone={pick<TextTone>(state, "tone", "default")}
          weight={pick<TextWeight>(state, "weight", "regular")}
          align={pick<TextAlign>(state, "align", "left")}
          mono={bool(state, "mono")}
          truncate={bool(state, "truncate")}
          leading={pick<"tight" | "snug" | "normal" | "relaxed">(state, "leading", "normal")}
        >
          {str(state, "children", TEXT_SAMPLE)}
        </Text>
      );
    },
    code: (state) => {
      const as = pick(state, "as", "span");
      const size = pick<TextSize>(state, "size", "sm");
      const tone = pick<TextTone>(state, "tone", "default");
      const weight = pick<TextWeight>(state, "weight", "regular");
      const align = pick<TextAlign>(state, "align", "left");
      const leading = pick<"tight" | "snug" | "normal" | "relaxed">(state, "leading", "normal");
      return jsx("Text", {
        props: {
          as: as === "span" ? undefined : as,
          size: size === "sm" ? undefined : size,
          tone: tone === "default" ? undefined : tone,
          weight: weight === "regular" ? undefined : weight,
          align: align === "left" ? undefined : align,
          mono: bool(state, "mono"),
          truncate: bool(state, "truncate"),
          leading: leading === "normal" ? undefined : leading,
        },
        children: str(state, "children", TEXT_SAMPLE),
      });
    },
    props: [
      { name: "size", type: '"2xs" | "xs" | "sm" | "md" | "lg" | "xl"', default: '"sm"', description: "Font size step." },
      {
        name: "tone",
        type: '"default" | "muted" | "subtle" | "primary" | "success" | "warning" | "danger" | "info"',
        default: '"default"',
        description: "Semantic text color.",
      },
      { name: "weight", type: '"regular" | "medium" | "semibold" | "bold"', description: "Font weight." },
      { name: "align", type: '"left" | "center" | "right"', description: "Text alignment." },
      { name: "mono", type: "boolean", default: "false", description: "Render in a monospace font." },
      { name: "truncate", type: "boolean", default: "false", description: "Single-line ellipsis truncation." },
      { name: "leading", type: '"tight" | "snug" | "normal" | "relaxed"', description: "Line-height scale." },
      { name: "as", type: "ElementType", default: '"span"', description: "Element to render; defaults to a span." },
    ],
    notes: ["Defaults to a <span>; pass as to render a p, div, or other element while keeping the styles."],
  },
  {
    id: "truncate",
    name: "Truncate",
    category: "Typography",
    description: "Clamps text to one or more lines with an ellipsis.",
    keywords: ["ellipsis", "clamp", "overflow", "lines", "truncate"],
    controls: [
      { name: "children", type: "textarea", label: "Text", defaultValue: TRUNCATE_TEXT },
      { name: "lines", type: "number", defaultValue: 2, min: 1, max: 6, step: 1 },
    ],
    render: (state) => (
      <div style={{ maxWidth: 260 }}>
        <Truncate lines={num(state, "lines", 2)}>{str(state, "children", TRUNCATE_TEXT)}</Truncate>
      </div>
    ),
    code: (state) => {
      const lines = num(state, "lines", 2);
      return jsx("Truncate", {
        props: { lines: lines === 1 ? undefined : lines },
        children: str(state, "children", TRUNCATE_TEXT),
      });
    },
    props: [
      {
        name: "lines",
        type: "number",
        default: "1",
        description: "Visible lines before clamping; 1 renders a single-line ellipsis.",
      },
    ],
    notes: ["Multi-line clamping uses -webkit-line-clamp; the single-line variant uses text-overflow ellipsis."],
  },
  {
    id: "kbd",
    name: "Kbd",
    category: "Typography",
    description: "A keyboard key or shortcut combination.",
    keywords: ["keyboard", "shortcut", "hotkey", "key", "command"],
    controls: [
      { name: "keys", type: "text", label: "Keys (comma separated)", defaultValue: "Ctrl, K" },
      {
        name: "size",
        type: "select",
        defaultValue: "md",
        options: [
          { label: "sm", value: "sm" },
          { label: "md", value: "md" },
        ],
      },
      {
        name: "variant",
        type: "select",
        defaultValue: "solid",
        options: [
          { label: "solid", value: "solid" },
          { label: "outline", value: "outline" },
          { label: "ghost", value: "ghost" },
        ],
      },
    ],
    render: (state) => {
      const keys = str(state, "keys", "Ctrl, K")
        .split(",")
        .map((key) => key.trim())
        .filter(Boolean);
      return (
        <Kbd keys={keys} size={pick(state, "size", "md")} variant={pick(state, "variant", "solid")}>
          {keys.length ? undefined : "K"}
        </Kbd>
      );
    },
    code: (state) => {
      const keys = str(state, "keys", "Ctrl, K")
        .split(",")
        .map((key) => key.trim())
        .filter(Boolean);
      const props: Record<string, string> = {};
      if (pick(state, "size", "md") !== "md") props.size = String(pick(state, "size", "md"));
      if (pick(state, "variant", "solid") !== "solid") props.variant = String(pick(state, "variant", "solid"));
      return keys.length
        ? jsx("Kbd", { props: { ...props, keys: `[${keys.map((key) => JSON.stringify(key)).join(", ")}]` } })
        : jsx("Kbd", { props, children: "K" });
    },
    props: [
      { name: "keys", type: "string[]", description: "Renders a key combination; joins keys with a visual +." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Key cap size." },
      { name: "variant", type: '"solid" | "outline" | "ghost"', default: '"solid"', description: "Key cap surface." },
      { name: "...rest", type: "HTMLAttributes<HTMLElement>", description: "Native kbd props." },
    ],
    notes: [
      "Renders a semantic <kbd> element, so shortcuts are announced correctly.",
      "The combination gets an aria-label (for example \"Ctrl + K\") while the visual plus is hidden from assistive tech.",
    ],
  },
];
