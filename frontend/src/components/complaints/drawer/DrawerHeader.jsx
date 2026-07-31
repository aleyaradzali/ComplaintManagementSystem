import { Link } from 'react-router-dom';
import { ExternalLink, X } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { CategoryBadge } from '../CategoryBadge';
import { formatDateTime } from '../../../utils/formatDate';
import { ROUTES } from '../../../constants/routes';

export function DrawerHeader({ complaint, onClose }) {
  return (
    <div className="flex-none border-b border-border bg-surface-muted/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 text-base font-semibold leading-snug text-ink">
          {complaint.title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close complaint details"
          className="flex-none rounded p-1.5 text-muted hover:bg-surface hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
        {complaint.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={complaint.category} />
        <StatusBadge status={complaint.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">Submitted {formatDateTime(complaint.created_at)}</p>
        <Link
          to={ROUTES.COMPLAINT_DETAIL(complaint.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          View full page
          <ExternalLink size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
