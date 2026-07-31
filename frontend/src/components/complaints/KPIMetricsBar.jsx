import { Inbox, FileClock, Search, PauseCircle, Flag, CheckCircle2, Archive } from 'lucide-react';
import { Card } from '../ui/Card';
import { COMPLAINT_STATUS, COMPLAINT_STATUS_OPTIONS } from '../../constants/complaintStatus';

const STATUS_ICONS = {
  [COMPLAINT_STATUS.NEW]: FileClock,
  [COMPLAINT_STATUS.INVESTIGATION]: Search,
  [COMPLAINT_STATUS.ON_HOLD]: PauseCircle,
  [COMPLAINT_STATUS.APPEAL]: Flag,
  [COMPLAINT_STATUS.RESOLVED]: CheckCircle2,
  [COMPLAINT_STATUS.CLOSED]: Archive,
};

const TILES = [
  { key: 'total', label: 'Total complaints', icon: Inbox, color: 'var(--color-primary)' },
  ...COMPLAINT_STATUS_OPTIONS.map((opt) => ({
    key: opt.value,
    label: opt.label,
    icon: STATUS_ICONS[opt.value],
    color: opt.color,
  })),
];

export function KPIMetricsBar({ columns, total, loading }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {TILES.map(({ key, label, icon: Icon, color }) => {
        const value = key === 'total' ? total : (columns[key]?.total ?? 0);
        return (
          <Card key={key} className="p-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full"
                style={{ color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
              >
                <Icon size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted">{label}</p>
                {loading ? (
                  <div className="mt-1 h-6 w-10 animate-pulse rounded bg-border/60" />
                ) : (
                  <p className="tabular text-xl font-semibold text-ink">{value}</p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
