import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '../../utils/cn';

// `containerClassName` extends the scrolling wrapper (e.g. to bound its height so it
// scrolls vertically too — see ComplaintTable). It has to land on this same div rather
// than a div wrapped around <Table>: an ancestor with its own overflow-y:auto becomes
// a second scroll container sitting between a sticky <th> and the real scrollport,
// which silently breaks position:sticky (the cell sticks to the inert inner box
// instead of the one that's actually scrolling).
export function Table({ children, className, containerClassName }) {
  return (
    <div className={cn('scrollbar-thin overflow-auto', containerClassName)}>
      {/* border-separate (not border-collapse) — sticky positioning on <th> cells doesn't
          take effect in collapsed-border tables in any major browser. Row/cell borders
          below are applied per-cell instead of via divide-y on <tr>, since border-separate
          doesn't paint borders on non-cell elements (tr/thead/tbody). */}
      <table className={cn('w-full border-separate border-spacing-0 text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead>
      <tr className="bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-muted">
        {children}
      </tr>
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className, ...props }) {
  return (
    <tr className={cn('transition-colors hover:bg-surface-muted', className)} {...props}>
      {children}
    </tr>
  );
}

// Pass `sortable` to turn a header into a sort control — `sortDirection` ('asc' | 'desc' |
// undefined) reflects the current state and `onSort` fires on click/Enter/Space. This is
// generic over any table's column keys: the caller owns what "sort by this column" means.
export function Th({ children, className, sortable, sortDirection, onSort }) {
  if (!sortable) {
    return <th className={cn('border-b border-border px-4 py-3 font-semibold', className)}>{children}</th>;
  }

  const Icon = sortDirection === 'asc' ? ArrowUp : sortDirection === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <th
      className={cn('border-b border-border px-4 py-3 font-semibold', className)}
      aria-sort={sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none'}
    >
      <button
        type="button"
        onClick={onSort}
        className={cn(
          'inline-flex items-center gap-1 rounded-sm hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
          sortDirection && 'text-ink'
        )}
      >
        {children}
        <Icon size={12} aria-hidden="true" className={cn('flex-none', !sortDirection && 'opacity-40')} />
      </button>
    </th>
  );
}

export function Td({ children, className }) {
  return <td className={cn('border-b border-border px-4 py-3 align-middle text-ink', className)}>{children}</td>;
}
