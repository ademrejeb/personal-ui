import { Icon, iconNames, iconRegistry, type IconSize, Button } from "@personal-ui/ui";
import { Download } from "lucide-react";
import type { ComponentEntry } from "./types";
import { pick } from "./demo";
import { jsx } from "../lib/jsx";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

function IconGallery({ size }: { size: IconSize }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(5.5rem, 1fr))",
        gap: "var(--ui-p-space-3)",
      }}
    >
      {iconNames.map((name) => (
        <div
          key={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--ui-p-space-2)",
            padding: "var(--ui-p-space-3)",
            border: "var(--ui-p-border-thin) solid var(--ui-border)",
            borderRadius: "var(--ui-p-radius-md)",
            color: "var(--ui-muted-strong)",
          }}
        >
          <Icon icon={iconRegistry[name]} size={size} />
          <span style={{ fontSize: "var(--ui-p-text-2xs)", color: "var(--ui-muted)" }}>{name}</span>
        </div>
      ))}
    </div>
  );
}

export const iconEntries: ComponentEntry[] = [
  {
    id: "icons",
    name: "Icon",
    category: "Icons",
    description: "Sized, colour-inheriting wrapper around a curated Lucide icon registry.",
    keywords: ["icon", "glyph", "symbol", "lucide", "gallery", "pictogram"],
    controls: [
      {
        name: "size",
        type: "select",
        defaultValue: "md",
        options: SIZES.map((value) => ({ label: value, value })),
      },
    ],
    render: (state) => <IconGallery size={pick(state, "size", "md") as IconSize} />,
    code: (state) =>
      jsx("Icon", {
        props: {
          icon: "<Search />",
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
        },
      }),
    props: [
      { name: "icon", type: "ComponentType<SVGProps>", required: true, description: "Any Lucide (or compatible) icon component." },
      { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl" | number', default: '"md"', description: "Named step from the control scale, or an explicit pixel size." },
      { name: "label", type: "string", description: "Accessible name; omit to mark the icon as decorative." },
      { name: "spin", type: "boolean", default: "false", description: "Loop the spin animation (loaders)." },
    ],
    notes: [
      "Icons inherit colour from their parent, so they pick up button and link states automatically.",
      "The registry is a curated, tree-shakeable subset — import more from lucide-react as needed.",
      "Set label when the icon is the only content; otherwise it renders aria-hidden.",
    ],
  },
  {
    id: "icon-in-button",
    name: "Icon in context",
    category: "Icons",
    description: "Icons aligned inside buttons and other controls.",
    keywords: ["icon", "button", "context", "alignment"],
    render: () => (
      <div style={{ display: "flex", gap: "var(--ui-p-space-3)", alignItems: "center" }}>
        <Button startIcon={<Download size={16} />}>Export</Button>
        <Button variant="outline" startIcon={<Icon icon={iconRegistry.search} size="sm" />}>
          Search
        </Button>
      </div>
    ),
    code: () =>
      [
        '<Button startIcon={<Download size={16} />}>Export</Button>',
        '<Button variant="outline" startIcon={<Icon icon={iconRegistry.search} />}>Search</Button>',
      ].join("\n"),
    props: [],
    notes: ["Prefer the component's startIcon/endIcon slots so spacing and sizing stay consistent."],
  },
];
