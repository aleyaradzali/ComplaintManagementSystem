import { useCallback, useState } from 'react';

/**
 * Owns "which complaint is selected" + open/closed state for ComplaintDetailDrawer.
 * Lives outside any table-specific logic so a future trigger (e.g. a Kanban card click)
 * can drive the same drawer instance without duplicating this state.
 */
export function useComplaintDrawer() {
  const [selectedId, setSelectedId] = useState(null);
  const [open, setOpen] = useState(false);

  // Clicking the row that's already open toggles the drawer closed instead of
  // re-opening it to the same content.
  const openDrawer = useCallback(
    (id) => {
      if (open && selectedId === id) {
        setOpen(false);
        return;
      }
      setSelectedId(id);
      setOpen(true);
    },
    [open, selectedId]
  );

  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  return { selectedId, open, openDrawer, closeDrawer };
}
