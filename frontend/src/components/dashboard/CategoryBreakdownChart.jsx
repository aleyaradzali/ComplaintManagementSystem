import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { ErrorState } from '../feedback/ErrorState';
import { EmptyState } from '../feedback/EmptyState';
import { getCategoryMeta } from '../../constants/complaintCategory';

const CHART_HEIGHT = 260;

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: point } = payload[0];
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-md">
      <p className="flex items-center gap-1.5 font-medium text-ink">
        <span
          className="h-2 w-2 flex-none rounded-full"
          style={{ backgroundColor: point.fill }}
          aria-hidden="true"
        />
        {name}
      </p>
      <p className="mt-0.5 tabular text-muted">
        <span className="font-semibold text-ink">{value}</span> complaint{value === 1 ? '' : 's'}
      </p>
    </div>
  );
}

export function CategoryBreakdownChart({ data = [], loading, error, onRetry }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const legendItems = data.map((item) => ({ ...getCategoryMeta(item.category), count: item.count }));
  const chartData = legendItems
    .filter((item) => item.count > 0)
    .map((item) => ({ label: item.label, value: item.count, fill: item.color }));

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-ink">Complaints by category</h2>
      <p className="mb-4 text-xs text-muted">This month</p>

      {loading ? (
        <div
          className="flex items-center justify-center"
          style={{ height: CHART_HEIGHT }}
          role="status"
          aria-label="Loading chart"
        >
          <Spinner size={24} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : total === 0 ? (
        <EmptyState
          title="No complaints yet this month"
          message="The breakdown will appear once complaints start coming in."
        />
      ) : (
        <>
          <div className="relative" style={{ height: CHART_HEIGHT }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="62%"
                  outerRadius="90%"
                  paddingAngle={2}
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-ink">{total}</span>
              <span className="text-xs text-muted">this month</span>
            </div>
          </div>

          <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {legendItems.map((item) => (
              <li key={item.value} className="flex items-center gap-1.5 text-xs">
                <span
                  className="h-2.5 w-2.5 flex-none rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span className="text-ink">{item.label}</span>
                <span className="tabular text-muted">{item.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
