import { cn } from '../../utils/cn';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0][0];
  return initials.toUpperCase();
}

export function Avatar({ name, className }) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary',
        className
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
