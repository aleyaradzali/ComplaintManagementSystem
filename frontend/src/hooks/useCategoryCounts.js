import { useCallback, useEffect, useState } from 'react';
import { getCategoryCounts } from '../api/complaintApi';

export function useCategoryCounts() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCounts = useCallback(() => {
    setLoading(true);
    setError(null);

    getCategoryCounts()
      .then(setCounts)
      .catch((err) => setError(err.message ?? 'Failed to load category breakdown'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern, consistent with other hooks
    fetchCounts();
  }, [fetchCounts]);

  return { counts, loading, error, refetch: fetchCounts };
}
