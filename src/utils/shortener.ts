import crypto from 'node:crypto';

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface LinkTargeting {
  originalUrl: string;
  iosUrl?: string;
  androidUrl?: string;
  desktopUrl?: string;
}

export interface LinkStatusCheck {
  allowed: boolean;
  reason?: 'expired' | 'max_clicks_reached' | 'inactive' | 'password_required' | 'blocked';
}

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Normalizes URL: ensures protocol, trims spaces, validates scheme
 */
export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

/**
 * Validates whether string is a valid HTTP/HTTPS URL with proper hostname
 */
export function isValidUrl(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return false;

  try {
    const withProtocol = normalizeUrl(trimmed);
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Prevents recursive redirection loops targeting narshort.url or current domain
 */
export function isSelfDomain(input: string, selfDomain: string = 'narshort.url'): boolean {
  try {
    const parsed = new URL(normalizeUrl(input));
    const host = parsed.hostname.toLowerCase();
    const self = selfDomain.toLowerCase().replace(/:\d+$/, '');
    return host === self || host.endsWith(`.${self}`) || host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

/**
 * Generates random base62 short code (default 6-7 characters)
 */
export function generateBase62Code(length = 6): string {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS[bytes[i] % BASE62_CHARS.length];
  }
  return result;
}

/**
 * Appends UTM query parameters to a base URL
 */
export function buildUtmUrl(baseUrl: string, utm: UtmParams): string {
  try {
    const url = new URL(normalizeUrl(baseUrl));
    if (utm.source) url.searchParams.set('utm_source', utm.source);
    if (utm.medium) url.searchParams.set('utm_medium', utm.medium);
    if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign);
    if (utm.term) url.searchParams.set('utm_term', utm.term);
    if (utm.content) url.searchParams.set('utm_content', utm.content);
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Anonymizes client IP with SHA-256 for GDPR/privacy compliance
 */
export function hashIp(ip: string, salt: string = 'narshort_salt_v1'): string {
  if (!ip) return 'anonymous';
  return crypto.createHash('sha256').update(`${ip}:${salt}`).digest('hex').substring(0, 16);
}

/**
 * Detects device platform based on User-Agent string
 */
export function detectDevice(userAgent: string): 'ios' | 'android' | 'desktop' {
  const ua = (userAgent || '').toLowerCase();
  if (/ipad|iphone|ipod/.test(ua)) {
    return 'ios';
  }
  if (/android/.test(ua)) {
    return 'android';
  }
  return 'desktop';
}

/**
 * Resolves targeted URL based on visitor device
 */
export function getDeviceTargetedUrl(link: LinkTargeting, userAgent: string): string {
  const device = detectDevice(userAgent);
  if (device === 'ios' && link.iosUrl && isValidUrl(link.iosUrl)) {
    return link.iosUrl;
  }
  if (device === 'android' && link.androidUrl && isValidUrl(link.androidUrl)) {
    return link.androidUrl;
  }
  if (device === 'desktop' && link.desktopUrl && isValidUrl(link.desktopUrl)) {
    return link.desktopUrl;
  }
  return link.originalUrl;
}

/**
 * Validates link availability based on status, expiry, max clicks, and password
 */
export function checkLinkStatus(link: {
  isActive: boolean;
  isBlocked?: boolean;
  expiresAt?: string | null;
  maxClicks?: number | null;
  clickCount?: number;
  hasPassword?: boolean;
}): LinkStatusCheck {
  if (link.isBlocked) {
    return { allowed: false, reason: 'blocked' };
  }
  if (!link.isActive) {
    return { allowed: false, reason: 'inactive' };
  }
  if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
    return { allowed: false, reason: 'expired' };
  }
  if (link.maxClicks && (link.clickCount ?? 0) >= link.maxClicks) {
    return { allowed: false, reason: 'max_clicks_reached' };
  }
  if (link.hasPassword) {
    return { allowed: false, reason: 'password_required' };
  }
  return { allowed: true };
}
