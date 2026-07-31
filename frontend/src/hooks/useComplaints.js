import { useCallback, useEffect, useState } from 'react';
import { listComplaints } from '../api/complaintApi';
import { useSort } from './useSort';

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGINATION = { page: 1, limit: DEFAULT_LIMIT, total: 0, totalPages: 1 };

export function useComplaints() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [filters, setFilters] = useState({ status: '', category: '', assigned_to: '', search: '' });
  const { sort, order, toggleSort } = useSort();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComplaints = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = { page, limit };
    if (sort) {
      params.sort = sort;
      params.order = order;
    }
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;
    if (filters.assigned_to) params.assigned_to = filters.assigned_to;
    if (filters.search) params.search = filters.search;

    listComplaints(params)
      .then((res) => {
        setItems(res.data.items);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(err.message ?? 'Failed to load complaints'))
      .finally(() => setLoading(false));
  }, [page, limit, filters, sort, order]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/dep-change is the intentional pattern (Context API + hooks, no React Query per README)
    fetchComplaints();
  }, [fetchComplaints]);

  const updateFilters = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const updateLimit = (nextLimit) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const updateSort = (column) => {
    toggleSort(column);
    setPage(1);
  };

  return {
    items,
    pagination,
    page,
    setPage,
    limit,
    updateLimit,
    filters,
    updateFilters,
    sort,
    order,
    updateSort,
    loading,
    error,
    refetch: fetchComplaints,
  };
}
