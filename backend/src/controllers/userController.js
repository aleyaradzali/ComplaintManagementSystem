import * as userService from '../services/userService.js';
import { Result } from '../utils/result.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { MESSAGES } from '../constants/messages.js';

export const listOfficers = asyncHandler(async (req, res) => {
  const officers = await userService.listOfficers();
  res.status(200).json(Result.ok({ officers }, MESSAGES.OFFICERS_RETRIEVED));
});
