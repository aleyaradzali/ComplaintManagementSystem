import * as authService from '../services/authService.js';
import { Result } from '../utils/result.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookie.js';
import { MESSAGES } from '../constants/messages.js';

export const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body);
  setAuthCookie(res, token);
  res.status(200).json(Result.ok({ user }, MESSAGES.LOGIN_SUCCESS));
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.status(200).json(Result.ok(null, MESSAGES.LOGOUT_SUCCESS));
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.status(200).json(Result.ok({ user }, MESSAGES.PROFILE_RETRIEVED));
});
