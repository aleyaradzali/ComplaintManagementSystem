import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { BreakdownList } from '../components/reports/BreakdownList';
import { useComplaintBoard } from '../hooks/useComplaintBoard';
import { useCategoryCounts } from '../hooks/useCategoryCounts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { COMPLAINT_STATUS_OPTIONS } from '../constants/complaintStatus';
import { COMPLAINT_CATEGORY_OPTIONS } from '../constants/complaintCategory';

export function ReportsPage() {
  useDocumentTitle('Reports');
  const board = useComplaintBoard();
  const { counts, loading: categoryLoading, error: categoryError, refetch: refetchCategories } =
    useCategoryCounts();

  const statusItems = COMPLAINT_STATUS_OPTIONS.map((opt) => ({
    label: opt.label,
    value: board.columns[opt.value]?.total ?? 0,
    color: opt.color,
  }));

  const categoryTotal = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const categoryItems = COMPLAINT_CATEGORY_OPTIONS.map((opt) => ({
    label: opt.label,
    value: counts[opt.value] ?? 0,
    color: opt.color,
  }));

  return (
    <AppShell>
      <PageHeader title="Reports" subtitle="Complaint volume by status and category" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-ink">By status</h2>
          {board.loading ? (
            <LoadingState rows={4} />
          ) : board.error ? (
            <ErrorState message={board.error} onRetry={board.refetch} />
          ) : (
            <BreakdownList items={statusItems} total={board.total} />
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-ink">By category</h2>
          {categoryLoading ? (
            <LoadingState rows={5} />
          ) : categoryError ? (
            <ErrorState message={categoryError} onRetry={refetchCategories} />
          ) : (
            <BreakdownList items={categoryItems} total={categoryTotal} />
          )}
        </Card>
      </div>
    </AppShell>
  );
}
