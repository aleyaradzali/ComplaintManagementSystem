import { useCallback, useEffect, useState } from 'react';
import { getDashboardCharts } from '../api/complaintApi';

const EMPTY_CHARTS = { categoryBreakdown: [], complaintsOverTime: [] };

export function useDashboardCharts() {
  const [charts, setCharts] = useState(EMPTY_CHARTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCharts = useCallback(() => {
    setLoading(true);
    setError(null);

    getDashboardCharts()
      .then((res) => setCharts(res.data))
      .catch((err) => setError(err.message ?? 'Failed to load dashboard charts'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern, consistent with other hooks
    fetchCharts();
  }, [fetchCharts]);

  return { ...charts, loading, error, refetch: fetchCharts };
}
