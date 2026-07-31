import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { LoadingState } from '../components/feedback/LoadingState';
import { ErrorState } from '../components/feedback/ErrorState';
import { ComplaintInfoCard } from '../components/complaints/ComplaintInfoCard';
import { ActivityTimeline } from '../components/complaints/ActivityTimeline';
import { StatusUpdateForm } from '../components/complaints/StatusUpdateForm';
import { AssignOfficerForm } from '../components/complaints/AssignOfficerForm';
import { useComplaintDetail } from '../hooks/useComplaintDetail';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLE } from '../constants/userRole';
import { ROUTES } from '../constants/routes';

export function ComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { complaint, loading, error, refetch } = useComplaintDetail(id);
  useDocumentTitle(complaint?.title ?? 'Complaint');

  return (
    <AppShell>
      <Link
        to={ROUTES.COMPLAINTS}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to complaints
      </Link>

      {loading ? (
        <LoadingState rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <ComplaintInfoCard complaint={complaint} />
            <ActivityTimeline logs={complaint.activity_logs} />
          </div>
          <div className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
            <StatusUpdateForm
              complaintId={id}
              currentStatus={complaint.status}
              onUpdated={refetch}
            />
            {user?.role === USER_ROLE.ADMIN && (
              <AssignOfficerForm
                complaintId={id}
                currentAssigneeId={complaint.assigned_to?.id}
                onUpdated={refetch}
              />
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
