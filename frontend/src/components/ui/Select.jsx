import { cn } from '../../utils/cn';

export function Select({ label, id, error, options, placeholder, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'h-10 rounded border border-border bg-surface px-3 text-sm text-ink',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
          'focus-visible:outline-offset-1',
          error && 'border-danger',
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
