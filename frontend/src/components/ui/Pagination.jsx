import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const navButtonClass =
  'inline-flex items-center gap-1 rounded border border-border bg-surface px-3 py-1.5 text-sm text-ink transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

const DEFAULT_LIMIT_OPTIONS = [10, 20, 50, 100];

export function Pagination({
  page,
  totalPages,
  total,
  itemCount,
  limit,
  limitOptions = DEFAULT_LIMIT_OPTIONS,
  onPageChange,
  onLimitChange,
  className,
}) {
  const showingCount = typeof total === 'number' && typeof itemCount === 'number';
  const showLimitSelect = typeof limit === 'number' && typeof onLimitChange === 'function';
  const showPageInfo = typeof totalPages === 'number';
  const showNav = showPageInfo && totalPages > 1;

  if (!showingCount && !showLimitSelect && !showPageInfo) return null;

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-wrap items-center justify-between gap-4', className)}
    >
      <div className="flex flex-wrap items-center gap-4">
        {(showingCount || showPageInfo) && (
          <p className="text-xs text-muted">
            {showingCount && (
              <>
                Showing <span className="tabular font-medium text-ink">{itemCount}</span> of{' '}
                <span className="tabular font-medium text-ink">{total}</span> records
              </>
            )}
            {showingCount && showPageInfo && <span className="mx-2 text-opacity-100">|</span>}
            {showPageInfo && (
              <>
                Page <span className="tabular font-medium text-ink">{page}</span> of{' '}
                <span className="tabular font-medium text-ink">{totalPages}</span>
              </>
            )}
          </p>
        )}

        {showLimitSelect && (
          <div className="flex items-center gap-2">
            <label htmlFor="pagination-limit" className="text-xs text-muted">
              Rows per page
            </label>
            <select
              id="pagination-limit"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-8 rounded border border-border bg-surface px-2 text-xs text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {showNav && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrev}
            aria-label="Previous page"
            className={navButtonClass}
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
            aria-label="Next page"
            className={navButtonClass}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </nav>
  );
}
