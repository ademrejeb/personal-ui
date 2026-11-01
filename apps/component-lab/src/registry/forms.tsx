import { useState } from "react";
import { Copy } from "lucide-react";
import {
  Autocomplete,
  Button,
  Calendar,
  Cascader,
  Checkbox,
  ColorPicker,
  Combobox,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  Fieldset,
  FileUpload,
  Form,
  FormActions,
  FormBuilder,
  FormField,
  Input,
  InputGroup,
  InputMask,
  InlineEdit,
  InputOTP,
  Mentions,
  MultiSelect,
  NumberInput,
  PasswordInput,
  Radio,
  RadioGroup,
  Rating,
  SearchInput,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  Textarea,
  TimePicker,
  Transfer,
  TreeSelect,
  useForm,
} from "@personal-ui/ui";
import type { CalendarEvent } from "@personal-ui/ui";
import type { ControlSize } from "@personal-ui/ui";
import type { CascaderOption } from "@personal-ui/ui";
import type { TransferItem } from "@personal-ui/ui";
import type { TreeItem } from "@personal-ui/ui";
import { SurveyBuilder, Editor } from "@personal-ui/ui";
import { FormBuilderV2 } from "@personal-ui/ui";
import type { ComponentEntry } from "./types";
import { bool, num, pick, str } from "./demo";
import { jsx } from "../lib/jsx";

const CONTROL_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const controlSizeOptions = CONTROL_SIZES.map((value) => ({ label: value, value }));
const COLOR_FORMAT_OPTIONS = (["hex", "rgb", "hsl"] as const).map((value) => ({ label: value, value }));

const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "sprint", start: new Date(2026, 1, 9), end: new Date(2026, 1, 11), label: "Sprint", status: "info" },
  { id: "launch", start: new Date(2026, 1, 24), label: "Launch", status: "success" },
];

const SMALL_SIZES = ["sm", "md"] as const;
const smallSizeOptions = SMALL_SIZES.map((value) => ({ label: value, value }));

const ORIENTATION_OPTIONS = [
  { label: "vertical", value: "vertical" },
  { label: "horizontal", value: "horizontal" },
];

const PEOPLE_OPTIONS = [
  { value: "ada", label: "Ada Lovelace", description: "Engineering", group: "Engineering" },
  { value: "grace", label: "Grace Hopper", description: "Engineering", group: "Engineering" },
  { value: "margaret", label: "Margaret Hamilton", description: "Engineering", group: "Engineering" },
  { value: "alan", label: "Alan Turing", description: "Research", group: "Research" },
  { value: "katherine", label: "Katherine Johnson", description: "Research", group: "Research" },
  { value: "edsger", label: "Edsger Dijkstra", description: "Research", group: "Research", disabled: true },
];

const TEAM_OPTIONS = [
  { value: "eng", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "product", label: "Product" },
  { value: "research", label: "Research" },
  { value: "ops", label: "Operations" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
];

function FormDemo() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  const form = useForm({
    initialValues: { name: "", email: "", terms: false },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.name.trim()) errors.name = "Name is required";
      if (values.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) {
        errors.email = "Enter a valid email address";
      }
      if (!values.terms) errors.terms = "You must accept the terms";
      return errors;
    },
    onSubmit: (values) => setSubmitted(values.name),
  });

  return (
    <Form
      form={form}
      style={{ display: "grid", gap: "1rem", maxWidth: "24rem" }}
      aria-label="Account form"
    >
      <FormField name="name" label="Name" required>
        <Input placeholder="Ada Lovelace" {...form.bind("name")} />
      </FormField>
      <FormField name="email" label="Email" description="Used only for notifications.">
        <Input type="email" placeholder="ada@example.com" {...form.bind("email")} />
      </FormField>
      <FormField name="terms" label="Agreement">
        <Checkbox label="I accept the terms" {...form.bindCheckbox("terms")} />
      </FormField>
      <FormActions>
        <Button type="submit" loading={form.isSubmitting}>
          Create account
        </Button>
      </FormActions>
      {submitted ? <p>Welcome aboard, {submitted}!</p> : null}
    </Form>
  );
}

function FormBuilderDemo() {
  const [saved, setSaved] = useState(false);
  const form = useForm({
    initialValues: { name: "", email: "", role: "eng", active: true },
    onSubmit: () => setSaved(true),
  });
  return (
    <Form form={form} aria-label="Profile form">
      <FormBuilder
        form={form}
        columns={2}
        fields={[
          { name: "name", label: "Full name", type: "text", placeholder: "Ada Lovelace", colSpan: 2 },
          { name: "email", label: "Email", type: "email", placeholder: "ada@example.com" },
          {
            name: "role",
            label: "Role",
            type: "select",
            options: [
              { label: "Engineering", value: "eng" },
              { label: "Design", value: "design" },
              { label: "Product", value: "product" },
            ],
          },
          { name: "active", label: "Active", type: "switch", colSpan: 2 },
        ]}
      />
      <div style={{ marginTop: "1rem" }}>
        <Button type="submit">Save profile</Button>
        {saved ? <span style={{ marginLeft: "0.75rem" }}>Saved!</span> : null}
      </div>
    </Form>
  );
}

function AutocompleteDemo() {
  const [value, setValue] = useState("");
  return (
    <div style={{ maxWidth: "20rem" }}>
      <Autocomplete
        value={value}
        onChange={setValue}
        label="City"
        placeholder="Start typing a city…"
        options={[
          { value: "amsterdam", label: "Amsterdam" },
          { value: "berlin", label: "Berlin" },
          { value: "lisbon", label: "Lisbon" },
          { value: "london", label: "London" },
          { value: "madrid", label: "Madrid" },
        ]}
      />
      <p style={{ marginTop: "0.75rem" }}>Value: {value || "—"}</p>
    </div>
  );
}

function DateTimeDemo() {
  const [value, setValue] = useState<string | null>("2026-02-10T09:30");
  return (
    <div style={{ maxWidth: "22rem" }}>
      <DateTimePicker value={value ?? ""} onValueChange={setValue} label="Starts at" seconds />
      <p style={{ marginTop: "0.75rem" }}>Value: {value ?? "—"}</p>
    </div>
  );
}

function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div style={{ maxWidth: "26rem" }}>
      <FileUpload multiple onChange={setFiles} accept="image/*,.pdf" hint="PNG, JPG, or PDF" />
      <p style={{ marginTop: "0.75rem" }}>{files.length} file(s) selected</p>
    </div>
  );
}

const REGION_TREE: TreeItem[] = [
  {
    key: "emea",
    label: "EMEA",
    children: [
      {
        key: "eu",
        label: "European Union",
        children: [
          { key: "fr", label: "France" },
          { key: "de", label: "Germany" },
          { key: "es", label: "Spain" },
        ],
      },
      { key: "uk", label: "United Kingdom" },
    ],
  },
  {
    key: "amer",
    label: "Americas",
    children: [
      { key: "us", label: "United States" },
      { key: "br", label: "Brazil" },
    ],
  },
  { key: "apac", label: "APAC", children: [{ key: "jp", label: "Japan" }] },
];

const REGION_OPTIONS: CascaderOption[] = [
  {
    value: "emea",
    label: "EMEA",
    children: [
      {
        value: "eu",
        label: "European Union",
        children: [
          { value: "fr", label: "France" },
          { value: "de", label: "Germany" },
          { value: "es", label: "Spain" },
        ],
      },
      { value: "uk", label: "United Kingdom" },
    ],
  },
  {
    value: "amer",
    label: "Americas",
    children: [
      { value: "us", label: "United States" },
      { value: "br", label: "Brazil" },
    ],
  },
  { value: "apac", label: "APAC", children: [{ value: "jp", label: "Japan" }] },
];

const TRANSFER_ITEMS: TransferItem[] = [
  { key: "read", label: "Read", description: "View records" },
  { key: "write", label: "Write", description: "Create and edit" },
  { key: "delete", label: "Delete", description: "Remove records" },
  { key: "billing", label: "Billing", description: "Manage invoices" },
  { key: "admin", label: "Admin", description: "Workspace settings" },
];

function RatingDemo({ value, readOnly, disabled }: { value: number; readOnly: boolean; disabled: boolean }) {
  const [score, setScore] = useState(value || 3);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--ui-p-space-3)" }}>
      <Rating
        label="Score"
        value={readOnly ? value : score}
        onValueChange={setScore}
        readOnly={readOnly}
        disabled={disabled}
      />
      <span style={{ fontSize: "var(--ui-p-text-sm)", color: "var(--ui-muted)" }}>
        {readOnly ? value : score} / 5
      </span>
    </div>
  );
}

const SEGMENTED_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month", disabled: true },
];

function SegmentedControlDemo({
  size,
  fullWidth,
  disabled,
}: {
  size: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth: boolean;
  disabled: boolean;
}) {
  const [value, setValue] = useState("week");

  return (
    <div style={{ width: fullWidth ? 420 : undefined }}>
      <SegmentedControl
        options={SEGMENTED_OPTIONS}
        label="Range"
        value={value}
        onValueChange={setValue}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
      />
    </div>
  );
}

function InputMaskDemo({
  size,
  invalid,
  disabled,
}: {
  size: "xs" | "sm" | "md" | "lg" | "xl";
  invalid: boolean;
  disabled: boolean;
}) {
  const [phone, setPhone] = useState("");

  return (
    <div style={{ display: "flex", width: 280, flexDirection: "column", gap: 8 }}>
      <InputMask
        mask="(999) 999-9999"
        value={phone}
        onValueChange={(next) => setPhone(next)}
        aria-label="Phone number"
        size={size}
        invalid={invalid}
        disabled={disabled}
      />
      <span style={{ fontSize: "var(--ui-p-text-xs)", color: "var(--ui-muted)" }}>
        Raw value: {phone.replace(/\D/g, "") || "—"}
      </span>
    </div>
  );
}

function ColorPickerDemo({
  format,
  withAlpha,
  showValue,
  size,
  invalid,
  disabled,
}: {
  format: "hex" | "rgb" | "hsl";
  withAlpha: boolean;
  showValue: boolean;
  size: ControlSize;
  invalid: boolean;
  disabled: boolean;
}) {
  const [color, setColor] = useState("#6c70f2");

  return (
    <div style={{ display: "flex", width: 280, flexDirection: "column", gap: 8 }}>
      <ColorPicker
        label="Accent"
        value={color}
        onValueChange={setColor}
        format={format}
        withAlpha={withAlpha}
        showValue={showValue}
        size={size}
        invalid={invalid}
        disabled={disabled}
      />
      <span style={{ fontSize: "var(--ui-p-text-xs)", color: "var(--ui-muted)" }}>
        Value: {color}
      </span>
    </div>
  );
}

function TransferDemo({
  showSearch,
  oneWay,
  disabled,
}: {
  showSearch: boolean;
  oneWay: boolean;
  disabled: boolean;
}) {
  const [keys, setKeys] = useState<string[]>(["read", "write"]);

  return (
    <div style={{ width: 560 }}>
      <Transfer
        dataSource={TRANSFER_ITEMS}
        targetKeys={keys}
        onChange={(next) => setKeys(next)}
        titles={["Available", "Granted"]}
        label="Permissions"
        showSearch={showSearch}
        oneWay={oneWay}
        disabled={disabled}
      />
    </div>
  );
}

function CascaderDemo({
  size,
  changeOnSelect,
  clearable,
  invalid,
  disabled,
}: {
  size: "xs" | "sm" | "md" | "lg" | "xl";
  changeOnSelect: boolean;
  clearable: boolean;
  invalid: boolean;
  disabled: boolean;
}) {
  const [value, setValue] = useState<string[] | null>(["emea", "eu", "de"]);

  return (
    <div style={{ width: 300 }}>
      <Cascader
        options={REGION_OPTIONS}
        value={value}
        onChange={(path) => setValue(path)}
        label="Region"
        placeholder="Pick a region…"
        size={size}
        changeOnSelect={changeOnSelect}
        clearable={clearable}
        invalid={invalid}
        disabled={disabled}
      />
    </div>
  );
}

function TreeSelectDemo({
  size,
  searchable,
  clearable,
  showPath,
  invalid,
  disabled,
}: {
  size: "xs" | "sm" | "md" | "lg" | "xl";
  searchable: boolean;
  clearable: boolean;
  showPath: boolean;
  invalid: boolean;
  disabled: boolean;
}) {
  const [value, setValue] = useState<string | null>("fr");

  return (
    <div style={{ width: 280 }}>
      <TreeSelect
        items={REGION_TREE}
        value={value}
        onValueChange={setValue}
        label="Region"
        placeholder="Pick a region…"
        size={size}
        searchable={searchable}
        clearable={clearable}
        showPathInTrigger={showPath}
        invalid={invalid}
        disabled={disabled}
      />
    </div>
  );
}

function InlineEditDemo({
  initialValue,
  size,
  multiline,
  showActions,
  disabled,
  readOnly,
  submitOnBlur,
}: {
  initialValue: string;
  size: "sm" | "md" | "lg";
  multiline: boolean;
  showActions: boolean;
  disabled: boolean;
  readOnly: boolean;
  submitOnBlur: boolean;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <InlineEdit
      value={value}
      onValueChange={setValue}
      label="Project name"
      size={size}
      multiline={multiline}
      showActions={showActions}
      disabled={disabled}
      readOnly={readOnly}
      submitOnBlur={submitOnBlur}
    />
  );
}

export const formsEntries: ComponentEntry[] = [
  {
    id: "checkbox",
    name: "Checkbox",
    category: "Forms",
    description: "Native checkbox with a custom indicator and indeterminate support.",
    keywords: ["check", "tick", "boolean", "selection", "indeterminate"],
    controls: [
      { name: "label", type: "text", defaultValue: "Accept terms and conditions" },
      { name: "description", type: "text", defaultValue: "" },
      { name: "size", type: "select", defaultValue: "md", options: smallSizeOptions },
      { name: "defaultChecked", type: "boolean", label: "Checked", defaultValue: false },
      { name: "indeterminate", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Checkbox
        label={str(state, "label", "Accept terms and conditions")}
        description={str(state, "description") || undefined}
        size={pick(state, "size", "md")}
        defaultChecked={bool(state, "defaultChecked")}
        indeterminate={bool(state, "indeterminate")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("Checkbox", {
        props: {
          label: str(state, "label", "Accept terms and conditions"),
          description: str(state, "description") || undefined,
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          defaultChecked: bool(state, "defaultChecked") ? true : undefined,
          indeterminate: bool(state, "indeterminate"),
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "label", type: "ReactNode", description: "Label rendered beside the box." },
      { name: "description", type: "ReactNode", description: "Secondary help text, wired via aria-describedby." },
      { name: "indeterminate", type: "boolean", default: "false", description: 'Mixed visual state (e.g. "select all").' },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Control size." },
      { name: "...rest", type: 'Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">', description: "Native input props." },
    ],
    notes: [
      "The indeterminate flag is reflected on the DOM input property; it never submits a value.",
      "Wrap a set of checkboxes in a Fieldset to group and disable them together.",
    ],
  },
  {
    id: "fieldset",
    name: "Fieldset",
    category: "Forms",
    description: "Groups related controls with a legend and native disabled propagation.",
    keywords: ["group", "legend", "form", "section"],
    controls: [
      { name: "legend", type: "text", defaultValue: "Notification preferences" },
      { name: "description", type: "text", defaultValue: "Choose how you want to be notified." },
      { name: "orientation", type: "select", defaultValue: "vertical", options: ORIENTATION_OPTIONS },
      { name: "hideLegend", type: "boolean", label: "Hide legend", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Fieldset
        legend={str(state, "legend", "Notification preferences")}
        description={str(state, "description") || undefined}
        orientation={pick(state, "orientation", "vertical")}
        hideLegend={bool(state, "hideLegend")}
        disabled={bool(state, "disabled")}
      >
        <Checkbox label="Email" defaultChecked />
        <Checkbox label="Push notifications" />
        <Checkbox label="SMS" />
      </Fieldset>
    ),
    code: (state) =>
      jsx("Fieldset", {
        props: {
          legend: str(state, "legend", "Notification preferences"),
          description: str(state, "description") || undefined,
          orientation:
            pick(state, "orientation", "vertical") === "vertical"
              ? undefined
              : pick(state, "orientation", "vertical"),
          hideLegend: bool(state, "hideLegend"),
          disabled: bool(state, "disabled"),
        },
        children: [
          '  <Checkbox label="Email" defaultChecked />',
          '  <Checkbox label="Push notifications" />',
          '  <Checkbox label="SMS" />',
        ].join("\n"),
      }),
    props: [
      { name: "legend", type: "ReactNode", required: true, description: "Group label; may be visually hidden." },
      { name: "description", type: "ReactNode", description: "Introductory text shown below the legend." },
      { name: "hideLegend", type: "boolean", default: "false", description: "Keep the legend for screen readers only." },
      {
        name: "orientation",
        type: '"vertical" | "horizontal"',
        default: '"vertical"',
        description: "Layout of the grouped controls.",
      },
      { name: "disabled", type: "boolean", default: "false", description: "Disables every control inside natively." },
      {
        name: "...rest",
        type: "FieldsetHTMLAttributes<HTMLFieldSetElement>",
        description: "Native fieldset props.",
      },
    ],
    notes: ["A native <fieldset> propagates disabled to all descendants automatically."],
  },
  {
    id: "form-actions",
    name: "FormActions",
    category: "Forms",
    description: "Consistent layout for a form's submit and cancel controls.",
    keywords: ["footer", "buttons", "submit", "cancel"],
    controls: [
      {
        name: "align",
        type: "select",
        defaultValue: "end",
        options: [
          { label: "start", value: "start" },
          { label: "end", value: "end" },
          { label: "between", value: "between" },
        ],
      },
      { name: "sticky", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <FormActions align={pick(state, "align", "end")} sticky={bool(state, "sticky")}>
        <Button variant="ghost">Cancel</Button>
        <Button>Save changes</Button>
      </FormActions>
    ),
    code: (state) =>
      jsx("FormActions", {
        props: {
          align: pick(state, "align", "end") === "end" ? undefined : pick(state, "align", "end"),
          sticky: bool(state, "sticky"),
        },
        children: ['  <Button variant="ghost">Cancel</Button>', "  <Button>Save changes</Button>"].join("\n"),
      }),
    props: [
      {
        name: "align",
        type: '"start" | "end" | "between"',
        default: '"end"',
        description: "Horizontal placement of the actions.",
      },
      { name: "sticky", type: "boolean", default: "false", description: "Pin the actions to the bottom of a scroll container." },
      { name: "...rest", type: "HTMLAttributes<HTMLDivElement>", description: "Native div props." },
    ],
    notes: ["Pairs with a FormField stack; place it as the final child of a <form>."],
  },
  {
    id: "form-field",
    name: "FormField",
    category: "Forms",
    description: "Wires a label, description, and error to a control through generated ids and context.",
    keywords: ["label", "error", "validation", "field"],
    controls: [
      { name: "label", type: "text", defaultValue: "Email address" },
      { name: "description", type: "text", defaultValue: "We'll never share your email." },
      { name: "error", type: "text", defaultValue: "" },
      { name: "orientation", type: "select", defaultValue: "vertical", options: ORIENTATION_OPTIONS },
      { name: "required", type: "boolean", defaultValue: false },
      { name: "optional", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <FormField
        label={str(state, "label", "Email address")}
        description={str(state, "description") || undefined}
        error={str(state, "error") || undefined}
        orientation={pick(state, "orientation", "vertical")}
        required={bool(state, "required")}
        optional={bool(state, "optional")}
        disabled={bool(state, "disabled")}
      >
        <Input type="email" placeholder="you@example.com" />
      </FormField>
    ),
    code: (state) =>
      jsx("FormField", {
        props: {
          label: str(state, "label", "Email address"),
          description: str(state, "description") || undefined,
          error: str(state, "error") || undefined,
          orientation:
            pick(state, "orientation", "vertical") === "vertical"
              ? undefined
              : pick(state, "orientation", "vertical"),
          required: bool(state, "required"),
          optional: bool(state, "optional"),
          disabled: bool(state, "disabled"),
        },
        children: '<Input type="email" placeholder="you@example.com" />',
      }),
    props: [
      { name: "label", type: "ReactNode", description: "Field label; linked via htmlFor." },
      { name: "description", type: "ReactNode", description: "Help text connected with aria-describedby." },
      { name: "error", type: "ReactNode", description: "When set, marks the field invalid and announces the message." },
      { name: "required", type: "boolean", default: "false", description: "Marks the label and control required." },
      { name: "optional", type: "boolean", default: "false", description: "Shows an optional hint on the label." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the contained control." },
      { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Label/control layout." },
    ],
    notes: [
      "Field state is shared via context, so Input, Select, and friends configure themselves automatically.",
      "useFormField() reads the wiring; useRequiredFormField() throws when no field is present.",
    ],
  },
  {
    id: "input",
    name: "Input",
    category: "Forms",
    description: "Text input that supports every native input type.",
    keywords: ["text", "email", "field", "control"],
    controls: [
      {
        name: "type",
        type: "select",
        defaultValue: "text",
        options: [
          { label: "text", value: "text" },
          { label: "email", value: "email" },
          { label: "password", value: "password" },
          { label: "number", value: "number" },
          { label: "search", value: "search" },
          { label: "tel", value: "tel" },
          { label: "url", value: "url" },
        ],
      },
      { name: "placeholder", type: "text", defaultValue: "you@example.com" },
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "defaultValue", type: "text", label: "Value", defaultValue: "" },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "required", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Input
        type={pick(state, "type", "text")}
        placeholder={str(state, "placeholder", "you@example.com")}
        size={pick(state, "size", "md")}
        defaultValue={str(state, "defaultValue")}
        invalid={bool(state, "invalid")}
        required={bool(state, "required")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("Input", {
        props: {
          type: pick(state, "type", "text") === "text" ? undefined : pick(state, "type", "text"),
          placeholder: str(state, "placeholder", "you@example.com"),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          defaultValue: str(state, "defaultValue") || undefined,
          invalid: bool(state, "invalid"),
          required: bool(state, "required"),
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "type", type: "HTMLInputTypeAttribute", default: '"text"', description: "Any native input type." },
      { name: "size", type: "ControlSize", default: '"md"', description: '"xs" through "xl".' },
      { name: "invalid", type: "boolean", default: "false", description: "Applies invalid styling and aria-invalid." },
      { name: "...rest", type: 'Omit<InputHTMLAttributes<HTMLInputElement>, "size">', description: "Native input props." },
    ],
    notes: ["Inside a FormField, id, aria-describedby, required, and disabled are inherited from the field."],
  },
  {
    id: "input-group",
    name: "InputGroup",
    category: "Forms",
    description: "Attaches addons and action buttons flush to an input.",
    keywords: ["addon", "prefix", "suffix", "input", "affix"],
    controls: [
      { name: "addon", type: "text", label: "Addon", defaultValue: "https://" },
      { name: "placeholder", type: "text", defaultValue: "example.com" },
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "showButton", type: "boolean", label: "Action button", defaultValue: true },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => {
      const disabled = bool(state, "disabled");
      return (
        <InputGroup size={pick(state, "size", "md")} invalid={bool(state, "invalid")} disabled={disabled}>
          <InputGroup.Addon>{str(state, "addon", "https://")}</InputGroup.Addon>
          <Input placeholder={str(state, "placeholder", "example.com")} disabled={disabled} />
          {bool(state, "showButton") ? (
            <InputGroup.Button disabled={disabled}>
              <Copy size={14} aria-hidden="true" />
              Copy
            </InputGroup.Button>
          ) : null}
        </InputGroup>
      );
    },
    code: (state) => {
      const lines = [
        `  <InputGroup.Addon>${str(state, "addon", "https://")}</InputGroup.Addon>`,
        `  <Input placeholder="${str(state, "placeholder", "example.com")}" />`,
      ];
      if (bool(state, "showButton")) lines.push("  <InputGroup.Button>Copy</InputGroup.Button>");
      return jsx("InputGroup", {
        props: {
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          invalid: bool(state, "invalid"),
          disabled: bool(state, "disabled"),
        },
        children: lines.join("\n"),
      });
    },
    props: [
      { name: "size", type: "ControlSize", default: '"md"', description: "Matches the attached control." },
      { name: "invalid", type: "boolean", default: "false", description: "Invalid styling for the whole group." },
      { name: "disabled", type: "boolean", default: "false", description: "Marks the group disabled." },
      { name: "InputGroup.Addon", type: "position?: \"start\" | \"end\"", description: "Static text or prefix/suffix content." },
      { name: "InputGroup.Button", type: "ButtonHTMLAttributes", description: "An action button attached flush to the group." },
    ],
    notes: ["Compose any `.ui-control` between the addons and buttons; defaults to type=\"button\" on actions."],
  },
  {
    id: "input-otp",
    name: "InputOTP",
    category: "Forms",
    description: "Segmented one-time-password input with paste support and full keyboard navigation.",
    keywords: ["otp", "pin", "code", "verification", "2fa"],
    controls: [
      { name: "length", type: "number", defaultValue: 6, min: 4, max: 8, step: 1 },
      {
        name: "type",
        type: "select",
        defaultValue: "numeric",
        options: [
          { label: "numeric", value: "numeric" },
          { label: "text", value: "text" },
        ],
      },
      { name: "defaultValue", type: "text", label: "Code", defaultValue: "" },
      { name: "groupSize", type: "number", label: "Group size", defaultValue: 0, min: 0, max: 4, step: 1 },
      { name: "mask", type: "boolean", defaultValue: false },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <InputOTP
        length={num(state, "length", 6)}
        type={pick(state, "type", "numeric")}
        defaultValue={str(state, "defaultValue")}
        groupSize={num(state, "groupSize", 0) || undefined}
        mask={bool(state, "mask")}
        invalid={bool(state, "invalid")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("InputOTP", {
        props: {
          length: num(state, "length", 6) === 6 ? undefined : num(state, "length", 6),
          type: pick(state, "type", "numeric") === "numeric" ? undefined : pick(state, "type", "numeric"),
          defaultValue: str(state, "defaultValue") || undefined,
          groupSize: num(state, "groupSize", 0) || undefined,
          mask: bool(state, "mask"),
          invalid: bool(state, "invalid"),
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "length", type: "number", default: "6", description: "Number of segments." },
      { name: "value / defaultValue", type: "string", description: "Controlled/default code value." },
      { name: "onValueChange", type: "(value: string) => void", description: "Fires on every change." },
      { name: "onComplete", type: "(value: string) => void", description: "Fires once all segments are filled." },
      { name: "type", type: '"numeric" | "text"', default: '"numeric"', description: "Digit-only or free text." },
      { name: "mask", type: "boolean", default: "false", description: "Mask entered characters." },
      { name: "groupSize", type: "number", description: "Insert a visual gap after every N segments." },
      { name: "name", type: "string", description: "Adds a hidden input carrying the code." },
    ],
    notes: ["Pasting a code fills every segment; arrow, Home, and End keys move between cells."],
  },
  {
    id: "number-input",
    name: "NumberInput",
    category: "Forms",
    description: "Numeric input with validation, clamping, and optional stepper controls.",
    keywords: ["number", "stepper", "quantity", "spinner"],
    controls: [
      { name: "defaultValue", type: "number", label: "Value", defaultValue: 1 },
      { name: "min", type: "number", defaultValue: 0, step: 1 },
      { name: "max", type: "number", defaultValue: 100, step: 1 },
      { name: "step", type: "number", defaultValue: 1, min: 1, step: 1 },
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "stepper", type: "boolean", defaultValue: true },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <NumberInput
        aria-label="Quantity"
        defaultValue={num(state, "defaultValue", 1)}
        min={num(state, "min", 0)}
        max={num(state, "max", 100)}
        step={num(state, "step", 1)}
        size={pick(state, "size", "md")}
        stepper={bool(state, "stepper")}
        invalid={bool(state, "invalid")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("NumberInput", {
        props: {
          defaultValue: num(state, "defaultValue", 1),
          min: num(state, "min", 0) === 0 ? undefined : num(state, "min", 0),
          max: num(state, "max", 100) === 100 ? undefined : num(state, "max", 100),
          step: num(state, "step", 1) === 1 ? undefined : num(state, "step", 1),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          stepper: bool(state, "stepper") ? undefined : false,
          invalid: bool(state, "invalid"),
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "value / defaultValue", type: "number | null", description: "Controlled/default numeric value." },
      { name: "onValueChange", type: "(value: number | null) => void", description: "Fires whenever the value changes." },
      { name: "min / max", type: "number", description: "Bounds applied on blur and when stepping." },
      { name: "step", type: "number", default: "1", description: "Increment used by the steppers and arrow keys." },
      { name: "stepper", type: "boolean", default: "true", description: "Show increment/decrement controls." },
      { name: "size", type: "ControlSize", default: '"md"', description: "Control height and padding." },
    ],
    notes: ["The empty string clears the value and reports null; out-of-range entries clamp on blur."],
  },
  {
    id: "password-input",
    name: "PasswordInput",
    category: "Forms",
    description: "Password field with an accessible show/hide toggle.",
    keywords: ["password", "secret", "reveal", "visibility"],
    controls: [
      { name: "defaultValue", type: "text", label: "Value", defaultValue: "" },
      { name: "placeholder", type: "text", defaultValue: "Enter your password" },
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "showLabel", type: "text", label: "Show label", defaultValue: "Show password" },
      { name: "hideLabel", type: "text", label: "Hide label", defaultValue: "Hide password" },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "required", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <PasswordInput
        defaultValue={str(state, "defaultValue")}
        placeholder={str(state, "placeholder", "Enter your password")}
        size={pick(state, "size", "md")}
        showLabel={str(state, "showLabel", "Show password")}
        hideLabel={str(state, "hideLabel", "Hide password")}
        invalid={bool(state, "invalid")}
        required={bool(state, "required")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("PasswordInput", {
        props: {
          defaultValue: str(state, "defaultValue") || undefined,
          placeholder: str(state, "placeholder", "Enter your password"),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          showLabel: str(state, "showLabel", "Show password") === "Show password" ? undefined : str(state, "showLabel", "Show password"),
          hideLabel: str(state, "hideLabel", "Hide password") === "Hide password" ? undefined : str(state, "hideLabel", "Hide password"),
          invalid: bool(state, "invalid"),
          required: bool(state, "required"),
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "showLabel", type: "string", default: '"Show password"', description: "Accessible label while hidden." },
      { name: "hideLabel", type: "string", default: '"Hide password"', description: "Accessible label while revealed." },
      { name: "...rest", type: "InputProps", description: "All Input props; type is fixed to password." },
    ],
    notes: ["The toggle exposes its state via aria-pressed and keeps the input's form semantics."],
  },
  {
    id: "radio-group",
    name: "RadioGroup",
    category: "Forms",
    description: "Groups a set of radios with a single shared selection.",
    keywords: ["radio", "choice", "option", "select one"],
    controls: [
      { name: "label", type: "text", defaultValue: "Plan" },
      {
        name: "defaultValue",
        type: "select",
        defaultValue: "pro",
        options: [
          { label: "Starter", value: "starter" },
          { label: "Pro", value: "pro" },
          { label: "Business", value: "business" },
        ],
      },
      { name: "orientation", type: "select", defaultValue: "vertical", options: ORIENTATION_OPTIONS },
      { name: "required", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <RadioGroup
        label={str(state, "label", "Plan")}
        defaultValue={pick(state, "defaultValue", "pro")}
        orientation={pick(state, "orientation", "vertical")}
        required={bool(state, "required")}
        disabled={bool(state, "disabled")}
      >
        <Radio value="starter" label="Starter" description="$9 / month" />
        <Radio value="pro" label="Pro" description="$29 / month" />
        <Radio value="business" label="Business" description="$99 / month" />
      </RadioGroup>
    ),
    code: (state) =>
      jsx("RadioGroup", {
        props: {
          label: str(state, "label", "Plan"),
          defaultValue: pick(state, "defaultValue", "pro") === "pro" ? undefined : pick(state, "defaultValue", "pro"),
          orientation:
            pick(state, "orientation", "vertical") === "vertical"
              ? undefined
              : pick(state, "orientation", "vertical"),
          required: bool(state, "required"),
          disabled: bool(state, "disabled"),
        },
        children: [
          '  <Radio value="starter" label="Starter" description="$9 / month" />',
          '  <Radio value="pro" label="Pro" description="$29 / month" />',
          '  <Radio value="business" label="Business" description="$99 / month" />',
        ].join("\n"),
      }),
    props: [
      { name: "label", type: "ReactNode", description: "Group label rendered above the radios." },
      { name: "value / defaultValue", type: "string", description: "Controlled/default selected value." },
      { name: "onValueChange", type: "(value: string) => void", description: "Fires when the selection changes." },
      { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Layout axis." },
      { name: "required", type: "boolean", default: "false", description: "Marks the group required." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables every radio in the group." },
      { name: "Radio", type: "value: string; label?: ReactNode; description?: ReactNode; size?: \"sm\" | \"md\"", description: "A single option, wired to the group." },
    ],
    notes: ["The group provides name, selection state, and disabled propagation to each Radio via context."],
  },
  {
    id: "search-input",
    name: "SearchInput",
    category: "Forms",
    description: "Text input with a leading search icon and a clear affordance.",
    keywords: ["search", "filter", "find", "clear"],
    controls: [
      { name: "placeholder", type: "text", defaultValue: "Search components" },
      { name: "defaultValue", type: "text", label: "Value", defaultValue: "" },
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "clearable", type: "boolean", defaultValue: true },
      { name: "clearLabel", type: "text", label: "Clear label", defaultValue: "Clear search" },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <SearchInput
        placeholder={str(state, "placeholder", "Search components")}
        defaultValue={str(state, "defaultValue")}
        size={pick(state, "size", "md")}
        clearable={bool(state, "clearable")}
        clearLabel={str(state, "clearLabel", "Clear search")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("SearchInput", {
        props: {
          placeholder: str(state, "placeholder", "Search components"),
          defaultValue: str(state, "defaultValue") || undefined,
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          clearable: bool(state, "clearable") ? undefined : false,
          clearLabel: str(state, "clearLabel", "Clear search") === "Clear search" ? undefined : str(state, "clearLabel", "Clear search"),
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "clearable", type: "boolean", default: "true", description: "Show the clear button when a value is present." },
      { name: "clearLabel", type: "string", default: '"Clear search"', description: "Accessible label for the clear button." },
      { name: "onClear", type: "() => void", description: "Fired when the clear button is pressed." },
      { name: "...rest", type: "InputProps", description: "All Input props; type is fixed to search." },
    ],
    notes: ["Works controlled or uncontrolled; the clear button appears only when the field is non-empty."],
  },
  {
    id: "select",
    name: "Select",
    category: "Forms",
    description: "Accessible single-selection control backed by the native select element.",
    keywords: ["dropdown", "picker", "option", "choose"],
    controls: [
      { name: "placeholder", type: "text", defaultValue: "Select a team" },
      {
        name: "defaultValue",
        type: "select",
        defaultValue: "",
        options: [
          { label: "None", value: "" },
          { label: "Engineering", value: "engineering" },
          { label: "Design", value: "design" },
          { label: "Product", value: "product" },
        ],
      },
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "required", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Select
        aria-label="Team"
        placeholder={str(state, "placeholder", "Select a team") || undefined}
        defaultValue={pick(state, "defaultValue", "")}
        size={pick(state, "size", "md")}
        invalid={bool(state, "invalid")}
        required={bool(state, "required")}
        disabled={bool(state, "disabled")}
      >
        <option value="engineering">Engineering</option>
        <option value="design">Design</option>
        <option value="product">Product</option>
      </Select>
    ),
    code: (state) =>
      jsx("Select", {
        props: {
          placeholder: str(state, "placeholder", "Select a team") || undefined,
          defaultValue: pick(state, "defaultValue", "") || undefined,
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          invalid: bool(state, "invalid"),
          required: bool(state, "required"),
          disabled: bool(state, "disabled"),
        },
        children: [
          '  <option value="engineering">Engineering</option>',
          '  <option value="design">Design</option>',
          '  <option value="product">Product</option>',
        ].join("\n"),
      }),
    props: [
      { name: "placeholder", type: "string", description: "Hidden, disabled first option." },
      { name: "size", type: "ControlSize", default: '"md"', description: "Control height and padding." },
      { name: "invalid", type: "boolean", default: "false", description: "Invalid styling and aria-invalid." },
      { name: "multiple", type: "boolean", default: "false", description: "Allow multiple selection; hides the chevron when set." },
      { name: "...rest", type: 'Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">', description: "Native select props." },
    ],
    notes: ["Rendering a real <select> gives correct keyboard, mobile, and form-submission behavior for free."],
  },
  {
    id: "combobox",
    name: "Combobox",
    category: "Forms",
    description: "Searchable single-select combobox with a custom listbox, grouping, and descriptions.",
    keywords: ["combobox", "autocomplete", "search select", "typeahead", "picker"],
    controls: [
      { name: "placeholder", type: "text", defaultValue: "Search people…" },
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "clearable", type: "boolean", defaultValue: true },
      { name: "loading", type: "boolean", defaultValue: false },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Combobox
        options={PEOPLE_OPTIONS}
        placeholder={str(state, "placeholder", "Search people…")}
        size={pick(state, "size", "md")}
        clearable={bool(state, "clearable")}
        loading={bool(state, "loading")}
        invalid={bool(state, "invalid")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("Combobox", {
        props: {
          options:
            '[{ value: "ada", label: "Ada Lovelace", group: "Engineering" }, { value: "alan", label: "Alan Turing", group: "Research" }]',
          placeholder: str(state, "placeholder", "Search people…"),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          clearable: bool(state, "clearable") ? undefined : false,
          loading: bool(state, "loading"),
          invalid: bool(state, "invalid"),
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "options", type: "SelectOption<T>[]", description: "Options with optional group, description, icon, and disabled." },
      { name: "value / defaultValue / onChange", type: "T | null", description: "Controlled or uncontrolled single selection." },
      { name: "filterFn", type: "(option, query) => boolean", description: "Custom search predicate." },
      { name: "renderOption", type: "(option, state) => ReactNode", description: "Custom option renderer." },
      { name: "clearable", type: "boolean", default: "true", description: "Show a clear button when a value is set." },
      { name: "loading / error", type: "boolean | ReactNode", description: "Async and error states for the popup." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean", description: "Controlled popup visibility." },
    ],
    notes: [
      "Prefer Combobox over Select when search, grouping, or rich option content is required; Select stays natively backed for simple cases.",
      "The text input is the ARIA combobox; the popup listbox is linked via aria-controls and aria-activedescendant.",
    ],
  },
  {
    id: "multiselect",
    name: "MultiSelect",
    category: "Forms",
    description: "Multi-selection control with chips, search, overflow handling, and a shared listbox.",
    keywords: ["multiselect", "tags", "chips", "tokens", "multi"],
    controls: [
      { name: "placeholder", type: "text", defaultValue: "Select teams…" },
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "maxVisibleChips", type: "number", label: "Max visible chips", defaultValue: 4, min: 1, max: 7, step: 1 },
      { name: "selectAll", type: "boolean", label: "Select all", defaultValue: true },
      { name: "clearable", type: "boolean", defaultValue: true },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <MultiSelect
        options={TEAM_OPTIONS}
        defaultValue={["eng", "design"]}
        placeholder={str(state, "placeholder", "Select teams…")}
        size={pick(state, "size", "md")}
        maxVisibleChips={num(state, "maxVisibleChips", 4)}
        selectAll={bool(state, "selectAll")}
        clearable={bool(state, "clearable")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("MultiSelect", {
        props: {
          options: '[{ value: "eng", label: "Engineering" }, { value: "design", label: "Design" }]',
          defaultValue: '["eng", "design"]',
          placeholder: str(state, "placeholder", "Select teams…"),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          maxVisibleChips: num(state, "maxVisibleChips", 4),
          selectAll: bool(state, "selectAll") ? undefined : false,
          clearable: bool(state, "clearable") ? undefined : false,
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "options", type: "SelectOption<T>[]", description: "Options to select from." },
      { name: "value / defaultValue / onChange", type: "T[]", description: "Controlled or uncontrolled selection array." },
      { name: "maxSelected", type: "number", description: "Cap selections; further options become disabled." },
      { name: "maxVisibleChips", type: "number", description: "Collapse chips beyond this into a +N indicator." },
      { name: "selectAll", type: "boolean", default: "false", description: "Offer a select-all-filtered action." },
      { name: "renderChip", type: "(option, remove) => ReactNode", description: "Custom chip renderer." },
      { name: "clearable / loading / error", type: "boolean | ReactNode", description: "Affordances and async states." },
    ],
    notes: [
      "Backspace in an empty search removes the last chip; helper chips are announced with aria-selected on each option.",
      "Shares keyboard and filtering logic with Combobox via the same listbox core so the two cannot drift.",
    ],
  },
  {
    id: "tree-select",
    name: "TreeSelect",
    category: "Forms",
    description: "Selects one node from a tree in a floating, searchable popup.",
    keywords: ["tree select", "hierarchy", "cascader", "nested select", "picker"],
    controls: [
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "searchable", type: "boolean", defaultValue: true },
      { name: "clearable", type: "boolean", defaultValue: true },
      { name: "showPath", type: "boolean", label: "Show ancestry", defaultValue: false },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <TreeSelectDemo
        size={pick(state, "size", "md") as "xs" | "sm" | "md" | "lg" | "xl"}
        searchable={bool(state, "searchable", true)}
        clearable={bool(state, "clearable", true)}
        showPath={bool(state, "showPath")}
        invalid={bool(state, "invalid")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      [
        `<TreeSelect`,
        `  items={regions}`,
        `  value={value}`,
        `  onValueChange={setValue}`,
        `  label="Region"`,
        `  placeholder="Pick a region…"`,
        pick(state, "size", "md") === "md" ? null : `  size="${pick(state, "size", "md")}"`,
        bool(state, "searchable", true) ? null : `  searchable={false}`,
        bool(state, "clearable", true) ? null : `  clearable={false}`,
        bool(state, "showPath") ? `  showPathInTrigger` : null,
        bool(state, "invalid") ? `  invalid` : null,
        bool(state, "disabled") ? `  disabled` : null,
        `/>`,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    props: [
      { name: "items", type: "TreeItem<string>[]", required: true, description: "The tree to choose from." },
      { name: "value / defaultValue / onValueChange", type: "string | null", description: "Controlled or uncontrolled selected key." },
      { name: "searchable", type: "boolean", default: "false", description: "Add a filter box; ancestors of matches stay visible." },
      { name: "clearable", type: "boolean", default: "false", description: "Show a clear button when a value is set." },
      { name: "showPathInTrigger", type: "boolean", default: "false", description: "Render the ancestry above the selected label." },
      { name: "expandSelectedPath", type: "boolean", default: "true", description: "Open the branches leading to the current value." },
      { name: "allowParentSelect", type: "boolean", default: "true", description: "Set false to only allow leaf selection." },
      { name: "size / disabled / invalid / required / name", type: "control props", description: "Standard control surface, including a hidden input for forms." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<TreeSelectSlot, string>>", description: "Per-slot overrides: root, trigger, value, placeholder, path, clear, indicator, popup, search, searchInput, tree, empty." },
    ],
    notes: [
      "The trigger is a select-only combobox (`role=\"combobox\"`, aria-haspopup=\"tree\") while the popup keeps the tree's own roving-focus model.",
      "Escape closes the popup and returns focus to the trigger; Tab closes it and moves on.",
      "Filtering prunes to the branches containing a match and expands them automatically.",
      "Inside a FormField it picks up id, description and error wiring via useFieldControl, exactly like the other controls.",
    ],
  },
  {
    id: "cascader",
    name: "Cascader",
    category: "Forms",
    description: "Picks a path through nested options across drilled-in columns.",
    keywords: ["cascade", "nested", "levels", "regions", "breadcrumb", "picker"],
    controls: [
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "changeOnSelect", type: "boolean", label: "Commit parents", defaultValue: false },
      { name: "clearable", type: "boolean", defaultValue: true },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <CascaderDemo
        size={pick(state, "size", "md") as "xs" | "sm" | "md" | "lg" | "xl"}
        changeOnSelect={bool(state, "changeOnSelect")}
        clearable={bool(state, "clearable", true)}
        invalid={bool(state, "invalid")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      [
        `<Cascader`,
        `  options={regions}`,
        `  value={value}`,
        `  onChange={(path) => setValue(path)}`,
        `  label="Region"`,
        `  placeholder="Pick a region…"`,
        pick(state, "size", "md") === "md" ? null : `  size="${pick(state, "size", "md")}"`,
        bool(state, "changeOnSelect") ? `  changeOnSelect` : null,
        bool(state, "clearable", true) ? null : `  clearable={false}`,
        bool(state, "invalid") ? `  invalid` : null,
        bool(state, "disabled") ? `  disabled` : null,
        `/>`,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    props: [
      { name: "options", type: "CascaderOption[]", required: true, description: "`{ value, label, disabled?, children? }` tree of levels." },
      { name: "value / defaultValue / onChange", type: "string[] | null", description: "Controlled or uncontrolled selected path; `onChange` also receives the leaf option." },
      { name: "changeOnSelect", type: "boolean", default: "false", description: "Commit parent rows too instead of only drilling into them." },
      { name: "expandTrigger", type: '"click" | "hover"', default: '"click"', description: "How a parent row opens its child column." },
      { name: "displayRender", type: "(labels, path) => ReactNode", description: "Replace the default “A / B / C” trigger rendering." },
      { name: "clearable / placeholder / label / emptyMessage", type: "standard props", description: "Chrome and copy for the trigger and empty popup." },
      { name: "size / disabled / invalid / required / name / valueSeparator", type: "control props", description: "Standard control surface; `name` submits the joined path through a hidden input." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<CascaderSlot, string>>", description: "Per-slot overrides: root, trigger, value, placeholder, path, clear, indicator, popup, menu, column, menuItem, menuItemLabel, expandIcon, empty." },
    ],
    notes: [
      "One column per level; every column is a `listbox` and the trigger stays focused with `aria-activedescendant` pointing at the highlighted row, so the widget is a single tab stop.",
      "Arrow Right drills in, Arrow Left steps back a level, Arrow Up/Down and Home/End move the highlight, Enter commits or drills.",
      "The trigger is a combobox (`role=\"combobox\"`, aria-haspopup=\"listbox\") inside a FloatingLayer, so outside click, Escape and focus return are handled for you.",
      "Optional clear button and a hidden input for form submission, wired through useFieldControl inside a FormField.",
    ],
  },
  {
    id: "transfer",
    name: "Transfer",
    category: "Forms",
    description: "Dual list for moving many items between a source and a target set.",
    keywords: ["dual list", "shuttle", "move", "permissions", "transfer list"],
    controls: [
      { name: "showSearch", type: "boolean", defaultValue: true, label: "Searchable" },
      { name: "oneWay", type: "boolean", label: "One way", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <TransferDemo
        showSearch={bool(state, "showSearch", true)}
        oneWay={bool(state, "oneWay")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      [
        `<Transfer`,
        `  dataSource={permissions}`,
        `  targetKeys={keys}`,
        `  onChange={(next) => setKeys(next)}`,
        `  titles={["Available", "Granted"]}`,
        `  label="Permissions"`,
        bool(state, "showSearch", true) ? null : `  showSearch={false}`,
        bool(state, "oneWay") ? `  oneWay` : null,
        bool(state, "disabled") ? `  disabled` : null,
        `/>`,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    props: [
      { name: "dataSource", type: "TransferItem[]", required: true, description: "`{ key, label, description?, disabled? }` rows shared by both panels." },
      { name: "targetKeys / defaultTargetKeys / onChange", type: "readonly string[]", description: "Controlled or uncontrolled right-hand keys; `onChange` receives the direction and the moved keys." },
      { name: "titles", type: "[ReactNode, ReactNode]", default: '["Source", "Target"]', description: "Panel headings; each also labels its group." },
      { name: "showSearch / searchPlaceholder / filterOption", type: "boolean | string | fn", description: "Per-side filter box; the default matches string labels case-insensitively." },
      { name: "oneWay", type: "boolean", default: "false", description: "Hide the move-back button." },
      { name: "listHeight / emptyMessage / label", type: "number | string", description: "List viewport height, empty copy and the group's accessible name." },
      { name: "disabled / renderItem", type: "control props", description: "Disable every control, or replace the row label." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<TransferSlot, string>>", description: "Per-slot overrides: root, panel, panelHeader, panelTitle, panelCount, selectAll, search, searchInput, list, item, itemBody, itemLabel, itemDescription, operations, moveRight, moveLeft, empty." },
    ],
    notes: [
      "Each panel keeps its own selection and search, with a select-all box that reports the indeterminate state.",
      "Rows are real checkboxes, so Space toggles them and disabled rows can never move.",
      "The move buttons disable themselves until a movable row is checked; oneWay hides the return button entirely.",
      "onChange reports (targetKeys, direction, movedKeys) so the parent can keep its own model in sync.",
    ],
  },
  {
    id: "input-mask",
    name: "InputMask",
    category: "Forms",
    description: "Text input that keeps its value in a fixed shape while typing.",
    keywords: ["mask", "format", "phone", "date", "pattern", "input"],
    controls: [
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <InputMaskDemo
        size={pick(state, "size", "md") as "xs" | "sm" | "md" | "lg" | "xl"}
        invalid={bool(state, "invalid")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      [
        `<InputMask`,
        `  mask="(999) 999-9999"`,
        `  value={phone}`,
        `  onValueChange={(next) => setPhone(next)}`,
        `  aria-label="Phone number"`,
        pick(state, "size", "md") === "md" ? null : `  size="${pick(state, "size", "md")}"`,
        bool(state, "invalid") ? `  invalid` : null,
        bool(state, "disabled") ? `  disabled` : null,
        `/>`,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    props: [
      { name: "mask", type: "string", required: true, description: "Pattern where `9` is a digit, `a` a letter, `*` alphanumeric and every other character is a literal (escape one with `\\`)." },
      { name: "value / defaultValue / onValueChange", type: "string", description: "Controlled or uncontrolled masked value; the callback also receives the raw characters." },
      { name: "submitMasked / name", type: "boolean | string", description: "A hidden input submits the raw value by default, or the masked one when asked." },
      { name: "placeholder / placeholderChar", type: "string", default: "mask with _", description: "Placeholder text; defaults to the mask with underscores, e.g. `(___) ___-____`." },
      { name: "size / invalid / disabled / required / id", type: "control props", description: "Standard control surface; wires into FormField through useFieldControl." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<InputMaskSlot, string>>", description: "Per-slot overrides: root, input." },
    ],
    notes: [
      "Characters that do not match the current token are dropped, so the value can never be malformed.",
      "Literals are committed only once the token after them is filled, so partial input stays readable.",
      "A numeric-only mask switches the input to `inputMode=\"numeric\"` for the right mobile keypad.",
      "The root exposes `data-complete` once every mask position is filled.",
    ],
  },
  {
    id: "color-picker",
    name: "ColorPicker",
    category: "Forms",
    description: "Swatch trigger with a popup for presets, a native picker, a hex field and alpha.",
    keywords: ["colour", "color", "swatch", "palette", "hex", "rgb", "hsl", "alpha", "picker"],
    controls: [
      { name: "format", type: "select", defaultValue: "hex", options: COLOR_FORMAT_OPTIONS },
      { name: "withAlpha", type: "boolean", label: "With alpha", defaultValue: false },
      { name: "showValue", type: "boolean", label: "Show value", defaultValue: true },
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <ColorPickerDemo
        format={pick(state, "format", "hex") as "hex" | "rgb" | "hsl"}
        withAlpha={bool(state, "withAlpha")}
        showValue={bool(state, "showValue")}
        size={pick(state, "size", "md") as ControlSize}
        invalid={bool(state, "invalid")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      [
        `<ColorPicker`,
        `  label="Accent"`,
        `  value={accent}`,
        `  onValueChange={setAccent}`,
        pick(state, "format", "hex") === "hex" ? null : `  format="${pick(state, "format", "hex")}"`,
        bool(state, "withAlpha") ? `  withAlpha` : null,
        bool(state, "showValue") ? `  showValue` : null,
        pick(state, "size", "md") === "md" ? null : `  size="${pick(state, "size", "md")}"`,
        bool(state, "invalid") ? `  invalid` : null,
        bool(state, "disabled") ? `  disabled` : null,
        `/>`,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    props: [
      { name: "value / defaultValue / onValueChange", type: "string", description: "Controlled or uncontrolled colour; the callback receives the string in the chosen `format`." },
      { name: "format", type: '"hex" | "rgb" | "hsl"', default: '"hex"', description: "Output format for the value, the trigger label and the callback. Hex gains an alpha byte when needed." },
      { name: "withAlpha", type: "boolean", default: "false", description: "Add an opacity slider and let presets keep the current alpha." },
      { name: "swatches", type: "string[]", description: "Preset colours in the popup grid; defaults to a curated ten-swatch palette." },
      { name: "nativeInput", type: "boolean", default: "true", description: "Show the OS colour input inside the popup." },
      { name: "showValue / placement / label", type: "standard props", description: "Value text in the trigger, popup placement and the accessible name of the trigger and dialog." },
      { name: "name / submitFormat", type: "string | \"value\" | \"hex\"", description: "A hidden input submits the formatted value, or the opaque hex when asked." },
      { name: "size / invalid / disabled / id", type: "control props", description: "Standard control surface; wires into FormField through useFieldControl." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<ColorPickerSlot, string>>", description: "Per-slot overrides: root, trigger, swatch, value, indicator, popup, section, label, native, hexInput, alpha, alphaInput, invalid, swatches, swatchButton." },
    ],
    notes: [
      "The popup is a FloatingLayer dialog: Escape, outside clicks, focus return and anchoring are handled for you.",
      "The text field accepts anything the parser understands — hex (3, 4, 6 or 8 digits), rgb()/rgba() and hsl()/hsla() — and reports invalid input next to the field.",
      "Presets show a readable tick, picked from the swatch's relative luminance.",
    ],
  },
  {
    id: "rating",
    name: "Rating",
    category: "Forms",
    description: "Star rating on a native radio group, with hover preview and optional clearing.",
    keywords: ["stars", "score", "review", "feedback", "rate"],
    controls: [
      { name: "value", type: "number", label: "Initial value", defaultValue: 3, min: 0, max: 5, step: 1 },
      { name: "readOnly", type: "boolean", label: "Read only", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <RatingDemo
        value={num(state, "value", 3)}
        readOnly={bool(state, "readOnly")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      [
        `<Rating`,
        `  label="Score"`,
        `  value={score}`,
        `  onValueChange={setScore}`,
        num(state, "value", 3) === 3 ? null : `  defaultValue={${num(state, "value", 3)}}`,
        bool(state, "readOnly") ? `  readOnly` : null,
        bool(state, "disabled") ? `  disabled` : null,
        `/>`,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    props: [
      { name: "value / defaultValue / onValueChange", type: "number", description: "Controlled or uncontrolled rating; `onValueChange(0)` fires when a cleared rating is emptied." },
      { name: "max", type: "number", default: "5", description: "Number of stars." },
      { name: "allowClear", type: "boolean", default: "true", description: "Clicking the current value clears the rating." },
      { name: "readOnly", type: "boolean", default: "false", description: "Render a static `role=\"img\"` value with an “n out of m” name." },
      { name: "icon / renderIcon", type: "ReactNode | fn", description: "Replace the glyph; `renderIcon` receives `{ filled, index }`." },
      { name: "size / disabled / name / label", type: "standard props", description: "Star size, disabling, the shared radio name and the group's accessible label." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<RatingSlot, string>>", description: "Per-slot overrides: root, item, input, icon." },
    ],
    notes: [
      "Each star is a native radio inside a radiogroup, so arrow keys, roving focus and form submission come from the platform.",
      "Hovering previews the value; leaving the group restores the committed one.",
      "A hidden input is not needed — pass `name` and the checked radio submits itself.",
    ],
  },
  {
    id: "segmented-control",
    name: "SegmentedControl",
    category: "Forms",
    description: "Single-select segmented buttons with radio semantics.",
    keywords: ["segmented", "toggle group", "tabs", "switch", "range", "radio"],
    controls: [
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "fullWidth", type: "boolean", label: "Full width", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <SegmentedControlDemo
        size={pick(state, "size", "md") as "xs" | "sm" | "md" | "lg" | "xl"}
        fullWidth={bool(state, "fullWidth")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      [
        `<SegmentedControl`,
        `  options={ranges}`,
        `  label="Range"`,
        `  value={value}`,
        `  onValueChange={setValue}`,
        pick(state, "size", "md") === "md" ? null : `  size="${pick(state, "size", "md")}"`,
        bool(state, "fullWidth") ? `  fullWidth` : null,
        bool(state, "disabled") ? `  disabled` : null,
        `/>`,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    props: [
      { name: "options", type: "SegmentedOption[]", required: true, description: "`{ value, label, icon?, disabled? }` segments." },
      { name: "value / defaultValue / onValueChange", type: "string", description: "Controlled or uncontrolled selection; defaults to the first option." },
      { name: "size / disabled / name", type: "standard props", description: "Segment height, disabling, and the shared radio name for forms." },
      { name: "fullWidth", type: "boolean", default: "false", description: "Stretch the segments evenly across the container." },
      { name: "label", type: "string", description: "Accessible name for the radiogroup." },
      { name: "unstyled", type: "boolean", default: "false", description: "Drop the built-in ui-* classes; behaviour and ARIA stay." },
      { name: "classNames", type: "Partial<Record<SegmentedControlSlot, string>>", description: "Per-slot overrides: root, item, input, icon, label." },
    ],
    notes: [
      "Every segment is a native radio, so arrow keys move the selection and the checked one submits with the form.",
      "The active segment exposes `data-state=\"active\"`; disabled segments drop out of the group without breaking arrow navigation.",
    ],
  },
  {
    id: "calendar",
    name: "Calendar",
    category: "Forms",
    description: "Date grid with single or range selection, localization, and full keyboard navigation.",
    keywords: ["calendar", "date", "month", "grid", "range"],
    controls: [
      {
        name: "mode",
        type: "select",
        defaultValue: "single",
        options: [
          { label: "single", value: "single" },
          { label: "range", value: "range" },
          { label: "multiple", value: "multiple" },
        ],
      },
      { name: "events", type: "boolean", label: "Events", defaultValue: false },
      {
        name: "captionLayout",
        type: "select",
        defaultValue: "label",
        options: [
          { label: "label", value: "label" },
          { label: "dropdown", value: "dropdown" },
        ],
      },
      { name: "numberOfMonths", type: "number", label: "Months", defaultValue: 1, min: 1, max: 2, step: 1 },
      { name: "fixedWeeks", type: "boolean", label: "Fixed weeks", defaultValue: false },
      { name: "showOutsideDays", type: "boolean", label: "Outside days", defaultValue: true },
    ],
    render: (state) => {
      const mode = pick(state, "mode", "single") as string;
      const common = {
        defaultMonth: new Date(2026, 1, 1),
        events: bool(state, "events") ? CALENDAR_EVENTS : undefined,
        captionLayout: pick(state, "captionLayout", "label"),
        numberOfMonths: num(state, "numberOfMonths", 1),
        fixedWeeks: bool(state, "fixedWeeks"),
        showOutsideDays: bool(state, "showOutsideDays"),
        locale: "en-US",
      };
      if (mode === "range") {
        return (
          <Calendar
            mode="range"
            defaultRange={{ from: new Date(2026, 1, 10), to: new Date(2026, 1, 20) }}
            {...common}
          />
        );
      }
      if (mode === "multiple") {
        return (
          <Calendar
            mode="multiple"
            defaultValues={[new Date(2026, 1, 10), new Date(2026, 1, 14)]}
            {...common}
          />
        );
      }
      return <Calendar defaultValue={new Date(2026, 1, 10)} {...common} />;
    },
    code: (state) => {
      const mode = pick(state, "mode", "single") as string;
      const withEvents = bool(state, "events");
      return jsx("Calendar", {
        props: {
          mode: mode === "single" ? undefined : mode,
          defaultValue: mode === "multiple" ? undefined : 'new Date(2026, 1, 10)',
          defaultValues:
            mode === "multiple" ? "[new Date(2026, 1, 10), new Date(2026, 1, 14)]" : undefined,
          defaultMonth: 'new Date(2026, 1, 1)',
          events: withEvents
            ? '[{ start: new Date(2026, 1, 9), end: new Date(2026, 1, 11), label: "Sprint", status: "info" }]'
            : undefined,
          numberOfMonths: num(state, "numberOfMonths", 1) === 1 ? undefined : num(state, "numberOfMonths", 1),
        },
      });
    },
    props: [
      { name: "mode", type: '"single" | "range" | "multiple"', default: '"single"', description: "Selection model." },
      { name: "value / defaultValue / onValueChange", type: "Date | null", description: "Single selection (mode=single)." },
      { name: "range / defaultRange / onRangeChange", type: "CalendarRange", description: "Range selection (mode=range)." },
      { name: "values / defaultValues / onValuesChange", type: "Date[]", description: "Toggleable dates (mode=multiple)." },
      { name: "events", type: "CalendarEvent[]", description: "Dated events highlighted across the grid." },
      { name: "month / defaultMonth / onMonthChange", type: "Date", description: "Visible month." },
      { name: "numberOfMonths", type: "number", default: "1", description: "Months to display side by side." },
      { name: "weekStartsOn", type: "0…6", default: "1", description: "First day of the week." },
      { name: "min / max / disabledWeekdays / isDateDisabled", type: "constraints", description: "Selection bounds and disabled days." },
      { name: "captionLayout", type: '"label" | "dropdown"', default: '"label"', description: "Static caption or month/year dropdowns." },
    ],
    notes: [
      "Arrow keys move days, PageUp/PageDown change months (hold Shift for years), Home/End jump to week edges.",
      "Events span an inclusive start/end and are announced through each day's aria-label; a dot marks days with more than one.",
      "Dates are calendar dates with no time zone shift; see the date utilities for the underlying model.",
    ],
  },
  {
    id: "date-picker",
    name: "DatePicker",
    category: "Forms",
    description: "Read-only date input that opens a popup Calendar.",
    keywords: ["date", "picker", "calendar", "input"],
    controls: [
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "clearable", type: "boolean", defaultValue: true },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <DatePicker
        label="Start date"
        locale="en-US"
        defaultMonth={new Date(2026, 1, 1)}
        defaultValue={new Date(2026, 1, 10)}
        size={pick(state, "size", "md")}
        clearable={bool(state, "clearable")}
        invalid={bool(state, "invalid")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("DatePicker", {
        props: {
          defaultValue: 'new Date(2026, 1, 10)',
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          clearable: bool(state, "clearable") ? undefined : false,
          invalid: bool(state, "invalid"),
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "value / defaultValue / onValueChange", type: "Date | null", description: "Selected date." },
      { name: "min / max / disabledWeekdays / isDateDisabled", type: "constraints", description: "Selection bounds." },
      { name: "format / locale", type: "Intl.DateTimeFormatOptions", description: "Display formatting." },
      { name: "clearable / invalid / disabled / size", type: "—", description: "Standard control affordances." },
    ],
    notes: ["The trigger is read-only so the value is always a real calendar date, never free-typed text."],
  },
  {
    id: "date-range-picker",
    name: "DateRangePicker",
    category: "Forms",
    description: "Two-month range calendar in a popup with hover preview.",
    keywords: ["date", "range", "calendar", "period", "from to"],
    controls: [
      { name: "numberOfMonths", type: "number", label: "Months", defaultValue: 2, min: 1, max: 3, step: 1 },
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "clearable", type: "boolean", defaultValue: true },
    ],
    render: (state) => (
      <DateRangePicker
        label="Period"
        locale="en-US"
        defaultMonth={new Date(2026, 1, 1)}
        defaultValue={{ from: new Date(2026, 1, 10), to: new Date(2026, 1, 20) }}
        numberOfMonths={num(state, "numberOfMonths", 2)}
        size={pick(state, "size", "md")}
        clearable={bool(state, "clearable")}
      />
    ),
    code: (state) =>
      jsx("DateRangePicker", {
        props: {
          defaultValue: '{{ from: new Date(2026, 1, 10), to: new Date(2026, 1, 20) }}',
          defaultMonth: 'new Date(2026, 1, 1)',
          numberOfMonths: num(state, "numberOfMonths", 2),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          clearable: bool(state, "clearable") ? undefined : false,
        },
      }),
    props: [
      { name: "range / defaultRange / onRangeChange", type: "CalendarRange", description: "Start and end dates." },
      { name: "numberOfMonths", type: "number", default: "2", description: "Months shown side by side." },
      { name: "rangeSeparator", type: "string", default: '" – "', description: "Text between the two dates." },
      { name: "min / max / disabledWeekdays / isDateDisabled", type: "constraints", description: "Selection bounds." },
    ],
    notes: ["Clicking a day before the start restarts the range; hovering previews the pending range."],
  },
  {
    id: "time-picker",
    name: "TimePicker",
    category: "Forms",
    description: "Hour/minute/second column picker with 12- or 24-hour cycles.",
    keywords: ["time", "hour", "minute", "clock", "picker"],
    controls: [
      { name: "seconds", type: "boolean", defaultValue: false },
      {
        name: "hourCycle",
        type: "select",
        label: "Hour cycle",
        defaultValue: 24,
        options: [
          { label: "24-hour", value: 24 },
          { label: "12-hour", value: 12 },
        ],
      },
      { name: "step", type: "number", defaultValue: 15, min: 1, max: 30, step: 1 },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <TimePicker
        label="Start time"
        defaultValue="09:30"
        seconds={bool(state, "seconds")}
        hourCycle={Number(pick(state, "hourCycle", 24)) === 12 ? 12 : 24}
        step={num(state, "step", 15)}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("TimePicker", {
        props: {
          defaultValue: "09:30",
          seconds: bool(state, "seconds"),
          hourCycle: Number(pick(state, "hourCycle", 24)) === 12 ? 12 : undefined,
          step: num(state, "step", 15) === 1 ? undefined : num(state, "step", 15),
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "value / defaultValue / onValueChange", type: '"HH:mm" | "HH:mm:ss"', description: "Selected time." },
      { name: "seconds", type: "boolean", default: "false", description: "Include a seconds column." },
      { name: "hourCycle", type: "12 | 24", default: "24", description: "Clock format." },
      { name: "step", type: "number", default: "1", description: "Minute interval." },
      { name: "min / max", type: '"HH:mm"', description: "Selectable-time bounds." },
    ],
    notes: ["Columns are independent listboxes; Up/Down move within a column and Tab moves between them."],
  },
  {
    id: "form",
    name: "Form",
    category: "Forms",
    description: "Form engine with values, touched state, sync/async validation, and submission.",
    keywords: ["form", "validation", "submit", "useForm", "engine"],
    controls: [],
    render: () => <FormDemo />,
    code: () =>
      [
        "const form = useForm({",
        "  initialValues: { name: \"\", email: \"\", terms: false },",
        "  validate: (values) => ({ /* … */ }),",
        "  onSubmit: (values) => save(values),",
        "});",
        "",
        "return (",
        "  <Form form={form}>",
        "    <FormField name=\"name\" label=\"Name\" required>",
        "      <Input {...form.bind(\"name\")} />",
        "    </FormField>",
        "    <FormField name=\"terms\" label=\"Agreement\">",
        "      <Checkbox {...form.bindCheckbox(\"terms\")} label=\"I accept\" />",
        "    </FormField>",
        "    <Button type=\"submit\">Create account</Button>",
        "  </Form>",
        ");",
      ].join("\n"),
    props: [
      { name: "initialValues", type: "T", description: "Starting values for the form." },
      { name: "validate", type: "(values) => errors", description: "Sync or async validator." },
      { name: "onSubmit", type: "(values) => void | Promise<void>", description: "Called after successful validation." },
      { name: "values / errors / touched / isSubmitting / isValid", type: "state", description: "Form state returned by useForm." },
      { name: "setValue / setValues / setError / setTouched / reset", type: "actions", description: "Imperative field updates." },
      { name: "bind / bindCheckbox", type: "(name) => props", description: "Spreadable control bindings." },
      { name: "useField / useController", type: "(form, name) => api", description: "Single-field read/write, with optional transform and field-level validation." },
      { name: "useWatch / useFormState / useFieldArray", type: "hooks", description: "Subscribe to a value or state slice, and manage repeater rows." },
    ],
    notes: [
      "FormField reads errors from the enclosing Form by name and only shows them once the field is touched or the form has been submitted.",
      "Handlers accept either a change event or a plain value, so bind works with Input as well as Combobox/MultiSelect.",
    ],
  },
  {
    id: "form-builder",
    name: "FormBuilder",
    category: "Forms",
    description: "Schema-driven form: describe fields once and let the builder render and wire them.",
    keywords: ["form", "builder", "schema", "generated"],
    controls: [],
    render: () => <FormBuilderDemo />,
    code: () => [
      "<FormBuilder",
      "  form={form}",
      "  columns={2}",
      "  fields={[",
      "    { name: \"name\", label: \"Full name\", type: \"text\", colSpan: 2 },",
      "    { name: \"email\", label: \"Email\", type: \"email\", required: true },",
      "    { name: \"role\", label: \"Role\", type: \"select\", options: roles },",
      "    { name: \"active\", label: \"Active\", type: \"switch\" },",
      "  ]}",
      "/>",
    ].join("\n"),
    props: [
      { name: "form", type: "UseFormReturn<T>", description: "The engine that owns values and errors." },
      { name: "fields", type: "FormBuildField<T>[]", description: "Field schema (label, type, options, colSpan, hidden)." },
      { name: "columns", type: "number", default: "2", description: "Grid columns; collapses to one on narrow screens." },
    ],
    notes: [
      "Field types: text, email, password, number, date, time, textarea, select, checkbox, switch, and custom.",
      "Use type: \"custom\" with a render function for anything the schema can't express.",
    ],
  },
  {
    id: "slider",
    name: "Slider",
    category: "Forms",
    description: "Single-value range slider built on the native input[type=range].",
    keywords: ["range", "slider", "value", "drag"],
    controls: [
      { name: "defaultValue", type: "number", label: "Value", defaultValue: 40, step: 1 },
      { name: "min", type: "number", defaultValue: 0, step: 1 },
      { name: "max", type: "number", defaultValue: 100, step: 1 },
      { name: "step", type: "number", defaultValue: 1, min: 1, step: 1 },
      { name: "size", type: "select", defaultValue: "md", options: smallSizeOptions },
      { name: "showValue", type: "boolean", label: "Show value", defaultValue: true },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Slider
        aria-label="Volume"
        defaultValue={num(state, "defaultValue", 40)}
        min={num(state, "min", 0)}
        max={num(state, "max", 100)}
        step={num(state, "step", 1)}
        size={pick(state, "size", "md")}
        showValue={bool(state, "showValue")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("Slider", {
        props: {
          defaultValue: num(state, "defaultValue", 40),
          min: num(state, "min", 0) === 0 ? undefined : num(state, "min", 0),
          max: num(state, "max", 100) === 100 ? undefined : num(state, "max", 100),
          step: num(state, "step", 1) === 1 ? undefined : num(state, "step", 1),
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          showValue: bool(state, "showValue") ? undefined : false,
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "value / defaultValue", type: "number", default: "0", description: "Controlled/default value." },
      { name: "onValueChange", type: "(value: number) => void", description: "Fires on every change." },
      { name: "min / max", type: "number", default: "0 / 100", description: "Range bounds." },
      { name: "step", type: "number", default: "1", description: "Increment between stops." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Track and thumb size." },
      { name: "showValue", type: "boolean", default: "false", description: "Render the current value beside the track." },
      { name: "formatValue", type: "(value: number) => ReactNode", description: "Custom display and aria-valuetext." },
    ],
    notes: ["The filled track is driven by a CSS custom property, so theming needs no JS layout work."],
  },
  {
    id: "switch",
    name: "Switch",
    category: "Forms",
    description: "Toggle switch built on a native checkbox with role=switch.",
    keywords: ["toggle", "switch", "on off", "boolean"],
    controls: [
      { name: "label", type: "text", defaultValue: "Enable notifications" },
      { name: "description", type: "text", defaultValue: "" },
      { name: "size", type: "select", defaultValue: "md", options: smallSizeOptions },
      { name: "defaultChecked", type: "boolean", label: "Checked", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Switch
        label={str(state, "label", "Enable notifications")}
        description={str(state, "description") || undefined}
        size={pick(state, "size", "md")}
        defaultChecked={bool(state, "defaultChecked")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("Switch", {
        props: {
          label: str(state, "label", "Enable notifications"),
          description: str(state, "description") || undefined,
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          defaultChecked: bool(state, "defaultChecked") ? true : undefined,
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "label", type: "ReactNode", description: "Label rendered beside the track." },
      { name: "description", type: "ReactNode", description: "Secondary help text, wired via aria-describedby." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Track and thumb size." },
      { name: "...rest", type: 'Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">', description: "Native input props." },
    ],
    notes: ["Keeps checkbox semantics while exposing role=switch for assistive technology."],
  },
  {
    id: "textarea",
    name: "Textarea",
    category: "Forms",
    description: "Multi-line text input with optional auto-resize and character count.",
    keywords: ["multiline", "text", "notes", "message"],
    controls: [
      { name: "placeholder", type: "text", defaultValue: "Write a message..." },
      { name: "defaultValue", type: "textarea", label: "Value", defaultValue: "" },
      { name: "size", type: "select", defaultValue: "md", options: controlSizeOptions },
      { name: "minRows", type: "number", label: "Min rows", defaultValue: 3, min: 1, max: 12, step: 1 },
      { name: "maxRows", type: "number", label: "Max rows", defaultValue: 12, min: 1, max: 24, step: 1 },
      { name: "autoResize", type: "boolean", label: "Auto resize", defaultValue: false },
      { name: "showCount", type: "boolean", label: "Show count", defaultValue: false },
      { name: "maxLength", type: "number", label: "Max length", defaultValue: 0, min: 0, step: 1 },
      { name: "invalid", type: "boolean", defaultValue: false },
      { name: "required", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => (
      <Textarea
        placeholder={str(state, "placeholder", "Write a message...")}
        defaultValue={str(state, "defaultValue")}
        size={pick(state, "size", "md")}
        rows={num(state, "minRows", 3)}
        minRows={num(state, "minRows", 3)}
        maxRows={num(state, "maxRows", 12)}
        autoResize={bool(state, "autoResize")}
        showCount={bool(state, "showCount")}
        maxLength={num(state, "maxLength", 0) || undefined}
        invalid={bool(state, "invalid")}
        required={bool(state, "required")}
        disabled={bool(state, "disabled")}
      />
    ),
    code: (state) =>
      jsx("Textarea", {
        props: {
          placeholder: str(state, "placeholder", "Write a message..."),
          defaultValue: str(state, "defaultValue") || undefined,
          size: pick(state, "size", "md") === "md" ? undefined : pick(state, "size", "md"),
          rows: num(state, "minRows", 3) === 3 ? undefined : num(state, "minRows", 3),
          minRows: num(state, "minRows", 3) === 3 ? undefined : num(state, "minRows", 3),
          maxRows: num(state, "maxRows", 12) === 12 ? undefined : num(state, "maxRows", 12),
          autoResize: bool(state, "autoResize"),
          showCount: bool(state, "showCount"),
          maxLength: num(state, "maxLength", 0) || undefined,
          invalid: bool(state, "invalid"),
          required: bool(state, "required"),
          disabled: bool(state, "disabled"),
        },
      }),
    props: [
      { name: "autoResize", type: "boolean", default: "false", description: "Grow height to fit content up to maxRows." },
      { name: "minRows / maxRows", type: "number", default: "3 / 12", description: "Bounding row counts for auto-resize." },
      { name: "showCount", type: "boolean", default: "false", description: "Show a live character counter." },
      { name: "size", type: "ControlSize", default: '"md"', description: "Control height and typography." },
      { name: "invalid", type: "boolean", default: "false", description: "Invalid styling and aria-invalid." },
      { name: "...rest", type: "TextareaHTMLAttributes<HTMLTextAreaElement>", description: "Native textarea props." },
    ],
    notes: ["The character counter uses maxLength when provided; auto-resize respects the computed line height."],
  },
  {
    id: "autocomplete",
    name: "Autocomplete",
    category: "Forms",
    description: "Free-text input with filtered suggestions; values need not match an option.",
    keywords: ["autocomplete", "typeahead", "suggest", "search", "free text"],
    controls: [],
    render: () => <AutocompleteDemo />,
    code: () =>
      [
        '<Autocomplete',
        '  label="City"',
        '  placeholder="Start typing a city…"',
        '  options={cities}',
        '  value={value}',
        '  onChange={setValue}',
        "/>",
      ].join("\n"),
    props: [
      { name: "options", type: "SelectOption<T>[]", required: true, description: "Suggestion list (label/description/icon/keywords)." },
      { name: "value / onChange", type: "string", description: "Free-text value; may not match any option." },
      { name: "onSelectOption", type: "(option) => void", description: "Fired only when a suggestion is picked." },
      { name: "minChars", type: "number", default: "1", description: "Minimum query length before opening." },
      { name: "allowCustom", type: "boolean", default: "true", description: "Permit values outside the option list." },
      { name: "filterFn", type: "(option, query) => boolean", description: "Custom matching strategy." },
    ],
    notes: [
      "Combobox commits only options; Autocomplete keeps arbitrary text.",
      "Arrow keys, Home/End, Enter, and Escape follow the combobox keyboard model.",
    ],
  },
  {
    id: "datetime-picker",
    name: "DateTimePicker",
    category: "Forms",
    description: "Date and time in a single control, combining the calendar with time columns.",
    keywords: ["datetime", "date", "time", "schedule", "picker"],
    controls: [],
    render: () => <DateTimeDemo />,
    code: () =>
      [
        "<DateTimePicker",
        "  label=\"Starts at\"",
        "  seconds",
        "  value={value}",
        "  onValueChange={setValue}",
        "/>",
      ].join("\n"),
    props: [
      { name: "value / onValueChange", type: "string | null", description: "Local `YYYY-MM-DDTHH:mm` (with `:ss` when `seconds`)." },
      { name: "seconds", type: "boolean", default: "false", description: "Include a seconds column." },
      { name: "hourCycle", type: "12 | 24", default: "24", description: "12-hour clock adds an AM/PM column." },
      { name: "step", type: "number", default: "1", description: "Minute interval." },
      { name: "min / max", type: "Date", description: "Selectable date bounds." },
    ],
    notes: [
      "Values are local date-times (no timezone), so they cannot drift across zones.",
      "Composes the shared Calendar, so range/keyboard behaviour is identical.",
    ],
  },
  {
    id: "file-upload",
    name: "FileUpload",
    category: "Forms",
    description: "Drag-and-drop file input with size limits and a removable file list.",
    keywords: ["upload", "file", "dropzone", "attachment", "drag"],
    controls: [],
    render: () => <FileUploadDemo />,
    code: () =>
      [
        '<FileUpload',
        "  multiple",
        '  accept="image/*,.pdf"',
        '  hint="PNG, JPG, or PDF"',
        "  onChange={setFiles}",
        "/>",
      ].join("\n"),
    props: [
      { name: "multiple", type: "boolean", default: "false", description: "Allow more than one file." },
      { name: "accept", type: "string", description: "Comma-separated accept list, e.g. `image/*,.pdf`." },
      { name: "maxSize", type: "number", description: "Per-file byte limit; over-sized files are rejected." },
      { name: "maxFiles", type: "number", description: "Total file cap (defaults to 1 unless `multiple`)." },
      { name: "value / onChange", type: "File[]", description: "Controlled file list." },
    ],
    notes: [
      "The dropzone is a labelled, keyboard-operable button (Enter/Space opens the picker).",
      "A hidden native file input keeps form submission and `required` working.",
    ],
  },
  {
    id: "survey-builder",
    name: "SurveyBuilder",
    category: "Forms",
    description: "Visual survey designer with palette, canvas, inspector, live preview, undo/redo.",
    keywords: ["survey", "builder", "designer", "questionnaire"],
    controls: [],
    render: () => <SurveyBuilder />,
    code: () => "<SurveyBuilder />",
    props: [{ name: "initialSchema / onChange", type: "SurveySchema", description: "Controlled/uncontrolled survey definition." }],
    notes: ["Ships a versioned JSON schema; renderer works independently."],
  },
  {
    id: "form-builder-v2",
    name: "FormBuilderV2",
    category: "Forms",
    description: "Visual form designer with groups, multi-column layout, and field inspector.",
    keywords: ["form", "builder", "designer", "fields"],
    controls: [],
    render: () => <FormBuilderV2 />,
    code: () => "<FormBuilderV2 />",
    props: [{ name: "initialSchema / onChange", type: "FormSchema", description: "Controlled/uncontrolled form definition." }],
    notes: ["Shares the generic builder framework with SurveyBuilder."],
  },
  {
    id: "rich-text-editor",
    name: "Editor",
    category: "Forms",
    description: "Rich-text editor with toolbar, placeholders, and serialization.",
    keywords: ["editor","richtext","wysiwyg","content"],
    controls: [],
    render: () => <Editor placeholder="Start typing..." />,
    code: () => "<Editor />",
    props: [{ name: "value / onChange", type: "string", description: "Controlled HTML content." }],
    notes: ["Supports placeholders via {{key}} syntax."],
  },
  {
    id: "inline-edit",
    name: "InlineEdit",
    category: "Forms",
    description: "Click-to-edit text with keyboard save/cancel and blur-to-commit.",
    keywords: ["inline", "edit", "editable", "rename", "click to edit"],
    controls: [
      { name: "value", type: "text", label: "Value", defaultValue: "Untitled project" },
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
      { name: "multiline", type: "boolean", defaultValue: false },
      { name: "showActions", type: "boolean", defaultValue: false },
      { name: "submitOnBlur", type: "boolean", defaultValue: true },
      { name: "readOnly", type: "boolean", defaultValue: false },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    render: (state) => {
      const initialValue = str(state, "value", "Untitled project");
      return (
        <InlineEditDemo
          key={initialValue}
          initialValue={initialValue}
          size={pick(state, "size", "md")}
          multiline={bool(state, "multiline")}
          showActions={bool(state, "showActions")}
          submitOnBlur={bool(state, "submitOnBlur", true)}
          readOnly={bool(state, "readOnly")}
          disabled={bool(state, "disabled")}
        />
      );
    },
    code: (state) => {
      const props: Record<string, string | number | boolean> = {
        defaultValue: str(state, "value", "Untitled project"),
        label: "Project name",
      };
      if (pick(state, "size", "md") !== "md") props.size = String(pick(state, "size", "md"));
      if (bool(state, "multiline")) props.multiline = true;
      if (bool(state, "showActions")) props.showActions = true;
      if (!bool(state, "submitOnBlur", true)) props.submitOnBlur = false;
      if (bool(state, "readOnly")) props.readOnly = true;
      if (bool(state, "disabled")) props.disabled = true;
      return jsx("InlineEdit", { props });
    },
    props: [
      { name: "value / defaultValue", type: "string", description: "Controlled or initial text." },
      { name: "onValueChange", type: "(value: string) => void", description: "Fires on every edit." },
      { name: "onSubmit / onCancel", type: "(value: string) => void", description: "Commit and cancel callbacks." },
      { name: "editing / defaultEditing", type: "boolean", description: "Controlled or initial edit mode." },
      { name: "multiline", type: "boolean", default: "false", description: "Use a textarea; Ctrl/Cmd+Enter commits." },
      { name: "submitOnBlur", type: "boolean", default: "true", description: "Commit when focus leaves the field." },
      { name: "showActions", type: "boolean", default: "false", description: "Show explicit save/cancel buttons." },
      { name: "label", type: "string", description: "Accessible name and edit-button label." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Text size." },
      { name: "disabled / readOnly", type: "boolean", default: "false", description: "Prevent entering edit mode." },
    ],
    notes: [
      "Enter saves, Escape cancels, and blur saves by default; use submitOnBlur={false} to require an explicit save.",
      "The trigger is a real button, so the value is reachable and editable from the keyboard.",
      "The headless logic is exported as useInlineEdit for custom presentations.",
    ],
  },
  {
    id: "mentions",
    name: "Mentions",
    category: "Forms",
    description: "A textarea with @mention autocomplete, keyboard navigation, and a typed suggestion list.",
    keywords: ["mentions", "autocomplete", "mention", "comment", "textarea", "tag"],
    render: () => (
      <div style={{ width: "min(100%, 28rem)" }}>
        <Mentions
          placeholder="Write a comment… type @ to mention someone"
          options={[
            { value: "ada", label: "Ada Lovelace", description: "Engineering" },
            { value: "grace", label: "Grace Hopper", description: "Platform" },
            { value: "alan", label: "Alan Turing", description: "Research" },
            { value: "katherine", label: "Katherine Johnson", description: "Data" },
          ]}
        />
      </div>
    ),
    props: [
      { name: "options", type: "MentionOption[]", required: true, description: "Suggestions with value, label, description, and avatar." },
      { name: "value / defaultValue / onValueChange", type: "string", description: "Controlled or uncontrolled text." },
      { name: "trigger", type: "string", default: '"@"', description: "Character that opens the list." },
      { name: "onSelect", type: "(option: MentionOption) => void", description: "Fires when a mention is inserted." },
      { name: "filterOption", type: "(option, query) => boolean", description: "Custom matching; defaults to label/value contains." },
      { name: "emptyText", type: "ReactNode", default: '"No matches"', description: "Shown when nothing matches." },
      { name: "size / invalid", type: "ControlSize / boolean", description: "Control sizing and error state." },
    ],
    notes: [
      "Arrow keys move the active option; Enter or Tab inserts it and Escape dismisses the list.",
      "The popup is a FloatingLayer, so it closes on outside interaction and is positioned for you.",
      "Selecting inserts `@value ` and places the caret after the trailing space.",
    ],
  },
];
