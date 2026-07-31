import { ChevronRight, UserRound } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, Th, Td } from '../ui/Table';
import { Card } from '../ui/Card';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { formatDate } from '../../utils/formatDate';
import { cn } from '../../utils/cn';

function handleActivateKey(e, id, onRowClick) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onRowClick(id);
  }
}

// Row clicks stop propagation so the drawer's outside-click-to-close listener (on
// document) never sees them — a row click should switch the drawer's content, not
// close it, even though the row itself is outside the drawer panel.
function handleActivateClick(e, id, onRowClick) {
  e.stopPropagation();
  onRowClick(id);
}

// Sticky header cells need their own background — a sticky cell's box scrolls
// independently of its (static) <tr>, so the row's bg-surface-muted no longer paints
// behind it once stuck; without this, body rows would show through underneath.
const stickyThClass = 'sticky top-0 z-10 bg-surface-muted';

// `onRowClick` is optional — e.g. DashboardPage's "recent complaints" widget renders
// this table read-only, with no drawer/detail trigger wired up.
//
// Height/scroll is self-contained here rather than imposed by the caller: when a
// parent gives this component room to grow (e.g. ComplaintListPage's flex-1 region),
// it fills that space and scrolls internally with the header pinned; when it doesn't
// (e.g. DashboardPage's normal document flow), flex-1/min-h-0 are no-ops and it just
// renders at its natural height like before.
// `sort`/`order`/`onSort` are optional — when omitted (e.g. DashboardPage's read-only
// widget) columns render as plain, non-interactive headers.
export function ComplaintTable({ items, onRowClick, activeId, sort, order, onSort }) {
  const isInteractive = typeof onRowClick === 'function';
  const isSortable = typeof onSort === 'function';

  const sortProps = (column) =>
    isSortable
      ? { sortable: true, sortDirection: sort === column ? order : undefined, onSort: () => onSort(column) }
      : {};

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Card className="hidden overflow-hidden md:flex md:min-h-0 md:flex-1 md:flex-col">
        <Table containerClassName="min-h-0 flex-1">
          <TableHead>
            <Th className={stickyThClass} {...sortProps('title')}>Title</Th>
            <Th className={stickyThClass}>Category</Th>
            <Th className={stickyThClass}>Status</Th>
            <Th className={stickyThClass} {...sortProps('complainant_name')}>Complainant</Th>
            <Th className={stickyThClass}>Assigned to</Th>
            <Th className={stickyThClass} {...sortProps('created_at')}>Date</Th>
            <Th className={stickyThClass}>
              <span className="sr-only">Open</span>
            </Th>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                role={isInteractive ? 'button' : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                aria-label={isInteractive ? `View ${item.title}` : undefined}
                aria-current={activeId === item.id ? 'true' : undefined}
                onClick={isInteractive ? (e) => handleActivateClick(e, item.id, onRowClick) : undefined}
                onKeyDown={isInteractive ? (e) => handleActivateKey(e, item.id, onRowClick) : undefined}
                className={cn(
                  isInteractive &&
                    'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
                  activeId === item.id && 'bg-primary-soft/70 hover:bg-primary-soft/70'
                )}
              >
                <Td className="max-w-xs truncate font-medium text-ink">{item.title}</Td>
                <Td>
                  <CategoryBadge category={item.category} />
                </Td>
                <Td>
                  <StatusBadge status={item.status} />
                </Td>
                <Td>{item.complainant_name}</Td>
                <Td className="text-muted">{item.assigned_to?.name ?? 'Unassigned'}</Td>
                <Td className="tabular whitespace-nowrap text-muted">
                  {formatDate(item.created_at)}
                </Td>
                <Td>
                  <ChevronRight size={16} className="ml-auto text-muted" aria-hidden="true" />
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ul className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto md:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <div
              role={isInteractive ? 'button' : undefined}
              tabIndex={isInteractive ? 0 : undefined}
              aria-label={isInteractive ? `View ${item.title}` : undefined}
              aria-current={activeId === item.id ? 'true' : undefined}
              onClick={isInteractive ? (e) => handleActivateClick(e, item.id, onRowClick) : undefined}
              onKeyDown={isInteractive ? (e) => handleActivateKey(e, item.id, onRowClick) : undefined}
              className={cn(
                'block rounded-lg border border-border bg-surface p-4 shadow-card transition-shadow',
                isInteractive &&
                  'cursor-pointer hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                activeId === item.id && 'ring-2 ring-primary'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-ink">{item.title}</p>
                <ChevronRight size={16} className="mt-0.5 flex-none text-muted" aria-hidden="true" />
              </div>
              <p className="mt-1 text-sm text-muted">{item.complainant_name}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={item.status} />
                <CategoryBadge category={item.category} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <UserRound size={12} aria-hidden="true" />
                  {item.assigned_to?.name ?? 'Unassigned'}
                </span>
                <span className="tabular">{formatDate(item.created_at)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
