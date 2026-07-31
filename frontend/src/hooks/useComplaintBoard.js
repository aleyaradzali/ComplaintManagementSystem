import { useCallback, useEffect, useState } from 'react';
import { getComplaintBoard } from '../api/complaintApi';

const EMPTY_BOARD = { columns: {}, total: 0 };

export function useComplaintBoard(category, assignedTo, search) {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoard = useCallback(() => {
    setLoading(true);
    setError(null);

    getComplaintBoard(category, assignedTo, search)
      .then(setBoard)
      .catch((err) => setError(err.message ?? 'Failed to load complaint overview'))
      .finally(() => setLoading(false));
  }, [category, assignedTo, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/dep-change is the intentional pattern (Context API + hooks, no React Query per README)
    fetchBoard();
  }, [fetchBoard]);

  return { ...board, loading, error, refetch: fetchBoard };
}
