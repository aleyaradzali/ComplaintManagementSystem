import { Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { EmptyState } from '../components/feedback/EmptyState';
import { useOfficers } from '../hooks/useOfficers';
import { useComplaintBoard } from '../hooks/useComplaintBoard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLE } from '../constants/userRole';
import { COMPLAINT_STATUS } from '../constants/complaintStatus';
import { ROUTES } from '../constants/routes';

const ACTIVE_STATUSES = new Set([
  COMPLAINT_STATUS.INVESTIGATION,
  COMPLAINT_STATUS.ON_HOLD,
  COMPLAINT_STATUS.APPEAL,
]);

function buildWorkload(columns) {
  const workload = {};
  Object.values(columns).forEach(({ items }) => {
    items.forEach((item) => {
      const officerId = item.assigned_to?.id;
      if (!officerId) return;
      if (!workload[officerId]) workload[officerId] = { total: 0, active: 0, resolved: 0 };
      workload[officerId].total += 1;
      if (ACTIVE_STATUSES.has(item.status)) workload[officerId].active += 1;
      if (item.status === COMPLAINT_STATUS.RESOLVED) workload[officerId].resolved += 1;
    });
  });
  return workload;
}

export function OfficersPage() {
  useDocumentTitle('Officers');
  const { user } = useAuth();
  const officersState = useOfficers();
  const board = useComplaintBoard();

  if (user && user.role !== USER_ROLE.ADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const loading = officersState.loading || board.loading;
  const error = officersState.error || board.error;
  const workload = buildWorkload(board.columns);

  const handleRetry = () => {
    officersState.refetch();
    board.refetch();
  };

  return (
    <AppShell>
      <PageHeader title="Officers" subtitle="Workload overview for complaint-handling officers" />

      {loading ? (
        <LoadingState rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : officersState.officers.length === 0 ? (
        <EmptyState title="No officers found" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {officersState.officers.map((officer) => {
            const stats = workload[officer.id] ?? { total: 0, active: 0, resolved: 0 };
            return (
              <Card key={officer.id} className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={officer.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{officer.name}</p>
                    <p className="truncate text-xs text-muted">{officer.email}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                  <div>
                    <p className="tabular text-lg font-semibold text-ink">{stats.total}</p>
                    <p className="text-[11px] uppercase tracking-wide text-muted">Assigned</p>
                  </div>
                  <div>
                    <p className="tabular text-lg font-semibold text-warning">{stats.active}</p>
                    <p className="text-[11px] uppercase tracking-wide text-muted">Active</p>
                  </div>
                  <div>
                    <p className="tabular text-lg font-semibold text-success">{stats.resolved}</p>
                    <p className="text-[11px] uppercase tracking-wide text-muted">Resolved</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
