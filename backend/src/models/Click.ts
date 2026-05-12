import mongoose, { Schema } from 'mongoose';
import { IClick } from '../types';

const clickSchema = new Schema<IClick>(
  {
    urlId: {
      type: Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
      index: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: String,
    referer: String,
    country: String,
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
    },
    browser: String,
    os: String,
  },
  {
    timestamps: true,
    // Only keep createdAt for analytics
    toJSON: { virtuals: false },
  }
);

// Indexes for analytics aggregations
clickSchema.index({ urlId: 1, createdAt: -1 });
clickSchema.index({ urlId: 1, ip: 1 }); // Unique click detection
clickSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90 day TTL

export const Click = mongoose.model<IClick>('Click', clickSchema);
