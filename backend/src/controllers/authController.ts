import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { asyncHandler } from '../utils/errors';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await AuthService.register(req.body);
  res.status(201).json({
    success: true,
    data: { user, token },
    message: 'Account created successfully',
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await AuthService.login(req.body);
  res.json({
    success: true,
    data: { user, token },
    message: 'Logged in successfully',
  });
});

export const me = asyncHandler(async (req: Request & { user?: any }, res: Response) => {
  res.json({ success: true, data: { user: req.user } });
});
