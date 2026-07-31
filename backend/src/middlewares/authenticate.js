import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { COOKIE_NAME } from '../utils/cookie.js';
import { MESSAGES } from '../constants/messages.js';

export function authenticate(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return next(new AppError(MESSAGES.UNAUTHENTICATED, 401));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(MESSAGES.UNAUTHENTICATED, 401));
  }
}
