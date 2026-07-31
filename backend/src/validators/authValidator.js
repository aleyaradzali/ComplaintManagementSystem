import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ error: 'Email is required' })
      .min(1, 'Email is required')
      .email('Must be a valid email address'),
    password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
  }),
});
