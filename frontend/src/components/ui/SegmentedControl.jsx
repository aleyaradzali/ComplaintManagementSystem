import { cn } from '../../utils/cn';

export function SegmentedControl({ options, value, onChange, className }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded border border-border bg-surface-muted p-1',
        className
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
              isActive ? 'bg-surface text-primary shadow-xs' : 'text-muted hover:text-ink'
            )}
          >
            {opt.icon && <opt.icon size={15} aria-hidden="true" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
