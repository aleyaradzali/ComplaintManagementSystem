import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRound, CalendarDays, RefreshCw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { CategoryBadge } from './CategoryBadge';
import { COMPLAINT_STATUS_OPTIONS } from '../../constants/complaintStatus';
import { USER_ROLE } from '../../constants/userRole';
import { formatDate } from '../../utils/formatDate';
import { ROUTES } from '../../constants/routes';
import { updateComplaint } from '../../api/complaintApi';
import { useAuth } from '../../hooks/useAuth';
import { useOfficers } from '../../hooks/useOfficers';

const COLUMNS = COMPLAINT_STATUS_OPTIONS.map((opt) => ({
  status: opt.value,
  label: opt.label,
  color: opt.color,
}));

/**
 * Combined status + assignee editor. Both fields patch through the same
 * endpoint in one call, so an admin can reassign and re-status a card in a
 * single save instead of opening the detail drawer for each change.
 */
function QuickEditForm({ item, isAdmin, onDone }) {
  const { officers } = useOfficers(isAdmin);
  const [status, setStatus] = useState(item.status);
  const [assignedTo, setAssignedTo] = useState(item.assigned_to?.id ? String(item.assigned_to.id) : '');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const officerOptions = officers.map((o) => ({ value: String(o.id), label: o.name }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmitting(true);
    setError(null);
    try {
      await updateComplaint(item.id, {
        status,
        assigned_to: isAdmin ? (assignedTo ? Number(assignedTo) : null) : undefined,
        comment,
      });
      onDone();
    } catch (err) {
      setError(err.message ?? 'Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onClick={(e) => e.stopPropagation()}
      className="mt-3 flex flex-col gap-2 border-t border-border pt-3"
    >
      <Select
        id={`quick-status-${item.id}`}
        options={COMPLAINT_STATUS_OPTIONS}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-9 text-xs"
      />
      {isAdmin && (
        <Select
          id={`quick-assignee-${item.id}`}
          options={officerOptions}
          placeholder="Unassigned"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="h-9 text-xs"
        />
      )}
      <Textarea
        id={`quick-comment-${item.id}`}
        rows={2}
        placeholder="Comment (required)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="text-xs"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button type="submit" size="sm" loading={submitting} disabled={submitting}>
        Save
      </Button>
    </form>
  );
}

function KanbanCard({ item, isAdmin, onChanged }) {
  const [editing, setEditing] = useState(false);

  return (
    <Card className="p-3.5" interactive>
      <div className="flex items-start justify-between gap-2">
        <Link
          to={ROUTES.COMPLAINT_DETAIL(item.id)}
          className="line-clamp-2 text-sm font-medium text-ink hover:text-primary"
        >
          {item.title}
        </Link>
      </div>
      <div className="mt-2">
        <CategoryBadge category={item.category} />
      </div>
      <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <UserRound size={12} aria-hidden="true" />
          {item.assigned_to?.name ?? 'Unassigned'}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays size={12} aria-hidden="true" />
          {formatDate(item.created_at)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setEditing((v) => !v)}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover"
      >
        <RefreshCw size={12} aria-hidden="true" />
        {editing ? 'Cancel' : isAdmin ? 'Update' : 'Change status'}
      </button>

      {editing && (
        <QuickEditForm
          item={item}
          isAdmin={isAdmin}
          onDone={() => {
            setEditing(false);
            onChanged();
          }}
        />
      )}
    </Card>
  );
}

export function ComplaintKanbanView({ columns, onChanged }) {
  const { user } = useAuth();
  const isAdmin = user?.role === USER_ROLE.ADMIN;

  return (
    <div className="scrollbar-thin -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {COLUMNS.map((col) => {
        const column = columns[col.status] ?? { items: [], total: 0 };
        return (
          <section key={col.status} className="w-72 flex-none sm:w-80">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
              <h3 className="text-sm font-semibold text-ink">{col.label}</h3>
              <span className="tabular ml-auto rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted">
                {column.total}
              </span>
            </div>
            <div className="scrollbar-thin flex max-h-[calc(100vh-20rem)] flex-col gap-3 overflow-y-auto rounded-lg bg-surface-muted/60 p-2">
              {column.items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted">
                  No complaints
                </p>
              ) : (
                column.items.map((item) => (
                  <KanbanCard key={item.id} item={item} isAdmin={isAdmin} onChanged={onChanged} />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
