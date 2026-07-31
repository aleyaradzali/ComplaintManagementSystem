import { DrawerSection } from './DrawerSection';

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm text-ink">{value || '—'}</p>
    </div>
  );
}

export function DrawerComplainantSection({ complaint }) {
  return (
    <DrawerSection title="Complainant Details">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" value={complaint.complainant_name} />
        <Field label="Phone" value={complaint.complainant_phone} />
        <Field label="Email" value={complaint.complainant_email} />
      </div>
    </DrawerSection>
  );
}
