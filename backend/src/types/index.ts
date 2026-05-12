import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ======= User Types =======
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  plan: 'free' | 'pro';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

// ======= URL Types =======
export interface IUrl extends Document {
  _id: Types.ObjectId;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  userId?: Types.ObjectId;
  title?: string;
  clicks: number;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ======= Analytics Types =======
export interface IClick extends Document {
  _id: Types.ObjectId;
  urlId: Types.ObjectId;
  ip: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  device?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser?: string;
  os?: string;
  createdAt: Date;
}

export interface AnalyticsSummary {
  totalClicks: number;
  uniqueClicks: number;
  clicksByDay: { date: string; count: number }[];
  clicksByDevice: { device: string; count: number }[];
  clicksByBrowser: { browser: string; count: number }[];
  topReferers: { referer: string; count: number }[];
}

// ======= Request Extensions =======
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    plan: string;
  };
}

// ======= API Response Types =======
export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ======= DTO Types =======
export interface CreateUrlDto {
  originalUrl: string;
  customAlias?: string;
  title?: string;
  expiresAt?: Date;
}

export interface UpdateUrlDto {
  title?: string;
  isActive?: boolean;
  expiresAt?: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}
