import { Response } from 'express';
import { AuthRequest } from '../types';
import { UrlService } from '../services/urlService';
import { AnalyticsService } from '../services/analyticsService';
import { asyncHandler } from '../utils/errors';
import { buildShortUrl } from '../utils/shortCode';

export const createUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
  const url = await UrlService.createUrl(req.body, req.user?.id);
  res.status(201).json({
    success: true,
    data: {
      ...url,
      shortUrl: buildShortUrl(url.customAlias || url.shortCode),
    },
  });
});

export const redirect = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { code } = req.params;
  const originalUrl = await UrlService.resolveUrl(code);

  // Track click asynchronously — don't block redirect
  const url = await UrlService.getUrlByCode(code);
  setImmediate(() => {
    AnalyticsService.trackClick(
      url._id,
      req.ip || 'unknown',
      req.headers['user-agent'],
      req.headers.referer
    ).catch(() => {}); // Swallow analytics errors
  });

  res.redirect(301, originalUrl);
});

export const getUserUrls = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

  const result = await UrlService.getUserUrls(req.user!.id, page, limit);
  const urlsWithShortUrl = result.urls.map((url) => ({
    ...url,
    shortUrl: buildShortUrl((url as any).customAlias || (url as any).shortCode),
  }));

  res.json({ success: true, data: urlsWithShortUrl, pagination: result.pagination });
});

export const getUrlInfo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const url = await UrlService.getUrlByCode(req.params.code);
  res.json({
    success: true,
    data: {
      ...url.toObject(),
      shortUrl: buildShortUrl(url.customAlias || url.shortCode),
    },
  });
});

export const updateUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
  const url = await UrlService.updateUrl(req.params.code, req.user!.id, req.body);
  res.json({ success: true, data: url });
});

export const deleteUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
  await UrlService.deleteUrl(req.params.code, req.user!.id);
  res.json({ success: true, message: 'URL deleted successfully' });
});

export const getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const analytics = await AnalyticsService.getAnalytics(req.params.code, req.user!.id);
  res.json({ success: true, data: analytics });
});
