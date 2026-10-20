export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type Plan = 'FREE' | 'PRO' | 'BUSINESS';
export type RedirectType = 301 | 302 | 307;
export type DeviceType = 'ios' | 'android' | 'desktop';
export type ReportCategory = 'PHISHING' | 'MALWARE' | 'SPAM' | 'COPYRIGHT' | 'HARASSMENT' | 'OTHER';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  plan: Plan;
  createdAt: string;
}

export interface Link {
  id: string;
  code: string;
  originalUrl: string;
  title: string;
  notes?: string;
  redirectType: RedirectType;
  
  // Device Targeting
  iosUrl?: string;
  androidUrl?: string;
  desktopUrl?: string;
  
  // UTM Parameters
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  
  // Protections & Limits
  password?: string; // Plain or bcrypt hash
  expiresAt?: string | null;
  maxClicks?: number | null;
  clickCount: number;
  isActive: boolean;
  isBlocked: boolean;
  showPreview: boolean; // Anti-phishing interstitial

  // QR Customization
  qrColor: string;
  qrBgColor: string;

  // Metadata & Relations
  userId?: string;
  folderId?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClickRecord {
  id: string;
  linkId: string;
  ipHash: string;
  device: DeviceType;
  os: string;
  browser: string;
  country: string;
  city: string;
  referrer: string;
  isUnique: boolean;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  userId: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  userId: string;
  createdAt: string;
}

export interface AbuseReport {
  id: string;
  linkId: string;
  linkCode: string;
  originalUrl: string;
  category: ReportCategory;
  details: string;
  reporterIpHash: string;
  status: ReportStatus;
  createdAt: string;
}

export interface BlockedDomain {
  id: string;
  domain: string;
  reason: string;
  createdAt: string;
}
