import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AuthService } from '../services/authService';
import { UnauthorizedError } from '../utils/errors';

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided'));
  }

  const token = authHeader.split(' ')[1];
  const payload = AuthService.verifyToken(token);
  req.user = payload;
  next();
};

// Optional auth — doesn't throw if no token
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      req.user = AuthService.verifyToken(token);
    }
  } catch {
    // Swallow error — unauthenticated is fine here
  }
  next();
};
