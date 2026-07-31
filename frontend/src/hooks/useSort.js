import { useState } from 'react';

/**
 * Tracks a single sort column + direction, for pairing with the sortable `Th` in
 * `ui/Table`. Only one column can be active at a time, so switching to a different
 * column implicitly clears the previous one back to neutral.
 *
 * Each column cycles independently through three states on repeated clicks:
 * ascending -> descending -> no sort (back to neutral/default order).
 */
export function useSort() {
  const [sort, setSort] = useState(null);
  const [order, setOrder] = useState('asc');

  const toggleSort = (column) => {
    if (column !== sort) {
      setSort(column);
      setOrder('asc');
    } else if (order === 'asc') {
      setOrder('desc');
    } else {
      setSort(null);
    }
  };

  return { sort, order, toggleSort };
}
