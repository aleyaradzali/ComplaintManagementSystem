import { X } from 'lucide-react';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { COMPLAINT_STATUS_OPTIONS } from '../../constants/complaintStatus';
import { COMPLAINT_CATEGORY_OPTIONS } from '../../constants/complaintCategory';
import { USER_ROLE } from '../../constants/userRole';
import { useAuth } from '../../hooks/useAuth';
import { useOfficers } from '../../hooks/useOfficers';
import { cn } from '../../utils/cn';

export function ComplaintFilters({ filters, onChange, showStatus = true, stacked = false }) {
  const { user } = useAuth();
  const isAdmin = user?.role === USER_ROLE.ADMIN;
  const { officers } = useOfficers(isAdmin);
  const officerOptions = officers.map((officer) => ({ value: officer.id, label: officer.name }));

  const hasFilters = Boolean(filters.status || filters.category || filters.assigned_to);

  return (
    <div className={cn('flex flex-col gap-3', !stacked && 'sm:flex-row sm:flex-wrap sm:items-end')}>
      {showStatus && (
        <Select
          id="filter-status"
          label="Status"
          placeholder="All statuses"
          options={COMPLAINT_STATUS_OPTIONS}
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="sm:w-48"
        />
      )}
      <Select
        id="filter-category"
        label="Category"
        placeholder="All categories"
        options={COMPLAINT_CATEGORY_OPTIONS}
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className="sm:w-48"
      />
      {isAdmin && (
        <Select
          id="filter-assigned-to"
          label="Assigned To"
          placeholder="All officers"
          options={officerOptions}
          value={filters.assigned_to}
          onChange={(e) => onChange({ ...filters, assigned_to: e.target.value })}
          className="sm:w-48"
        />
      )}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ ...filters, status: '', category: '', assigned_to: '' })}
          className="self-start sm:self-auto"
        >
          <X size={14} />
          Clear filters
        </Button>
      )}
    </div>
  );
}
