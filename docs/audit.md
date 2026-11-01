# Repository audit & upgrade plan

Status of the production-readiness upgrade. Tracks defects, API gaps, missing
capabilities, and verification. Updated as phases land.

Legend: ✅ done · 🟡 partial · ⬜ not started

---

## 1. Existing functionality to preserve

- ✅ React 19 + TypeScript strict; `forwardRef` on every component; compound parts via `Object.assign`.
- ✅ Global hand-written CSS driven by a three-layer token system (primitives → semantic → component).
- ✅ `ThemeProvider` with `light`/`dark`/`system`, persistence, and transition suppression.
- ✅ Headless hooks (`useFloating`, `useFocusTrap`, `useScrollLock`, `useControllableState`, …).
- ✅ The component lab (schema-driven registry, JSX codegen, token inspector, theme switcher).
- ✅ Vitest + Testing Library + Playwright suites; Vite library build with a CSS inliner.

## 2. Components requiring bug fixes

| # | Component | Defect | Status |
| --- | --- | --- | --- |
| 2.1 | **DataTable** | Date columns compared display strings; no null/empty handling; forced pagination; selection conflated visible vs all. | ✅ fixed |
| 2.2 | **Stepper** | Connector line was a sibling of the whole step content, so it misaligned when labels wrapped or heights differed; inline display bug. | ✅ fixed |
| 2.3 | **InputGroup / CopyButton** | Icons could shrink inside the flex row; icon-only actions cramped; no focus ring on group buttons. | ✅ fixed |
| 2.4 | **Select** | Only a restyled native `<select>`; no custom listbox, search, groups, avatars, async. | ⬜ Phase 3.4 |
| 2.5 | **DropdownMenu** | Items were not activatable by keyboard (Enter/Space); `aria-checked` on the wrong role. | 🟡 Enter/Space + role fixed; arrow-key roving still to add |
| 2.6 | **Slider** | Dual-handle range behavior unverified. | ⬜ Phase 7 |
| 2.7 | **ToggleGroup** | `onValueChange`, `value`, `defaultValue`, and `type` were spread onto the group `<div>`, logging “Unknown event handler property `onValueChange`” on every render. | ✅ fixed (destructured before the DOM spread + regression test) |
| 2.8 | **ThemeProvider** | The transition-guard `<style>` was removed by both the `requestAnimationFrame` callback and the effect cleanup; the second `removeChild` threw `NotFoundError` and unmounted the whole app on the second theme switch. | ✅ fixed (idempotent `style.remove()` + regression test) |

## 3. Components requiring API improvements

- ✅ **DataTable** — typed `Column<T>` (accessor/cell/format/sortType/filterFn/width/min/max/align/meta), optional pagination (`none`/`client`/`server`), controlled sorting/selection/search, `isRowSelectable`, states (`loading`/`error`/`onRetry`/`emptyMessage`), density/striped/bordered.
- ✅ **Stepper** — `defaultCurrent` (uncontrolled), `linear`, per-step `status`/`icon`/`optional`, controlled `current`.
- ⬜ Consistent loading/error/read-only across form controls.
- ⬜ Discriminated-union configuration objects for the most prop-heavy components.

## 4. Missing components

- ✅ `Calendar`, `DatePicker`, `DateRangePicker`, `TimePicker`, `DateTimePicker` (roving-grid calendar, single/range modes, dropdown captions, 12/24h time columns, combined date+time).
- ✅ Event calendar — `Calendar mode="multiple"` (toggleable `values`/`onValuesChange`) plus `events` spans (inclusive start/end, `status` tone, labels announced via each day's `aria-label`, multi-event dot).
- ✅ `Combobox` (searchable single), `MultiSelect` (chips, `maxSelected`, select-all), `Autocomplete` (free-text with suggestions).
- ✅ `Navbar`, `Sidebar` (responsive: persistent rail + off-canvas drawer), `NavigationMenu`, `MenuBar`, `ContextMenu`, library `CommandPalette`, `UserMenu`.
- ✅ `FormBuilder` (schema grid), `FileUpload` (drag-and-drop, size limits).
- ✅ `Icon` wrapper + curated `iconRegistry` + lab gallery.

## 5. Missing hooks & utilities

- ✅ **Date utilities** — `parseDateValue`, `compareDateValues`, `formatDate`, `toDateOnlyString`, calendar arithmetic (`addDays`, `addMonths`, `startOfWeek`, …), `isDateDisabled`. Distinguishes calendar dates vs local date-times vs instants (no UTC shift; ambiguous locale strings rejected).
- ✅ **Comparison utilities** — `compareValues` (type-aware, direction-aware, empty-last, locale/numeric-aware), `getCollator`.
- ✅ **Formatters** — `formatNumber`, `formatCurrency`, `formatPercent`, `formatFileSize`, `truncateText`, `slugify`, `titleCase`.
- ✅ Form hooks: `useForm`, `useFormContext`, `useField`, `useController`, `useWatch`, `useFormState`, `useFieldArray` shipped (`forms/form-engine.ts`, `forms/Form.tsx`).
- ✅ Calendar event spans + multiple selection are prop-driven (see §4).

## 6. Missing documentation & testing

- ✅ Root/package READMEs + `docs/` (`architecture`, `tokens`, `theming`, `components`, `lab`).
- ✅ Machine-readable `docs/manifest.json` generated from the lab registry via `npm run manifest` (`scripts/build-manifest.mjs`) - 135 components.
- ✅ `AGENTS.md` at the repo root and per-module guides: `guides/datatable.md`, `guides/calendar.md`, `guides/formbuilder.md`.
- ✅ DataTable tests (date sorting, nulls, stability, controlled sorting, client/server/disabled pagination, visible-row selection, indeterminate, filtering+sorting, states) — 16 tests.
- ✅ Date utility tests — 20 tests.
- ✅ Select/Combobox/MultiSelect, Calendar, date pickers, form engine, Navbar/Sidebar, and Icon suites added.
- ✅ Selection/collection unit tests (`tests/utilities/selection.test.ts`).
- ✅ Runtime a11y audit — `tests/e2e/a11y.spec.ts` runs axe-core in a real browser over a curated cross-family sample in every browser project **and** every manifest component on chromium (129 checks). Landing it fixed real defects: dark-theme text contrast (new `--ui-primary-text` / `--ui-danger-text` steps so fills and text can both clear 4.5:1), `--ui-muted-strong` dark step, code-block language label, CopyButton/FileUpload accessible names, MenuBar trigger roles, Avatar initials leaking into the accessible name, and several lab-chrome labels. The three document-level landmark-uniqueness rules are disabled with a note, since the single-page lab legitimately nests demo `<main>` elements.
- ✅ Visual regression for responsive layout components — `tests/e2e/visual.spec.ts` captures Navbar/Sidebar/Stepper at desktop/tablet/mobile against committed chromium baselines (1% pixel tolerance).

## 7. Architectural problems affecting multiple components

- ✅ **Date handling** — no foundation existed; the table guessed with `String()`/`localeCompare`. Now centralized in `utilities/date.ts`.
- ✅ **Sorting** — duplicated ad-hoc comparators; now `utilities/compare.ts`.
- ✅ **Overlay/menu infrastructure** — Tooltip, Popover, DropdownMenu, ContextMenu, the select controls, and the date pickers now all sit on one `FloatingLayer` primitive (`primitives/FloatingLayer.tsx`) that owns anchoring/positioning, outside + Escape dismissal, focus return, and auto-focus; `useFloating` takes an external anchor ref and `computePositionAtPoint` handles pointer-anchored menus. Each component keeps only its own keyboard model.
- ✅ **Selection/collection state** — one core shared by every multi-select surface: pure helpers in `utilities/selection.ts` (`toggleKey`, `selectKeys`, `setKeys`, `isKeySelected`, `areAllSelected`, `areSomeSelected`; no-ops return the same reference so no spurious change events) plus the `useSelection` hook (controlled/uncontrolled, `max`, grouped `toggleAll`, `atLimit`). DataTable and MultiSelect now both consume it.

---

## Phase status

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Audit & checklist | ✅ this document |
| 2 | Foundation (types, tokens, date nav, utilities, icons, doc conventions) | ✅ date/compare/format utilities + docs |
| 3 | Regression fixes (DataTable, Stepper, InputGroup/CopyButton, Select, MultiSelect) | ✅ all shipped |
| 4 | Date & time (DatePicker, DateRangePicker, TimePicker, Calendar) | ✅ shipped |
| 5 | Form engine + FormBuilder | ✅ shipped |
| 6 | Responsive navigation & menus | ✅ Navbar, Sidebar, NavigationMenu, MenuBar, ContextMenu, CommandPalette, UserMenu |
| 7 | Icons + remaining components | ✅ Icon registry/gallery, Autocomplete, DateTimePicker, FileUpload |
| 8 | Docs, manifest, AGENTS.md | ✅ `docs/manifest.json` + `AGENTS.md` |
| 9 | Tests, a11y, build, bundle analysis | ✅ unit + e2e suites green, axe audit and responsive visual baselines in place, bundle split |
| 10 | Component expansion (new components + deeper customization) | ✅ complete — Collapsible, HoverCard, Carousel, TreeView/TreeSelect, Charts, Cascader, Transfer, InputMask, Rating/SegmentedControl, ColorPicker shipped |
| 11 | Packaging + Next.js drop-in + headless expansion | ✅ complete — `"use client"` build contract, `ThemeScript`, Next.js guide, Kbd/RelativeTime/Meter/InlineEdit/SplitPane, useDisclosure/useInlineEdit/useSplitPane |
| 12 | Catalog parity with shadcn/ui + Ant Design | ✅ complete — Popconfirm, Tour, Result, Notification, Anchor, Affix, Masonry, Watermark, FloatButton, Mentions, Image, Item, Attachment, Bubble, MessageScroller |

## Phase 10 — component expansion

Every new component ships the same customization contract, built on
`utilities/slots.ts`: Layer C tokens, typed `classNames` slot overrides,
`unstyled` for headless use, `data-state` attributes for external styling, and an
exported `use<Name>` hook that reproduces the behaviour with your own markup.

| Component | Area | Status |
| --- | --- | --- |
| `Collapsible` | Navigation | ✅ shipped (`useCollapsible`, reduced-motion, `forceMount`) |
| `HoverCard` | Overlays | ✅ shipped (`useHoverCard`, `FloatingLayer`, Escape + focus open) |
| `Carousel` | Data display | ✅ shipped (`useCarousel`, swipe/keyboard/autoplay, inert off-screen slides) |
| `TreeView` + `TreeSelect` | Navigation / Forms | ✅ shipped (`useTree`, roving focus, `loadData`, cascading TreeSelect with clear-button fix) |
| `Charts` (Line/Bar/Area/Donut) | Data display | ✅ shipped (`utilities/chart.ts` math + token series palette, grouped/stacked bars, arcs) |
| `Cascader` | Forms | ✅ shipped (`useCascader`, column drill-down, `changeOnSelect`, hover expand) |
| `Transfer` | Forms | ✅ shipped (`useTransfer`, dual panels, search, `oneWay`) |
| `InputMask` | Forms | ✅ shipped (`utilities/mask.ts` + `useInputMask`, `9`/`a`/`*` tokens, completion state) |
| `Rating` + `SegmentedControl` | Forms | ✅ shipped (native radio groups, hover preview, `allowClear`, `fullWidth`) |
| `ColorPicker` | Forms | ✅ shipped (`utilities/color.ts` + `useColorPicker`, FloatingLayer dialog, presets, alpha, format output) |

## Phase 11 — packaging and headless expansion

The published bundle now declares `"use client"` at the top and the build script
asserts it (`packages/ui/scripts/verify-build.mjs`), so Next.js App Router treats
the package as a client boundary without `transpilePackages`. `ThemeScript`
applies the stored theme before first paint, and `docs/nextjs.md` documents both
routers.

| Component / hook | Area | Status |
| --- | --- | --- |
| `Kbd` | Typography | ✅ shipped (`keys` combinations, sizes/variants, spoken label) |
| `RelativeTime` + `formatRelativeTime` | Data display / utilities | ✅ shipped (live interval, fixed `now`, custom formatter, `<time dateTime>`) |
| `Meter` | Feedback | ✅ shipped (`role="meter"`, low/high/optimum tone derivation) |
| `InlineEdit` + `useInlineEdit` | Forms | ✅ shipped (Enter/Escape/blur, multiline, explicit actions, controlled modes) |
| `SplitPane` + `useSplitPane` | Layout | ✅ shipped (pointer capture, keyboard/RTL resize, separator ARIA) |
| `useDisclosure` | Hooks | ✅ shipped (controlled/uncontrolled open state) |

## Phase 12 — catalog parity (shadcn/ui + Ant Design gaps)

Fifteen useful components from the shadcn/ui and Ant Design catalogs that the
library was missing. Each ships the same contract as Phase 10/11: Layer C
tokens, typed `classNames` slots, `unstyled`, `data-*` state attributes, and
tests. `NativeSelect` was deliberately not added because `Select` is already
native-backed.

| Component | Area | Notes |
| --- | --- | --- |
| `Popconfirm` | Overlays | `role="alertdialog"`, FloatingLayer positioning, focus return, danger tone |
| `Tour` | Overlays | spotlight cutout, step card, selector/element/resolver targets, Escape/finish |
| `Result` | Feedback | success/info/warning/danger/404/403/500 statuses, `role="status"` |
| `Notification` + `NotificationProvider` + `useNotification` | Feedback | stackable rich notices, placement, actions, pause-on-hover, `role="alert"` for danger |
| `Anchor` | Navigation | scroll-spy TOC via IntersectionObserver, nested items, `aria-current="location"` |
| `Affix` | Layout | pins to the viewport or a scroll container, placeholder preserves layout |
| `Masonry` | Layout | CSS columns, no measurement loop, gap tokens |
| `Watermark` | Layout | inline SVG pattern, inherits `currentColor`, pointer-events none |
| `FloatButton` | Actions | fixed FAB, label/badge, back-to-top, accessible name |
| `Mentions` | Forms | textarea autocomplete on `@`, FloatingLayer popup, caret restore |
| `Image` | Data display | loading/fallback/caption, lightbox reuses `Modal` |
| `Item` | Data display | compound `Media`/`Content`/`Title`/`Description`/`Actions` row |
| `Attachment` | Data display | file type icon, `formatFileSize`, progressbar, download/remove |
| `Bubble` | Data display | chat bubble with align/variant, author, timestamp, footer |
| `MessageScroller` | Data display | `role="log"` viewport, pin-to-bottom, jump-to-latest, imperative handle |

## Verification (current)

- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npx vitest run` — 479 tests passing (38 files).
- `npm run build` — library + lab build succeed.
- `npm run manifest` — `docs/manifest.json` (135 components) regenerates.
- ✅ `npm run test:e2e` — all four projects green (185 passing): desktop chromium 143 (5 lab journeys, 129 axe checks, 9 visual snapshots); firefox, webkit, and mobile-chrome 14 each (9 curated axe pages + 5 lab journeys). The full manifest sweep and the visual baselines stay desktop-chromium-only by design.
- ✅ Lab bundle code-split (`react`, `icons`, `ui`, app) — no chunk exceeds 500 kB.

## Next priorities

1. ~~Finish the Phase 10 table~~ - done; keep `typecheck`, `lint`, `vitest`, `manifest`, `build`, and the e2e suites (chromium/firefox/webkit) green after each new component.
2. Arrow-key roving focus between DropdownMenu items (the last keyboard gap in §2.5).
3. Extend `useSelection` to the remaining grouped pickers (Select/NavigationMenu sections) and document the pattern in `docs/architecture.md`.
4. Visual baselines for the state-heavy form controls (Slider, Combobox, DataTable) once the demo states are frozen.
5. Light-theme axe run and contrast pass for the `system` preference path.
