import { forwardRef, useState, type HTMLAttributes } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cx } from "../../utilities/cx";
import { IconButton } from "../actions/IconButton";

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  /** Show first/last page buttons. */
  showEdges?: boolean;
  /** Show a jump-to-page input. */
  showJump?: boolean;
  disabled?: boolean;
  label?: string;
}

type PageToken = number | "ellipsis-left" | "ellipsis-right";

function range(start: number, end: number): number[] {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
}

export function getPageTokens(page: number, pageCount: number, siblingCount: number): PageToken[] {
  const totalNumbers = siblingCount * 2 + 5;
  if (pageCount <= totalNumbers) return range(1, pageCount);

  const left = Math.max(2, page - siblingCount);
  const right = Math.min(pageCount - 1, page + siblingCount);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < pageCount - 1;

  const middle: PageToken[] = [];
  if (showLeftEllipsis) middle.push("ellipsis-left");
  middle.push(...range(left, right));
  if (showRightEllipsis) middle.push("ellipsis-right");

  return [1, ...middle, pageCount];
}

/** Accessible pagination with sibling windowing and optional jump-to-page. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    className,
    page,
    pageCount,
    onPageChange,
    siblingCount = 1,
    showEdges = false,
    showJump = false,
    disabled = false,
    label = "Pagination",
    ...rest
  },
  ref,
) {
  const [jump, setJump] = useState("");
  const tokens = getPageTokens(page, pageCount, siblingCount);
  const goto = (next: number) => {
    const clamped = Math.min(Math.max(1, next), pageCount);
    if (clamped !== page) onPageChange?.(clamped);
  };

  return (
    <nav ref={ref} aria-label={label} className={cx("ui-pagination", className)} {...rest}>
      <ul className="ui-pagination__list">
        {showEdges ? (
          <li>
            <IconButton
              icon={<ChevronLeft size={16} />}
              aria-label="First page"
              variant="ghost"
              size="sm"
              disabled={disabled || page <= 1}
              onClick={() => goto(1)}
            />
          </li>
        ) : null}
        <li>
          <IconButton
            icon={<ChevronLeft size={16} />}
            aria-label="Previous page"
            variant="ghost"
            size="sm"
            disabled={disabled || page <= 1}
            onClick={() => goto(page - 1)}
          />
        </li>

        {tokens.map((token) =>
          typeof token === "number" ? (
            <li key={token}>
              <button
                type="button"
                className={cx("ui-pagination__page", token === page && "ui-pagination__page--active")}
                aria-current={token === page ? "page" : undefined}
                aria-label={`Page ${token}`}
                disabled={disabled}
                onClick={() => goto(token)}
              >
                {token}
              </button>
            </li>
          ) : (
            <li key={token}>
              <span className="ui-pagination__ellipsis" aria-hidden="true">
                <MoreHorizontal size={16} />
              </span>
            </li>
          ),
        )}

        <li>
          <IconButton
            icon={<ChevronRight size={16} />}
            aria-label="Next page"
            variant="ghost"
            size="sm"
            disabled={disabled || page >= pageCount}
            onClick={() => goto(page + 1)}
          />
        </li>
        {showEdges ? (
          <li>
            <IconButton
              icon={<ChevronRight size={16} />}
              aria-label="Last page"
              variant="ghost"
              size="sm"
              disabled={disabled || page >= pageCount}
              onClick={() => goto(pageCount)}
            />
          </li>
        ) : null}
      </ul>

      {showJump ? (
        <form
          className="ui-pagination__jump"
          onSubmit={(event) => {
            event.preventDefault();
            const value = Number(jump);
            if (!Number.isNaN(value) && value > 0) goto(value);
            setJump("");
          }}
        >
          <label className="ui-pagination__jump-label">
            <span>Go to</span>
            <input
              type="number"
              min={1}
              max={pageCount}
              value={jump}
              onChange={(event) => setJump(event.target.value)}
              className="ui-pagination__jump-input ui-control"
              disabled={disabled}
              aria-label={`Page number, 1 to ${pageCount}`}
            />
          </label>
        </form>
      ) : null}
    </nav>
  );
});
Pagination.displayName = "Pagination";
