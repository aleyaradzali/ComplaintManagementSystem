export function BreakdownList({ items, total }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const pct = total ? Math.round((item.value / total) * 100) : 0;
        return (
          <li key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium text-ink">
                <span
                  className="h-2.5 w-2.5 flex-none rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                {item.label}
              </span>
              <span className="tabular flex-none text-muted">
                {item.value} <span className="text-xs">({pct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
