import { Card } from '../ui/Card';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { formatDateTime } from '../../utils/formatDate';

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm text-ink">{children}</p>
    </div>
  );
}

export function ComplaintInfoCard({ complaint }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{complaint.title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={complaint.category} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">
        {complaint.description}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Complainant">{complaint.complainant_name}</Field>
        <Field label="Phone">{complaint.complainant_phone || '—'}</Field>
        <Field label="Email">{complaint.complainant_email || '—'}</Field>
        <Field label="Assigned officer">{complaint.assigned_to?.name ?? 'Unassigned'}</Field>
        <Field label="Submitted">{formatDateTime(complaint.created_at)}</Field>
        <Field label="Last updated">{formatDateTime(complaint.updated_at)}</Field>
      </div>
    </Card>
  );
}
