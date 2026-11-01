# DataTable guide

`DataTable<T>` renders a typed table with sorting, filtering, pagination,
selection, and empty/loading/error states. It is always controlled-or-not per
concern: every feature accepts an optional `value` prop (controlled) plus a
`default…` prop and an `on…Change` callback (uncontrolled). Internals live in
`packages/ui/src/components/data-display/DataTable.tsx`; styles in
`styles/components/data-display.css` (`ui-data-table__*`).

## Quick start

```tsx
import { DataTable, type Column } from "@personal-ui/ui";

interface Person {
  id: string;
  name: string;
  role: string;
  joined: Date;
}

const columns: Column<Person>[] = [
  { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
  { id: "role", header: "Role", accessor: (row) => row.role, filterable: true },
  { id: "joined", header: "Joined", accessor: (row) => row.joined, sortType: "date", sortable: true },
];

<DataTable data={people} columns={columns} getRowId={(row) => row.id} pageSize={10} />;
```

`getRowId` should be stable — it keys React rows, selection, and sort stability.
Without it the row index is used (fine only for static data).

## Columns

| Field | Purpose |
| --- | --- |
| `id` / `header` | Required identity and header content. |
| `accessor?: (row) => unknown` | Value used for sorting and the default cell text. |
| `render?: (row, index) => ReactNode` | Custom cell. |
| `sortable?`, `sortFn?`, `sortType?` | Enable sorting; `sortFn` for custom compares, `sortType` picks the `compareValues` kind (`string`/`number`/`date`/`boolean`). |
| `filterable?`, `filterFn?` | Enables the column's filter in the toolbar / accepts `filters` entries. |
| `align?`, `width?`, `minWidth?`, `maxWidth?` | Presentation. |
| `hidden?`, `className?`, `headerClassName?`, `cellClassName?`, `meta?` | Escape hatches. |

## Sorting

Controlled (`sort` + `onSortChange`) or self-managed (`defaultSort`). Sorting is
**stable**: rows are decorated with their original index before comparing so
equal values never reshuffle. Custom `sortFn` receives a tuple and must return a
negative/zero/positive number; `sortType` routes through the shared date/number
comparators in `utilities/compare.ts` (empty values sort last).

Header clicks announce the new sort to assistive tech; set `announceSort={false}`
to opt out.

## Filtering

- `searchable` shows the toolbar search bound to `globalFilter` / `defaultGlobalFilter` / `onGlobalFilterChange`, using `globalFilterFn` (falls back to a case-insensitive contains over `accessor` values).
- `filters: { id, value }[]` applies per-column predicates via each column's `filterFn`.

Both run **before** sorting and pagination, and are skipped entirely when
`pagination="server"` — in server mode the consumer owns the dataset.

## Selection

```tsx
const [selection, setSelection] = useState<string[]>([]);
<DataTable
  data={people}
  columns={columns}
  getRowId={(row) => row.id}
  selectable
  selection={selection}
  onSelectionChange={setSelection}
  selectAllScope="all"
  isRowSelectable={(row) => row.role !== "bot"}
/>;
```

- Selection ids come from `getRowId`.
- The header checkbox is indeterminate when only part of the scope is selected; its label is `selectAllLabel` and each row checkbox uses `rowSelectLabel` (string or function).
- `selectAllScope` is `"page"` (default) or `"all"`. Server datasets are always page-scoped, since the full set is remote.
- `isRowSelectable` excludes rows from both toggling and "select all".
- The toggle / select-all math is the shared `useSelection` hook + `utilities/selection.ts`, the same core MultiSelect uses, so the two cannot drift.

## Pagination

`pagination` is `"none" | "client" | "server"` and is **inferred** from
`pageSize` when omitted (present ⇒ `client`). Controlled with `page` /
`onPageChange` / `pageSize` / `onPageSizeChange`.

- `client` slices the processed rows locally.
- `server` renders exactly `data` and defers to `total` or `pageCount` for the page count.
- `compactPagination` renders a minimal pager; `pageSizeOptions` configures the size select.

## States

`loading` shows a skeleton, `error` + `onRetry` shows an error panel with a
retry button, and `emptyState` / `emptyMessage` win when there are no rows.
States take precedence over rows, and the empty state still renders the header.

## Presentation

`density` (`compact`/`default`/`comfortable`), `striped`, `bordered`,
`stickyHeader`, `caption`, `onRowClick`, `rowClassName`, and
`columnVisibility: Record<columnId, boolean>` (merged with per-column `hidden`).
`locale` is forwarded to the comparators/formatting.

## Accessibility

- A real `<table>` with `<caption>`, `<th scope="col">`, and `aria-sort` on sorted headers.
- Selection uses native checkbox inputs with explicit `aria-label`s; row click does not swallow checkbox/button clicks.
- Announcements for sort and page changes are `role="status"` live regions.

## Tests

`tests/components/datatable.test.tsx` covers sorting (incl. date + nulls), client
/ server / disabled pagination, controlled sorting, visible-row selection,
indeterminate state, filtering + sorting together, and empty/loading/error
states.
