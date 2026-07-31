import { useState } from 'react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { assignComplaint } from '../../api/complaintApi';
import { useOfficers } from '../../hooks/useOfficers';

export function AssignOfficerForm({ complaintId, currentAssigneeId, onUpdated }) {
  const { officers } = useOfficers();
  const [assignedTo, setAssignedTo] = useState(currentAssigneeId ?? '');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const officerOptions = officers.map((o) => ({ value: String(o.id), label: o.name }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    try {
      await assignComplaint(complaintId, {
        assigned_to: assignedTo ? Number(assignedTo) : null,
        comment,
      });
      setComment('');
      onUpdated();
    } catch (err) {
      if (err.data?.errors) {
        const fieldErrors = {};
        err.data.errors.forEach((fe) => {
          fieldErrors[fe.field] = fe.message;
        });
        setErrors(fieldErrors);
      } else {
        setFormError(err.message ?? 'Failed to assign complaint');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="mb-4 text-sm font-semibold text-ink">Assign Officer</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          id="assigned_to"
          label="Officer"
          placeholder="Unassigned"
          options={officerOptions}
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          error={errors.assigned_to}
        />
        <Textarea
          id="assign-comment"
          label="Comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          error={errors.comment}
          placeholder="Note the reason for this assignment"
        />
        {formError && <p className="text-sm text-danger">{formError}</p>}
        <Button type="submit" loading={submitting} disabled={submitting} className="self-start">
          Assign
        </Button>
      </form>
    </Card>
  );
}
