import { Router } from 'express';
import * as urlController from '../controllers/urlController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate, schemas } from '../middleware/validate';
import { defaultRateLimiter, redirectRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public: redirect
router.get('/:code', redirectRateLimiter, urlController.redirect);

// URL CRUD (protected)
router.post(
  '/api/urls',
  defaultRateLimiter,
  optionalAuth,
  validate(schemas.createUrl),
  urlController.createUrl
);

router.get('/api/urls', authenticate, urlController.getUserUrls);
router.get('/api/urls/:code', authenticate, urlController.getUrlInfo);
router.put('/api/urls/:code', authenticate, validate(schemas.updateUrl), urlController.updateUrl);
router.delete('/api/urls/:code', authenticate, urlController.deleteUrl);

// Analytics
router.get('/api/urls/:code/analytics', authenticate, urlController.getAnalytics);

export default router;
