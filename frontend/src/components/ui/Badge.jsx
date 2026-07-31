import { cn } from '../../utils/cn';

export function Badge({ children, color, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight transition-colors',
        className
      )}
      style={
        color
          ? {
              color,
              backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 26%, transparent)`,
            }
          : undefined
      }
    >
      {color && (
        <span
          className="h-1.5 w-1.5 flex-none rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 0 2px color-mix(in srgb, ${color} 20%, transparent)` }}
        />
      )}
      {children}
    </span>
  );
}
