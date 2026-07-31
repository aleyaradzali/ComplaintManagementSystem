import { X } from 'lucide-react';

export function DrawerSkeleton({ onClose }) {
  return (
    <div className="flex h-full flex-col" role="status" aria-label="Loading complaint">
      <div className="flex flex-none items-center justify-between border-b border-border p-5">
        <div className="h-5 w-40 animate-pulse rounded bg-border/50" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close complaint details"
          className="flex-none rounded p-1.5 text-muted hover:bg-surface-muted hover:text-ink"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-col gap-4 p-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-border/50" />
        ))}
      </div>
    </div>
  );
}
