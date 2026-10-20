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

export interface LinkItem {
  id: string;
  code: string;
  originalUrl: string;
  title: string;
  notes?: string;
  redirectType: RedirectType;
  
  iosUrl?: string;
  androidUrl?: string;
  desktopUrl?: string;
  
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  
  password?: string;
  expiresAt?: string | null;
  maxClicks?: number | null;
  clickCount: number;
  isActive: boolean;
  isBlocked: boolean;
  showPreview: boolean;

  qrColor: string;
  qrBgColor: string;

  userId?: string;
  folderId?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FolderItem {
  id: string;
  name: string;
  color?: string;
  userId: string;
  createdAt: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  prefix: string;
  userId: string;
  lastUsedAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AbuseReportItem {
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

export interface BlockedDomainItem {
  id: string;
  domain: string;
  reason: string;
  createdAt: string;
}

export interface LinkAnalyticsData {
  link: LinkItem;
  summary: {
    totalClicks: number;
    uniqueClicks: number;
    todayClicks: number;
  };
  timeSeries: Array<{ date: string; total: number; unique: number }>;
  devices: Array<{ name: string; count: number }>;
  operatingSystems: Array<{ name: string; count: number }>;
  browsers: Array<{ name: string; count: number }>;
  referrers: Array<{ name: string; count: number }>;
  countries: Array<{ name: string; count: number }>;
}
