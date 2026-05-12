import mongoose, { Schema } from 'mongoose';
import { IUrl } from '../types';

const urlSchema = new Schema<IUrl>(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple nulls
      trim: true,
      lowercase: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for faster queries
urlSchema.index({ userId: 1, createdAt: -1 });
urlSchema.index({ shortCode: 1, isActive: 1 });

// Virtual for the effective short code (custom alias takes priority)
urlSchema.virtual('effectiveCode').get(function () {
  return this.customAlias || this.shortCode;
});

export const Url = mongoose.model<IUrl>('Url', urlSchema);
