import { useState } from 'react';
import { LayoutGrid, ListFilter, Rows3 } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { EmptyState } from '../components/feedback/EmptyState';
import { ComplaintFilters } from '../components/complaints/ComplaintFilters';
import { ComplaintSearch } from '../components/complaints/ComplaintSearch';
import { ComplaintTable } from '../components/complaints/ComplaintTable';
import { ComplaintKanbanView } from '../components/complaints/ComplaintKanbanView';
import { ComplaintDetailDrawer } from '../components/complaints/ComplaintDetailDrawer';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { useComplaints } from '../hooks/useComplaints';
import { useComplaintBoard } from '../hooks/useComplaintBoard';
import { useComplaintDrawer } from '../hooks/useComplaintDrawer';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const VIEW_STORAGE_KEY = 'resolv:complaint-view';
const VIEW_OPTIONS = [
  { value: 'table', label: 'Table', icon: Rows3 },
  { value: 'kanban', label: 'Board', icon: LayoutGrid },
];

export function ComplaintListPage() {
  useDocumentTitle('Complaints');
  const [view, setView] = useState(
    () => localStorage.getItem(VIEW_STORAGE_KEY) ?? 'table'
  );
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);

  const {
    items,
    pagination,
    filters,
    updateFilters,
    setPage,
    limit,
    updateLimit,
    sort,
    order,
    updateSort,
    loading,
    error,
    refetch,
  } = useComplaints();

  const board = useComplaintBoard(filters.category, filters.assigned_to, filters.search);
  const drawer = useComplaintDrawer();

  const handleViewChange = (next) => {
    setView(next);
    localStorage.setItem(VIEW_STORAGE_KEY, next);
  };

  const handleBoardChanged = () => {
    board.refetch();
    refetch();
  };

  const hasFilters = Boolean(
    filters.status || filters.category || filters.assigned_to || filters.search
  );

  return (
    <AppShell rightPanelOpen={drawer.open} fillHeight={view === 'table'}>
      <PageHeader
        title="Complaints"
        subtitle="Review, assign, and track public complaints"
        actions={<SegmentedControl options={VIEW_OPTIONS} value={view} onChange={handleViewChange} />}
      />

      <div className="mb-4 flex flex-none items-center gap-3">
        <div className="hidden flex-1 md:flex md:self-end">
          <ComplaintSearch
            value={filters.search}
            onChange={(search) => updateFilters({ ...filters, search })}
            className="max-w-xs flex-1 md:flex-none md:w-72 mb-0"
          />
        </div>
        <div className="hidden flex-1 justify-end md:flex">
          <ComplaintFilters
            filters={filters}
            onChange={updateFilters}
            showStatus={view === 'table'}
          />
        </div>
        <Button
          variant="secondary"
          className="md:hidden"
          aria-label="Open filters"
          onClick={() => setFiltersModalOpen(true)}
        >
          <ListFilter size={16} />
        </Button>
      </div>

      <Modal open={filtersModalOpen} onClose={() => setFiltersModalOpen(false)} title="Filters">
        <ComplaintFilters
          filters={filters}
          onChange={updateFilters}
          showStatus={view === 'table'}
          stacked
        />
      </Modal>

      {view === 'kanban' ? (
        board.loading ? (
          <LoadingState rows={6} />
        ) : board.error ? (
          <ErrorState message={board.error} onRetry={board.refetch} />
        ) : (
          <ComplaintKanbanView columns={board.columns} onChanged={handleBoardChanged} />
        )
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {loading ? (
            <LoadingState rows={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : items.length === 0 ? (
            <EmptyState
              title="No complaints found"
              message={hasFilters ? 'Try adjusting your filters.' : 'No complaints have been submitted yet.'}
            />
          ) : (
            <>
              <ComplaintTable
                items={items}
                onRowClick={drawer.openDrawer}
                activeId={drawer.open ? drawer.selectedId : null}
                sort={sort}
                order={order}
                onSort={updateSort}
              />
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                itemCount={items.length}
                limit={limit}
                onLimitChange={updateLimit}
                onPageChange={setPage}
                className="mt-4 flex-none"
              />
            </>
          )}
        </div>
      )}

      <ComplaintDetailDrawer
        complaintId={drawer.selectedId}
        open={drawer.open}
        onClose={drawer.closeDrawer}
        onChanged={refetch}
      />
    </AppShell>
  );
}
