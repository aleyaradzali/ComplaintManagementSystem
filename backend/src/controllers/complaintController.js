import * as complaintService from '../services/complaintService.js';
import { Result } from '../utils/result.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { MESSAGES } from '../constants/messages.js';

export const create = asyncHandler(async (req, res) => {
  const complaint = await complaintService.createComplaint(req.body, req.user);
  res.status(201).json(Result.ok({ complaint }, MESSAGES.COMPLAINT_CREATED));
});

export const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await complaintService.listComplaints(req.query, req.user);
  res
    .status(200)
    .json(Result.ok({ items, pagination }, MESSAGES.COMPLAINTS_RETRIEVED));
});

export const getDetail = asyncHandler(async (req, res) => {
  const complaint = await complaintService.getComplaintDetail(req.params.id, req.user);
  res.status(200).json(Result.ok({ complaint }, MESSAGES.COMPLAINT_RETRIEVED));
});

export const update = asyncHandler(async (req, res) => {
  const { complaint, changed } = await complaintService.updateComplaint(
    req.params.id,
    req.body,
    req.user
  );
  const message = changed ? MESSAGES.COMPLAINT_UPDATED : MESSAGES.COMPLAINT_NO_CHANGES;
  res.status(200).json(Result.ok({ complaint }, message));
});
