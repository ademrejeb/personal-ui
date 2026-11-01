import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, RotateCcw, Search, X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { compareValues, type CompareKind } from "../../utilities/compare";
import { useControllableState } from "../../hooks/useControllableState";
import { useSelection } from "../../hooks/useSelection";
import { Table, TableBody, TableCell, TableHead, TableHeader } from "./Table";
import { Checkbox } from "../forms/Checkbox";
import { Pagination } from "../navigation/Pagination";
import { Skeleton } from "../feedback/Skeleton";
import { Spinner } from "../feedback/Spinner";
import { VisuallyHidden } from "../layout/VisuallyHidden";

export interface Column<T> {
  /** Stable identifier, unique within the table. */
  id: string;
  /** Header content. */
  header: ReactNode;
  /** Accessible name for the sort control when `header` is not plain text. */
  headerLabel?: string;
  /** Extract the raw value used for sorting, filtering, and default rendering. */
  accessor?: (row: T) => unknown;
  /** Fully custom cell renderer. Takes precedence over `format` and `accessor`. */
  cell?: (row: T, index: number) => ReactNode;
  /** Format the accessed value for display. */
  format?: (value: unknown, row: T) => ReactNode;
  sortable?: boolean;
  /** Comparator over rows. When provided, `sortType` is ignored. */
  sortFn?: (a: T, b: T) => number;
  /** How values are compared. Defaults to type detection. */
  sortType?: CompareKind;
  /** Column predicate for column-specific filtering. */
  filterFn?: (row: T, value: unknown, column: Column<T>) => boolean;
  filterable?: boolean;
  align?: "start" | "center" | "end";
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  /** Hide the column. Can also be controlled via `columnVisibility`. */
  hidden?: boolean;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  /** Arbitrary per-column metadata, forwarded to custom cell renderers. */
  meta?: unknown;
}

export type SortDirection = "asc" | "desc";

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export interface DataTableFilter {
  /** Column id the filter applies to. */
  id: string;
  value: unknown;
}

export type PaginationMode = "none" | "client" | "server";
export type DataTableDensity = "compact" | "default" | "comfortable";

export interface DataTableProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "children" | "onChange"> {
  data: T[];
  columns: Column<T>[];
  /** Stable row key. Defaults to the row index (fine only for static data). */
  getRowId?: (row: T, index: number) => string;

  /* Sorting */
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;

  /* Filtering */
  filters?: DataTableFilter[];
  globalFilter?: string;
  defaultGlobalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  globalFilterFn?: (row: T, query: string, columns: Column<T>[]) => boolean;
  searchable?: boolean;
  searchPlaceholder?: string;

  /* Selection */
  selectable?: boolean;
  selection?: string[];
  defaultSelection?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Which rows the header "select all" toggles. Defaults to the visible page. */
  selectAllScope?: "page" | "all";
  isRowSelectable?: (row: T, index: number) => boolean;
  selectAllLabel?: string;
  rowSelectLabel?: string | ((row: T, index: number) => string);

  /* Pagination */
  /** Explicit mode. When omitted, inferred from `pageSize`. */
  pagination?: PaginationMode;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  /** Total row count for `pagination="server"`. */
  total?: number;
  /** Total page count for `pagination="server"` (alternative to `total`). */
  pageCount?: number;
  compactPagination?: boolean;

  /* States */
  loading?: boolean;
  error?: ReactNode;
  onRetry?: () => void;
  emptyState?: ReactNode;
  emptyMessage?: ReactNode;

  /* Presentation */
  density?: DataTableDensity;
  striped?: boolean;
  bordered?: boolean;
  stickyHeader?: boolean;
  caption?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: (row: T, index: number) => string | undefined;
  /** Per-column visibility overrides keyed by column id. */
  columnVisibility?: Record<string, boolean>;
  locale?: string | string[];
  /** Announce sort changes to assistive technology. Defaults to true. */
  announceSort?: boolean;
}

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

function defaultGlobalFilterFn<T>(row: T, query: string, columns: Column<T>[]): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return columns.some((column) => {
    const value = column.accessor?.(row);
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(needle);
  });
}

function DataTableInner<T>(
  {
    className,
    data,
    columns,
    getRowId = (_row: T, index: number) => String(index),
    sort: sortProp,
    defaultSort = null,
    onSortChange,
    filters,
    globalFilter: globalFilterProp,
    defaultGlobalFilter = "",
    onGlobalFilterChange,
    globalFilterFn,
    searchable = false,
    searchPlaceholder = "Search…",
    selectable = false,
    selection: selectionProp,
    defaultSelection = [],
    onSelectionChange,
    selectAllScope = "page",
    isRowSelectable,
    selectAllLabel = "Select all rows",
    rowSelectLabel = "Select row",
    pagination,
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    pageSize: pageSizeProp,
    defaultPageSize = 10,
    pageSizeOptions,
    onPageSizeChange,
    total,
    pageCount: pageCountProp,
    compactPagination = false,
    loading = false,
    error,
    onRetry,
    emptyState,
    emptyMessage = "No data",
    density = "default",
    striped = false,
    bordered = false,
    stickyHeader = false,
    caption,
    onRowClick,
    rowClassName,
    columnVisibility = {},
    locale,
    announceSort = true,
    ...rest
  }: DataTableProps<T>,
  ref: Ref<HTMLTableElement>,
) {
  const [sort, setSort] = useControllableState<SortState | null>({
    value: sortProp,
    defaultValue: defaultSort,
    onChange: onSortChange,
  });
  // Row selection shares the multi-select core with MultiSelect so the two
  // surfaces cannot drift (toggle / select-all semantics live in one place).
  const selectionApi = useSelection({
    value: selectionProp,
    defaultValue: defaultSelection,
    onChange: onSelectionChange,
  });
  const selection = selectionApi.selected;
  const [globalFilter, setGlobalFilter] = useControllableState<string>({
    value: globalFilterProp,
    defaultValue: defaultGlobalFilter,
    onChange: onGlobalFilterChange,
  });
  const mode: PaginationMode = pagination ?? (pageSizeProp ? "client" : "none");
  const isServer = mode === "server";
  const effectivePageSize = pageSizeProp ?? defaultPageSize;

  const [page, setPage] = useControllableState<number>({
    value: pageProp,
    defaultValue: defaultPage,
    onChange: onPageChange,
  });

  const [pageSize, setPageSize] = useControllableState<number>({
    value: pageSizeProp,
    defaultValue: pageSizeProp ?? defaultPageSize,
    onChange: onPageSizeChange,
  });

  const visibleColumns = useMemo(
    () => columns.filter((column) => !column.hidden && columnVisibility[column.id] !== false),
    [columns, columnVisibility],
  );

  // Filtering + sorting are skipped entirely in server mode: the consumer owns
  // the dataset they hand us, so mutating/slicing it would be incorrect.
  const processed = useMemo(() => {
    if (isServer) return data;

    let result = data;
    if (globalFilter.trim()) {
      const filterFn = globalFilterFn ?? defaultGlobalFilterFn;
      result = result.filter((row) => filterFn(row, globalFilter, visibleColumns));
    }
    if (filters && filters.length > 0) {
      result = result.filter((row) =>
        filters.every((filter) => {
          const column = columns.find((c) => c.id === filter.id);
          if (!column?.filterFn) return true;
          return column.filterFn(row, filter.value, column);
        }),
      );
    }

    if (!sort) return result;
    const column = columns.find((c) => c.id === sort.columnId);
    if (!column) return result;
    const factor = sort.direction === "asc" ? 1 : -1;
    const compare = column.sortFn
      ? (a: T, b: T) => column.sortFn!(a, b) * factor
      : (a: T, b: T) =>
          compareValues(column.accessor?.(a), column.accessor?.(b), {
            kind: column.sortType,
            direction: sort.direction,
            locale,
          });

    // Decorate with the original index to guarantee stable ordering.
    return result
      .map((row, index) => ({ row, index }))
      .sort((x, y) => {
        const result = compare(x.row, y.row);
        return result !== 0 ? result : x.index - y.index;
      })
      .map((entry) => entry.row);
  }, [isServer, data, globalFilter, globalFilterFn, filters, visibleColumns, columns, sort, locale]);

  const totalForPaging = isServer
    ? (total ?? (pageCountProp != null ? pageCountProp * effectivePageSize : data.length))
    : processed.length;

  const computedPageCount = isServer
    ? pageCountProp ?? Math.max(1, Math.ceil(totalForPaging / effectivePageSize))
    : mode === "client"
      ? Math.max(1, Math.ceil(processed.length / effectivePageSize))
      : 1;

  const currentPage = Math.min(Math.max(1, page), computedPageCount);

  const rows = useMemo(() => {
    if (isServer || mode === "none") return processed;
    const start = (currentPage - 1) * effectivePageSize;
    return processed.slice(start, start + effectivePageSize);
  }, [isServer, mode, processed, currentPage, effectivePageSize]);

  const selectableRows = useMemo(
    () =>
      rows
        .map((row, index) => ({ row, index, id: getRowId(row, index) }))
        .filter(({ row, index }) => !isRowSelectable || isRowSelectable(row, index)),
    [rows, getRowId, isRowSelectable],
  );
  const visibleIds = selectableRows.map((entry) => entry.id);

  // "Select all" targets every filtered row client-side, or just the visible
  // page. Server datasets are always page-scoped because the full set is remote.
  const scopeIds = useMemo(() => {
    if (selectAllScope !== "all" || isServer) return visibleIds;
    return processed
      .map((row, index) => ({ row, index }))
      .filter(({ row, index }) => !isRowSelectable || isRowSelectable(row, index))
      .map(({ row, index }) => getRowId(row, index));
  }, [selectAllScope, isServer, visibleIds, processed, isRowSelectable, getRowId]);

  const allSelected = selectable && selectionApi.allSelected(scopeIds);
  const someSelected = selectable && selectionApi.someSelected(scopeIds) && !allSelected;

  const toggleAll = () => selectionApi.toggleAll(scopeIds);

  const toggleRow = (id: string) => selectionApi.toggle(id);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;
    if (!sort || sort.columnId !== column.id) {
      setSort({ columnId: column.id, direction: "asc" });
    } else if (sort.direction === "asc") {
      setSort({ columnId: column.id, direction: "desc" });
    } else {
      setSort(null);
    }
  };

  const sortLabel = useMemo(() => {
    if (!sort) return "";
    const column = columns.find((c) => c.id === sort.columnId);
    if (!column) return "";
    const name = column.headerLabel ?? column.id;
    return `Sorted by ${name}, ${sort.direction === "asc" ? "ascending" : "descending"}`;
  }, [sort, columns]);

  const columnCount = visibleColumns.length + (selectable ? 1 : 0);
  const skeletonRows = mode === "none" ? 5 : Math.min(effectivePageSize, 10);
  const showPagination = mode !== "none" && computedPageCount > 1;

  const table = (
    <Table
      responsive
      stickyHeader={stickyHeader}
      ref={ref}
      aria-busy={loading || undefined}
      data-density={density}
      className={cx(striped && "ui-table--striped", bordered && "ui-table--bordered")}
    >
      {caption ? <Table.Caption>{caption}</Table.Caption> : null}
      <TableHeader>
        <Table.Row>
          {selectable ? (
            <TableHead className="ui-data-table__select-head">
              <Checkbox
                aria-label={selectAllLabel}
                checked={allSelected}
                indeterminate={someSelected}
                disabled={loading || visibleIds.length === 0}
                onChange={toggleAll}
              />
            </TableHead>
          ) : null}
          {visibleColumns.map((column) => {
            const active = sort?.columnId === column.id;
            const ariaSort = active
              ? sort.direction === "asc"
                ? "ascending"
                : "descending"
              : "none";
            const headerName =
              column.headerLabel ?? (typeof column.header === "string" ? column.header : column.id);
            return (
              <TableHead
                key={column.id}
                align={column.align}
                className={column.headerClassName}
                style={{
                  width: toCssSize(column.width),
                  minWidth: toCssSize(column.minWidth),
                  maxWidth: toCssSize(column.maxWidth),
                }}
                aria-sort={column.sortable ? ariaSort : undefined}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    className={cx("ui-data-table__sort", active && "ui-data-table__sort--active")}
                    onClick={() => handleSort(column)}
                  >
                    <span>{column.header}</span>
                    <span className="ui-data-table__sort-icon" aria-hidden="true">
                      {active && sort.direction === "asc" ? (
                        <ArrowUp size={14} />
                      ) : active && sort.direction === "desc" ? (
                        <ArrowDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} />
                      )}
                    </span>
                    <VisuallyHidden>sort {headerName}</VisuallyHidden>
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            );
          })}
        </Table.Row>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: skeletonRows }).map((_, rowIndex) => (
            <Table.Row key={`skeleton-${rowIndex}`}>
              {Array.from({ length: columnCount }).map((__, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton height={16} />
                </TableCell>
              ))}
            </Table.Row>
          ))
        ) : error ? (
          <Table.Row>
            <TableCell colSpan={columnCount} className="ui-data-table__message ui-data-table__error">
              <span>{error}</span>
              {onRetry ? (
                <button type="button" className="ui-data-table__retry" onClick={onRetry}>
                  <RotateCcw size={14} aria-hidden="true" />
                  Retry
                </button>
              ) : null}
            </TableCell>
          </Table.Row>
        ) : rows.length === 0 ? (
          <Table.Row>
            <TableCell colSpan={columnCount} className="ui-data-table__message ui-data-table__empty">
              {emptyState ?? emptyMessage}
            </TableCell>
          </Table.Row>
        ) : (
          rows.map((row, index) => {
            const id = getRowId(row, index);
            const isSelected = selection.includes(id);
            const disabled = isRowSelectable ? !isRowSelectable(row, index) : false;
            return (
              <Table.Row
                key={id}
                selected={isSelected}
                className={cx(
                  onRowClick && !disabled && "ui-data-table__row--clickable",
                  rowClassName?.(row, index),
                )}
                onClick={onRowClick && !disabled ? () => onRowClick(row, index) : undefined}
              >
                {selectable ? (
                  <TableCell className="ui-data-table__select-cell">
                    <Checkbox
                      aria-label={
                        typeof rowSelectLabel === "function"
                          ? rowSelectLabel(row, index)
                          : rowSelectLabel
                      }
                      checked={isSelected}
                      disabled={disabled}
                      onChange={() => toggleRow(id)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </TableCell>
                ) : null}
                {visibleColumns.map((column) => {
                  const value = column.accessor?.(row);
                  return (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      className={cx(column.className, column.cellClassName)}
                    >
                      {column.cell
                        ? column.cell(row, index)
                        : column.format
                          ? column.format(value, row)
                          : (value as ReactNode)}
                    </TableCell>
                  );
                })}
              </Table.Row>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className={cx("ui-data-table", className)} {...rest}>
      {searchable ? (
        <div className="ui-data-table__toolbar">
          <div className="ui-data-table__search">
            <Search size={16} aria-hidden="true" className="ui-data-table__search-icon" />
            <input
              type="search"
              className="ui-data-table__search-input ui-control"
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              aria-label={searchPlaceholder}
            />
            {globalFilter ? (
              <button
                type="button"
                className="ui-data-table__search-clear"
                aria-label="Clear search"
                onClick={() => setGlobalFilter("")}
              >
                <X size={14} aria-hidden="true" />
              </button>
            ) : null}
          </div>
          {loading ? <Spinner size="sm" label="Loading" /> : null}
        </div>
      ) : null}

      {error ? <div aria-live="polite" className="ui-data-table__status">{error}</div> : null}

      {table}

      {showPagination ? (
        <div className="ui-data-table__pagination">
          {mode === "client" && pageSizeOptions && pageSizeOptions.length > 0 ? (
            <label className="ui-data-table__page-size">
              <span>Rows per page</span>
              <select
                className="ui-control"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                aria-label="Rows per page"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <Pagination
            page={currentPage}
            pageCount={computedPageCount}
            onPageChange={setPage}
            showEdges={!compactPagination}
            label="Table pagination"
          />
        </div>
      ) : null}

      {announceSort ? (
        <VisuallyHidden role="status" aria-live="polite">
          {sortLabel}
        </VisuallyHidden>
      ) : null}
    </div>
  );
}

/**
 * Composable data table.
 *
 * - Sorting is type-aware and date-correct (calendar dates never shift zones).
 * - Pagination is optional: `none` (default), `client`, or `server`.
 * - In `server` mode the supplied `data` is rendered as-is — the consumer owns
 *   sorting, filtering, and slicing.
 * - Selection defaults to the visible page; use `isRowSelectable` and
 *   `selectAllScope` to refine behavior.
 */
export const DataTable = forwardRef(DataTableInner) as <T>(
  props: DataTableProps<T> & { ref?: Ref<HTMLTableElement> },
) => ReactElement;
