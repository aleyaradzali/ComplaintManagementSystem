import { useCallback, useEffect, useState } from 'react';
import { listOfficers } from '../api/complaintApi';

export function useOfficers(enabled = true) {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetchOfficers = useCallback(() => {
    setLoading(true);
    setError(null);

    listOfficers()
      .then((res) => setOfficers(res.data.officers))
      .catch((err) => setError(err.message ?? 'Failed to load officers'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern, consistent with other hooks
    fetchOfficers();
  }, [enabled, fetchOfficers]);

  return { officers, loading, error, refetch: fetchOfficers };
}
