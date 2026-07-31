import { useState } from 'react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { COMPLAINT_STATUS_OPTIONS } from '../../constants/complaintStatus';
import { updateComplaintStatus } from '../../api/complaintApi';

export function StatusUpdateForm({ complaintId, currentStatus, onUpdated }) {
  const [status, setStatus] = useState(currentStatus);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    try {
      await updateComplaintStatus(complaintId, { status, comment });
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
        setFormError(err.message ?? 'Failed to update status');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="mb-4 text-sm font-semibold text-ink">Update Status</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          id="status"
          label="New status"
          options={COMPLAINT_STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          error={errors.status}
        />
        <Textarea
          id="comment"
          label="Comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          error={errors.comment}
          placeholder="Describe what changed and why"
        />
        {formError && <p className="text-sm text-danger">{formError}</p>}
        <Button type="submit" loading={submitting} disabled={submitting} className="self-start">
          Update status
        </Button>
      </form>
    </Card>
  );
}
