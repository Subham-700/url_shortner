import { customAlphabet } from 'nanoid';
import { config } from '../config/env';

// URL-safe alphabet (no ambiguous chars)
const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';

const generateId = customAlphabet(ALPHABET, config.url.shortCodeLength);

export const generateShortCode = (): string => generateId();

export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const isValidCustomAlias = (alias: string): boolean => {
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(alias) && alias.length <= config.url.maxCustomAliasLength;
};

export const buildShortUrl = (code: string): string => `${config.baseUrl}/${code}`;

export const normalizeUrl = (url: string): string => {
  const parsed = new URL(url);
  return parsed.toString();
};
