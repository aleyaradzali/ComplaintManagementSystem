import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

const VARIANTS = {
  primary: 'bg-primary text-white shadow-xs hover:bg-primary-hover focus-visible:outline-primary',
  secondary:
    'bg-surface text-ink border border-border hover:bg-surface-muted focus-visible:outline-primary',
  ghost: 'bg-transparent text-ink hover:bg-surface-muted focus-visible:outline-primary',
  danger:
    'bg-transparent text-danger border border-danger/25 hover:bg-danger-soft focus-visible:outline-danger',
};

const SIZES = {
  sm: 'gap-1.5 px-3 py-1.5 text-xs',
  md: 'gap-2 px-4 py-2 text-sm',
  lg: 'gap-2 px-5 py-2.5 text-sm',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded font-medium',
        'transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner size={16} className="text-current" />}
      {children}
    </button>
  );
}
