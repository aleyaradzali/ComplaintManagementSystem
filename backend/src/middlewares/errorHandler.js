import { Result } from '../utils/result.js';
import { AppError } from '../utils/AppError.js';
import { MESSAGES } from '../constants/messages.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  if (!env.isProduction) {
    console.error(err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(Result.fail(err.message, err.data));
  }

  return res.status(500).json(Result.fail(MESSAGES.INTERNAL_ERROR));
}
