import UAParser from 'ua-parser-js';
import { Click } from '../models/Click';
import { Url } from '../models/Url';
import { CacheService, CacheKeys } from '../config/redis';
import { AnalyticsSummary } from '../types';
import { NotFoundError } from '../utils/errors';
import { Types } from 'mongoose';

export class AnalyticsService {
  // ── Track Click (async, non-blocking) ────────────────────────────────────
  static async trackClick(
    urlId: string | Types.ObjectId,
    ip: string,
    userAgent?: string,
    referer?: string
  ): Promise<void> {
    const parsed = userAgent ? new UAParser(userAgent) : null;

    const deviceType = parsed?.getDevice().type;
    const device: 'desktop' | 'mobile' | 'tablet' | 'unknown' =
      deviceType === 'mobile'
        ? 'mobile'
        : deviceType === 'tablet'
        ? 'tablet'
        : parsed
        ? 'desktop'
        : 'unknown';

    await Click.create({
      urlId,
      ip: this.hashIp(ip),
      userAgent,
      referer: referer || undefined,
      device,
      browser: parsed?.getBrowser().name,
      os: parsed?.getOS().name,
    });

    // Invalidate analytics cache
    await CacheService.del(CacheKeys.ANALYTICS(urlId.toString()));
  }

  // ── Get Analytics Summary ─────────────────────────────────────────────────
  static async getAnalytics(code: string, userId: string): Promise<AnalyticsSummary> {
    const url = await Url.findOne({
      $or: [{ shortCode: code }, { customAlias: code }],
      userId,
    });
    if (!url) throw new NotFoundError('URL');

    const cacheKey = CacheKeys.ANALYTICS(url._id.toString());
    const cached = await CacheService.get<AnalyticsSummary>(cacheKey);
    if (cached) return cached;

    const urlId = url._id;

    // Run all aggregations in parallel
    const [totalClicks, uniqueClicks, clicksByDay, clicksByDevice, clicksByBrowser, topReferers] =
      await Promise.all([
        Click.countDocuments({ urlId }),
        Click.distinct('ip', { urlId }).then((ips) => ips.length),
        this.getClicksByDay(urlId),
        this.getClicksByField(urlId, 'device'),
        this.getClicksByField(urlId, 'browser'),
        this.getTopReferers(urlId),
      ]);

    const summary: AnalyticsSummary = {
      totalClicks,
      uniqueClicks,
      clicksByDay,
      clicksByDevice,
      clicksByBrowser,
      topReferers,
    };

    await CacheService.set(cacheKey, summary, 60); // 1 min cache
    return summary;
  }

  private static async getClicksByDay(urlId: Types.ObjectId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Click.aggregate([
      { $match: { urlId, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    return result;
  }

  private static async getClicksByField(urlId: Types.ObjectId, field: string) {
    const result = await Click.aggregate([
      { $match: { urlId } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { [field]: { $ifNull: ['$_id', 'Unknown'] }, count: 1, _id: 0 } },
    ]);
    return result.map((r) => ({ [field]: r[field] || 'Unknown', count: r.count }));
  }

  private static async getTopReferers(urlId: Types.ObjectId) {
    const result = await Click.aggregate([
      { $match: { urlId, referer: { $exists: true, $ne: null } } },
      { $group: { _id: '$referer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { referer: '$_id', count: 1, _id: 0 } },
    ]);
    return result;
  }

  // Hash IP for privacy (GDPR compliance)
  private static hashIp(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return ip.substring(0, ip.length / 2) + '***';
  }
}
