import { Result } from '../utils/result.js';
import { MESSAGES } from '../constants/messages.js';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path[issue.path.length - 1] ?? issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json(Result.fail(MESSAGES.VALIDATION_FAILED, { errors }));
    }

    if (result.data.body !== undefined) req.body = result.data.body;
    if (result.data.query !== undefined) req.query = result.data.query;
    if (result.data.params !== undefined) req.params = result.data.params;
    next();
  };
}
