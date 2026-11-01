import { useState } from "react";
import { Bell, Folder, Home, LayoutDashboard, Settings, Users } from "lucide-react";
import {
  Accordion,
  Anchor,
  Breadcrumbs,
  Button,
  Collapsible,
  IconButton,
  Navbar,
  Pagination,
  Sidebar,
  Stepper,
  Tabs,
  TreeView,
} from "@adem.rejeb/ui";
import type { ComponentEntry } from "./types";
import type { TreeItem } from "@adem.rejeb/ui";
import { bool, num, pick, str } from "./demo";
import { jsx } from "../lib/jsx";

const ANCHOR_ITEMS = [
  { id: "anchor-overview", title: "Overview" },
  { id: "anchor-usage", title: "Usage" },
  { id: "anchor-api", title: "API" },
  { id: "anchor-examples", title: "Examples" },
];

function AnchorDemo() {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--ui-p-space-6)",
        alignItems: "flex-start",
        width: "min(100%, 36rem)",
      }}
    >
      <div style={{ width: "11rem", flex: "none" }}>
        <Anchor items={ANCHOR_ITEMS} sticky={false} offsetTop={0} />
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: "var(--ui-p-space-4)",
        }}
      >
        {ANCHOR_ITEMS.map((item) => (
          <section
            key={item.id}
            id={item.id}
            style={{
              minHeight: "7rem",
              padding: "var(--ui-p-space-4)",
              border: "1px solid var(--ui-border)",
              borderRadius: "var(--ui-p-radius-lg)",
              background: "var(--ui-surface)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "var(--ui-p-text-md)" }}>{item.title}</h3>
            <p style={{ margin: "var(--ui-p-space-2) 0 0", color: "var(--ui-muted)" }}>
              Scroll-spy tracks this section while you read.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

const ACCORDION_ITEMS = [
  { value: "shipping", label: "Shipping", body: "We ship worldwide within 3-5 business days." },
  { value: "returns", label: "Returns", body: "Return any item within 30 days for a full refund." },
  { value: "support", label: "Support", body: "Our team is available 24/7 over chat and email." },
];

function AccordionDemo({
  type,
  collapsible,
  disabled,
}: {
  type: "single" | "multiple";
  collapsible: boolean;
  disabled: boolean;
}) {
  const items = ACCORDION_ITEMS.map((item) => (
    <Accordion.Item key={item.value} value={item.value}>
      <Accordion.Trigger>{item.label}</Accordion.Trigger>
      <Accordion.Content>{item.body}</Accordion.Content>
    </Accordion.Item>
  ));

  return type === "multiple" ? (
    <Accordion type="multiple" defaultValue={["shipping"]} collapsible={collapsible} disabled={disabled}>
      {items}
    </Accordion>
  ) : (
    <Accordion type="single" defaultValue="shipping" collapsible={collapsible} disabled={disabled}>
      {items}
    </Accordion>
  );
}

function CollapsibleDemo({
  defaultOpen,
  disabled,
  unstyled,
}: {
  defaultOpen: boolean;
  disabled: boolean;
  unstyled: boolean;
}) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      disabled={disabled}
      unstyled={unstyled}
      style={{ width: "100%", maxWidth: "26rem" }}
    >
      <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
      <Collapsible.Content>
        Keeps the workspace in sync and enables experimental features.
      </Collapsible.Content>
    </Collapsible>
  );
}

const STEPPER_STEPS = [
  { id: "cart", label: "Cart", description: "Review your items" },
  { id: "address", label: "Address", description: "Where should we ship?" },
  { id: "payment", label: "Payment", description: "Add a payment method" },
  { id: "done", label: "Done", description: "Confirm the order" },
];

function StepperDemo({
  initialCurrent,
  orientation,
  clickable,
}: {
  initialCurrent: number;
  orientation: "horizontal" | "vertical";
  clickable: boolean;
}) {
  const [current, setCurrent] = useState(initialCurrent);

  return (
    <Stepper
      steps={STEPPER_STEPS}
      current={current}
      orientation={orientation}
      clickable={clickable}
      onStepClick={setCurrent}
    />
  );
}

function PaginationDemo({
  initialPage,
  pageCount,
  siblingCount,
  showEdges,
  showJump,
  disabled,
}: {
  initialPage: number;
  pageCount: number;
  siblingCount: number;
  showEdges: boolean;
  showJump: boolean;
  disabled: boolean;
}) {
  const [page, setPage] = useState(initialPage);

  return (
    <Pagination
      page={page}
      pageCount={pageCount}
      siblingCount={siblingCount}
      showEdges={showEdges}
      showJump={showJump}
      disabled={disabled}
      onPageChange={setPage}
    />
  );
}

const TAB_ITEMS = [
  { value: "overview", label: "Overview", body: "A high-level summary of the account." },
  { value: "activity", label: "Activity", body: "Recent events from the last 30 days." },
  { value: "settings", label: "Settings", body: "Configure preferences and access." },
];

function TabsDemo({
  defaultValue,
  orientation,
  activationMode,
}: {
  defaultValue: string;
  orientation: "horizontal" | "vertical";
  activationMode: "automatic" | "manual";
}) {
  return (
    <Tabs defaultValue={defaultValue} orientation={orientation} activationMode={activationMode}>
      <Tabs.List>
        {TAB_ITEMS.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {TAB_ITEMS.map((tab) => (
        <Tabs.Content key={tab.value} value={tab.value}>
          {tab.body}
        </Tabs.Content>
      ))}
    </Tabs>
  );
}

function NavbarDemo({ sticky, bordered }: { sticky: boolean; bordered: boolean }) {
  const [active, setActive] = useState("dashboard");
  const links = [
    { value: "dashboard", label: "Dashboard" },
    { value: "projects", label: "Projects" },
    { value: "team", label: "Team" },
  ];
  return (
    <Navbar sticky={sticky} bordered={bordered} style={{ position: "relative" }}>
      <Navbar.Brand href="#" mark={<Folder size={18} />}>
        Acme
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Nav>
        {links.map((link) => (
          <Navbar.Link
            key={link.value}
            href="#"
            active={active === link.value}
            onClick={(event) => {
              event.preventDefault();
              setActive(link.value);
            }}
          >
            {link.label}
          </Navbar.Link>
        ))}
      </Navbar.Nav>
      <Navbar.Actions>
        <IconButton aria-label="Notifications" variant="ghost" size="sm" icon={<Bell size={18} />} />
        <Button size="sm">Sign in</Button>
      </Navbar.Actions>
    </Navbar>
  );
}

function SidebarDemo({ collapsed }: { collapsed: boolean }) {
  const [active, setActive] = useState("dashboard");
  const groups = [
    {
      label: "Workspace",
      items: [
        { value: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { value: "projects", label: "Projects", icon: <Folder size={18} /> },
        { value: "team", label: "Team", icon: <Users size={18} /> },
      ],
    },
    {
      label: "Account",
      items: [{ value: "settings", label: "Settings", icon: <Settings size={18} /> }],
    },
  ];
  return (
    <div style={{ display: "flex", minHeight: "18rem" }}>
      <Sidebar defaultCollapsed={collapsed}>
        <Sidebar.Header>
          <strong>Acme</strong>
          <Sidebar.Toggle />
        </Sidebar.Header>
        <Sidebar.Nav>
          {groups.map((group) => (
            <Sidebar.Section key={group.label} label={group.label}>
              {group.items.map((item) => (
                <Sidebar.Link
                  key={item.value}
                  href="#"
                  icon={item.icon}
                  active={active === item.value}
                  onClick={(event) => {
                    event.preventDefault();
                    setActive(item.value);
                  }}
                >
                  {item.label}
                </Sidebar.Link>
              ))}
            </Sidebar.Section>
          ))}
        </Sidebar.Nav>
      </Sidebar>
      <div style={{ flex: 1, padding: "var(--ui-p-space-4)" }}>Content area</div>
    </div>
  );
}

const TREE_ITEMS: TreeItem[] = [
  {
    key: "src",
    label: "src",
    children: [
      {
        key: "components",
        label: "components",
        description: "24 files",
        children: [
          { key: "button", label: "Button.tsx" },
          { key: "input", label: "Input.tsx" },
          { key: "card", label: "Card.tsx" },
        ],
      },
      {
        key: "styles",
        label: "styles",
        children: [
          { key: "tokens", label: "tokens.css" },
          { key: "base", label: "base.css" },
        ],
      },
      { key: "index", label: "index.ts" },
    ],
  },
  {
    key: "docs",
    label: "docs",
    children: [
      { key: "audit", label: "audit.md" },
      { key: "tokens-doc", label: "tokens.md" },
    ],
  },
  { key: "package", label: "package.json" },
  { key: "lock", label: "pnpm-lock.yaml", disabled: true },
];

function TreeViewDemo({
  selectionMode,
  expandAll,
  cascade,
  lines,
  unstyled,
}: {
  selectionMode: "single" | "multiple";
  expandAll: boolean;
  cascade: boolean;
  lines: boolean;
  unstyled: boolean;
}) {
  const [activated, setActivated] = useState("nothing yet");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ui-p-space-3)", maxWidth: 320 }}>
      <TreeView
        items={TREE_ITEMS}
        label="Project files"
        selectionMode={selectionMode}
        defaultExpandAll={expandAll}
        cascade={cascade}
        showLines={lines}
        unstyled={unstyled}
        onActivate={setActivated}
      />
      <span style={{ fontSize: "var(--ui-p-text-xs)", color: "var(--ui-muted)" }}>
        Activated: {activated}
      </span>
    </div>
  );
}

export const navigationEntries: ComponentEntry[] = [
  {
    id: "accordion",
    name: "Accordion",
    category: "Navigation",
    description: "Stacked disclosure panels that expand a single section or many at once.",
    keywords: ["disclosure", "collapse", "expand", "faq", "panel"],
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
      { name: "collapsible", type: "boolean", defaultValue: true },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <AccordionDemo
        type={(pick(state, "type", "single") as string) === "multiple" ? "multiple" : "single"}
        collapsible={bool(state, "collapsible", true)}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("Accordion", {
        props: {
          type: (pick(state, "type", "single") as string) === "multiple" ? "multiple" : "single",
          defaultValue: (pick(state, "type", "single") as string) === "multiple" ? '["shipping"]' : '"shipping"',
          collapsible: bool(state, "collapsible", true) ? undefined : "false",
          disabled: bool(state, "disabled"),
        },
        children: [
          '  <Accordion.Item value="shipping">',
          "    <Accordion.Trigger>Shipping</Accordion.Trigger>",
          "    <Accordion.Content>We ship worldwide within 3-5 business days.</Accordion.Content>",
          "  </Accordion.Item>",
          '  <Accordion.Item value="returns">',
          "    <Accordion.Trigger>Returns</Accordion.Trigger>",
          "    <Accordion.Content>Return any item within 30 days for a full refund.</Accordion.Content>",
          "  </Accordion.Item>",
        ].join("\n"),
      }),
    props: [
      {
        name: "type",
        type: '"single" | "multiple"',
        required: true,
        description: "Whether one or many panels can be open.",
      },
      {
        name: "defaultValue",
        type: "string | string[]",
        description: "Initially open item value(s) when uncontrolled.",
      },
      {
        name: "collapsible",
        type: "boolean",
        default: "true",
        description: "Allow closing the open item in single mode.",
      },
      { name: "disabled", type: "boolean", default: "false", description: "Disable every trigger in the group." },
      {
        name: "Accordion.Item value",
        type: "string",
        required: true,
        description: "Unique value identifying each item.",
      },
      {
        name: "Accordion.Trigger indicator",
        type: "ReactNode",
        description: "Custom indicator; defaults to a chevron.",
      },
      {
        name: "Accordion.Content forceMount",
        type: "boolean",
        default: "false",
        description: "Keep the panel mounted while closed.",
      },
    ],
    notes: [
      "Arrow keys, Home, and End move focus between triggers.",
      "Triggers expose aria-expanded and wire aria-controls to their panel.",
      "Panels unmount when closed unless forceMount is set.",
    ],
  },
  {
    id: "collapsible",
    name: "Collapsible",
    category: "Navigation",
    description: "Single disclosure panel with a trigger that expands one section of content.",
    keywords: ["disclosure", "collapse", "expand", "details", "toggle", "panel"],
    controls: [
      { name: "open", type: "boolean", defaultValue: false, label: "Open" },
      { name: "disabled", type: "boolean", defaultValue: false },
      { name: "unstyled", type: "boolean", defaultValue: false, label: "Unstyled (headless)" },
    ],
    children: "Advanced settings",
    render: (state) => (
      <CollapsibleDemo
        defaultOpen={bool(state, "open")}
        disabled={bool(state, "disabled")}
        unstyled={bool(state, "unstyled")}
      />
    ),
    code: (state) =>
      jsx("Collapsible", {
        props: {
          defaultOpen: bool(state, "open"),
          disabled: bool(state, "disabled"),
          unstyled: bool(state, "unstyled") ? true : undefined,
        },
        children: [
          "  <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>",
          "  <Collapsible.Content>",
          "    Keeps the workspace in sync and enables experimental features.",
          "  </Collapsible.Content>",
        ].join("\n"),
      }),
    props: [
      { name: "open / defaultOpen", type: "boolean", default: "false", description: "Controlled or initial open state." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called whenever the panel opens or closes." },
      { name: "disabled", type: "boolean", default: "false", description: "Blocks interaction with the trigger." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<CollapsibleSlot, string>>", description: "Per-slot class overrides (root, trigger, indicator, content, contentInner)." },
      { name: "Collapsible.Trigger indicator", type: "ReactNode", description: "Custom indicator; defaults to a chevron." },
      { name: "Collapsible.Content forceMount", type: "boolean", default: "false", description: "Keep the panel mounted while closed." },
    ],
    notes: [
      "Trigger exposes aria-expanded and wires aria-controls; the panel is a labelled region.",
      "Controlled and uncontrolled usage behave identically.",
      "Set unstyled to keep only behaviour + aria wiring, or reach for the useCollapsible hook for fully custom markup.",
      "classNames targets individual slots without a new stylesheet.",
    ],
  },
  {
    id: "breadcrumbs",
    name: "Breadcrumbs",
    category: "Navigation",
    description: "Hierarchical page trail that shows the user's location and links back up.",
    keywords: ["trail", "path", "hierarchy", "location"],
    controls: [
      { name: "label", type: "text", label: "Aria label", defaultValue: "Breadcrumb" },
      { name: "maxItems", type: "number", label: "Max items", defaultValue: 0, min: 0, max: 6 },
      { name: "withIcons", type: "boolean", label: "Home icon", defaultValue: false },
    ],
    render: (state) => {
      const max = num(state, "maxItems", 0);
      return (
        <Breadcrumbs
          items={[
            {
              label: "Home",
              href: "/",
              icon: bool(state, "withIcons") ? <Home size={14} /> : undefined,
            },
            { label: "Products", href: "/products" },
            { label: "Category", href: "/products/category" },
            { label: "Current page" },
          ]}
          label={str(state, "label", "Breadcrumb")}
          maxItems={max > 0 ? max : undefined}
        />
      );
    },
    code: (state) => {
      const max = num(state, "maxItems", 0);
      return jsx("Breadcrumbs", {
        props: {
          items:
            '[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: "Current page" }]',
          label: str(state, "label", "Breadcrumb") === "Breadcrumb" ? undefined : str(state, "label", "Breadcrumb"),
          maxItems: max > 0 ? max : undefined,
        },
      });
    },
    props: [
      { name: "items", type: "BreadcrumbItemData[]", required: true, description: "Ordered trail from root to current page." },
      { name: "label", type: "string", default: '"Breadcrumb"', description: "Accessible name for the nav landmark." },
      { name: "maxItems", type: "number", description: "Collapse middle items when the trail exceeds this length." },
      { name: "separator", type: "ReactNode", description: "Custom separator; defaults to a chevron icon." },
      { name: "item.href", type: "string", description: "Renders the item as a link; omit for the current page." },
      { name: "item.icon", type: "ReactNode", description: "Optional icon rendered before the label." },
      { name: "item.onClick", type: "() => void", description: "Click handler for link items." },
    ],
    notes: [
      "Renders a <nav> landmark wrapping an ordered list.",
      "The final item is marked with aria-current=\"page\" and rendered as text.",
      "When maxItems is set, middle items collapse into an aria-hidden ellipsis.",
    ],
  },
  {
    id: "pagination",
    name: "Pagination",
    category: "Navigation",
    description: "Page navigation with sibling windowing, edge controls, and optional jump-to-page.",
    keywords: ["pages", "paging", "next", "previous", "pager"],
    controls: [
      { name: "page", type: "number", defaultValue: 5, min: 1, max: 50 },
      { name: "pageCount", type: "number", label: "Page count", defaultValue: 20, min: 1, max: 100 },
      { name: "siblingCount", type: "number", label: "Siblings", defaultValue: 1, min: 0, max: 3 },
      { name: "showEdges", type: "boolean", label: "First / last", defaultValue: false },
      { name: "showJump", type: "boolean", label: "Jump input", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <PaginationDemo
        key={num(state, "page", 5)}
        initialPage={num(state, "page", 5)}
        pageCount={num(state, "pageCount", 20)}
        siblingCount={num(state, "siblingCount", 1)}
        showEdges={bool(state, "showEdges")}
        showJump={bool(state, "showJump")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("Pagination", {
        props: {
          page: num(state, "page", 5),
          pageCount: num(state, "pageCount", 20),
          siblingCount: num(state, "siblingCount", 1) === 1 ? undefined : num(state, "siblingCount", 1),
          showEdges: bool(state, "showEdges"),
          showJump: bool(state, "showJump"),
          disabled: bool(state, "disabled"),
          onPageChange: "(page) => setPage(page)",
        },
      }),
    props: [
      { name: "page", type: "number", required: true, description: "Current page (one-based)." },
      { name: "pageCount", type: "number", required: true, description: "Total number of pages." },
      { name: "onPageChange", type: "(page: number) => void", description: "Called with the next page when it changes." },
      { name: "siblingCount", type: "number", default: "1", description: "Pages shown around the current page." },
      { name: "showEdges", type: "boolean", default: "false", description: "Show first and last page buttons." },
      { name: "showJump", type: "boolean", default: "false", description: "Show a jump-to-page input." },
      { name: "disabled", type: "boolean", default: "false", description: "Disable every control." },
      { name: "label", type: "string", default: '"Pagination"', description: "Accessible name for the nav landmark." },
    ],
    notes: [
      "The active page is marked with aria-current=\"page\".",
      "getPageTokens windows the range with ellipses on either side.",
      "Edge and jump controls reuse IconButton for consistent sizing.",
    ],
  },
  {
    id: "stepper",
    name: "Stepper",
    category: "Navigation",
    description: "Progress indicator that tracks the active step in a multi-step workflow.",
    keywords: ["wizard", "progress", "steps", "flow", "checkout"],
    controls: [
      { name: "orientation", type: "select", defaultValue: "horizontal", options: [
        { label: "horizontal", value: "horizontal" },
        { label: "vertical", value: "vertical" },
      ] },
      { name: "current", type: "number", label: "Current step", defaultValue: 1, min: 0, max: 3 },
      { name: "clickable", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <StepperDemo
        key={num(state, "current", 1)}
        initialCurrent={num(state, "current", 1)}
        orientation={pick(state, "orientation", "horizontal")}
        clickable={bool(state, "clickable")}
      />
    ),
    code: (state) =>
      jsx("Stepper", {
        props: {
          steps:
            '[{ label: "Cart" }, { label: "Address" }, { label: "Payment" }, { label: "Done" }]',
          current: num(state, "current", 1),
          orientation: pick(state, "orientation", "horizontal") === "horizontal" ? undefined : "vertical",
          clickable: bool(state, "clickable"),
        },
      }),
    props: [
      { name: "steps", type: "StepperStep[]", required: true, description: "Ordered list of steps with label and optional description." },
      { name: "current", type: "number", required: true, description: "Zero-based index of the active step." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Layout direction of the trail." },
      { name: "clickable", type: "boolean", default: "false", description: "Render each step as a button that can be selected." },
      { name: "onStepClick", type: "(index: number) => void", description: "Called with the step index when clickable and pressed." },
      { name: "label", type: "string", default: '"Progress"', description: "Accessible name for the nav landmark." },
    ],
    notes: [
      "Completed steps render a check icon in place of their number.",
      "The active step is marked with aria-current=\"step\".",
      "Set clickable to let users jump between non-disabled steps.",
    ],
  },
  {
    id: "tabs",
    name: "Tabs",
    category: "Navigation",
    description: "Compound tabs with roving tab order, keyboard navigation, and ARIA wiring.",
    keywords: ["tabbed", "panels", "sections", "switch"],
    controls: [
      {
        name: "defaultValue",
        type: "select",
        defaultValue: "overview",
        options: [
          { label: "overview", value: "overview" },
          { label: "activity", value: "activity" },
          { label: "settings", value: "settings" },
        ],
      },
      { name: "orientation", type: "select", defaultValue: "horizontal", options: [
        { label: "horizontal", value: "horizontal" },
        { label: "vertical", value: "vertical" },
      ] },
      {
        name: "activationMode",
        type: "select",
        label: "Activation",
        defaultValue: "automatic",
        options: [
          { label: "automatic", value: "automatic" },
          { label: "manual", value: "manual" },
        ],
      },
    ],
    render: (state) => (
      <TabsDemo
        key={pick(state, "defaultValue", "overview")}
        defaultValue={pick(state, "defaultValue", "overview")}
        orientation={pick(state, "orientation", "horizontal")}
        activationMode={pick(state, "activationMode", "automatic")}
      />
    ),
    code: (state) =>
      jsx("Tabs", {
        props: {
          defaultValue: pick(state, "defaultValue", "overview"),
          orientation: pick(state, "orientation", "horizontal") === "horizontal" ? undefined : "vertical",
          activationMode: pick(state, "activationMode", "automatic") === "automatic" ? undefined : "manual",
        },
        children: [
          "  <Tabs.List>",
          '    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>',
          '    <Tabs.Trigger value="activity">Activity</Tabs.Trigger>',
          '    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>',
          "  </Tabs.List>",
          '  <Tabs.Content value="overview">A high-level summary of the account.</Tabs.Content>',
          '  <Tabs.Content value="activity">Recent events from the last 30 days.</Tabs.Content>',
          '  <Tabs.Content value="settings">Configure preferences and access.</Tabs.Content>',
        ].join("\n"),
      }),
    props: [
      { name: "defaultValue", type: "string", description: "Initially selected tab value when uncontrolled." },
      { name: "value", type: "string", description: "Controlled selected tab value." },
      { name: "onValueChange", type: "(value: string) => void", description: "Called when the selected tab changes." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Arrow-key axis for the tab list." },
      {
        name: "activationMode",
        type: '"automatic" | "manual"',
        default: '"automatic"',
        description: "Whether focusing a tab selects it.",
      },
      { name: "Tabs.Trigger value", type: "string", required: true, description: "Value linking a trigger to its panel." },
      { name: "Tabs.Content value", type: "string", required: true, description: "Value linking a panel to its trigger." },
      { name: "Tabs.Content forceMount", type: "boolean", default: "false", description: "Keep inactive panels mounted." },
    ],
    notes: [
      "Only the active trigger is tabbable (roving tabindex).",
      "Arrow keys, Home, and End move focus; automatic mode selects on focus.",
      "Triggers and panels are wired with aria-controls and aria-labelledby.",
    ],
  },
  {
    id: "tree-view",
    name: "TreeView",
    category: "Navigation",
    description: "Hierarchical tree with expand/collapse, roving focus and cascading multi-select.",
    keywords: ["tree", "hierarchy", "nested", "outline", "file tree", "checkbox tree"],
    controls: [
      {
        name: "selectionMode",
        type: "select",
        defaultValue: "single",
        options: [
          { label: "single", value: "single" },
          { label: "multiple", value: "multiple" },
        ],
      },
      { name: "expandAll", type: "boolean", defaultValue: true, label: "Expand all" },
      { name: "cascade", type: "boolean", defaultValue: true, label: "Cascade checks" },
      { name: "lines", type: "boolean", defaultValue: false, label: "Indent guides" },
      { name: "unstyled", type: "boolean", defaultValue: false, label: "Unstyled (headless)" },
    ],
    render: (state) => (
      <TreeViewDemo
        selectionMode={pick(state, "selectionMode", "single") as "single" | "multiple"}
        expandAll={bool(state, "expandAll", true)}
        cascade={bool(state, "cascade", true)}
        lines={bool(state, "lines")}
        unstyled={bool(state, "unstyled")}
      />
    ),
    code: (state) => {
      const multiple = (pick(state, "selectionMode", "single") as string) === "multiple";
      return [
        `<TreeView`,
        `  items={tree}`,
        `  label="Project files"`,
        multiple ? `  selectionMode="multiple"` : null,
        bool(state, "expandAll", true) ? `  defaultExpandAll` : null,
        multiple && !bool(state, "cascade", true) ? `  cascade={false}` : null,
        bool(state, "lines") ? `  showLines` : null,
        bool(state, "unstyled") ? `  unstyled` : null,
        `  onActivate={(key) => openFile(key)}`,
        `/>`,
      ]
        .filter((line) => line !== null)
        .join("\n");
    },
    props: [
      { name: "items", type: "TreeItem<string>[]", required: true, description: "Nodes with key, label, children, description and disabled." },
      { name: "selectionMode", type: '"single" | "multiple"', default: '"single"', description: "Radio-style selection or cascading checkboxes." },
      { name: "selectedKeys / defaultSelectedKeys", type: "string[]", description: "Controlled or initial selection." },
      { name: "onSelectedKeysChange", type: "(keys: string[]) => void", description: "Fires whenever the selection changes." },
      { name: "expandedKeys / defaultExpandedKeys", type: "string[]", description: "Controlled or initial expansion." },
      { name: "defaultExpandAll", type: "boolean", default: "false", description: "Expand every parent on first render." },
      { name: "cascade", type: "boolean", default: "true", description: "Multiple mode: checking a node drives its leaf descendants." },
      { name: "defaultFocusedKey", type: "string", description: "Row that owns the tree's tab stop." },
      { name: "showLines", type: "boolean", default: "false", description: "Draw indent guides per level." },
      { name: "renderIcon / renderLabel", type: "(row) => ReactNode", description: "Custom leading visual and label per row." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<TreeViewSlot, string>>", description: "Per-slot overrides: root, item, row, toggle, toggleIcon, checkbox, label, description, empty." },
    ],
    notes: [
      "Rows are flat `treeitem`s carrying aria-level, which screen readers handle more predictably than nested lists.",
      "Arrow Up/Down walk the visible rows, Right expands or steps in, Left collapses or steps out, Home/End jump, Enter/Space select.",
      "Multiple mode renders aria-checked with a derived mixed state for partially checked branches.",
      "Everything token-driven: swap --ui-tree-indent, --ui-tree-row-* and --ui-tree-guide-color to reshape it.",
    ],
  },
  {
    id: "navbar",
    name: "Navbar",
    category: "Navigation",
    description: "Responsive top bar that collapses into a toggleable menu on small screens.",
    keywords: ["header", "topbar", "appbar", "menu", "responsive"],
    controls: [
      { name: "sticky", type: "boolean", defaultValue: true },
      { name: "bordered", type: "boolean", defaultValue: true },
    ],
    render: (state) => (
      <NavbarDemo sticky={bool(state, "sticky", true)} bordered={bool(state, "bordered", true)} />
    ),
    code: (state) =>
      jsx("Navbar", {
        props: {
          sticky: bool(state, "sticky", true) ? undefined : false,
          bordered: bool(state, "bordered", true) ? undefined : false,
        },
        children: [
          '  <Navbar.Brand href="/" mark={<Logo />}>Acme</Navbar.Brand>',
          "  <Navbar.Toggle />",
          "  <Navbar.Nav>",
          '    <Navbar.Link href="/" active>Dashboard</Navbar.Link>',
          '    <Navbar.Link href="/projects">Projects</Navbar.Link>',
          "  </Navbar.Nav>",
          "  <Navbar.Actions>",
          "    <Button size=\"sm\">Sign in</Button>",
          "  </Navbar.Actions>",
        ].join("\n"),
      }),
    props: [
      { name: "sticky", type: "boolean", default: "true", description: "Pin the bar to the top of the viewport." },
      { name: "bordered", type: "boolean", default: "true", description: "Show the bottom divider." },
      { name: "open / defaultOpen", type: "boolean", description: "Controlled or uncontrolled mobile menu state." },
      { name: "Navbar.Toggle", type: "button", description: "Hamburger button; wires aria-expanded/aria-controls." },
      { name: "Navbar.Link active", type: "boolean", description: "Marks the current page with aria-current." },
    ],
    notes: [
      "The nav and toggle button are only rendered inline above 48rem; below that the menu collapses.",
      "The toggle automatically swaps between the menu and close icons and manages aria-expanded.",
      "Place actions last so they push to the trailing edge.",
    ],
  },
  {
    id: "sidebar",
    name: "Sidebar",
    category: "Navigation",
    description: "Collapsible navigation rail that becomes an off-canvas drawer on mobile.",
    keywords: ["sidenav", "drawer", "rail", "aside", "menu"],
    controls: [{ name: "collapsed", type: "boolean", defaultValue: false, label: "Start collapsed" }],
    render: (state) => <SidebarDemo key={String(bool(state, "collapsed", false))} collapsed={bool(state, "collapsed", false)} />,
    code: (state) =>
      jsx("Sidebar", {
        props: {
          defaultCollapsed: bool(state, "collapsed", false) ? true : undefined,
        },
        children: [
          "  <Sidebar.Header>",
          "    <strong>Acme</strong>",
          "    <Sidebar.Toggle />",
          "  </Sidebar.Header>",
          "  <Sidebar.Nav>",
          '    <Sidebar.Section label="Workspace">',
          '      <Sidebar.Link href="/" icon={<Home />} active>Dashboard</Sidebar.Link>',
          '      <Sidebar.Link href="/projects" icon={<Folder />}>Projects</Sidebar.Link>',
          "    </Sidebar.Section>",
          "  </Sidebar.Nav>",
        ].join("\n"),
      }),
    props: [
      { name: "collapsed / defaultCollapsed", type: "boolean", description: "Desktop icon-rail state." },
      { name: "open / defaultOpen", type: "boolean", description: "Mobile drawer state." },
      { name: "side", type: '"start" | "end"', default: '"start"', description: "Which edge the rail sticks to." },
      { name: "Sidebar.Link icon", type: "ReactNode", description: "Leading icon, shown alone when collapsed." },
      { name: "Sidebar.Section label", type: "ReactNode", description: "Uppercase group heading." },
    ],
    notes: [
      "Above 48rem the sidebar is a persistent rail; below it slides in as a drawer with a backdrop.",
      "Clicking the backdrop or Sidebar.Close dismisses the mobile drawer.",
      "The toggle rotates and its pressed state reflects the collapsed flag.",
    ],
  },
  {
    id: "anchor",
    name: "Anchor",
    category: "Navigation",
    description: "A table-of-contents anchor that scroll-spies sections and scrolls smoothly to them.",
    keywords: ["anchor", "toc", "table of contents", "scroll spy", "sticky"],
    render: () => <AnchorDemo />,
    props: [
      { name: "items", type: "AnchorItem[]", required: true, description: "Sections with id, title, href, and optional children." },
      { name: "activeId / defaultActiveId", type: "string", description: "Controlled or initial active section." },
      { name: "onActiveChange", type: "(id: string) => void", description: "Fires when the observed section changes." },
      { name: "offsetTop", type: "number", default: "96", description: "Sticky and scroll-landing offset." },
      { name: "sticky", type: "boolean", default: "true", description: "Pin the nav while the page scrolls." },
      { name: "label", type: "string", default: '"On this page"', description: "Accessible name for the nav landmark." },
    ],
    notes: [
      "The active section is tracked with an IntersectionObserver; the active link gets aria-current=location.",
      "Clicking a link scrolls with the configured offset and updates the URL hash.",
      "Nested items render as a nested list for sub-sections.",
    ],
  },
];
