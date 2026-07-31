import { pool } from '../config/db.js';
import * as complaintRepository from '../repositories/complaintRepository.js';
import * as activityLogRepository from '../repositories/activityLogRepository.js';
import * as userRepository from '../repositories/userRepository.js';
import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';
import { ACTIVITY_ACTION } from '../constants/activityAction.js';
import { USER_ROLE } from '../constants/userRole.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export async function createComplaint(data, currentUser) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const complaint = await complaintRepository.create(client, data);
    await activityLogRepository.create(client, {
      complaint_id: complaint.id,
      action: ACTIVITY_ACTION.CREATED,
      description: 'Complaint submitted by complainant.',
      performed_by: currentUser.id,
    });

    await client.query('COMMIT');
    return complaint;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function listComplaints(query, currentUser) {
  const { page, limit, offset } = parsePagination(query);
  const assignedTo =
    currentUser.role === USER_ROLE.ADMIN ? query.assigned_to : currentUser.id;

  const { items, total } = await complaintRepository.findPaginated({
    status: query.status,
    category: query.category,
    sort: query.sort,
    order: query.order,
    assignedTo,
    search: query.search,
    limit,
    offset,
  });

  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
}

export async function getComplaintDetail(id, currentUser) {
  const complaint = await complaintRepository.findById(id);
  if (!complaint) {
    throw new AppError(MESSAGES.COMPLAINT_NOT_FOUND, 404);
  }
  if (currentUser.role !== USER_ROLE.ADMIN && complaint.assigned_to?.id !== currentUser.id) {
    throw new AppError(MESSAGES.FORBIDDEN, 403);
  }
  const activityLogs = await activityLogRepository.findByComplaintId(id);
  return { ...complaint, activity_logs: activityLogs };
}

export async function updateComplaint(id, payload, currentUser) {
  const { status, assigned_to, comment } = payload;

  if (assigned_to !== undefined && currentUser.role !== USER_ROLE.ADMIN) {
    throw new AppError(MESSAGES.FORBIDDEN_ADMIN_ONLY, 403);
  }

  const existing = await complaintRepository.findById(id);
  if (!existing) {
    throw new AppError(MESSAGES.COMPLAINT_NOT_FOUND, 404);
  }

  if (currentUser.role !== USER_ROLE.ADMIN && existing.assigned_to?.id !== currentUser.id) {
    throw new AppError(MESSAGES.FORBIDDEN, 403);
  }

  const isStatusChange = status !== undefined && status !== existing.status;
  const isAssignmentChange =
    assigned_to !== undefined && assigned_to !== (existing.assigned_to?.id ?? null);

  if (!isStatusChange && !isAssignmentChange) {
    return { complaint: existing, changed: false };
  }

  if (isAssignmentChange && assigned_to !== null) {
    const assignee = await userRepository.findById(assigned_to);
    if (!assignee) {
      throw new AppError(MESSAGES.ASSIGNEE_NOT_FOUND, 400);
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let complaint = existing;

    if (isStatusChange) {
      complaint = await complaintRepository.updateStatus(client, id, status);
      await activityLogRepository.create(client, {
        complaint_id: id,
        action: ACTIVITY_ACTION.STATUS_CHANGED,
        description: comment,
        performed_by: currentUser.id,
      });
    }

    if (isAssignmentChange) {
      complaint = await complaintRepository.updateAssignment(client, id, assigned_to);
      await activityLogRepository.create(client, {
        complaint_id: id,
        action: ACTIVITY_ACTION.ASSIGNED,
        description: comment,
        performed_by: currentUser.id,
      });
    }

    await client.query('COMMIT');
    return { complaint, changed: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
