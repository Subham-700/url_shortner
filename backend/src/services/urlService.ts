import { IUrl, CreateUrlDto, UpdateUrlDto, PaginationMeta } from '../types';
import { Url } from '../models/Url';
import { CacheService, CacheKeys } from '../config/redis';
import { config } from '../config/env';
import {
  generateShortCode,
  isValidUrl,
  isValidCustomAlias,
  buildShortUrl,
} from '../utils/shortCode';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../utils/errors';

export class UrlService {
  // ── Create ──────────────────────────────────────────────────────────────
  static async createUrl(dto: CreateUrlDto, userId?: string): Promise<IUrl & { shortUrl: string }> {
    if (!isValidUrl(dto.originalUrl)) {
      throw new ValidationError('Invalid URL. Must start with http:// or https://');
    }

    if (dto.customAlias) {
      if (!isValidCustomAlias(dto.customAlias)) {
        throw new ValidationError(
          'Custom alias can only contain letters, numbers, hyphens, and underscores'
        );
      }
      const existing = await Url.findOne({ customAlias: dto.customAlias.toLowerCase() });
      if (existing) throw new ConflictError('This custom alias is already taken');
    }

    // Generate unique short code with collision handling
    let shortCode = generateShortCode();
    let attempts = 0;
    while (await Url.findOne({ shortCode })) {
      shortCode = generateShortCode();
      if (++attempts > 5) throw new Error('Failed to generate unique short code');
    }

    const url = await Url.create({
      originalUrl: dto.originalUrl,
      shortCode,
      customAlias: dto.customAlias?.toLowerCase(),
      userId: userId || undefined,
      title: dto.title,
      expiresAt: dto.expiresAt,
    });

    // Cache the mapping: code → original URL
    const effectiveCode = url.customAlias || url.shortCode;
    await CacheService.set(
      CacheKeys.URL(effectiveCode),
      url.originalUrl,
      config.redis.ttl
    );

    // Invalidate user's URL list cache
    if (userId) {
      await CacheService.deletePattern(`user:${userId}:urls:*`);
    }

    return { ...url.toObject(), shortUrl: buildShortUrl(effectiveCode) };
  }

  // ── Resolve (hot path — cache first) ────────────────────────────────────
  static async resolveUrl(code: string): Promise<string> {
    // 1. Cache hit
    const cached = await CacheService.get<string>(CacheKeys.URL(code));
    if (cached) return cached;

    // 2. DB lookup
    const url = await Url.findOne({
      $or: [{ shortCode: code }, { customAlias: code }],
      isActive: true,
    });

    if (!url) throw new NotFoundError('Short URL');
    if (url.expiresAt && url.expiresAt < new Date()) {
      throw new ValidationError('This link has expired');
    }

    // 3. Repopulate cache
    await CacheService.set(CacheKeys.URL(code), url.originalUrl, config.redis.ttl);

    // 4. Increment click counter (non-blocking)
    Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } }).exec();

    return url.originalUrl;
  }

  // ── Get by code (full doc) ───────────────────────────────────────────────
  static async getUrlByCode(code: string): Promise<IUrl> {
    const url = await Url.findOne({
      $or: [{ shortCode: code }, { customAlias: code }],
    });
    if (!url) throw new NotFoundError('URL');
    return url;
  }

  // ── List user URLs (paginated) ───────────────────────────────────────────
  static async getUserUrls(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ urls: IUrl[]; pagination: PaginationMeta }> {
    const cacheKey = CacheKeys.USER_URLS(userId, page);
    const cached = await CacheService.get<{ urls: IUrl[]; pagination: PaginationMeta }>(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * limit;
    const [urls, total] = await Promise.all([
      Url.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Url.countDocuments({ userId }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const result = {
      urls: urls as IUrl[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    await CacheService.set(cacheKey, result, 300); // 5 min cache
    return result;
  }

  // ── Update ───────────────────────────────────────────────────────────────
  static async updateUrl(
    code: string,
    userId: string,
    dto: UpdateUrlDto
  ): Promise<IUrl> {
    const url = await Url.findOneAndUpdate(
      { $or: [{ shortCode: code }, { customAlias: code }], userId },
      { $set: dto },
      { new: true }
    );
    if (!url) throw new NotFoundError('URL');

    // Invalidate caches
    await CacheService.del(CacheKeys.URL(code));
    await CacheService.deletePattern(`user:${userId}:urls:*`);

    return url;
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  static async deleteUrl(code: string, userId: string): Promise<void> {
    const url = await Url.findOneAndDelete({
      $or: [{ shortCode: code }, { customAlias: code }],
      userId,
    });
    if (!url) throw new NotFoundError('URL');

    await CacheService.del(CacheKeys.URL(code));
    await CacheService.deletePattern(`user:${userId}:urls:*`);
  }
}
