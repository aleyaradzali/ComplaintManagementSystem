import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
        <Inbox size={22} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        {message && <p className="mt-1 text-sm text-muted">{message}</p>}
      </div>
      {action}
    </div>
  );
}
