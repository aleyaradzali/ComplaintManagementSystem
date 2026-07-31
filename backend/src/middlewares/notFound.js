import { Result } from '../utils/result.js';
import { MESSAGES } from '../constants/messages.js';

export function notFound(req, res) {
  res.status(404).json(Result.fail(MESSAGES.NOT_FOUND));
}
