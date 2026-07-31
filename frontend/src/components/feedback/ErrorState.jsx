import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle size={22} aria-hidden="true" />
      </span>
      <p className="text-sm text-ink">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
