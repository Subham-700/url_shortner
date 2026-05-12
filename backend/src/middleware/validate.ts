import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    res.status(400).json({ success: false, error: errors.join(', ') });
    return;
  }
  req.body = result.data;
  next();
};

export const schemas = {
  createUrl: z.object({
    originalUrl: z.string().url('Must be a valid URL'),
    customAlias: z.string().min(3).max(20).optional(),
    title: z.string().max(100).optional(),
    expiresAt: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  }),

  updateUrl: z.object({
    title: z.string().max(100).optional(),
    isActive: z.boolean().optional(),
    expiresAt: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  }),

  register: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1).max(50),
  }),

  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};
