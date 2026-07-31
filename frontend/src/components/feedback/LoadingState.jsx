export function LoadingState({ rows = 5 }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-border/50" />
      ))}
    </div>
  );
}
