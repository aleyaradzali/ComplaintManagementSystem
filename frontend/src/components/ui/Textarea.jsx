import { cn } from '../../utils/cn';

export function Textarea({ label, id, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'rounded border border-border bg-surface px-3 py-2 text-sm text-ink',
          'placeholder:text-muted focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-primary focus-visible:outline-offset-1',
          error && 'border-danger',
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
