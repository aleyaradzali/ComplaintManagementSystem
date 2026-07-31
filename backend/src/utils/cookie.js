import { env } from '../config/env.js';

export const COOKIE_NAME = 'token';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 1000 * 60 * 30,   // 30 minutes, not 8 hours
};

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, cookieOptions);
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
}
