import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { useComplaintDetail } from '../../hooks/useComplaintDetail';
import { USER_ROLE } from '../../constants/userRole';
import { Button } from '../ui/Button';
import { DrawerHeader } from './drawer/DrawerHeader';
import { DrawerComplainantSection } from './drawer/DrawerComplainantSection';
import { DrawerAssigneeSection } from './drawer/DrawerAssigneeSection';
import { DrawerStatusSection } from './drawer/DrawerStatusSection';
import { DrawerActivityTimeline } from './drawer/DrawerActivityTimeline';
import { DrawerSkeleton } from './drawer/DrawerSkeleton';

const TRANSITION_MS = 300;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Generic, standalone complaint detail panel. Takes a `complaintId` and manages its
 * own fetch — it doesn't know or care whether it was opened from a table row, a Kanban
 * card, or anything else. "Which complaint is selected" lives in the caller (see
 * useComplaintDrawer), so a future trigger can reuse this component unchanged.
 */
export function ComplaintDetailDrawer({ complaintId, open, onClose, onChanged }) {
  const { user } = useAuth();
  const { complaint, loading, error, refetch } = useComplaintDetail(complaintId);
  const [shouldRender, setShouldRender] = useState(open);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Keep the panel mounted long enough to play the exit transition before unmounting.
  // Mount/unmount is driven by the `open` prop transition, not derivable at render time.
  useEffect(() => {
    if (open) {
      setShouldRender(true); // eslint-disable-line react-hooks/set-state-in-effect
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const timeout = setTimeout(() => setShouldRender(false), TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [open]);

  // Move focus into the panel on open, and back to the trigger on close.
  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement;
    const raf = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      const el = previousFocusRef.current;
      if (el && typeof el.focus === 'function') el.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape to close, and a simple focus trap while open.
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Click outside the panel closes it. There is deliberately no full-screen backdrop
  // element intercepting pointer events — on desktop the table must stay clickable
  // beside the panel (so clicking a different row switches content instead of being
  // swallowed by a backdrop). Row triggers call stopPropagation() on their click so
  // it never reaches this listener; every other outside click does.
  useEffect(() => {
    if (!open) return undefined;

    function handleOutsideClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [open, onClose]);

  if (!shouldRender) return null;

  const isAdmin = user?.role === USER_ROLE.ADMIN;
  const showSkeleton = loading && !complaint;
  const showError = !loading && Boolean(error);

  const handleUpdated = () => {
    refetch();
    onChanged?.();
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={complaint?.title ?? 'Complaint details'}
      tabIndex={-1}
      className={cn(
        'fixed inset-x-0 bottom-0 top-16 z-[60] flex flex-col bg-surface shadow-lg outline-none',
        // Below `lg` (the project's "desktop" breakpoint — see README section 8) the panel
        // overlays full-width, same as mobile: there isn't room to push a tablet-width table.
        'transition-transform duration-300 ease-in-out lg:inset-x-auto lg:right-0 lg:w-[480px]',
        visible ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {showSkeleton ? (
        <DrawerSkeleton onClose={onClose} />
      ) : showError ? (
        <div className="flex h-full flex-col">
          <div className="flex flex-none items-center justify-between border-b border-border p-5">
            <h2 className="text-sm font-semibold text-ink">Complaint details</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close complaint details"
              className="rounded p-1.5 text-muted hover:bg-surface-muted hover:text-ink"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
              <AlertTriangle size={22} aria-hidden="true" />
            </span>
            <p className="text-sm text-ink">{error}</p>
            <Button variant="secondary" onClick={refetch}>
              Try again
            </Button>
          </div>
        </div>
      ) : complaint ? (
        <div className="flex h-full flex-col">
          <DrawerHeader complaint={complaint} onClose={onClose} />
          <div
            className={cn(
              'scrollbar-thin flex-1 overflow-y-auto transition-opacity duration-150',
              loading && 'pointer-events-none opacity-50'
            )}
          >
            <DrawerComplainantSection complaint={complaint} />
            <DrawerAssigneeSection
              complaint={complaint}
              complaintId={complaintId}
              isAdmin={isAdmin}
              onUpdated={handleUpdated}
            />
            <DrawerStatusSection complaint={complaint} complaintId={complaintId} onUpdated={handleUpdated} />
            <DrawerActivityTimeline logs={complaint.activity_logs} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
