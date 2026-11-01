# Component catalog

Everything below is exported from the package root:

```ts
import { Button, Card, Tabs } from "@personal-ui/ui";
```

Compound parts are available both as static members (`Card.Header`, `Tabs.List`) and as named exports (`CardHeader`, `TabsList`). Run the lab (`npm run dev`) for live previews, editable controls, and full prop tables.

## Customization

Every component can be restyled three ways, from lightest to deepest:

1. **`className`** — merges with the component's own classes.
2. **`classNames`** — typed per-slot overrides, e.g.
   `classNames={{ root: "…", trigger: "…" }}`; slot names are exported as
   `XClassNames` types.
3. **`unstyled`** — drops the built-in `ui-*` classes while keeping behaviour,
   ARIA wiring, and `data-*` state attributes, so you can style from scratch.

```tsx
<Collapsible classNames={{ trigger: "my-trigger", content: "my-panel" }}>
  …
</Collapsible>

<Meter unstyled value={70} label="Usage" className="my-meter" />
```

For full control over markup, use the matching headless hook (below) and spread
its prop bags onto your own elements.

## Layout

| Component | Description |
| --- | --- |
| `Affix` | Pins content to the top of the viewport or a scroll container after it scrolls past. |
| `AspectRatio` | Constrains children to a fixed aspect ratio. |
| `Box` | Polymorphic styled box; the layout primitive base. |
| `Card` | Elevated/outlined surface container with `Header`, `Body`, `Footer`, `Title`, `Description`. |
| `Container` | Centers content with responsive max-widths. |
| `Divider` | Horizontal or vertical separator, with optional label. |
| `Flex` | One-dimensional flexible layout. |
| `Grid` | Two-dimensional grid with column/row spans. |
| `Masonry` | CSS multi-column masonry that preserves each item's natural height. |
| `ScrollArea` | Overflow container with styled scrollbars. |
| `SplitPane` | Two resizable panes with a draggable, keyboard-operable separator (`useSplitPane`). |
| `Stack` | Vertical or horizontal stack with token-based gaps. |
| `Surface` | Themed background surface primitive. |
| `VisuallyHidden` | Accessible content hidden visually (screen-reader only). |
| `Watermark` | Repeating text or image watermark rendered as a theme-aware SVG pattern. |

## Typography

| Component | Description |
| --- | --- |
| `Blockquote` | Styled quotation with optional attribution. |
| `Code` | Inline code styling. |
| `CodeBlock` | Preformatted multi-line code block. |
| `Heading` | Semantic, level-aware heading with `as` support. |
| `Kbd` | Keyboard key or shortcut combination, with optional key grouping. |
| `Label` | Form label. |
| `Link` | Anchor with token styling and external-link affordance. |
| `Text` | Body text with `tone`/`size` variants. |
| `Truncate` | Single-line ellipsis truncation. |

## Actions

| Component | Description |
| --- | --- |
| `Button` | Primary action button across variants/sizes/tones. |
| `IconButton` | Square, icon-only button with accessible label. |
| `ButtonGroup` | Segments a set of related buttons. |
| `ToggleButton` | Button that reflects a pressed/unpressed state. |
| `ToggleGroup` | Single/multi-select group of toggle buttons. |
| `CopyButton` | Copies text to the clipboard with success feedback. |
| `FloatButton` | Fixed action button for global actions, with label, badge, and back-to-top behavior. |

## Forms

| Component | Description |
| --- | --- |
| `Autocomplete` | Free-text input with filtered suggestions. |
| `Calendar` | Month grid with single/range/multiple selection, dated events, keyboard nav, and dropdown captions. |
| `Cascader` | Column-by-column drill-down select for hierarchical options, with a `useCascader` hook. |
| `Checkbox` | Checkbox with label and indeterminate support. |
| `ColorPicker` | Swatch trigger with a popup for presets, a native picker, a hex field and alpha, plus `useColorPicker` and the colour utilities. |
| `Combobox` | Searchable single-select with filtering and grouped options. |
| `DatePicker` | Date field with a calendar popup. |
| `DateRangePicker` | Two-month range picker with a configurable separator. |
| `DateTimePicker` | Combined calendar + time-column picker. |
| `FileUpload` | Drag-and-drop file input with size limits and a file list. |
| `Fieldset` | Grouped controls with legend and description. |
| `Form` | Form element wired to the form engine (validation + submit). |
| `FormActions` | Aligned action row for forms. |
| `FormBuilder` | Schema-driven form renderer built on the form engine. |
| `FormField` | Label/description/error wrapper for a single control. |
| `Input` | Text input with sizes and validation states. |
| `InputGroup` | Wraps an input with leading/trailing addons. |
| `InlineEdit` | Click-to-edit text with Enter/Escape/blur behavior and a `useInlineEdit` hook. |
| `InputMask` | Text input that keeps its value in a fixed shape while typing, with `useInputMask` and the mask utilities. |
| `InputOTP` | Segmented one-time-code input. |
| `Mentions` | Textarea with `@mention` autocomplete and a keyboard-navigable suggestion list. |
| `MultiSelect` | Multi-select with chips, limits, and select-all. |
| `NumberInput` | Numeric input with step controls. |
| `PasswordInput` | Password field with reveal toggle. |
| `RadioGroup` | Radio group with shared name and keyboard nav. |
| `Rating` | Star rating on a native radio group with hover preview and optional clearing. |
| `SearchInput` | Search field with icon and clear action. |
| `SegmentedControl` | Single-select segmented buttons with radio semantics. |
| `Select` | Native-backed select styled with a custom trigger. |
| `Slider` | Range input with single or double handles. |
| `Switch` | On/off toggle switch. |
| `Textarea` | Multi-line text input with auto-resize option. |
| `TimePicker` | Column-based time selection with a 12/24-hour cycle. |
| `Transfer` | Dual-panel list transfer with search, select-all and a `useTransfer` hook. |
| `TreeSelect` | Select whose popup is a tree, with a `useTree` hook. |

Form state helpers from `forms/form-engine.ts`: `useForm`, `Form` + `FormField`
(context wiring), `useField` (single-field read/write + bindings), `useController`
(controlled field with transform + field-level validation), `useWatch`,
`useFormState`, and `useFieldArray` (repeater rows).

## Feedback

| Component | Description |
| --- | --- |
| `Alert` | Prominent status message with icon and actions. |
| `CircularProgress` | Determinate/indeterminate ring progress. |
| `EmptyState` | Placeholder for empty content with icon and CTA. |
| `InlineMessage` | Compact inline status text. |
| `LoadingOverlay` | Overlay scrim with a spinner. |
| `Meter` | Range gauge (`role="meter"`) with low/high/optimum tone derivation. |
| `Notification` | Stackable rich notifications with title, description, actions, and placement (`NotificationProvider`, `useNotification`). |
| `Progress` | Linear progress bar. |
| `Result` | Full-area outcome message for success, error, and not-found states. |
| `Skeleton` | Loading placeholder shapes. |
| `Spinner` | Indeterminate spinning indicator. |
| `StatusIndicator` | Coloured dot / label for status. |
| `Toast` | Transient notification surface. |

## Overlays

| Component | Description |
| --- | --- |
| `AlertDialog` | Modal that demands a confirmation choice. |
| `CommandPalette` | Filterable, keyboard-driven command list with grouped results. |
| `ContextMenu` | Right-click menu positioned at the pointer. |
| `DropdownMenu` | Anchored contextual menu with `Trigger`, `Content`, `Item`, `Separator`, `Label`. |
| `HoverCard` | Rich preview card on hover/focus with `Trigger`, `Content` and a `useHoverCard` hook. |
| `MenuBar` | Desktop menu bar with `Menu`, `Item`, `Separator` and arrow-key traversal. |
| `Modal` | Accessible dialog with `Trigger`, `Content`, `Header`, `Title`, `Description`, `Footer`, `Close`. |
| `NavigationMenu` | Horizontal nav with `List`, `Item`, `Trigger`, `Content`, `Link` panels. |
| `Popover` | Anchored floating panel. **Named exports only** - `PopoverTrigger`, `PopoverContent`. |
| `Popconfirm` | Compact confirmation popover anchored to its trigger, for destructive actions. |
| `Sheet` | Edge-anchored drawer with `Title`, `Description`, `Close`. |
| `Tooltip` | Hover/focus hint anchored to its trigger. |
| `Tour` | Guided product tour that spotlights targets and steps through contextual cards. |

## Navigation

| Component | Description |
| --- | --- |
| `Accordion` | Collapsible sections with `Item`, `Trigger`, `Content`. |
| `Anchor` | Table-of-contents anchor with scroll-spy and smooth scrolling. |
| `Breadcrumbs` | Hierarchical trail with `Item`, `Link`, `Separator`. |
| `Collapsible` | Single disclosure panel with `Trigger`, `Content` and a `useCollapsible` hook. |
| `Navbar` | Responsive top bar with `Brand`, `Toggle`, `Nav`, `Link`, `Actions`. |
| `Pagination` | Page navigation with prev/next and page numbers. |
| `Sidebar` | Collapsible rail / off-canvas drawer with `Header`, `Nav`, `Section`, `Link`, `Footer`, `Toggle`, `Close`. |
| `Stepper` | Multi-step progress indicator. |
| `Tabs` | Tabbed sections with `List`, `Trigger`, `Content`. |
| `TreeView` | Expandable tree with roving focus, async `loadData` and a `useTree` hook. |

## Data display

| Component | Description |
| --- | --- |
| `Attachment` | File card with type icon or thumbnail, size, upload progress, and remove/download actions. |
| `Avatar` | User image with initials fallback and status. |
| `Badge` | Small status/count label. |
| `BarChart` | Grouped or stacked bar chart, driven by the `utilities/chart.ts` helpers. |
| `Bubble` | Chat message bubble with avatar, author, timestamp, and delivery footer. |
| `Carousel` | Sliding viewport with `Slide`, `Controls`, `Dots` and a `useCarousel` hook. |
| `DataTable` | Sortable, selectable tabular data. |
| `DescriptionList` | Term/definition pairs. |
| `DonutChart` | Filled arc donut with a centre metric and legend. |
| `Image` | Image with loading state, fallback, caption, and an accessible lightbox preview. |
| `Item` | Compound media + content + actions row (`Media`, `Content`, `Title`, `Description`, `Actions`). |
| `LineChart` / `AreaChart` | Line and area charts sharing the chart utilities. |
| `List` | Ordered/unordered styled list with `Item`. |
| `MessageScroller` | Chat transcript viewport pinned to the newest message, with jump-to-latest. |
| `RelativeTime` | Semantic `<time>` with a live relative label and absolute tooltip (`formatRelativeTime`). |
| `Sparkline` | Tiny inline trend chart. |
| `StatCard` | Headline metric with delta and trend. |
| `Table` | Table built from `Header`, `Body`, `Row`, `Cell`, `HeadCell`, `Caption`. |
| `Tag` | Removable label chip. |
| `Timeline` | Chronological event feed. |

## Application

| Component | Description |
| --- | --- |
| `ActivityFeed` | Stream of recent activity items. |
| `PageHeader` | Page title, description, breadcrumbs, and actions. |
| `PageShell` | App chrome: sidebar + header + content layout. |
| `SettingsSection` | Grouped settings rows with titles and controls. |
| `ThemeToggle` | Light/dark/system switcher wired to `useTheme`. |
| `Toolbar` | Row of related actions and filters. |
| `UserMenu` | Avatar account menu with identity header and actions. |
| `VersionBadge` | Version/environment pill. |

## Icons

| Export | Description |
| --- | --- |
| `Icon` | Sized, colour-inheriting wrapper around an icon component. |
| `iconRegistry` | Curated, tree-shakeable subset of Lucide icons keyed by name. |
| `iconNames` / `getIcon` | Enumerate or look up a registry icon by name. |

## Headless hooks

Every complex control exposes its behavior as a hook so you can keep the logic and
replace the markup. Hooks return state plus prop bags that are safe to spread onto
native elements.

| Hook | Used by | What it owns |
| --- | --- | --- |
| `useDisclosure` | Menus, modals, sheets | Controlled/uncontrolled open state with `onOpen`, `onClose`, `onToggle`. |
| `useInlineEdit` | `InlineEdit` | Value + editing state, Enter/Escape, blur-to-commit, input/trigger props. |
| `useSplitPane` | `SplitPane` | Percentage sizing, pointer capture, keyboard/RTL resizing, separator ARIA. |
| `useSelection` | `DataTable`, lists | Selection sets with select-all and indeterminate helpers. |
| `useTree` | `TreeView`, `TreeSelect` | Flattening, expansion, roving focus, async loading. |
| `useCascader` | `Cascader` | Column state, path resolution, popup/trigger props. |
| `useTransfer` | `Transfer` | Dual-panel movement, search, select-all. |
| `useInputMask` | `InputMask` | Mask parsing and value shaping. |
| `useColorPicker` | `ColorPicker` | Colour format state, swatches, popup props. |
| `useCarousel` | `Carousel` | Index, autoplay, drag, slide props. |
| `useHoverCard` | `HoverCard` | Open delays, hover/focus intent, positioning. |

```tsx
import { useDisclosure } from "@personal-ui/ui";

function Details() {
  const { open, onToggle } = useDisclosure();
  return (
    <>
      <button type="button" onClick={onToggle} aria-expanded={open}>
        Details
      </button>
      {open ? <div>Custom panel markup</div> : null}
    </>
  );
}
```
