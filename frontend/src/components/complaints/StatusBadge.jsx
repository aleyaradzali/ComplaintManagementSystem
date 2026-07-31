import { Badge } from '../ui/Badge';
import { getStatusMeta } from '../../constants/complaintStatus';

export function StatusBadge({ status }) {
  const meta = getStatusMeta(status);
  return <Badge color={meta.color}>{meta.label}</Badge>;
}
