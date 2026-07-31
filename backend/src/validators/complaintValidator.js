import { z } from 'zod';
import { COMPLAINT_CATEGORY_VALUES } from '../constants/complaintCategory.js';
import { COMPLAINT_STATUS_VALUES } from '../constants/complaintStatus.js';

const categoryEnum = z.enum(COMPLAINT_CATEGORY_VALUES, {
  error: 'Category must be one of: ' + COMPLAINT_CATEGORY_VALUES.join(', '),
});

const statusEnum = z.enum(COMPLAINT_STATUS_VALUES, {
  error: 'Status must be one of: ' + COMPLAINT_STATUS_VALUES.join(', '),
});

export const createSchema = z.object({
  body: z.object({
    title: z
      .string({ error: 'Title is required' })
      .min(1, 'Title is required')
      .max(200, 'Title must be at most 200 characters'),
    description: z.string({ error: 'Description is required' }).min(1, 'Description is required'),
    category: categoryEnum,
    complainant_name: z
      .string({ error: 'Complainant name is required' })
      .min(1, 'Complainant name is required')
      .max(150, 'Complainant name must be at most 150 characters'),
    complainant_phone: z.string().max(30).optional().nullable(),
    complainant_email: z
      .string()
      .email('Must be a valid email address')
      .max(150)
      .optional()
      .nullable()
      .or(z.literal('')),
  }),
});

export const listQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: statusEnum.optional(),
    category: categoryEnum.optional(),
    sort: z.enum(['created_at', 'updated_at', 'title', 'status', 'category', 'complainant_name']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    assigned_to: z.coerce.number().int().positive().optional(),
    search: z.string().trim().min(3, 'Search must be at least 3 characters').max(200).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.coerce.number({ error: 'Complaint id must be a number' }).int().positive(),
  }),
});

export const updateSchema = z.object({
  body: z
    .object({
      status: statusEnum.optional(),
      assigned_to: z.coerce.number().int().positive().nullable().optional(),
      comment: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.status === undefined && data.assigned_to === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['status'],
          message: 'Provide at least a status or an assignment change',
        });
        return;
      }
      if (!data.comment || data.comment.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['comment'],
          message: 'Comment is required when updating status or assignment',
        });
      }
    }),
});
