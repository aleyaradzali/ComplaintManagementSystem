import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const MIN_LENGTH = 3;
const DEBOUNCE_MS = 400;

export function ComplaintSearch({ value, onChange, className }) {
  const [inputValue, setInputValue] = useState(value ?? '');

  // Stay in sync when the search term is cleared elsewhere (e.g. "Clear filters").
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local text from an external prop change
    setInputValue(value ?? '');
  }, [value]);

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length > 0 && trimmed.length < MIN_LENGTH) return undefined;
    if (trimmed === (value ?? '')) return undefined;

    if (trimmed.length === 0) {
      onChange('');
      return undefined;
    }

    const timeout = setTimeout(() => onChange(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce keys off inputValue only
  }, [inputValue]);

  return (
    <div className={cn('relative', className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search title or complainant..."
        aria-label="Search complaints"
        className={cn(
          'h-10 w-full rounded border border-border bg-surface pl-9 pr-9 text-sm text-ink',
          'placeholder:text-muted focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-primary focus-visible:outline-offset-1'
        )}
      />
      {inputValue && (
        <button
          type="button"
          onClick={() => setInputValue('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:text-ink"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
