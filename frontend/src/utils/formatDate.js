export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
