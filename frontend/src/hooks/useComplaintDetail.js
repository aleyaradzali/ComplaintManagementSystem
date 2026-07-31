import { useCallback, useEffect, useRef, useState } from 'react';
import { getComplaintById } from '../api/complaintApi';

export function useComplaintDetail(id) {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const fetchDetail = useCallback(() => {
    if (!id) {
      setComplaint(null);
      setLoading(false);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    getComplaintById(id)
      .then((res) => {
        if (requestIdRef.current !== requestId) return;
        setComplaint(res.data.complaint);
      })
      .catch((err) => {
        if (requestIdRef.current !== requestId) return;
        setError(err.message ?? 'Failed to load complaint');
      })
      .finally(() => {
        if (requestIdRef.current !== requestId) return;
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/dep-change is the intentional pattern (Context API + hooks, no React Query per README)
    fetchDetail();
  }, [fetchDetail]);

  return { complaint, loading, error, refetch: fetchDetail };
}
