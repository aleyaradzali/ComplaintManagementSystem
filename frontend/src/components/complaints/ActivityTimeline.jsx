import { FilePlus, RefreshCw, UserCheck, MessageSquare } from 'lucide-react';
import { Card } from '../ui/Card';
import { EmptyState } from '../feedback/EmptyState';
import { formatDateTime } from '../../utils/formatDate';

const ACTION_ICONS = {
  created: FilePlus,
  status_changed: RefreshCw,
  assigned: UserCheck,
  commented: MessageSquare,
};

export function ActivityTimeline({ logs, bare = false }) {
  if (!logs || logs.length === 0) {
    return <EmptyState title="No activity yet" message="Updates to this complaint will appear here." />;
  }

  const list = (
    <ol className={bare ? 'flex flex-col gap-5' : 'mt-4 flex flex-col gap-5'}>
      {logs.map((log) => {
        const Icon = ACTION_ICONS[log.action] ?? MessageSquare;
        return (
          <li key={log.id} className="flex gap-3">
            <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon size={14} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ink">{log.description}</p>
              <p className="mt-0.5 text-xs text-muted">
                {log.performed_by?.name} · {formatDateTime(log.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );

  if (bare) return list;

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-ink">Activity Timeline</h2>
      {list}
    </Card>
  );
}
