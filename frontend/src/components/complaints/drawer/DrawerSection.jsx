import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';

export function DrawerSection({ title, subtitle, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
      >
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="text-sm font-semibold text-ink">{title}</span>
          {subtitle && <span className="truncate text-xs text-muted">{subtitle}</span>}
        </span>
        <ChevronDown
          size={16}
          className={cn('flex-none text-muted transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && <div className="animate-fade-in px-5 pb-5">{children}</div>}
    </div>
  );
}
