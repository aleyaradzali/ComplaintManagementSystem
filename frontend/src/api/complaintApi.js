import axiosClient from './axiosClient';
import { COMPLAINT_STATUS_VALUES } from '../constants/complaintStatus';
import { COMPLAINT_CATEGORY_VALUES } from '../constants/complaintCategory';

const BOARD_COLUMN_LIMIT = 100;

export function listComplaints(params) {
  return axiosClient.get('/complaints', { params });
}

/**
 * Fetches complaints grouped by status via parallel per-status list calls, since the
 * API has no dedicated stats/board endpoint. Reused by both the KPI bar (counts) and
 * the Kanban view (cards) so they stay in sync from a single fetch.
 */
export async function getComplaintBoard(category, assignedTo, search) {
  const params = { limit: BOARD_COLUMN_LIMIT, sort: 'created_at', order: 'desc' };
  if (category) params.category = category;
  if (assignedTo) params.assigned_to = assignedTo;
  if (search) params.search = search;

  const responses = await Promise.all(
    COMPLAINT_STATUS_VALUES.map((status) => listComplaints({ ...params, status }))
  );

  const columns = {};
  let total = 0;
  COMPLAINT_STATUS_VALUES.forEach((status, index) => {
    const { items, pagination } = responses[index].data;
    columns[status] = { items, total: pagination.total };
    total += pagination.total;
  });

  return { columns, total };
}

/**
 * Fetches total complaint counts per category via parallel per-category list calls
 * (limit: 1, reading only pagination.total), since the API has no stats endpoint.
 * Used by the Reports page's category breakdown.
 */
export async function getCategoryCounts() {
  const responses = await Promise.all(
    COMPLAINT_CATEGORY_VALUES.map((category) => listComplaints({ category, limit: 1 }))
  );

  const counts = {};
  COMPLAINT_CATEGORY_VALUES.forEach((category, index) => {
    counts[category] = responses[index].data.pagination.total;
  });

  return counts;
}

export function getComplaintById(id) {
  return axiosClient.get(`/complaints/${id}`);
}

export function createComplaint(data) {
  return axiosClient.post('/complaints', data);
}

export function updateComplaintStatus(id, { status, comment }) {
  return axiosClient.patch(`/complaints/${id}`, { status, comment });
}

export function assignComplaint(id, { assigned_to, comment }) {
  return axiosClient.patch(`/complaints/${id}`, { assigned_to, comment });
}

export function updateComplaint(id, { status, assigned_to, comment }) {
  return axiosClient.patch(`/complaints/${id}`, { status, assigned_to, comment });
}

export function listOfficers() {
  return axiosClient.get('/users/officers');
}

export function getDashboardCharts() {
  return axiosClient.get('/dashboard/charts');
}
