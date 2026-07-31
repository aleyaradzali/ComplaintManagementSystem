export const COMPLAINT_STATUS = {
  NEW: 'New',
  INVESTIGATION: 'Investigation',
  ON_HOLD: 'On Hold',
  APPEAL: 'Appeal',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const COMPLAINT_STATUS_OPTIONS = [
  { value: COMPLAINT_STATUS.NEW, label: 'New', color: 'var(--status-new)' },
  { value: COMPLAINT_STATUS.INVESTIGATION, label: 'Investigation', color: 'var(--status-investigation)' },
  { value: COMPLAINT_STATUS.ON_HOLD, label: 'On Hold', color: 'var(--status-on-hold)' },
  { value: COMPLAINT_STATUS.APPEAL, label: 'Appeal', color: 'var(--status-appeal)' },
  { value: COMPLAINT_STATUS.RESOLVED, label: 'Resolved', color: 'var(--status-resolved)' },
  { value: COMPLAINT_STATUS.CLOSED, label: 'Closed', color: 'var(--status-closed)' },
];

export const COMPLAINT_STATUS_VALUES = Object.values(COMPLAINT_STATUS);

const STATUS_MAP = new Map(COMPLAINT_STATUS_OPTIONS.map((opt) => [opt.value, opt]));

export function getStatusMeta(value) {
  return STATUS_MAP.get(value) ?? { value, label: value, color: 'var(--color-muted)' };
}
