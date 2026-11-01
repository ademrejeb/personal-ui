import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { cx } from "../../utilities/cx";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Wrap in a horizontally scrollable container. Defaults to true. */
  responsive?: boolean;
  /** Keep the header visible while scrolling the body. */
  stickyHeader?: boolean;
  wrapperClassName?: string;
}

const TableRoot = forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, responsive = true, stickyHeader = false, wrapperClassName, ...rest },
  ref,
) {
  const table = (
    <table
      ref={ref}
      className={cx("ui-table", stickyHeader && "ui-table--sticky", className)}
      {...rest}
    />
  );
  if (!responsive) return table;
  return <div className={cx("ui-table-wrapper", "ui-scrollbar", wrapperClassName)}>{table}</div>;
});
TableRoot.displayName = "Table";

export type TableSectionProps = HTMLAttributes<HTMLTableSectionElement>;
export const TableHeader = forwardRef<HTMLTableSectionElement, TableSectionProps>(
  function TableHeader({ className, ...rest }, ref) {
    return <thead ref={ref} className={cx("ui-table__header", className)} {...rest} />;
  },
);
export const TableBody = forwardRef<HTMLTableSectionElement, TableSectionProps>(
  function TableBody({ className, ...rest }, ref) {
    return <tbody ref={ref} className={cx("ui-table__body", className)} {...rest} />;
  },
);
export const TableFooter = forwardRef<HTMLTableSectionElement, TableSectionProps>(
  function TableFooter({ className, ...rest }, ref) {
    return <tfoot ref={ref} className={cx("ui-table__footer", className)} {...rest} />;
  },
);

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, selected, ...rest },
  ref,
) {
  return (
    <tr
      ref={ref}
      data-selected={selected || undefined}
      className={cx("ui-table__row", className)}
      {...rest}
    />
  );
});
TableRow.displayName = "Table.Row";

export interface TableHeadProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: "start" | "center" | "end";
}
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { className, align, ...rest },
  ref,
) {
  return (
    <th
      ref={ref}
      scope="col"
      data-align={align}
      className={cx("ui-table__head", className)}
      {...rest}
    />
  );
});
TableHead.displayName = "Table.Head";

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: "start" | "center" | "end";
}
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, align, ...rest },
  ref,
) {
  return <td ref={ref} data-align={align} className={cx("ui-table__cell", className)} {...rest} />;
});
TableCell.displayName = "Table.Cell";

export type TableCaptionProps = HTMLAttributes<HTMLTableCaptionElement>;
export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  function TableCaption({ className, ...rest }, ref) {
    return <caption ref={ref} className={cx("ui-table__caption", className)} {...rest} />;
  },
);
TableCaption.displayName = "Table.Caption";

/** Compound semantic table. */
export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Caption: TableCaption,
});
