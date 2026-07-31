import { UserRound } from 'lucide-react';
import { DrawerSection } from './DrawerSection';
import { AssignOfficerForm } from '../AssignOfficerForm';

export function DrawerAssigneeSection({ complaint, complaintId, isAdmin, onUpdated }) {
  const assigneeName = complaint.assigned_to?.name ?? 'Unassigned';

  return (
    <DrawerSection title="Assignee" subtitle={assigneeName}>
      {isAdmin ? (
        <AssignOfficerForm
          complaintId={complaintId}
          currentAssigneeId={complaint.assigned_to?.id}
          onUpdated={onUpdated}
        />
      ) : (
        <div className="flex items-center gap-2 text-sm text-ink">
          <UserRound size={16} className="flex-none text-muted" aria-hidden="true" />
          {assigneeName}
        </div>
      )}
    </DrawerSection>
  );
}
