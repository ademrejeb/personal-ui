import { Download, Filter, GitCommit, MessageSquare, Plus, Rocket, UserPlus } from "lucide-react";
import {
  ActivityFeed,
  Button,
  IconButton,
  PageHeader,
  PageShell,
  SettingsRow,
  SettingsSection,
  ThemeToggle,
  Toolbar,
  UserMenu,
  VersionBadge,
} from "@adem.rejeb/ui";
import type { ComponentEntry } from "./types";
import { bool, num, pick, str } from "./demo";
import { jsx } from "../lib/jsx";

const MAX_WIDTH_OPTIONS = (["sm", "md", "lg", "xl", "full"] as const).map((value) => ({
  label: value,
  value,
}));

const TONE_OPTIONS = (["neutral", "info", "warning", "danger"] as const).map((value) => ({
  label: value,
  value,
}));

const ORIENTATION_OPTIONS = [
  { label: "Horizontal", value: "horizontal" },
  { label: "Vertical", value: "vertical" },
];

const ACTIVITY_ITEMS = [
  {
    id: "commit",
    actor: "Ada Lovelace",
    action: "merged pull request",
    target: "#482",
    timestamp: "2 minutes ago",
    icon: <GitCommit size={16} />,
  },
  {
    id: "comment",
    actor: "Grace Hopper",
    action: "commented on",
    target: "Issue #129",
    timestamp: "1 hour ago",
    icon: <MessageSquare size={16} />,
  },
  {
    id: "member",
    actor: "Margaret Hamilton",
    action: "added",
    target: "Katherine to the team",
    timestamp: "Yesterday",
    icon: <UserPlus size={16} />,
  },
];

function UserMenuDemo() {
  return (
    <UserMenu
      name="Ada Lovelace"
      email="ada@example.com"
      showName
      items={[
        { id: "profile", label: "Profile" },
        { id: "billing", label: "Billing", separatorBefore: true },
        { id: "signout", label: "Sign out", danger: true, separatorBefore: true },
      ]}
    />
  );
}

export const applicationEntries: ComponentEntry[] = [
  {
    id: "activity-feed",
    name: "ActivityFeed",
    category: "Application",
    description: "Timestamped list of activity records with optional avatars, icons, and targets.",
    keywords: ["activity", "feed", "timeline", "audit", "history"],
    controls: [
      { name: "count", type: "number", defaultValue: 3, min: 1, max: 3, step: 1 },
      { name: "showIcons", type: "boolean", label: "Show icons", defaultValue: true },
    ],
    render: (state) => {
      const showIcons = bool(state, "showIcons");
      const count = num(state, "count", 3);
      const items = ACTIVITY_ITEMS.slice(0, count).map((item) => ({
        ...item,
        icon: showIcons ? item.icon : undefined,
      }));
      return <ActivityFeed items={items} />;
    },
    code: (state) => {
      const count = num(state, "count", 3);
      const rows = ACTIVITY_ITEMS.slice(0, count).map(
        (item) =>
          `    { actor: ${JSON.stringify(item.actor)}, action: ${JSON.stringify(
            item.action,
          )}, target: ${JSON.stringify(item.target)}, timestamp: ${JSON.stringify(item.timestamp)} },`,
      );
      return ["<ActivityFeed", "  items={[", ...rows, "  ]}", "/>"].join("\n");
    },
    props: [
      {
        name: "items",
        type: "ActivityFeedItem[]",
        required: true,
        description: "Records to render; each has action and timestamp plus optional actor/target/icon/avatar.",
      },
      {
        name: "...rest",
        type: "HTMLAttributes<HTMLUListElement>",
        description: "Native list props; the root is a <ul>.",
      },
    ],
    notes: [
      "Each item is a list row; item.avatar takes precedence over item.icon.",
      "Provide a stable item.id when the list reorders so React reuses rows.",
    ],
  },
  {
    id: "page-header",
    name: "PageHeader",
    category: "Application",
    description: "Page title, description, contextual breadcrumbs, and primary actions.",
    keywords: ["page", "header", "title", "breadcrumbs", "actions"],
    controls: [
      { name: "title", type: "text", defaultValue: "Projects" },
      {
        name: "description",
        type: "text",
        defaultValue: "Manage your team's projects and deployments.",
      },
      { name: "showBreadcrumbs", type: "boolean", label: "Breadcrumbs", defaultValue: true },
      { name: "showActions", type: "boolean", label: "Actions", defaultValue: true },
      { name: "showBadge", type: "boolean", label: "Badge", defaultValue: false },
      { name: "sticky", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <PageHeader
        title={str(state, "title", "Projects")}
        description={str(state, "description", "Manage your team's projects and deployments.")}
        breadcrumbs={bool(state, "showBreadcrumbs") ? "Workspace / Projects" : undefined}
        icon={<Rocket size={20} />}
        badge={bool(state, "showBadge") ? <VersionBadge version="v2.4.0" /> : undefined}
        actions={bool(state, "showActions") ? <Button size="sm">New project</Button> : undefined}
        sticky={bool(state, "sticky")}
      />
    ),
    code: (state) =>
      jsx("PageHeader", {
        props: {
          title: str(state, "title", "Projects"),
          description: str(state, "description", "Manage your team's projects and deployments."),
          breadcrumbs: bool(state, "showBreadcrumbs") ? "Workspace / Projects" : false,
          icon: "<Rocket size={20} />",
          badge: bool(state, "showBadge") ? '<VersionBadge version="v2.4.0" />' : false,
          actions: bool(state, "showActions") ? '<Button size="sm">New project</Button>' : false,
          sticky: bool(state, "sticky"),
        },
      }),
    props: [
      { name: "title", type: "ReactNode", required: true, description: "Primary heading (rendered as <h1>)." },
      { name: "description", type: "ReactNode", description: "Supporting copy beneath the title." },
      { name: "breadcrumbs", type: "ReactNode", description: "Contextual navigation such as a breadcrumb trail." },
      { name: "actions", type: "ReactNode", description: "Primary page actions, aligned to the end." },
      { name: "icon", type: "ReactNode", description: "Leading symbol; decorative (aria-hidden)." },
      { name: "badge", type: "ReactNode", description: "Trailing element beside the title." },
      { name: "sticky", type: "boolean", default: "false", description: "Pin the header while scrolling." },
    ],
    notes: ["Renders a semantic <header>; the title is an <h1> and should be unique per page."],
  },
  {
    id: "page-shell",
    name: "PageShell",
    category: "Application",
    description: "Consistent page structure with optional sidebar, header, toolbar, and footer.",
    keywords: ["layout", "page", "shell", "sidebar", "scaffold"],
    controls: [
      { name: "maxWidth", type: "select", defaultValue: "lg", options: MAX_WIDTH_OPTIONS },
      { name: "padded", type: "boolean", defaultValue: true },
      { name: "sidebar", type: "boolean", label: "Sidebar", defaultValue: false },
      { name: "header", type: "boolean", defaultValue: true },
      { name: "toolbar", type: "boolean", defaultValue: false },
      { name: "footer", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <PageShell
        maxWidth={pick(state, "maxWidth", "lg")}
        padded={bool(state, "padded")}
        sidebar={bool(state, "sidebar") ? <p>Sidebar</p> : undefined}
        header={bool(state, "header") ? <strong>Header</strong> : undefined}
        toolbar={
          bool(state, "toolbar") ? <Toolbar end={<Button size="sm">Save</Button>} /> : undefined
        }
        footer={bool(state, "footer") ? "© 2026 Personal UI" : undefined}
      >
        <p>Main content area.</p>
      </PageShell>
    ),
    code: (state) =>
      jsx("PageShell", {
        props: {
          maxWidth:
            pick(state, "maxWidth", "lg") === "lg" ? undefined : pick(state, "maxWidth", "lg"),
          padded: bool(state, "padded") ? true : undefined,
          sidebar: bool(state, "sidebar") ? "<p>Sidebar</p>" : false,
          header: bool(state, "header") ? "<strong>Header</strong>" : false,
          toolbar: bool(state, "toolbar")
            ? '<Toolbar end={<Button size="sm">Save</Button>} />'
            : false,
          footer: bool(state, "footer") ? "© 2026 Personal UI" : false,
        },
        children: "<p>Main content area.</p>",
      }),
    props: [
      { name: "sidebar", type: "ReactNode", description: "Persistent sidebar region beside the content." },
      { name: "header", type: "ReactNode", description: "Sticky top region, typically a Navbar or PageHeader." },
      { name: "toolbar", type: "ReactNode", description: "Sub-header toolbar region beneath the header." },
      { name: "footer", type: "ReactNode", description: "Region rendered below the main body." },
      {
        name: "maxWidth",
        type: 'ContainerSize | null ("sm" | "md" | "lg" | "xl" | "full" | null)',
        default: '"lg"',
        description: "Max content width; null fills the container.",
      },
      { name: "padded", type: "boolean", default: "true", description: "Apply content padding." },
    ],
    notes: [
      "Provide either a sidebar or full-width content; the sidebar toggles the data-has-sidebar layout.",
      "Regions are omitted entirely when their prop is null or undefined.",
    ],
  },
  {
    id: "settings-section",
    name: "SettingsSection",
    category: "Application",
    description: "Grouped block of settings rows with a title, description, and optional actions.",
    keywords: ["settings", "preferences", "section", "row", "config"],
    controls: [
      { name: "title", type: "text", defaultValue: "Notifications" },
      {
        name: "description",
        type: "text",
        defaultValue: "Choose how you want to be notified.",
      },
      { name: "showActions", type: "boolean", label: "Actions", defaultValue: false },
      { name: "orientation", type: "select", defaultValue: "horizontal", options: ORIENTATION_OPTIONS },
    ],
    render: (state) => (
      <SettingsSection
        title={str(state, "title", "Notifications")}
        description={str(state, "description", "Choose how you want to be notified.")}
        actions={
          bool(state, "showActions") ? (
            <Button size="sm" variant="outline">
              Reset
            </Button>
          ) : undefined
        }
      >
        <SettingsRow
          label="Email digest"
          description="A daily summary of activity."
          orientation={pick(state, "orientation", "horizontal")}
        >
          <Button size="sm" variant="ghost">
            Configure
          </Button>
        </SettingsRow>
        <SettingsRow
          label="Push notifications"
          control={<VersionBadge version="On" tone="info" />}
        />
      </SettingsSection>
    ),
    code: (state) => {
      const rowOrientation =
        (pick(state, "orientation", "horizontal") as string) === "vertical"
          ? ' orientation="vertical"'
          : "";
      return jsx("SettingsSection", {
        props: {
          title: str(state, "title", "Notifications"),
          description: str(state, "description", "Choose how you want to be notified."),
          actions: bool(state, "showActions")
            ? '<Button size="sm" variant="outline">Reset</Button>'
            : false,
        },
        children: [
          `  <SettingsRow label="Email digest" description="A daily summary of activity."${rowOrientation}>`,
          '    <Button size="sm" variant="ghost">Configure</Button>',
          "  </SettingsRow>",
          '  <SettingsRow label="Push notifications" control={<VersionBadge version="On" tone="info" />} />',
        ].join("\n"),
      });
    },
    props: [
      { name: "title", type: "ReactNode", required: true, description: "Section heading (rendered as <h2>)." },
      { name: "description", type: "ReactNode", description: "Supporting copy beneath the title." },
      { name: "actions", type: "ReactNode", description: "Controls aligned to the end of the header." },
    ],
    notes: [
      "Companion SettingsRow renders a label/description with a trailing control.",
      "SettingsRow.props: label (required), description, control, htmlFor, orientation (\"horizontal\" | \"vertical\").",
      "Pass htmlFor to associate the row label with a form control id.",
    ],
  },
  {
    id: "theme-toggle",
    name: "ThemeToggle",
    category: "Application",
    description: "Cycles or selects the active theme through the ambient ThemeProvider.",
    keywords: ["theme", "dark", "light", "mode", "system", "preferences"],
    controls: [
      {
        name: "variant",
        type: "select",
        defaultValue: "icon",
        options: [
          { label: "icon", value: "icon" },
          { label: "segmented", value: "segmented" },
        ],
      },
      { name: "showLabel", type: "boolean", label: "Show label", defaultValue: false },
    ],
    render: (state) => (
      <ThemeToggle
        variant={pick(state, "variant", "icon")}
        showLabel={bool(state, "showLabel")}
      />
    ),
    code: (state) =>
      jsx("ThemeToggle", {
        props: {
          variant: pick(state, "variant", "icon") === "icon" ? undefined : pick(state, "variant", "icon"),
          showLabel: bool(state, "showLabel"),
        },
      }),
    props: [
      {
        name: "variant",
        type: '"icon" | "segmented"',
        default: '"icon"',
        description: "Icon cycles light/dark; segmented adds a system option.",
      },
      { name: "showLabel", type: "boolean", default: "false", description: "Show the current theme name next to the icon." },
      {
        name: "...rest",
        type: "ButtonHTMLAttributes<HTMLButtonElement>",
        description: "Native button props for the icon variant.",
      },
    ],
    notes: [
      "Must be rendered within a ThemeProvider; it reads and writes through useTheme.",
      "The icon variant announces the current and next theme via aria-label.",
    ],
  },
  {
    id: "toolbar",
    name: "Toolbar",
    category: "Application",
    description: "Groups actions and controls into consistent start, center, and end regions.",
    keywords: ["toolbar", "actions", "controls", "bar"],
    controls: [
      { name: "orientation", type: "select", defaultValue: "horizontal", options: ORIENTATION_OPTIONS },
      { name: "plain", type: "boolean", defaultValue: false },
      { name: "start", type: "boolean", defaultValue: true },
      { name: "center", type: "boolean", defaultValue: true },
      { name: "end", type: "boolean", defaultValue: true },
    ],
    render: (state) => (
      <Toolbar
        orientation={pick(state, "orientation", "horizontal")}
        plain={bool(state, "plain")}
        start={
          bool(state, "start") ? (
            <>
              <Button variant="outline" startIcon={<Filter size={16} />}>
                Filter
              </Button>
              <Button variant="outline">Sort</Button>
            </>
          ) : undefined
        }
        center={bool(state, "center") ? <span>3 selected</span> : undefined}
        end={
          bool(state, "end") ? (
            <>
              <IconButton aria-label="Download" icon={<Download size={16} />} />
              <IconButton aria-label="Create" icon={<Plus size={16} />} />
            </>
          ) : undefined
        }
      />
    ),
    code: (state) =>
      jsx("Toolbar", {
        props: {
          orientation:
            pick(state, "orientation", "horizontal") === "horizontal"
              ? undefined
              : pick(state, "orientation", "horizontal"),
          plain: bool(state, "plain") ? true : undefined,
          start: bool(state, "start")
            ? '<><Button variant="outline" startIcon={<Filter size={16} />}>Filter</Button><Button variant="outline">Sort</Button></>'
            : false,
          center: bool(state, "center") ? "<span>3 selected</span>" : false,
          end: bool(state, "end")
            ? '<><IconButton aria-label="Download" icon={<Download size={16} />} /><IconButton aria-label="Create" icon={<Plus size={16} />} /></>'
            : false,
        },
      }),
    props: [
      { name: "start", type: "ReactNode", description: "Leading region." },
      { name: "center", type: "ReactNode", description: "Centered region." },
      { name: "end", type: "ReactNode", description: "Trailing region." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Layout axis." },
      { name: "plain", type: "boolean", default: "false", description: "Remove the container chrome." },
      {
        name: "...rest",
        type: "HTMLAttributes<HTMLDivElement>",
        description: "Native div props; the root has role=\"toolbar\".",
      },
    ],
    notes: ["Sets role and aria-orientation so assistive tech announces it as a toolbar."],
  },
  {
    id: "version-badge",
    name: "VersionBadge",
    category: "Application",
    description: "Package/environment indicator such as v1.4.2 · staging.",
    keywords: ["version", "badge", "environment", "build", "release"],
    controls: [
      { name: "version", type: "text", defaultValue: "v2.4.0" },
      { name: "environment", type: "text", defaultValue: "staging" },
      { name: "tone", type: "select", defaultValue: "neutral", options: TONE_OPTIONS },
    ],
    render: (state) => (
      <VersionBadge
        version={str(state, "version", "v2.4.0")}
        environment={str(state, "environment", "staging") || undefined}
        tone={pick(state, "tone", "neutral")}
      />
    ),
    code: (state) =>
      jsx("VersionBadge", {
        props: {
          version: str(state, "version", "v2.4.0"),
          environment: str(state, "environment", "staging") || false,
          tone: pick(state, "tone", "neutral") === "neutral" ? undefined : pick(state, "tone", "neutral"),
        },
      }),
    props: [
      { name: "version", type: "string", required: true, description: "Version string, e.g. \"v2.4.0\"." },
      { name: "environment", type: "string", description: "Environment label, e.g. \"staging\"." },
      {
        name: "tone",
        type: '"neutral" | "info" | "warning" | "danger"',
        default: '"neutral"',
        description: "Semantic color treatment.",
      },
    ],
    notes: ["The environment segment is omitted when the prop is empty."],
  },
  {
    id: "user-menu",
    name: "UserMenu",
    category: "Application",
    description: "Account menu with an avatar trigger, identity header, and action list.",
    keywords: ["user", "account", "avatar", "profile", "menu"],
    controls: [],
    render: () => <UserMenuDemo />,
    code: () =>
      jsx("UserMenu", {
        props: {
          name: "\"Ada Lovelace\"",
          email: "\"ada@example.com\"",
          showName: true,
        },
        children: [
          "  items={[",
          '    { id: "profile", label: "Profile" },',
          '    { id: "billing", label: "Billing", separatorBefore: true },',
          '    { id: "signout", label: "Sign out", danger: true, separatorBefore: true },',
          "  ]}",
        ].join("\n"),
      }),
    props: [
      { name: "name", type: "string", required: true, description: "Display name (also the avatar fallback)." },
      { name: "email", type: "string", description: "Secondary line in the header." },
      { name: "src", type: "string", description: "Avatar image URL." },
      { name: "items", type: "UserMenuItem[]", required: true, description: "Actions; each may be a link, danger, or have a divider." },
      { name: "footer", type: "ReactNode", description: "Extra content pinned below the actions." },
    ],
    notes: [
      "Built on DropdownMenu, so placement and dismissal match the rest of the system.",
      "Items with `href` render as anchors; others render as menu items with onSelect.",
    ],
  },
];
