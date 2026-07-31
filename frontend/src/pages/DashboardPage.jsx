import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { EmptyState } from '../components/feedback/EmptyState';
import { KPIMetricsBar } from '../components/complaints/KPIMetricsBar';
import { ComplaintTable } from '../components/complaints/ComplaintTable';
import { CategoryBreakdownChart } from '../components/dashboard/CategoryBreakdownChart';
import { ComplaintsOverTimeChart } from '../components/dashboard/ComplaintsOverTimeChart';
import { useComplaintBoard } from '../hooks/useComplaintBoard';
import { useComplaints } from '../hooks/useComplaints';
import { useDashboardCharts } from '../hooks/useDashboardCharts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

const RECENT_COUNT = 5;

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const board = useComplaintBoard();
  const { items, loading, error, refetch } = useComplaints();
  const charts = useDashboardCharts();
  const recent = items.slice(0, RECENT_COUNT);

  return (
    <AppShell>
      <PageHeader
        title={user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'}
        subtitle="Here's the current state of public complaints."
      />

      <div className="mb-6">
        <KPIMetricsBar columns={board.columns} total={board.total} loading={board.loading} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <CategoryBreakdownChart
          data={charts.categoryBreakdown}
          loading={charts.loading}
          error={charts.error}
          onRetry={charts.refetch}
        />
        <ComplaintsOverTimeChart
          data={charts.complaintsOverTime}
          loading={charts.loading}
          error={charts.error}
          onRetry={charts.refetch}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Recent complaints</h2>
        <Link
          to={ROUTES.COMPLAINTS}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
        >
          View all
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <LoadingState rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : recent.length === 0 ? (
        <EmptyState title="No complaints yet" message="New submissions will appear here." />
      ) : (
        <ComplaintTable items={recent} />
      )}
    </AppShell>
  );
}
