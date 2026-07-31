import { cn } from '../../utils/cn';

export function Card({ children, className, interactive = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface shadow-card',
        interactive && 'transition-shadow hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
