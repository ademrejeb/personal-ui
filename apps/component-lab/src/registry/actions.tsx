import { Plus, Star } from "lucide-react";
import {
  Button,
  ButtonGroup,
  CopyButton,
  FloatButton,
  IconButton,
  ToggleButton,
  ToggleGroup,
  ToggleGroupItem,
} from "@adem.rejeb/ui";
import type { ComponentEntry } from "./types";
import { bool, num, pick, str } from "./demo";
import { jsx } from "../lib/jsx";

const VARIANTS = ["primary", "secondary", "outline", "ghost", "danger", "link"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const buttonVariantOptions = VARIANTS.map((value) => ({ label: value, value }));
const buttonSizeOptions = SIZES.map((value) => ({ label: value, value }));

export const actionsEntries: ComponentEntry[] = [
  {
    id: "button",
    name: "Button",
    category: "Actions",
    description: "The primary action control, with variants, sizes, icons, and a loading state.",
    keywords: ["action", "submit", "cta", "primary"],
    children: "Save changes",
    controls: [
      {
        name: "variant",
        type: "select",
        defaultValue: "primary",
        options: buttonVariantOptions,
      },
      { name: "size", type: "select", defaultValue: "md", options: buttonSizeOptions },
      { name: "children", type: "text", label: "Label", defaultValue: "Save changes" },
      { name: "startIcon", type: "boolean", label: "Start icon", defaultValue: false },
      { name: "endIcon", type: "boolean", label: "End icon", defaultValue: false },
      { name: "loading", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
      { name: "fullWidth", type: "boolean", label: "Full width", defaultValue: false },
    ],
    render: (state) => (
      <Button
        variant={pick(state, "variant", "primary")}
        size={pick(state, "size", "md")}
        loading={bool(state, "loading")}
        disabled={bool(state, "disabled")}
        fullWidth={bool(state, "fullWidth")}
        startIcon={bool(state, "startIcon") ? <Plus size={16} /> : undefined}
        endIcon={bool(state, "endIcon") ? <Star size={16} /> : undefined}
      >
        {str(state, "children", "Save changes")}
      </Button>
    ),
    code: (state) =>
      jsx("Button", {
        props: {
          variant: pick(state, "variant", "primary") === "primary" ? undefined : pick(state, "variant", "primary"),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          startIcon: bool(state, "startIcon") ? "<Plus size={16} />" : false,
          endIcon: bool(state, "endIcon") ? "<Star size={16} />" : false,
          loading: bool(state, "loading"),
          disabled: bool(state, "disabled"),
          fullWidth: bool(state, "fullWidth"),
        },
        children: str(state, "children", "Save changes"),
      }),
    props: [
      {
        name: "variant",
        type: '"primary" | "secondary" | "outline" | "ghost" | "danger" | "link"',
        default: '"primary"',
        description: "Visual treatment.",
      },
      {
        name: "size",
        type: 'ControlSize ("xs" | "sm" | "md" | "lg" | "xl")',
        default: '"md"',
        description: "Control height and padding.",
      },
      { name: "loading", type: "boolean", default: "false", description: "Shows a spinner and disables interaction." },
      { name: "startIcon", type: "ReactNode", description: "Icon rendered before the label." },
      { name: "endIcon", type: "ReactNode", description: "Icon rendered after the label." },
      { name: "fullWidth", type: "boolean", default: "false", description: "Stretch to fill the container." },
      {
        name: "...rest",
        type: "ButtonHTMLAttributes<HTMLButtonElement>",
        description: "Native button props. Defaults to type=\"button\".",
      },
    ],
    notes: [
      "Renders a native <button>; for navigation use Link instead.",
      "While loading, the label is visually hidden but kept in the layout so the button never resizes.",
      "Announces a busy state via aria-busy.",
    ],
  },
  {
    id: "icon-button",
    name: "IconButton",
    category: "Actions",
    description: "Icon-only button with a required accessible name.",
    keywords: ["icon", "action", "square", "round"],
    controls: [
      { name: "variant", type: "select", defaultValue: "ghost", options: buttonVariantOptions },
      { name: "size", type: "select", defaultValue: "md", options: buttonSizeOptions },
      { name: "rounded", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <IconButton
        aria-label="Add item"
        icon={<Plus size={16} />}
        variant={pick(state, "variant", "ghost")}
        size={pick(state, "size", "md")}
        rounded={bool(state, "rounded")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("IconButton", {
        props: {
          "aria-label": "Add item",
          icon: "<Plus size={16} />",
          variant: pick(state, "variant", "ghost") === "ghost" ? undefined : pick(state, "variant", "ghost"),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          rounded: bool(state, "rounded"),
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "aria-label", type: "string", required: true, description: "Required accessible name." },
      { name: "icon", type: "ReactNode", required: true, description: "The icon to render." },
      { name: "rounded", type: "boolean", default: "false", description: "Render as a perfect circle." },
      { name: "size", type: "ControlSize", default: '"md"', description: "Shared with Button." },
    ],
    notes: ["A meaningful aria-label is enforced by the type signature."],
  },
  {
    id: "button-group",
    name: "ButtonGroup",
    category: "Actions",
    description: "Groups related actions, optionally joined into one segmented control.",
    keywords: ["segmented", "group", "toolbar"],
    controls: [
      { name: "orientation", type: "select", defaultValue: "horizontal", options: [
        { label: "horizontal", value: "horizontal" },
        { label: "vertical", value: "vertical" },
      ] },
      { name: "attached", type: "boolean", defaultValue: true },
      { name: "fullWidth", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <ButtonGroup
        orientation={pick(state, "orientation", "horizontal")}
        attached={bool(state, "attached")}
        fullWidth={bool(state, "fullWidth")}
      >
        <Button variant="outline">Cancel</Button>
        <Button variant="outline">Save draft</Button>
        <Button>Publish</Button>
      </ButtonGroup>
    ),
    code: (state) =>
      jsx("ButtonGroup", {
        props: {
          orientation:
            pick(state, "orientation", "horizontal") === "horizontal"
              ? undefined
              : pick(state, "orientation", "horizontal"),
          attached: bool(state, "attached") ? true : undefined,
          fullWidth: bool(state, "fullWidth"),
        },
        children: [
          '  <Button variant="outline">Cancel</Button>',
          '  <Button variant="outline">Save draft</Button>',
          "  <Button>Publish</Button>",
        ].join("\n"),
      }),
    props: [
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Layout axis." },
      { name: "attached", type: "boolean", default: "false", description: "Join buttons into one control." },
      { name: "fullWidth", type: "boolean", default: "false", description: "Stretch to fill the container." },
    ],
  },
  {
    id: "toggle-button",
    name: "ToggleButton",
    category: "Actions",
    description: "A two-state button that exposes aria-pressed.",
    keywords: ["toggle", "pressed", "state", "favorite"],
    controls: [
      { name: "variant", type: "select", defaultValue: "secondary", options: buttonVariantOptions },
      { name: "size", type: "select", defaultValue: "md", options: buttonSizeOptions },
      { name: "defaultPressed", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <ToggleButton
        variant={pick(state, "variant", "secondary")}
        size={pick(state, "size", "md")}
        defaultPressed={bool(state, "defaultPressed")}
        disabled={bool(state, "disabled")}
        startIcon={<Star size={16} />}
      >
        Favorite
      </ToggleButton>
    ),
    code: (state) =>
      jsx("ToggleButton", {
        props: {
          variant:
            pick(state, "variant", "secondary") === "secondary"
              ? undefined
              : pick(state, "variant", "secondary"),
          defaultPressed: bool(state, "defaultPressed") ? true : undefined,
          disabled: bool(state, "disabled"),
          startIcon: "<Star size={16} />",
        },
        children: "Favorite",
      }),
    props: [
      { name: "pressed", type: "boolean", description: "Controlled pressed state." },
      { name: "defaultPressed", type: "boolean", default: "false", description: "Initial uncontrolled state." },
      { name: "onPressedChange", type: "(pressed: boolean) => void", description: "Change callback." },
    ],
    notes: ["Exposes its state with aria-pressed rather than aria-expanded."],
  },
  {
    id: "toggle-group",
    name: "ToggleGroup",
    category: "Actions",
    description: "Related toggles with roving tab order and arrow-key navigation.",
    keywords: ["segmented", "switch", "select", "radio"],
    controls: [
      {
        name: "type",
        type: "select",
        defaultValue: "single",
        options: [
          { label: "single", value: "single" },
          { label: "multiple", value: "multiple" },
        ],
      },
      { name: "variant", type: "select", defaultValue: "secondary", options: buttonVariantOptions },
      { name: "size", type: "select", defaultValue: "md", options: buttonSizeOptions },
      { name: "attached", type: "boolean", defaultValue: true },
    ],
    render: (state) =>
      (pick(state, "type", "single") as string) === "multiple" ? (
        <ToggleGroup
          type="multiple"
          defaultValue={["bold"]}
          variant={pick(state, "variant", "secondary")}
          size={pick(state, "size", "md")}
          attached={bool(state, "attached")}
        >
          <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
          <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
          <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
        </ToggleGroup>
      ) : (
        <ToggleGroup
          type="single"
          defaultValue="grid"
          variant={pick(state, "variant", "secondary")}
          size={pick(state, "size", "md")}
          attached={bool(state, "attached")}
        >
          <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
          <ToggleGroupItem value="board">Board</ToggleGroupItem>
        </ToggleGroup>
      ),
    code: (state) =>
      jsx("ToggleGroup", {
        props: {
          type: (pick(state, "type", "single") as string) === "single" ? undefined : "multiple",
          defaultValue:
            (pick(state, "type", "single") as string) === "multiple" ? '["bold"]' : '"grid"',
          variant:
            pick(state, "variant", "secondary") === "secondary"
              ? undefined
              : pick(state, "variant", "secondary"),
        },
        children: [
          '  <ToggleGroupItem value="bold">Bold</ToggleGroupItem>',
          '  <ToggleGroupItem value="italic">Italic</ToggleGroupItem>',
          '  <ToggleGroupItem value="underline">Underline</ToggleGroupItem>',
        ].join("\n"),
      }),
    props: [
      { name: "type", type: '"single" | "multiple"', default: '"single"', description: "Selection mode." },
      { name: "value / defaultValue", type: "string | string[]", description: "Controlled/nncontrolled selection." },
      { name: "attached", type: "boolean", default: "false", description: "Join items into one control." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Layout axis." },
    ],
    notes: [
      "Arrow keys move between items; only the active item is tabbable (roving tabindex).",
      "Each item renders as a button with aria-pressed.",
    ],
  },
  {
    id: "copy-button",
    name: "CopyButton",
    category: "Actions",
    description: "Copies a value to the clipboard and reports success to all users.",
    keywords: ["clipboard", "copy", "code"],
    controls: [
      { name: "value", type: "text", defaultValue: "npm install @adem.rejeb/ui" },
      { name: "label", type: "text", defaultValue: "Copy" },
      { name: "copiedLabel", type: "text", label: "Copied label", defaultValue: "Copied" },
      { name: "iconOnly", type: "boolean", label: "Icon only", defaultValue: false },
      { name: "variant", type: "select", defaultValue: "ghost", options: buttonVariantOptions },
    ],
    render: (state) => (
      <CopyButton
        value={str(state, "value", "npm install @adem.rejeb/ui")}
        label={str(state, "label", "Copy")}
        copiedLabel={str(state, "copiedLabel", "Copied")}
        iconOnly={bool(state, "iconOnly")}
        variant={pick(state, "variant", "ghost")}
      />
    ),
    code: (state) =>
      jsx("CopyButton", {
        props: {
          value: str(state, "value", "npm install @adem.rejeb/ui"),
          label: str(state, "label", "Copy") === "Copy" ? undefined : str(state, "label", "Copy"),
          iconOnly: bool(state, "iconOnly"),
          variant: pick(state, "variant", "ghost") === "ghost" ? undefined : pick(state, "variant", "ghost"),
        },
      }),
    props: [
      { name: "value", type: "string", required: true, description: "Text written to the clipboard." },
      { name: "label", type: "string", default: '"Copy"', description: "Idle label." },
      { name: "copiedLabel", type: "string", default: '"Copied"', description: "Label after a successful copy." },
      { name: "iconOnly", type: "boolean", default: "false", description: "Hide the label visually." },
    ],
    notes: ["Success is announced via a polite live region, so screen readers hear it too."],
  },
  {
    id: "float-button",
    name: "FloatButton",
    category: "Actions",
    description: "A fixed action button for global actions, with an optional label, badge, and back-to-top behavior.",
    keywords: ["float", "fab", "fixed", "back to top", "scroll"],
    controls: [
      { name: "label", type: "text", defaultValue: "New item" },
      { name: "badge", type: "number", defaultValue: 3, min: 0, max: 99, step: 1 },
      { name: "shape", type: "select", defaultValue: "circle", options: [
        { label: "circle", value: "circle" },
        { label: "square", value: "square" },
      ] },
      { name: "variant", type: "select", defaultValue: "primary", options: [
        { label: "default", value: "default" },
        { label: "primary", value: "primary" },
      ] },
      { name: "backTop", type: "boolean", defaultValue: false },
    ],
    render: (state) => {
      const label = str(state, "label", "New item");
      return (
        <div style={{ height: "10rem" }}>
          <FloatButton
            icon={<Plus size={20} />}
            label={label || undefined}
            badge={num(state, "badge", 3) || undefined}
            shape={pick(state, "shape", "circle") as "circle" | "square"}
            variant={pick(state, "variant", "primary") as "default" | "primary"}
            backTop={bool(state, "backTop")}
            tooltip={label || "Create"}
          />
        </div>
      );
    },
    props: [
      { name: "icon", type: "ReactNode", description: "Leading icon; defaults to an up arrow for backTop." },
      { name: "label / description", type: "ReactNode", description: "Optional text; a label turns the button into a pill." },
      { name: "badge", type: "number | string", description: "Corner count or status." },
      { name: "shape", type: '"circle" | "square"', default: '"circle"', description: "Icon-only shape." },
      { name: "variant", type: '"default" | "primary"', default: '"default"', description: "Surface or accent fill." },
      { name: "position", type: "FloatButtonPosition", default: '"bottom-right"', description: "Viewport corner." },
      { name: "offset", type: "number", default: "0", description: "Edge offset, useful for stacking." },
      { name: "backTop", type: "boolean", default: "false", description: "Scroll to the top (or target) on press." },
      { name: "visible", type: "boolean", default: "true", description: "Hide without unmounting the parent." },
    ],
    notes: [
      "Renders a real button with an accessible name from aria-label, the label, or the tooltip.",
      "backTop uses smooth scrolling and respects prefers-reduced-motion through the browser setting.",
    ],
  },
];
