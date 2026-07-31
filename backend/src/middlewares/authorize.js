import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError(MESSAGES.FORBIDDEN, 403));
    }
    next();
  };
}
