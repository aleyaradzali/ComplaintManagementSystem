import { DrawerSection } from './DrawerSection';
import { StatusUpdateForm } from '../StatusUpdateForm';
import { getStatusMeta } from '../../../constants/complaintStatus';

/**
 * Status updates are open to both officers and admins here, mirroring
 * ComplaintDetailPage — only assignment is admin-gated per the API contract.
 */
export function DrawerStatusSection({ complaint, complaintId, onUpdated }) {
  const meta = getStatusMeta(complaint.status);

  return (
    <DrawerSection title="Status" subtitle={meta.label}>
      <StatusUpdateForm complaintId={complaintId} currentStatus={complaint.status} onUpdated={onUpdated} />
    </DrawerSection>
  );
}
