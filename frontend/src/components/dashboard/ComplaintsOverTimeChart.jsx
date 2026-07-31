import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { ErrorState } from '../feedback/ErrorState';

const CHART_HEIGHT = 260;

function formatDayTick(dateStr) {
  return String(Number(dateStr.slice(-2)));
}

function formatFullDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
  });
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { value, payload: point } = payload[0];
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-ink">{formatFullDate(point.date)}</p>
      <p className="mt-0.5 tabular text-muted">
        <span className="font-semibold text-ink">{value}</span> complaint{value === 1 ? '' : 's'}
      </p>
    </div>
  );
}

export function ComplaintsOverTimeChart({ data = [], loading, error, onRetry }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-ink">Complaints over time</h2>
      <p className="mb-4 text-xs text-muted">This month, by day</p>

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
      ) : (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDayTick}
              tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--color-primary)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: 'var(--color-primary)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
