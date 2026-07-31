import { Badge } from '../ui/Badge';
import { getCategoryMeta } from '../../constants/complaintCategory';

export function CategoryBadge({ category }) {
  const meta = getCategoryMeta(category);
  return <Badge className="bg-surface-muted text-muted">{meta.label}</Badge>;
}
