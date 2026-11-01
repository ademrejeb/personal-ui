import { useState } from "react";
import { AlertTriangle, ChevronDown, Copy, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  Avatar,
  Button,
  CommandPalette,
  ContextMenu,
  DropdownMenu,
  HoverCard,
  MenuBar,
  Modal,
  NavigationMenu,
  Popconfirm,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  Tooltip,
  Tour,
  type CommandPaletteItem,
} from "@adem.rejeb/ui";
import type { ModalSize, Placement, SheetSide } from "@adem.rejeb/ui";
import type { ComponentEntry } from "./types";
import { bool, num, pick, str } from "./demo";

function TourDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "var(--ui-p-space-4)",
      }}
    >
      <Button onClick={() => setOpen(true)}>Start tour</Button>
      <div style={{ display: "flex", gap: "var(--ui-p-space-3)" }}>
        {["Workspace", "Activity"].map((label, index) => (
          <div
            key={label}
            id={`tour-step-${index + 1}`}
            style={{
              padding: "var(--ui-p-space-4)",
              border: "1px solid var(--ui-border)",
              borderRadius: "var(--ui-p-radius-lg)",
              background: "var(--ui-surface)",
              minWidth: "8rem",
              textAlign: "center",
              fontSize: "var(--ui-p-text-sm)",
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <Tour
        open={open}
        onOpenChange={setOpen}
        onFinish={() => setOpen(false)}
        steps={[
          {
            target: "#tour-step-1",
            title: "Your workspace",
            description: "Projects, files, and settings live here.",
            placement: "bottom",
          },
          {
            target: "#tour-step-2",
            title: "Activity feed",
            description: "See what changed while you were away.",
            placement: "bottom",
          },
        ]}
      />
    </div>
  );
}

const MODAL_SIZES: ModalSize[] = ["sm", "md", "lg", "xl", "full"];
const modalSizeOptions = MODAL_SIZES.map((value) => ({ label: value, value }));

const PLACEMENTS: Placement[] = [
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
  "right",
  "right-start",
  "right-end",
];
const placementOptions = PLACEMENTS.map((value) => ({ label: value, value }));

const SHEET_SIDES: SheetSide[] = ["top", "right", "bottom", "left"];
const sheetSideOptions = SHEET_SIDES.map((value) => ({ label: value, value }));

const SHEET_SIZES: Array<"sm" | "md" | "lg" | "full"> = ["sm", "md", "lg", "full"];
const sheetSizeOptions = SHEET_SIZES.map((value) => ({ label: value, value }));

function AlertDialogDemo({ size, showIcon }: { size: ModalSize; showIcon: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        size={size}
        icon={showIcon ? <AlertTriangle size={20} /> : undefined}
        title="Delete project?"
        description="This permanently removes the project and all of its data."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </>
        }
      />
    </>
  );
}

function DropdownMenuDemo({
  placement,
  matchTriggerWidth,
}: {
  placement: Placement;
  matchTriggerWidth: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger>
        <Button variant="outline" endIcon={<ChevronDown size={16} />}>
          Options
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content placement={placement} matchTriggerWidth={matchTriggerWidth}>
        <DropdownMenu.Label>File</DropdownMenu.Label>
        <DropdownMenu.Item icon={<Pencil size={16} />} shortcut="⌘E">
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Copy size={16} />} shortcut="⌘C">
          Duplicate
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item danger icon={<Trash2 size={16} />}>
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

function ModalDemo({
  size,
  title,
  showClose,
  closeOnOverlayClick,
}: {
  size: ModalSize;
  title: string;
  showClose: boolean;
  closeOnOverlayClick: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onOpenChange={setOpen}>
        <Modal.Content size={size} showClose={showClose} closeOnOverlayClick={closeOnOverlayClick}>
          <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
            <Modal.Description>Invite teammates to collaborate on this project.</Modal.Description>
          </Modal.Header>
          <Modal.Body>Share the link below to grant access.</Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Send invite</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
}

function PopoverDemo({
  placement,
  offset,
  autoFocus,
}: {
  placement: Placement;
  offset: number;
  autoFocus: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent placement={placement} offset={offset} autoFocus={autoFocus}>
        <strong>Dimensions</strong>
        <p>Set the width and height of the layer.</p>
      </PopoverContent>
    </Popover>
  );
}

function SheetDemo({
  side,
  size,
  showClose,
}: {
  side: SheetSide;
  size: "sm" | "md" | "lg" | "full";
  showClose: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger>
        <Button variant="outline">Open sheet</Button>
      </Sheet.Trigger>
      <Sheet.Content side={side} size={size} showClose={showClose}>
        <Sheet.Header>
          <Sheet.Title>Filters</Sheet.Title>
          <Sheet.Description>Refine the results list.</Sheet.Description>
        </Sheet.Header>
        <Sheet.Body>Choose the fields you want to narrow down by.</Sheet.Body>
        <Sheet.Footer>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Reset
          </Button>
          <Button onClick={() => setOpen(false)}>Apply</Button>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  );
}

function TooltipDemo({
  content,
  placement,
  delay,
  disabled,
}: {
  content: string;
  placement: Placement;
  delay: number;
  disabled: boolean;
}) {
  return (
    <Tooltip content={content} placement={placement} delay={delay} disabled={disabled}>
      <Button variant="outline">Hover me</Button>
    </Tooltip>
  );
}

function HoverCardDemo({
  placement,
  openDelay,
  arrow,
  unstyled,
}: {
  placement: Placement;
  openDelay: number;
  arrow: boolean;
  unstyled: boolean;
}) {
  return (
    <HoverCard openDelay={openDelay} unstyled={unstyled}>
      <HoverCard.Trigger>
        <a href="#/components/hover-card" style={{ display: "inline-flex", alignItems: "center", gap: "var(--ui-p-space-2)" }}>
          <Avatar name="Ada Lovelace" size="sm" />
          <span>Ada Lovelace</span>
        </a>
      </HoverCard.Trigger>
      <HoverCard.Content placement={placement} arrow={arrow}>
        <div style={{ display: "flex", gap: "var(--ui-p-space-3)" }}>
          <Avatar name="Ada Lovelace" />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ui-p-space-1)" }}>
            <strong>Ada Lovelace</strong>
            <span style={{ color: "var(--ui-muted)" }}>@ada · Mathematician</span>
            <span>Wrote the first algorithm intended for a machine.</span>
          </div>
        </div>
      </HoverCard.Content>
    </HoverCard>
  );
}

function NavigationMenuDemo() {
  const groups = [
    { title: "Getting started", links: ["Introduction", "Installation", "Quick start"] },
    { title: "Components", links: ["Buttons", "Forms", "Data display"] },
  ];
  return (
    <NavigationMenu>
      <NavigationMenu.List>
        {["Docs", "Components", "Changelog"].map((label, index) => (
          <NavigationMenu.Item key={label} value={label}>
            <NavigationMenu.Trigger value={label}>{label}</NavigationMenu.Trigger>
            <NavigationMenu.Content value={label}>
              <NavigationMenu.Link href="#intro">{groups[index % groups.length].title}</NavigationMenu.Link>
              {groups[index % groups.length].links.map((link) => (
                <NavigationMenu.Link key={link} href={`#${link.toLowerCase()}`}>
                  {link}
                </NavigationMenu.Link>
              ))}
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
    </NavigationMenu>
  );
}

function MenuBarDemo() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <div>
      <MenuBar>
        <MenuBar.Menu value="file" label="File">
          <MenuBar.Item icon={<Copy size={14} />} onSelect={() => setLast("New")}>
            New
          </MenuBar.Item>
          <MenuBar.Item onSelect={() => setLast("Open")}>Open…</MenuBar.Item>
          <MenuBar.Separator />
          <MenuBar.Item danger onSelect={() => setLast("Delete")}>
            Delete
          </MenuBar.Item>
        </MenuBar.Menu>
        <MenuBar.Menu value="edit" label="Edit">
          <MenuBar.Item onSelect={() => setLast("Undo")}>Undo</MenuBar.Item>
          <MenuBar.Item onSelect={() => setLast("Redo")}>Redo</MenuBar.Item>
        </MenuBar.Menu>
        <MenuBar.Menu value="view" label="View">
          <MenuBar.Item checked onSelect={() => setLast("Sidebar")}>
            Show sidebar
          </MenuBar.Item>
        </MenuBar.Menu>
      </MenuBar>
      <p style={{ marginTop: "0.75rem" }}>Last action: {last ?? "—"}</p>
    </div>
  );
}

function ContextMenuDemo() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <div>
      <ContextMenu>
        <ContextMenu.Trigger>
          <button type="button" className="lab-context-target">
            Right-click this area
          </button>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item icon={<Pencil size={14} />} onSelect={() => setLast("Edit")}>
            Edit
          </ContextMenu.Item>
          <ContextMenu.Item icon={<Copy size={14} />} onSelect={() => setLast("Duplicate")}>
            Duplicate
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item danger icon={<Trash2 size={14} />} onSelect={() => setLast("Delete")}>
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
      <p style={{ marginTop: "0.75rem" }}>Last action: {last ?? "—"}</p>
    </div>
  );
}

const COMMANDS: CommandPaletteItem[] = [
  { id: "new-file", label: "New file", group: "File", keywords: ["create"] },
  { id: "open-file", label: "Open file", group: "File" },
  { id: "toggle-theme", label: "Toggle theme", group: "View", keywords: ["dark", "light"] },
  { id: "settings", label: "Open settings", group: "View" },
];

function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open palette</Button>
      <p style={{ marginTop: "0.75rem" }}>Last command: {picked ?? "—"}</p>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        onSelect={(item) => setPicked(item.label)}
        items={COMMANDS}
        footer="↑↓ to navigate · ↵ to run · esc to close"
      />
    </div>
  );
}

export const overlaysEntries: ComponentEntry[] = [
  {
    id: "alert-dialog",
    name: "AlertDialog",
    category: "Overlays",
    description: "A modal confirmation for destructive or irreversible actions.",
    keywords: ["confirm", "danger", "alert", "dialog", "delete"],
    controls: [
      { name: "size", type: "select", defaultValue: "sm", options: modalSizeOptions },
      { name: "showIcon", type: "boolean", label: "Icon", defaultValue: true },
    ],
    render: (state) => (
      <AlertDialogDemo
        size={pick(state, "size", "sm")}
        showIcon={bool(state, "showIcon", true)}
      />
    ),
    code: (state) => {
      const size = pick(state, "size", "sm");
      return [
        `<AlertDialog`,
        `  open={open}`,
        `  onOpenChange={setOpen}`,
        size === "sm" ? null : `  size="${size}"`,
        `  title="Delete project?"`,
        `  description="This permanently removes the project and all of its data."`,
        bool(state, "showIcon", true) ? `  icon={<AlertTriangle size={20} />}` : null,
        `  footer={`,
        `    <>`,
        `      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>`,
        `      <Button variant="danger" onClick={() => setOpen(false)}>Delete</Button>`,
        `    </>`,
        `  }`,
        `/>`,
      ]
        .filter((line) => line !== null)
        .join("\n");
    },
    props: [
      { name: "open", type: "boolean", description: "Controlled visibility." },
      { name: "defaultOpen", type: "boolean", default: "false", description: "Initial uncontrolled visibility." },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Called whenever the visibility changes.",
      },
      { name: "title", type: "ReactNode", required: true, description: "Dialog heading." },
      { name: "description", type: "ReactNode", description: "Supporting text under the title." },
      { name: "icon", type: "ReactNode", description: "Optional icon shown above the title." },
      { name: "size", type: '"sm" | "md" | "lg" | "xl" | "full"', default: '"sm"', description: "Panel width." },
      { name: "footer", type: "ReactNode", description: "Action row, typically the cancel/confirm buttons." },
    ],
    notes: [
      "Uses role=\"alertdialog\" and disables backdrop dismissal, so a response is required.",
      "No corner close button is rendered; provide explicit actions in the footer.",
    ],
  },
  {
    id: "dropdown-menu",
    name: "DropdownMenu",
    category: "Overlays",
    description: "A compound contextual menu anchored to a trigger element.",
    keywords: ["menu", "context", "actions", "commands"],
    controls: [
      { name: "placement", type: "select", defaultValue: "bottom-start", options: placementOptions },
      { name: "matchTriggerWidth", type: "boolean", label: "Match trigger width", defaultValue: false },
    ],
    render: (state) => (
      <DropdownMenuDemo
        placement={pick(state, "placement", "bottom-start")}
        matchTriggerWidth={bool(state, "matchTriggerWidth")}
      />
    ),
    code: (state) => {
      const placement = pick(state, "placement", "bottom-start");
      return [
        `<DropdownMenu open={open} onOpenChange={setOpen}>`,
        `  <DropdownMenu.Trigger>`,
        `    <Button variant="outline" endIcon={<ChevronDown size={16} />}>Options</Button>`,
        `  </DropdownMenu.Trigger>`,
        `  <DropdownMenu.Content`,
        placement === "bottom-start" ? null : `    placement="${placement}"`,
        bool(state, "matchTriggerWidth") ? `    matchTriggerWidth` : null,
        `  >`,
        `    <DropdownMenu.Label>File</DropdownMenu.Label>`,
        `    <DropdownMenu.Item icon={<Pencil size={16} />} shortcut="⌘E">Edit</DropdownMenu.Item>`,
        `    <DropdownMenu.Item icon={<Copy size={16} />} shortcut="⌘C">Duplicate</DropdownMenu.Item>`,
        `    <DropdownMenu.Separator />`,
        `    <DropdownMenu.Item danger icon={<Trash2 size={16} />}>Delete</DropdownMenu.Item>`,
        `  </DropdownMenu.Content>`,
        `</DropdownMenu>`,
      ]
        .filter((line) => line !== null)
        .join("\n");
    },
    props: [
      { name: "open", type: "boolean", description: "Controlled open state on the root." },
      { name: "defaultOpen", type: "boolean", default: "false", description: "Initial uncontrolled open state." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Open-state change callback." },
      {
        name: "placement",
        type: "Placement",
        default: '"bottom-start"',
        description: "Floating placement on DropdownMenu.Content.",
      },
      { name: "offset", type: "number", default: "4", description: "Gap between trigger and content." },
      { name: "matchTriggerWidth", type: "boolean", default: "false", description: "Align content width to the trigger." },
      { name: "DropdownMenu.Item onSelect", type: "(event: Event) => void", description: "Called when an item is chosen." },
    ],
    notes: [
      "DropdownMenu.Content is portalled and closes on Escape or outside interaction.",
      "Trigger, Content, Item, Separator, and Label compose as dropdownMenu.* compound parts.",
    ],
  },
  {
    id: "modal",
    name: "Modal",
    category: "Overlays",
    description: "A dialog rendered with the native <dialog> element, in five sizes.",
    keywords: ["dialog", "popup", "overlay", "lightbox"],
    controls: [
      { name: "size", type: "select", defaultValue: "md", options: modalSizeOptions },
      { name: "title", type: "text", label: "Title", defaultValue: "Invite teammates" },
      { name: "showClose", type: "boolean", label: "Show close button", defaultValue: true },
      { name: "closeOnOverlayClick", type: "boolean", label: "Close on overlay click", defaultValue: true },
    ],
    render: (state) => (
      <ModalDemo
        size={pick(state, "size", "md")}
        title={str(state, "title", "Invite teammates")}
        showClose={bool(state, "showClose", true)}
        closeOnOverlayClick={bool(state, "closeOnOverlayClick", true)}
      />
    ),
    code: (state) => {
      const size = pick(state, "size", "md");
      return [
        `<Modal open={open} onOpenChange={setOpen}>`,
        `  <Modal.Content`,
        size === "md" ? null : `    size="${size}"`,
        bool(state, "showClose", true) ? null : `    showClose={false}`,
        bool(state, "closeOnOverlayClick", true) ? null : `    closeOnOverlayClick={false}`,
        `  >`,
        `    <Modal.Header>`,
        `      <Modal.Title>${str(state, "title", "Invite teammates")}</Modal.Title>`,
        `      <Modal.Description>Invite teammates to collaborate on this project.</Modal.Description>`,
        `    </Modal.Header>`,
        `    <Modal.Body>Share the link below to grant access.</Modal.Body>`,
        `    <Modal.Footer>`,
        `      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>`,
        `      <Button onClick={() => setOpen(false)}>Send invite</Button>`,
        `    </Modal.Footer>`,
        `  </Modal.Content>`,
        `</Modal>`,
      ]
        .filter((line) => line !== null)
        .join("\n");
    },
    props: [
      { name: "open", type: "boolean", description: "Controlled visibility on the root." },
      { name: "defaultOpen", type: "boolean", default: "false", description: "Initial uncontrolled visibility." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Visibility change callback." },
      { name: "size", type: '"sm" | "md" | "lg" | "xl" | "full"', default: '"md"', description: "Panel width on Modal.Content." },
      { name: "role", type: '"dialog" | "alertdialog"', default: '"dialog"', description: "ARIA role on Modal.Content." },
      { name: "closeOnOverlayClick", type: "boolean", default: "true", description: "Dismiss when the backdrop is clicked." },
      { name: "closeOnEscape", type: "boolean", default: "true", description: "Dismiss on Escape." },
      { name: "showClose", type: "boolean", default: "true", description: "Render the built-in close button." },
    ],
    notes: [
      "Built on <dialog> with showModal(), so focus trapping and the top layer come from the platform.",
      "Compose Trigger, Content, Header, Title, Description, Body, Footer, and Close.",
    ],
  },
  {
    id: "popover",
    name: "Popover",
    category: "Overlays",
    description: "A non-modal floating panel anchored to a trigger, for rich content.",
    keywords: ["popup", "floating", "panel", "anchored"],
    controls: [
      { name: "placement", type: "select", defaultValue: "bottom-start", options: placementOptions },
      { name: "offset", type: "number", defaultValue: 8, min: 0, max: 32, step: 2 },
      { name: "autoFocus", type: "boolean", label: "Auto focus", defaultValue: false },
    ],
    render: (state) => (
      <PopoverDemo
        placement={pick(state, "placement", "bottom-start")}
        offset={num(state, "offset", 8)}
        autoFocus={bool(state, "autoFocus")}
      />
    ),
    code: (state) => {
      const placement = pick(state, "placement", "bottom-start");
      const offset = num(state, "offset", 8);
      return [
        `<Popover open={open} onOpenChange={setOpen}>`,
        `  <PopoverTrigger>Open popover</PopoverTrigger>`,
        `  <PopoverContent`,
        placement === "bottom-start" ? null : `    placement="${placement}"`,
        offset === 8 ? null : `    offset={${offset}}`,
        bool(state, "autoFocus") ? `    autoFocus` : null,
        `  >`,
        `    <strong>Dimensions</strong>`,
        `    <p>Set the width and height of the layer.</p>`,
        `  </PopoverContent>`,
        `</Popover>`,
      ]
        .filter((line) => line !== null)
        .join("\n");
    },
    props: [
      { name: "open", type: "boolean", description: "Controlled visibility on the root." },
      { name: "defaultOpen", type: "boolean", default: "false", description: "Initial uncontrolled visibility." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Visibility change callback." },
      { name: "placement", type: "Placement", default: '"bottom-start"', description: "Floating placement on the content." },
      { name: "offset", type: "number", default: "8", description: "Gap between trigger and content." },
      { name: "matchTriggerWidth", type: "boolean", default: "false", description: "Align content width to the trigger." },
      { name: "autoFocus", type: "boolean", default: "false", description: "Move focus into the popover on open." },
      { name: "closeOnOutside", type: "boolean", default: "true", description: "Close on outside interaction." },
    ],
    notes: [
      "Non-modal: focus is not trapped and the page stays interactive behind it.",
      "Closes on Escape, returning focus to the trigger.",
    ],
  },
  {
    id: "sheet",
    name: "Sheet",
    category: "Overlays",
    description: "A panel that slides in from any edge of the viewport.",
    keywords: ["drawer", "panel", "side", "bottom sheet"],
    controls: [
      { name: "side", type: "select", defaultValue: "right", options: sheetSideOptions },
      { name: "size", type: "select", defaultValue: "md", options: sheetSizeOptions },
      { name: "showClose", type: "boolean", label: "Show close button", defaultValue: true },
    ],
    render: (state) => (
      <SheetDemo
        side={pick(state, "side", "right")}
        size={pick(state, "size", "md")}
        showClose={bool(state, "showClose", true)}
      />
    ),
    code: (state) => {
      const side = pick(state, "side", "right");
      const size = pick(state, "size", "md");
      return [
        `<Sheet open={open} onOpenChange={setOpen}>`,
        `  <Sheet.Trigger>`,
        `    <Button variant="outline">Open sheet</Button>`,
        `  </Sheet.Trigger>`,
        `  <Sheet.Content`,
        side === "right" ? null : `    side="${side}"`,
        size === "md" ? null : `    size="${size}"`,
        bool(state, "showClose", true) ? null : `    showClose={false}`,
        `  >`,
        `    <Sheet.Header>`,
        `      <Sheet.Title>Filters</Sheet.Title>`,
        `      <Sheet.Description>Refine the results list.</Sheet.Description>`,
        `    </Sheet.Header>`,
        `    <Sheet.Body>Choose the fields you want to narrow down by.</Sheet.Body>`,
        `    <Sheet.Footer>`,
        `      <Button variant="ghost" onClick={() => setOpen(false)}>Reset</Button>`,
        `      <Button onClick={() => setOpen(false)}>Apply</Button>`,
        `    </Sheet.Footer>`,
        `  </Sheet.Content>`,
        `</Sheet>`,
      ]
        .filter((line) => line !== null)
        .join("\n");
    },
    props: [
      { name: "open", type: "boolean", description: "Controlled visibility on the root." },
      { name: "defaultOpen", type: "boolean", default: "false", description: "Initial uncontrolled visibility." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Visibility change callback." },
      { name: "side", type: '"left" | "right" | "top" | "bottom"', default: '"right"', description: "Edge the panel slides from." },
      { name: "size", type: '"sm" | "md" | "lg" | "full"', default: '"md"', description: "Panel span along its slide axis." },
      { name: "showClose", type: "boolean", default: "true", description: "Render the built-in close button." },
      { name: "closeOnOverlayClick", type: "boolean", default: "true", description: "Dismiss when the backdrop is clicked." },
    ],
    notes: [
      "Traps focus, locks background scroll, and closes on Escape while open.",
      "Compose Trigger, Content, Header, Title, Description, Body, Footer, and Close.",
    ],
  },
  {
    id: "tooltip",
    name: "Tooltip",
    category: "Overlays",
    description: "A short label that appears on hover or focus of a single trigger.",
    keywords: ["hint", "hover", "help", "label"],
    controls: [
      { name: "content", type: "text", label: "Content", defaultValue: "Save to your library" },
      { name: "placement", type: "select", defaultValue: "top", options: placementOptions },
      { name: "delay", type: "number", defaultValue: 400, min: 0, max: 2000, step: 100 },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <TooltipDemo
        content={str(state, "content", "Save to your library")}
        placement={pick(state, "placement", "top")}
        delay={num(state, "delay", 400)}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) => {
      const placement = pick(state, "placement", "top");
      const delay = num(state, "delay", 400);
      return [
        `<Tooltip`,
        `  content="${str(state, "content", "Save to your library")}"`,
        placement === "top" ? null : `  placement="${placement}"`,
        delay === 400 ? null : `  delay={${delay}}`,
        bool(state, "disabled") ? `  disabled` : null,
        `>`,
        `  <Button variant="outline">Hover me</Button>`,
        `</Tooltip>`,
      ]
        .filter((line) => line !== null)
        .join("\n");
    },
    props: [
      { name: "content", type: "ReactNode", required: true, description: "The tooltip body." },
      { name: "children", type: "ReactElement", required: true, description: "A single trigger element that receives the wiring." },
      { name: "placement", type: "Placement", default: '"top"', description: "Preferred placement of the bubble." },
      { name: "delay", type: "number", default: "400", description: "Hover delay before showing, in milliseconds." },
      { name: "offset", type: "number", default: "6", description: "Gap between trigger and bubble." },
      { name: "disabled", type: "boolean", default: "false", description: "Prevents the tooltip from showing." },
    ],
    notes: [
      "Visibility is managed internally: opens on hover after delay and immediately on focus.",
      "Escape dismisses it; the bubble is linked to the trigger via aria-describedby.",
    ],
  },
  {
    id: "hover-card",
    name: "HoverCard",
    category: "Overlays",
    description: "Rich preview card revealed on hover or focus of its trigger.",
    keywords: ["hover", "preview", "profile", "card", "popover", "flyout"],
    controls: [
      { name: "placement", type: "select", defaultValue: "bottom", options: placementOptions },
      { name: "openDelay", type: "number", defaultValue: 200, min: 0, max: 1500, step: 50, label: "Open delay (ms)" },
      { name: "arrow", type: "boolean", defaultValue: true },
      { name: "unstyled", type: "boolean", defaultValue: false, label: "Unstyled (headless)" },
    ],
    render: (state) => (
      <HoverCardDemo
        placement={pick(state, "placement", "bottom")}
        openDelay={num(state, "openDelay", 200)}
        arrow={bool(state, "arrow", true)}
        unstyled={bool(state, "unstyled")}
      />
    ),
    code: (state) => {
      const placement = pick(state, "placement", "bottom");
      const openDelay = num(state, "openDelay", 200);
      return [
        `<HoverCard`,
        openDelay === 200 ? null : `  openDelay={${openDelay}}`,
        bool(state, "unstyled") ? `  unstyled` : null,
        `>`,
        `  <HoverCard.Trigger>`,
        `    <a href="/ada">Ada Lovelace</a>`,
        `  </HoverCard.Trigger>`,
        `  <HoverCard.Content`,
        placement === "bottom" ? null : `    placement="${placement}"`,
        bool(state, "arrow", true) ? null : `    arrow={false}`,
        `  >`,
        `    Mathematician and first computer programmer.`,
        `  </HoverCard.Content>`,
        `</HoverCard>`,
      ]
        .filter((line) => line !== null)
        .join("\n");
    },
    props: [
      { name: "open / defaultOpen", type: "boolean", default: "false", description: "Controlled or initial visibility." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the card opens or closes." },
      { name: "openDelay", type: "number", default: "200", description: "Hover/focus delay before opening, in milliseconds." },
      { name: "closeDelay", type: "number", default: "150", description: "Grace period before closing, in milliseconds." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; hover/focus behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<HoverCardSlot, string>>", description: "Per-slot class overrides (trigger, content)." },
      { name: "HoverCard.Content placement", type: "Placement", default: '"bottom"', description: "Preferred side of the trigger." },
      { name: "HoverCard.Content arrow", type: "boolean", default: "true", description: "Render a pointer aimed at the trigger." },
    ],
    notes: [
      "Opens after openDelay on hover or focus, and keeps open while the pointer travels into the card.",
      "Wrap a focusable child (link, button) so keyboard users can reach it; Escape dismisses.",
      "The card is a dialog labelled by the trigger, so screen readers announce whose preview it is.",
      "Set unstyled for behaviour only, or use the useHoverCard hook to own the markup entirely.",
    ],
  },
  {
    id: "command-palette",
    name: "CommandPalette",
    category: "Overlays",
    description: "Filterable command list with keyboard navigation and grouped results.",
    keywords: ["command", "palette", "spotlight", "spotlight search", "actions"],
    controls: [],
    render: () => <CommandPaletteDemo />,
    code: () =>
      [
        "<CommandPalette",
        "  open={open}",
        "  onOpenChange={setOpen}",
        "  onSelect={(item) => pick(item)}",
        "  items={commands}",
        '  footer="↑↓ to navigate · ↵ to run · esc to close"',
        "/>",
      ].join("\n"),
    props: [
      { name: "open", type: "boolean", required: true, description: "Whether the palette is visible." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called on Escape, backdrop click, or selection." },
      { name: "onSelect", type: "(item) => void", required: true, description: "Fired with the chosen command." },
      { name: "items", type: "CommandPaletteItem[]", required: true, description: "Commands (label/group/keywords/icon/shortcut)." },
      { name: "footer", type: "ReactNode", description: "Pinned hint row at the bottom." },
    ],
    notes: [
      "Filtering matches any token against label, description, group, and keywords.",
      "Locks scroll, traps focus, and restores it on close; wire the hotkey yourself.",
    ],
  },
  {
    id: "context-menu",
    name: "ContextMenu",
    category: "Overlays",
    description: "Right-click menu positioned at the pointer.",
    keywords: ["context", "right click", "menu", "actions"],
    controls: [],
    render: () => <ContextMenuDemo />,
    code: () =>
      [
        "<ContextMenu>",
        "  <ContextMenu.Trigger>",
        "    <div>Right-click this area</div>",
        "  </ContextMenu.Trigger>",
        "  <ContextMenu.Content>",
        "    <ContextMenu.Item onSelect={edit}>Edit</ContextMenu.Item>",
        "    <ContextMenu.Separator />",
        "    <ContextMenu.Item danger onSelect={remove}>Delete</ContextMenu.Item>",
        "  </ContextMenu.Content>",
        "</ContextMenu>",
      ].join("\n"),
    props: [
      { name: "ContextMenu.Trigger", type: "ReactElement", required: true, description: "Single element that opens the menu." },
      { name: "ContextMenu.Content", type: "HTMLAttributes", description: "The menu surface; positions at the pointer." },
      { name: "ContextMenu.Item disabled/danger/icon/shortcut", type: "mixed", description: "Item modifiers." },
    ],
    notes: [
      "Closes on outside pointer-down, scroll, or Escape, and restores arrow-key navigation.",
      "Uses the same visual language as DropdownMenu.",
    ],
  },
  {
    id: "menu-bar",
    name: "MenuBar",
    category: "Overlays",
    description: "Desktop-style menu bar: a row of dropdown menus with arrow-key traversal.",
    keywords: ["menubar", "menu", "desktop", "app menu"],
    controls: [],
    render: () => <MenuBarDemo />,
    code: () =>
      [
        "<MenuBar>",
        '  <MenuBar.Menu value="file" label="File">',
        "    <MenuBar.Item onSelect={newFile}>New</MenuBar.Item>",
        "    <MenuBar.Separator />",
        "    <MenuBar.Item danger onSelect={remove}>Delete</MenuBar.Item>",
        "  </MenuBar.Menu>",
        '  <MenuBar.Menu value="edit" label="Edit">',
        "    <MenuBar.Item onSelect={undo}>Undo</MenuBar.Item>",
        "  </MenuBar.Menu>",
        "</MenuBar>",
      ].join("\n"),
    props: [
      { name: "value / defaultValue / onValueChange", type: "string | null", description: "Which menu is open." },
      { name: "MenuBar.Menu label", type: "ReactNode", required: true, description: "Trigger text for a menu." },
      { name: "MenuBar.Item", type: "DropdownMenu.Item", description: "Same item API as DropdownMenu." },
    ],
    notes: [
      "Left/Right arrows move between menus while one is open; hover switches menus.",
      "Composed on DropdownMenu, so positioning and dismissal are shared.",
    ],
  },
  {
    id: "navigation-menu",
    name: "NavigationMenu",
    category: "Overlays",
    description: "Horizontal navigation with hover/click panels, one open at a time.",
    keywords: ["navmenu", "navigation", "mega menu", "dropdown nav"],
    controls: [],
    render: () => <NavigationMenuDemo />,
    code: () =>
      [
        "<NavigationMenu>",
        "  <NavigationMenu.List>",
        '    <NavigationMenu.Item value="docs">',
        '      <NavigationMenu.Trigger value="docs">Docs</NavigationMenu.Trigger>',
        '      <NavigationMenu.Content value="docs">',
        '        <NavigationMenu.Link href="/intro">Introduction</NavigationMenu.Link>',
        "      </NavigationMenu.Content>",
        "    </NavigationMenu.Item>",
        "  </NavigationMenu.List>",
        "</NavigationMenu>",
      ].join("\n"),
    props: [
      { name: "value / defaultValue / onValueChange", type: "string | null", description: "The open panel value." },
      { name: "NavigationMenu.Trigger value", type: "string", required: true, description: "Links a trigger to its content." },
      { name: "NavigationMenu.Content value", type: "string", required: true, description: "Panel shown while its value is open." },
      { name: "closeDelay", type: "number", default: "120", description: "Grace period before closing on pointer leave." },
    ],
    notes: [
      "Left/Right arrows move between triggers; Escape closes the open panel.",
      "Use NavigationMenu.Link for the panel's destinations.",
    ],
  },
  {
    id: "popconfirm",
    name: "Popconfirm",
    category: "Overlays",
    description: "A compact confirmation popover anchored to its trigger, for destructive or irreversible actions.",
    keywords: ["popconfirm", "confirm", "delete", "popover", "danger"],
    controls: [
      { name: "title", type: "text", defaultValue: "Delete this item?" },
      { name: "description", type: "text", defaultValue: "This action cannot be undone." },
      { name: "tone", type: "select", defaultValue: "danger", options: [
        { label: "default", value: "default" },
        { label: "danger", value: "danger" },
      ] },
      { name: "showCancel", type: "boolean", defaultValue: true },
    ],
    render: (state) => (
      <Popconfirm
        title={str(state, "title", "Delete this item?")}
        description={str(state, "description", "This action cannot be undone.")}
        tone={pick(state, "tone", "danger") as "danger"}
        showCancel={bool(state, "showCancel")}
        confirmText="Delete"
        onConfirm={() => {}}
      >
        <Button variant="danger">Delete item</Button>
      </Popconfirm>
    ),
    props: [
      { name: "title", type: "ReactNode", required: true, description: "The question being confirmed." },
      { name: "description", type: "ReactNode", description: "Supporting explanation." },
      { name: "children", type: "ReactElement", required: true, description: "Trigger; receives aria-haspopup/expanded and onClick." },
      { name: "onConfirm / onCancel", type: "() => void", description: "Fired by the action buttons or dismissal." },
      { name: "confirmText / cancelText", type: "string", default: '"Confirm" / "Cancel"', description: "Action labels." },
      { name: "tone", type: '"default" | "danger"', default: '"default"', description: "Confirm button emphasis." },
      { name: "placement", type: "Placement", default: '"top"', description: "Side of the trigger." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean", description: "Controlled or uncontrolled visibility." },
    ],
    notes: [
      "The popup is role=alertdialog labelled by the title, so the question is announced.",
      "Focus moves into the popup and returns to the trigger on dismissal.",
      "Use AlertDialog when the confirmation needs a full modal.",
    ],
  },
  {
    id: "tour",
    name: "Tour",
    category: "Overlays",
    description: "A guided product tour that spotlights targets and steps through contextual cards.",
    keywords: ["tour", "onboarding", "walkthrough", "spotlight", "guide"],
    render: () => <TourDemo />,
    props: [
      { name: "steps", type: "TourStep[]", required: true, description: "Targets, titles, descriptions, and placements." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean", description: "Controlled or uncontrolled visibility." },
      { name: "current / defaultCurrent / onCurrentChange", type: "number", description: "Controlled or uncontrolled step index." },
      { name: "onFinish / onClose", type: "() => void", description: "Called when the last step finishes or the tour is dismissed." },
      { name: "mask / maskClosable", type: "boolean", default: "true / false", description: "Dim the page and optionally close on mask click." },
      { name: "scrollIntoView", type: "boolean", default: "true", description: "Scroll each target into view when its step opens." },
    ],
    notes: [
      "Targets can be a CSS selector, an element, or a resolver function; missing targets center the card.",
      "The spotlight is a box-shadow cutout, so the page is dimmed without extra overlay layers.",
      "The card is role=dialog, receives focus on each step, and Escape closes the tour.",
    ],
  },
];
