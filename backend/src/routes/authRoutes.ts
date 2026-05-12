import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validate, schemas } from '../middleware/validate';
import { strictRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', strictRateLimiter, validate(schemas.register), authController.register);
router.post('/login', strictRateLimiter, validate(schemas.login), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
