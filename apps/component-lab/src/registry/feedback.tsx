import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import {
  Alert,
  Button,
  CircularProgress,
  EmptyState,
  InlineMessage,
  LoadingOverlay,
  Meter,
  NotificationProvider,
  Progress,
  Result,
  Skeleton,
  Spinner,
  StatusIndicator,
  ToastProvider,
  useNotification,
  useToast,
  type AlertVariant,
  type Status,
  type ToastPosition,
} from "@adem.rejeb/ui";
import type { ComponentEntry } from "./types";
import { bool, num, pick, str } from "./demo";
import { jsx } from "../lib/jsx";

const options = <T extends string>(values: readonly T[]): { label: T; value: T }[] =>
  values.map((value) => ({ label: value, value }));

function NotificationTrigger() {
  const { notify } = useNotification();
  return (
    <Button
      onClick={() =>
        notify({
          variant: "success",
          title: "Deploy complete",
          description: "adem.rejeb@0.2.0 is live in production.",
          actions: (
            <Button size="sm" variant="outline">
              View release
            </Button>
          ),
        })
      }
    >
      Show notification
    </Button>
  );
}

function NotificationDemo() {
  return (
    <NotificationProvider placement="top-right">
      <NotificationTrigger />
    </NotificationProvider>
  );
}

const ALERT_VARIANTS = ["neutral", "info", "success", "warning", "danger"] as const;
const INLINE_STATUSES = ["success", "danger", "warning", "info"] as const;
const STATUS_VALUES = ["neutral", "success", "warning", "danger", "info"] as const;
const TONES = ["accent", "success", "warning", "danger"] as const;
const PROGRESS_VARIANTS = ["default", "success", "warning", "danger"] as const;
const PROGRESS_SIZES = ["sm", "md", "lg"] as const;
const EMPTY_SIZES = ["sm", "md", "lg"] as const;
const STATUS_SIZES = ["sm", "md"] as const;
const SKELETON_VARIANTS = ["text", "circular", "rectangular"] as const;
const CONTROL_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const TOAST_POSITIONS = [
  "top-right",
  "top-center",
  "top-left",
  "bottom-right",
  "bottom-center",
  "bottom-left",
] as const;

function AlertDemo({
  variant,
  title,
  body,
  showIcon,
  dismissible,
}: {
  variant: AlertVariant;
  title: string;
  body: string;
  showIcon: boolean;
  dismissible: boolean;
}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => setVisible(true), [variant, title, body, showIcon, dismissible]);
  if (!visible) return null;
  return (
    <Alert
      variant={variant}
      title={title || undefined}
      icon={showIcon ? undefined : false}
      dismissible={dismissible}
      onDismiss={() => setVisible(false)}
    >
      {body || undefined}
    </Alert>
  );
}

function LoadingOverlayDemo({
  loading,
  label,
  blur,
  blocking,
}: {
  loading: boolean;
  label: string;
  blur: boolean;
  blocking: boolean;
}) {
  const [busy, setBusy] = useState(loading);
  useEffect(() => setBusy(loading), [loading]);
  return (
    <div style={{ display: "grid", gap: 12, width: "100%" }}>
      <Button variant="outline" onClick={() => setBusy((value) => !value)}>
        Toggle loading
      </Button>
      <LoadingOverlay loading={busy} label={label} blur={blur} blocking={blocking}>
        <div style={{ padding: 24, minHeight: 80 }}>Content stays visible while loading</div>
      </LoadingOverlay>
    </div>
  );
}

function ToastTrigger({
  variant,
  title,
  description,
  duration,
}: {
  variant: Status;
  title: string;
  description: string;
  duration: number;
}) {
  const { toast } = useToast();
  return (
    <Button
      onClick={() =>
        toast({
          variant,
          title: title || undefined,
          description: description || undefined,
          duration,
        })
      }
    >
      Show toast
    </Button>
  );
}

function ToastDemo({
  variant,
  title,
  description,
  duration,
  position,
}: {
  variant: Status;
  title: string;
  description: string;
  duration: number;
  position: ToastPosition;
}) {
  return (
    <ToastProvider position={position}>
      <ToastTrigger variant={variant} title={title} description={description} duration={duration} />
    </ToastProvider>
  );
}

export const feedbackEntries: ComponentEntry[] = [
  {
    id: "alert",
    name: "Alert",
    category: "Feedback",
    description: "Inline semantic message with variants, an icon, and optional dismissal.",
    keywords: ["message", "notification", "status", "banner"],
    children: "Your changes have been saved.",
    controls: [
      { name: "variant", type: "select", defaultValue: "info", options: options(ALERT_VARIANTS) },
      { name: "title", type: "text", defaultValue: "Heads up" },
      {
        name: "body",
        type: "textarea",
        label: "Description",
        defaultValue: "Your changes have been saved.",
      },
      { name: "showIcon", type: "boolean", label: "Show icon", defaultValue: true },
      { name: "dismissible", type: "boolean", defaultValue: true },
    ],
    render: (state) => (
      <AlertDemo
        variant={pick(state, "variant", "info")}
        title={str(state, "title", "Heads up")}
        body={str(state, "body", "Your changes have been saved.")}
        showIcon={bool(state, "showIcon", true)}
        dismissible={bool(state, "dismissible", true)}
      />
    ),
    code: (state) =>
      jsx("Alert", {
        props: {
          variant: pick(state, "variant", "info") === "info" ? undefined : pick(state, "variant", "info"),
          title: str(state, "title", "Heads up") || undefined,
          dismissible: bool(state, "dismissible", true),
        },
        children: str(state, "body", "Your changes have been saved."),
      }),
    props: [
      {
        name: "variant",
        type: '"neutral" | "info" | "success" | "warning" | "danger"',
        default: '"info"',
        description: "Semantic tone. warning and danger use role=\"alert\".",
      },
      { name: "title", type: "ReactNode", description: "Bold heading above the message." },
      { name: "icon", type: "ReactNode | false", description: "Override the default icon; pass false to hide it." },
      { name: "dismissible", type: "boolean", default: "false", description: "Render a dismiss button." },
      { name: "onDismiss", type: "() => void", description: "Called when the dismiss button is pressed." },
      { name: "actions", type: "ReactNode", description: "Inline actions rendered below the message." },
    ],
    notes: [
      "Urgent variants (warning, danger) use role=\"alert\"; the rest use role=\"status\".",
      "Color is always paired with an icon so meaning is never conveyed by color alone.",
    ],
  },
  {
    id: "circular-progress",
    name: "CircularProgress",
    category: "Feedback",
    description: "Radial progress indicator rendered as an SVG ring, determinate or indeterminate.",
    keywords: ["ring", "radial", "spinner", "percent", "loading"],
    controls: [
      { name: "value", type: "number", defaultValue: 65, min: 0, max: 100, step: 1 },
      { name: "max", type: "number", defaultValue: 100, min: 1, step: 1 },
      { name: "size", type: "number", label: "Size (px)", defaultValue: 48, min: 16, max: 160, step: 4 },
      { name: "thickness", type: "number", label: "Thickness (px)", defaultValue: 4, min: 1, max: 16, step: 1 },
      { name: "tone", type: "select", defaultValue: "accent", options: options(TONES) },
      { name: "showValue", type: "boolean", label: "Show value", defaultValue: true },
      { name: "indeterminate", type: "boolean", defaultValue: false },
      { name: "label", type: "text", label: "Aria label", defaultValue: "Upload progress" },
    ],
    render: (state) => (
      <CircularProgress
        value={num(state, "value", 65)}
        max={num(state, "max", 100)}
        size={num(state, "size", 48)}
        thickness={num(state, "thickness", 4)}
        tone={pick(state, "tone", "accent")}
        showValue={bool(state, "showValue", true)}
        indeterminate={bool(state, "indeterminate")}
        label={str(state, "label", "Upload progress")}
      />
    ),
    code: (state) =>
      jsx("CircularProgress", {
        props: {
          value: num(state, "value", 65),
          max: num(state, "max", 100) === 100 ? undefined : num(state, "max", 100),
          size: num(state, "size", 48) === 48 ? undefined : num(state, "size", 48),
          thickness: num(state, "thickness", 4) === 4 ? undefined : num(state, "thickness", 4),
          tone: pick(state, "tone", "accent") === "accent" ? undefined : pick(state, "tone", "accent"),
          showValue: bool(state, "showValue", true),
          indeterminate: bool(state, "indeterminate") || undefined,
        },
      }),
    props: [
      { name: "value", type: "number", default: "0", description: "Current value." },
      { name: "max", type: "number", default: "100", description: "Value representing a full ring." },
      { name: "size", type: "number", default: "48", description: "Diameter in pixels." },
      { name: "thickness", type: "number", default: "4", description: "Ring stroke width in pixels." },
      { name: "indeterminate", type: "boolean", default: "false", description: "Render an animated unknown-progress ring." },
      { name: "showValue", type: "boolean", default: "false", description: "Show the percentage inside the ring." },
      {
        name: "tone",
        type: '"accent" | "success" | "warning" | "danger"',
        default: '"accent"',
        description: "Indicator color.",
      },
      { name: "label", type: "ReactNode", description: "Accessible label for the progressbar." },
      { name: "formatValue", type: "(value: number, max: number) => string", description: "Custom value formatter." },
    ],
    notes: ["`ProgressRing` is an alias of this component for metric-style displays."],
  },
  {
    id: "empty-state",
    name: "EmptyState",
    category: "Feedback",
    description: "Neutral empty-data presentation with an optional icon, copy, and actions.",
    keywords: ["empty", "placeholder", "no data", "zero state"],
    controls: [
      { name: "title", type: "text", defaultValue: "No projects yet" },
      {
        name: "description",
        type: "textarea",
        defaultValue: "Create your first project to get started.",
      },
      { name: "size", type: "select", defaultValue: "md", options: options(EMPTY_SIZES) },
      { name: "showIcon", type: "boolean", label: "Show icon", defaultValue: true },
      { name: "showActions", type: "boolean", label: "Show actions", defaultValue: true },
    ],
    render: (state) => (
      <EmptyState
        size={pick(state, "size", "md")}
        icon={bool(state, "showIcon", true) ? <Inbox size={40} /> : undefined}
        title={str(state, "title", "No projects yet")}
        description={str(state, "description", "Create your first project to get started.")}
        actions={bool(state, "showActions", true) ? <Button>New project</Button> : undefined}
      />
    ),
    code: (state) =>
      jsx("EmptyState", {
        props: {
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          icon: bool(state, "showIcon", true) ? "<Inbox size={40} />" : false,
          title: str(state, "title", "No projects yet"),
          description: str(state, "description", "Create your first project to get started."),
          actions: bool(state, "showActions", true) ? "<Button>New project</Button>" : false,
        },
      }),
    props: [
      { name: "icon", type: "ReactNode", description: "Illustration or icon shown above the title." },
      { name: "title", type: "ReactNode", description: "Primary heading." },
      { name: "description", type: "ReactNode", description: "Supporting copy." },
      { name: "actions", type: "ReactNode", description: "Primary and secondary actions." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Vertical padding and text scale." },
    ],
    notes: ["The icon is marked aria-hidden; keep the title meaningful on its own."],
  },
  {
    id: "inline-message",
    name: "InlineMessage",
    category: "Feedback",
    description: "Compact single-line validation or feedback message with a status icon.",
    keywords: ["validation", "error", "helper", "hint", "field"],
    children: "This field is required.",
    controls: [
      { name: "status", type: "select", defaultValue: "info", options: options(INLINE_STATUSES) },
      { name: "children", type: "text", label: "Message", defaultValue: "This field is required." },
      { name: "showIcon", type: "boolean", label: "Show icon", defaultValue: true },
    ],
    render: (state) => (
      <InlineMessage
        status={pick(state, "status", "info")}
        icon={bool(state, "showIcon", true) ? undefined : false}
      >
        {str(state, "children", "This field is required.")}
      </InlineMessage>
    ),
    code: (state) =>
      jsx("InlineMessage", {
        props: {
          status: pick(state, "status", "info") === "info" ? undefined : pick(state, "status", "info"),
          icon: bool(state, "showIcon", true) ? undefined : false,
        },
        children: str(state, "children", "This field is required."),
      }),
    props: [
      {
        name: "status",
        type: '"success" | "danger" | "warning" | "info"',
        default: '"info"',
        description: "Semantic tone; danger uses role=\"alert\".",
      },
      { name: "icon", type: "ReactNode | false", description: "Override the status icon; false hides it." },
    ],
    notes: ["Designed to sit directly beneath a form control; pair it with aria-describedby."],
  },
  {
    id: "loading-overlay",
    name: "LoadingOverlay",
    category: "Feedback",
    description: "Wraps content and overlays a spinner while a region is busy.",
    keywords: ["busy", "spinner", "blocking", "scrim", "loading"],
    controls: [
      { name: "loading", type: "boolean", defaultValue: true },
      { name: "label", type: "text", defaultValue: "Loading" },
      { name: "blur", type: "boolean", defaultValue: false },
      { name: "blocking", type: "boolean", defaultValue: true },
    ],
    render: (state) => (
      <LoadingOverlayDemo
        loading={bool(state, "loading", true)}
        label={str(state, "label", "Loading")}
        blur={bool(state, "blur")}
        blocking={bool(state, "blocking", true)}
      />
    ),
    code: (state) =>
      jsx("LoadingOverlay", {
        props: {
          loading: bool(state, "loading", true) || undefined,
          label: str(state, "label", "Loading") === "Loading" ? undefined : str(state, "label", "Loading"),
          blur: bool(state, "blur") || undefined,
          blocking: bool(state, "blocking", true) ? undefined : false,
        },
        children: "  <YourContent />",
      }),
    props: [
      { name: "loading", type: "boolean", default: "false", description: "Show the overlay and set aria-busy." },
      { name: "label", type: "string", default: '"Loading"', description: "Label announced while loading." },
      { name: "blur", type: "boolean", default: "false", description: "Apply a backdrop blur behind the overlay." },
      { name: "blocking", type: "boolean", default: "true", description: "Prevent interaction with content beneath." },
    ],
    notes: [
      "Content is kept in the DOM so layout stays stable while loading.",
      "The overlay is a polite live region announcing the label.",
    ],
  },
  {
    id: "progress",
    name: "Progress",
    category: "Feedback",
    description: "Linear progress bar with variants, sizes, and an indeterminate mode.",
    keywords: ["bar", "loading", "percent", "task"],
    controls: [
      { name: "value", type: "number", defaultValue: 40, min: 0, max: 100, step: 1 },
      { name: "max", type: "number", defaultValue: 100, min: 1, step: 1 },
      { name: "variant", type: "select", defaultValue: "default", options: options(PROGRESS_VARIANTS) },
      { name: "size", type: "select", defaultValue: "md", options: options(PROGRESS_SIZES) },
      { name: "label", type: "text", defaultValue: "Uploading" },
      { name: "showValue", type: "boolean", label: "Show value", defaultValue: true },
      { name: "indeterminate", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Progress
        value={num(state, "value", 40)}
        max={num(state, "max", 100)}
        variant={pick(state, "variant", "default")}
        size={pick(state, "size", "md")}
        label={str(state, "label", "Uploading")}
        showValue={bool(state, "showValue", true)}
        indeterminate={bool(state, "indeterminate")}
      />
    ),
    code: (state) =>
      jsx("Progress", {
        props: {
          value: num(state, "value", 40),
          max: num(state, "max", 100) === 100 ? undefined : num(state, "max", 100),
          variant: pick(state, "variant", "default") === "default" ? undefined : pick(state, "variant", "default"),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          label: str(state, "label", "Uploading"),
          showValue: bool(state, "showValue", true),
          indeterminate: bool(state, "indeterminate") || undefined,
        },
      }),
    props: [
      { name: "value", type: "number", default: "0", description: "Current value." },
      { name: "max", type: "number", default: "100", description: "Value representing a full bar." },
      {
        name: "variant",
        type: '"default" | "success" | "warning" | "danger"',
        default: '"default"',
        description: "Fill color.",
      },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Track height." },
      { name: "label", type: "ReactNode", description: "Visible label above the bar." },
      { name: "showValue", type: "boolean", default: "false", description: "Show the percentage beside the label." },
      { name: "indeterminate", type: "boolean", default: "false", description: "Render an animated unknown-progress bar." },
      { name: "aria-label", type: "string", description: "Accessible name when no visible label is provided." },
    ],
    notes: ["When no label is given, pass aria-label so the progressbar is announced."],
  },
  {
    id: "skeleton",
    name: "Skeleton",
    category: "Feedback",
    description: "Loading placeholder for text, circles, and rectangles.",
    keywords: ["placeholder", "loading", "shimmer", "shimmering"],
    controls: [
      { name: "variant", type: "select", defaultValue: "text", options: options(SKELETON_VARIANTS) },
      { name: "lines", type: "number", defaultValue: 3, min: 1, max: 6, step: 1 },
      { name: "width", type: "number", label: "Width (px)", defaultValue: 240, min: 16, step: 8 },
      { name: "height", type: "number", label: "Height (px)", defaultValue: 16, min: 8, step: 4 },
      { name: "animated", type: "boolean", defaultValue: true },
    ],
    render: (state) => (
      <Skeleton
        variant={pick(state, "variant", "text")}
        lines={num(state, "lines", 3)}
        width={num(state, "width", 240)}
        height={num(state, "height", 16)}
        animated={bool(state, "animated", true)}
      />
    ),
    code: (state) =>
      jsx("Skeleton", {
        props: {
          variant: pick(state, "variant", "text") === "text" ? undefined : pick(state, "variant", "text"),
          width: num(state, "width", 240),
          height: num(state, "height", 16),
          lines: num(state, "lines", 3),
          animated: bool(state, "animated", true) ? undefined : false,
        },
      }),
    props: [
      { name: "variant", type: '"text" | "circular" | "rectangular"', default: '"text"', description: "Placeholder shape." },
      { name: "width", type: "number | string", description: "Placeholder width." },
      { name: "height", type: "number | string", description: "Placeholder height." },
      { name: "radius", type: "string", description: "Border radius override." },
      { name: "lines", type: "number", default: "1", description: "Stacked lines for the text variant." },
      { name: "animated", type: "boolean", default: "true", description: "Apply the shimmer animation." },
    ],
    notes: ["Marked aria-hidden; announce loading state on the surrounding region instead."],
  },
  {
    id: "spinner",
    name: "Spinner",
    category: "Feedback",
    description: "Compact, themable loading indicator with accessible labeling.",
    keywords: ["loading", "throbber", "busy", "indicator"],
    controls: [
      { name: "size", type: "select", defaultValue: "md", options: options(CONTROL_SIZES) },
      { name: "label", type: "text", defaultValue: "Loading" },
      { name: "thickness", type: "number", defaultValue: 2.5, min: 1, max: 6, step: 0.5 },
      { name: "decorative", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Spinner
        size={pick(state, "size", "md")}
        label={str(state, "label", "Loading")}
        thickness={num(state, "thickness", 2.5)}
        decorative={bool(state, "decorative")}
      />
    ),
    code: (state) =>
      jsx("Spinner", {
        props: {
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          label: str(state, "label", "Loading") === "Loading" ? undefined : str(state, "label", "Loading"),
          thickness: num(state, "thickness", 2.5) === 2.5 ? undefined : num(state, "thickness", 2.5),
          decorative: bool(state, "decorative") || undefined,
        },
      }),
    props: [
      { name: "size", type: 'ControlSize | number', default: '"md"', description: "Named size or pixel diameter." },
      { name: "label", type: "string", default: '"Loading"', description: "Visually hidden label announced to AT." },
      { name: "decorative", type: "boolean", default: "false", description: "Hide the spinner from the a11y tree." },
      { name: "thickness", type: "number", default: "2.5", description: "Stroke width in SVG user units." },
    ],
    notes: ["Set decorative when the loading state is already announced by a parent region."],
  },
  {
    id: "status-indicator",
    name: "StatusIndicator",
    category: "Feedback",
    description: "A status dot with an accessible label; never relies on color alone.",
    keywords: ["status", "dot", "online", "presence", "badge"],
    controls: [
      { name: "status", type: "select", defaultValue: "success", options: options(STATUS_VALUES) },
      { name: "label", type: "text", defaultValue: "Online" },
      { name: "size", type: "select", defaultValue: "md", options: options(STATUS_SIZES) },
      { name: "pulse", type: "boolean", defaultValue: true },
      { name: "dotOnly", type: "boolean", label: "Dot only", defaultValue: false },
    ],
    render: (state) => (
      <StatusIndicator
        status={pick(state, "status", "success")}
        label={str(state, "label", "Online")}
        size={pick(state, "size", "md")}
        pulse={bool(state, "pulse", true)}
        dotOnly={bool(state, "dotOnly")}
      />
    ),
    code: (state) =>
      jsx("StatusIndicator", {
        props: {
          status:
            (pick(state, "status", "success") as string) === "neutral"
              ? undefined
              : pick(state, "status", "success"),
          label: str(state, "label", "Online"),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          pulse: bool(state, "pulse", true) || undefined,
          dotOnly: bool(state, "dotOnly") || undefined,
        },
      }),
    props: [
      {
        name: "status",
        type: '"neutral" | "success" | "warning" | "danger" | "info"',
        default: '"neutral"',
        description: "Dot color and default label.",
      },
      { name: "label", type: "ReactNode", description: "Visible label; falls back to the status name." },
      { name: "pulse", type: "boolean", default: "false", description: "Animate the dot for in-progress states." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Dot and label scale." },
      { name: "dotOnly", type: "boolean", default: "false", description: "Hide the visible label (still announced)." },
    ],
    notes: ["The label is always present for assistive technology, even in dotOnly mode."],
  },
  {
    id: "toast",
    name: "Toast",
    category: "Feedback",
    description: "Transient notifications surfaced through a provider and useToast hook.",
    keywords: ["notification", "snackbar", "message", "alert", "transient"],
    controls: [
      { name: "variant", type: "select", defaultValue: "success", options: options(STATUS_VALUES) },
      { name: "title", type: "text", defaultValue: "Saved" },
      { name: "description", type: "text", defaultValue: "Your changes are live." },
      { name: "duration", type: "number", label: "Duration (ms)", defaultValue: 5000, min: 0, step: 500 },
      { name: "position", type: "select", defaultValue: "bottom-right", options: options(TOAST_POSITIONS) },
    ],
    render: (state) => (
      <ToastDemo
        variant={pick(state, "variant", "success")}
        title={str(state, "title", "Saved")}
        description={str(state, "description", "Your changes are live.")}
        duration={num(state, "duration", 5000)}
        position={pick(state, "position", "bottom-right")}
      />
    ),
    code: (state) =>
      `const { toast } = useToast();

toast({
  variant: ${JSON.stringify(pick(state, "variant", "success"))},
  title: ${JSON.stringify(str(state, "title", "Saved"))},
  description: ${JSON.stringify(str(state, "description", "Your changes are live."))},
  duration: ${num(state, "duration", 5000)},
});`,
    props: [
      { name: "variant", type: '"neutral" | "success" | "warning" | "danger" | "info"', default: '"neutral"', description: "Toast tone and icon." },
      { name: "title", type: "ReactNode", description: "Bold heading." },
      { name: "description", type: "ReactNode", description: "Supporting copy." },
      { name: "action", type: "ReactNode", description: "Optional inline action." },
      { name: "duration", type: "number", default: "5000", description: "Auto-dismiss delay in ms; 0 keeps it open." },
      { name: "position", type: "ToastPosition", default: '"bottom-right"', description: "Provider viewport corner." },
    ],
    notes: [
      "Wrap the app in <ToastProvider> and call useToast() to enqueue toasts.",
      "The dismiss timer pauses while a toast is hovered or focused.",
      "Toasts are rendered in a Portal with aria-live=\"polite\".",
    ],
  },
  {
    id: "meter",
    name: "Meter",
    category: "Feedback",
    description: "A gauge for a value inside a known range, with automatic good/warning/bad tone.",
    keywords: ["meter", "gauge", "capacity", "score", "usage", "measurement"],
    controls: [
      { name: "value", type: "number", defaultValue: 68, min: 0, max: 100, step: 1 },
      { name: "low", type: "number", defaultValue: 25, min: 0, max: 100, step: 1 },
      { name: "high", type: "number", defaultValue: 80, min: 0, max: 100, step: 1 },
      { name: "optimum", type: "number", defaultValue: 50, min: 0, max: 100, step: 1 },
      {
        name: "tone",
        type: "select",
        defaultValue: "auto",
        options: [
          { label: "auto", value: "auto" },
          { label: "neutral", value: "neutral" },
          { label: "success", value: "success" },
          { label: "warning", value: "warning" },
          { label: "danger", value: "danger" },
        ],
      },
      {
        name: "size",
        type: "select",
        defaultValue: "md",
        options: [
          { label: "sm", value: "sm" },
          { label: "md", value: "md" },
          { label: "lg", value: "lg" },
        ],
      },
      { name: "showValue", type: "boolean", defaultValue: true },
    ],
    render: (state) => {
      const tone = pick(state, "tone", "auto");
      return (
        <div style={{ width: 260 }}>
          <Meter
            value={num(state, "value", 68)}
            low={num(state, "low", 25)}
            high={num(state, "high", 80)}
            optimum={num(state, "optimum", 50)}
            label="Disk usage"
            size={pick(state, "size", "md")}
            tone={tone === "auto" ? undefined : tone}
            showValue={bool(state, "showValue", true)}
          />
        </div>
      );
    },
    code: (state) => {
      const tone = pick(state, "tone", "auto");
      return jsx("Meter", {
        props: {
          value: num(state, "value", 68),
          low: num(state, "low", 25),
          high: num(state, "high", 80),
          optimum: num(state, "optimum", 50),
          label: "Disk usage",
          size: pick(state, "size", "md"),
          tone: tone === "auto" ? undefined : tone,
          showValue: bool(state, "showValue", true),
        },
      });
    },
    props: [
      { name: "value", type: "number", required: true, description: "Current value, clamped to min/max." },
      { name: "min / max", type: "number", default: "0 / 100", description: "Range bounds." },
      { name: "low / high", type: "number", description: "Bounds of the acceptable range; drives the tone." },
      { name: "optimum", type: "number", description: "Preferred value; defaults to the middle of low/high." },
      { name: "tone", type: '"neutral" | "success" | "warning" | "danger"', description: "Override the derived tone." },
      { name: "label", type: "ReactNode", description: "Visible label, also used as the accessible name." },
      { name: "showValue", type: "boolean", default: "false", description: "Show the formatted value beside the label." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Track height." },
    ],
    notes: [
      "Uses role=\"meter\" with aria-valuemin/max/now, not role=\"progressbar\".",
      "Tone is derived from low/high/optimum; pass tone to override it.",
      "Use Progress for task completion and Meter for a measurement inside a range.",
    ],
  },
  {
    id: "result",
    name: "Result",
    category: "Feedback",
    description: "A full-area outcome message for success, error, and not-found states.",
    keywords: ["result", "success", "error", "404", "403", "500", "empty"],
    controls: [
      { name: "status", type: "select", defaultValue: "success", options: options(["success", "info", "warning", "danger", "neutral", "404", "403", "500"]) },
      { name: "size", type: "select", defaultValue: "md", options: options(["sm", "md", "lg"] as const) },
      { name: "title", type: "text", defaultValue: "Payment received" },
      { name: "description", type: "textarea", defaultValue: "Your invoice is paid and the receipt is on its way." },
    ],
    render: (state) => (
      <Result
        status={pick(state, "status", "success") as "success"}
        size={pick(state, "size", "md") as "md"}
        title={str(state, "title", "Payment received")}
        description={str(state, "description", "")}
        extra={<Button size="sm">Go to dashboard</Button>}
      />
    ),
    props: [
      { name: "status", type: "ResultStatus", default: '"info"', description: "success, info, warning, danger, neutral, 404, 403, or 500." },
      { name: "title / description", type: "ReactNode", description: "Primary message and supporting copy." },
      { name: "extra", type: "ReactNode", description: "Actions under the description." },
      { name: "icon", type: "ReactNode", description: "Replace the status icon." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Icon and title scale." },
    ],
    notes: [
      "Status tones reuse the success/info/warning/danger subtle tokens.",
      "The container is role=status so the outcome is announced when it appears.",
    ],
  },
  {
    id: "notification",
    name: "Notification",
    category: "Feedback",
    description: "Rich, stackable notifications with a title, description, actions, and placement.",
    keywords: ["notification", "notice", "alert", "stack", "provider"],
    render: () => <NotificationDemo />,
    props: [
      { name: "notify", type: "(options: NotificationOptions) => string", required: true, description: "Adds a notification and returns its id." },
      { name: "dismiss / dismissAll", type: "(id?: string) => void", description: "Remove one or all notifications." },
      { name: "placement", type: "NotificationPlacement", default: '"top-right"', description: "Viewport corner for the stack." },
      { name: "title / description", type: "ReactNode", description: "Heading and supporting copy." },
      { name: "actions", type: "ReactNode", description: "Buttons or links under the description." },
      { name: "duration", type: "number", default: "6000", description: "Auto-dismiss delay; 0 keeps it open." },
      { name: "max", type: "number", default: "4", description: "Maximum concurrent notifications." },
    ],
    notes: [
      "The stack is portaled and aria-live=polite; danger notifications switch to role=alert.",
      "Hovering or focusing a notification pauses its dismiss timer.",
      "Use Toast for transient confirmations and Notification when actions or detail matter.",
    ],
  },
];
