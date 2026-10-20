import fs from 'node:fs';
import path from 'node:path';
import {
  User,
  Link,
  ClickRecord,
  ApiKey,
  Folder,
  AbuseReport,
  BlockedDomain,
} from './types.ts';
import { generateBase62Code, hashIp } from '../utils/shortener.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Initial Users
const users: User[] = [
  {
    id: 'user_admin_01',
    name: 'Nadhif Ramadhan (Admin)',
    email: 'admin@narshort.url',
    role: 'ADMIN',
    plan: 'BUSINESS',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user_demo_02',
    name: 'Demo Creator',
    email: 'demo@narshort.url',
    role: 'USER',
    plan: 'PRO',
    createdAt: '2026-01-10T00:00:00.000Z',
  },
];

// Folders
const folders: Folder[] = [
  {
    id: 'folder_01',
    name: 'Kampanye 2026',
    color: '#3730A3',
    userId: 'user_admin_01',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'folder_02',
    name: 'Produk & Aplikasi',
    color: '#C9A24B',
    userId: 'user_admin_01',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
];

// Blocked Domains
const blockedDomains: BlockedDomain[] = [
  {
    id: 'block_01',
    domain: 'phish-bank.com',
    reason: 'Upaya phishing terdeteksi pada form credentials',
    createdAt: '2026-01-12T00:00:00.000Z',
  },
  {
    id: 'block_02',
    domain: 'malware-drop.xyz',
    reason: 'Penyebaran file APK berbahaya tanpa sertifikat',
    createdAt: '2026-02-03T00:00:00.000Z',
  },
];

// Initial Links
const links: Link[] = [
  {
    id: 'link_01',
    code: 'promo-oktober',
    originalUrl: 'https://tokopedia.com/promo-spesial-harbolnas',
    title: 'Promo Spesial Harbolnas - Diskon 70%',
    notes: 'Kampanye promosi kuartal ke-4 dengan banner utama',
    redirectType: 302,
    utmSource: 'instagram',
    utmMedium: 'story_swipe',
    utmCampaign: 'harbolnas_2026',
    clickCount: 1482,
    isActive: true,
    isBlocked: false,
    showPreview: false,
    qrColor: '#3730A3',
    qrBgColor: '#FFFFFF',
    userId: 'user_admin_01',
    folderId: 'folder_01',
    tags: ['marketing', 'promo', 'ecommerce'],
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'link_02',
    code: 'unduh-aplikasi',
    originalUrl: 'https://narshort.url/download',
    title: 'Download Aplikasi Mobile narshort.url',
    notes: 'Smart routing ke Google Play Store atau Apple App Store',
    redirectType: 307,
    iosUrl: 'https://apps.apple.com/app/id647382910',
    androidUrl: 'https://play.google.com/store/apps/details?id=com.narshort.app',
    desktopUrl: 'https://narshort.url/web-download',
    clickCount: 843,
    isActive: true,
    isBlocked: false,
    showPreview: false,
    qrColor: '#C9A24B',
    qrBgColor: '#FAF8F5',
    userId: 'user_admin_01',
    folderId: 'folder_02',
    tags: ['aplikasi', 'mobile', 'smart-routing'],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'link_03',
    code: 'dokumen-rahasia',
    originalUrl: 'https://notion.so/narshort/internal-investor-briefing',
    title: 'Investor Deck & Roadmap 2026 [Terkunci]',
    notes: 'Akses terbatas untuk partner dan venture capital',
    redirectType: 302,
    password: 'narshort-vip',
    clickCount: 140,
    isActive: true,
    isBlocked: false,
    showPreview: false,
    qrColor: '#0F172A',
    qrBgColor: '#FFFFFF',
    userId: 'user_admin_01',
    folderId: 'folder_01',
    tags: ['internal', 'investor', 'rahasia'],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'link_04',
    code: 'preview-aman',
    originalUrl: 'https://github.com/torvalds/linux',
    title: 'Kernel Linux Repository di GitHub',
    notes: 'Contoh link dengan proteksi preview anti-phishing diaktifkan',
    redirectType: 302,
    clickCount: 356,
    isActive: true,
    isBlocked: false,
    showPreview: true,
    qrColor: '#3730A3',
    qrBgColor: '#FFFFFF',
    userId: 'user_demo_02',
    folderId: null,
    tags: ['developer', 'opensource', 'github'],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'link_05',
    code: 'link-kedaluwarsa',
    originalUrl: 'https://event.narshort.url/webinar-live',
    title: 'Webinar Eksklusif SEO & Link Management',
    notes: 'Webinar telah berakhir pada tanggal yang ditentukan',
    redirectType: 302,
    expiresAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    clickCount: 620,
    isActive: true,
    isBlocked: false,
    showPreview: false,
    qrColor: '#475569',
    qrBgColor: '#FFFFFF',
    userId: 'user_demo_02',
    folderId: null,
    tags: ['event', 'webinar'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'link_user_L1dH46',
    code: 'L1dH46',
    originalUrl: 'https://github.com/torvalds/linux',
    title: 'Tautan Pendek L1dH46',
    notes: 'Dibuat oleh pengguna',
    redirectType: 302,
    clickCount: 1,
    isActive: true,
    isBlocked: false,
    showPreview: false,
    qrColor: '#3730A3',
    qrBgColor: '#FFFFFF',
    userId: 'user_admin_01',
    folderId: null,
    tags: ['web'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Generate Realistic Seed Clicks for initial links
const clicks: ClickRecord[] = [];
const REFERRERS = ['WhatsApp', 'Instagram', 'Google', 'Direct', 'Twitter / X', 'TikTok', 'LinkedIn', 'YouTube'];
const CITIES_ID = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Yogyakarta', 'Bali'];
const BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Edge'];
const OS_LIST = ['iOS', 'Android', 'macOS', 'Windows'];

function seedClicksForLink(linkId: string, count: number) {
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    // Distribute randomly over the past 30 days, weighted towards recent days
    const daysAgo = Math.pow(Math.random(), 1.5) * 28;
    const clickTime = new Date(now - daysAgo * 86400000 - Math.random() * 86400000);
    
    const deviceChoice = Math.random();
    const device = deviceChoice < 0.45 ? 'android' : deviceChoice < 0.75 ? 'ios' : 'desktop';
    const os = device === 'ios' ? 'iOS' : device === 'android' ? 'Android' : Math.random() > 0.4 ? 'Windows' : 'macOS';
    const browser = device === 'ios' ? 'Safari' : Math.random() > 0.3 ? 'Chrome' : 'Firefox';
    const country = Math.random() > 0.15 ? 'Indonesia' : Math.random() > 0.5 ? 'Singapura' : 'Amerika Serikat';
    const city = country === 'Indonesia' ? CITIES_ID[Math.floor(Math.random() * CITIES_ID.length)] : (country === 'Singapura' ? 'Singapore' : 'San Francisco');
    const referrer = REFERRERS[Math.floor(Math.random() * REFERRERS.length)];

    clicks.push({
      id: `click_${linkId}_${i}`,
      linkId,
      ipHash: hashIp(`192.168.${(i * 7) % 250}.${(i * 13) % 250}`),
      device,
      os,
      browser,
      country,
      city,
      referrer,
      isUnique: Math.random() > 0.25,
      createdAt: clickTime.toISOString(),
    });
  }
}

// Seed clicks
seedClicksForLink('link_01', 320);
seedClicksForLink('link_02', 180);
seedClicksForLink('link_03', 60);
seedClicksForLink('link_04', 90);
seedClicksForLink('link_05', 110);

// API Keys
const apiKeys: ApiKey[] = [
  {
    id: 'key_01',
    name: 'Production Server Key',
    key: 'nar_live_839f28a710bc49281a',
    prefix: 'nar_live_839f',
    userId: 'user_admin_01',
    lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
    isActive: true,
    createdAt: '2026-01-20T00:00:00.000Z',
  },
  {
    id: 'key_02',
    name: 'Staging Integration',
    key: 'nar_test_92a71c841b802e887d',
    prefix: 'nar_test_92a7',
    userId: 'user_admin_01',
    lastUsedAt: null,
    isActive: true,
    createdAt: '2026-02-10T00:00:00.000Z',
  },
];

// Reports
const reports: AbuseReport[] = [
  {
    id: 'rep_01',
    linkId: 'link_01',
    linkCode: 'promo-oktober',
    originalUrl: 'https://tokopedia.com/promo-spesial-harbolnas',
    category: 'SPAM',
    details: 'Terlalu sering dibagikan berulang di grup WhatsApp komunitas tanpa izin.',
    reporterIpHash: hashIp('10.20.30.40'),
    status: 'REVIEWED',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

function saveToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify({
      links,
      clicks,
      folders,
      apiKeys,
      reports,
      blockedDomains,
    }, null, 2), 'utf-8');
  } catch (e) {
    // ignore
  }
}

function loadFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.links)) {
        for (const l of parsed.links) {
          if (!links.some(existing => existing.id === l.id || existing.code === l.code)) {
            links.push(l);
          }
        }
      }
      if (Array.isArray(parsed.clicks)) {
        for (const c of parsed.clicks) {
          if (!clicks.some(existing => existing.id === c.id)) {
            clicks.push(c);
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

// Initial load
loadFromDisk();

// Store Interface Functions
export const Store = {
  // Users
  getUsers: () => [...users],
  getUserById: (id: string) => users.find(u => u.id === id),
  getUserByEmail: (email: string) => users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  
  // Links
  getLinks: (options?: {
    userId?: string;
    search?: string;
    tag?: string;
    status?: 'all' | 'active' | 'inactive';
    folderId?: string;
  }) => {
    let result = [...links];
    if (options?.userId) {
      result = result.filter(l => l.userId === options.userId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(l => 
        l.code.toLowerCase().includes(q) ||
        l.originalUrl.toLowerCase().includes(q) ||
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.notes && l.notes.toLowerCase().includes(q))
      );
    }
    if (options?.tag && options.tag !== 'all') {
      result = result.filter(l => l.tags.includes(options.tag!));
    }
    if (options?.folderId && options.folderId !== 'all') {
      result = result.filter(l => l.folderId === options.folderId);
    }
    if (options?.status && options.status !== 'all') {
      if (options.status === 'active') result = result.filter(l => l.isActive && !l.isBlocked);
      if (options.status === 'inactive') result = result.filter(l => !l.isActive || l.isBlocked);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getLinkByCode: (code: string) => links.find(l => l.code.toLowerCase() === code.toLowerCase()),
  getLinkById: (id: string) => links.find(l => l.id === id),

  createLink: (linkData: Partial<Link> & { originalUrl: string }): Link => {
    const code = linkData.code ? linkData.code.trim().toLowerCase() : generateBase62Code(6);
    
    // Check collision
    if (links.some(l => l.code.toLowerCase() === code)) {
      throw new Error(`Alias atau kode '${code}' sudah digunakan. Silakan pilih alias lain.`);
    }

    const newLink: Link = {
      id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code,
      originalUrl: linkData.originalUrl,
      title: linkData.title || linkData.originalUrl.replace(/^https?:\/\//, '').split('/')[0] || 'Link Baru',
      notes: linkData.notes || '',
      redirectType: linkData.redirectType || 302,
      iosUrl: linkData.iosUrl,
      androidUrl: linkData.androidUrl,
      desktopUrl: linkData.desktopUrl,
      utmSource: linkData.utmSource,
      utmMedium: linkData.utmMedium,
      utmCampaign: linkData.utmCampaign,
      utmTerm: linkData.utmTerm,
      utmContent: linkData.utmContent,
      password: linkData.password,
      expiresAt: linkData.expiresAt || null,
      maxClicks: linkData.maxClicks || null,
      clickCount: 0,
      isActive: linkData.isActive !== false,
      isBlocked: false,
      showPreview: !!linkData.showPreview,
      qrColor: linkData.qrColor || '#3730A3',
      qrBgColor: linkData.qrBgColor || '#FFFFFF',
      userId: linkData.userId || 'user_demo_02',
      folderId: linkData.folderId || null,
      tags: linkData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    links.unshift(newLink);
    saveToDisk();
    return newLink;
  },

  updateLink: (id: string, updates: Partial<Link>): Link => {
    const idx = links.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Link tidak ditemukan');
    
    if (updates.code && updates.code !== links[idx].code) {
      const codeTaken = links.some(l => l.id !== id && l.code.toLowerCase() === updates.code!.toLowerCase());
      if (codeTaken) throw new Error(`Alias '${updates.code}' sudah dipakai`);
    }

    links[idx] = {
      ...links[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToDisk();
    return links[idx];
  },

  deleteLink: (id: string): boolean => {
    const idx = links.findIndex(l => l.id === id);
    if (idx === -1) return false;
    links.splice(idx, 1);
    // Remove clicks
    for (let i = clicks.length - 1; i >= 0; i--) {
      if (clicks[i].linkId === id) clicks.splice(i, 1);
    }
    saveToDisk();
    return true;
  },

  // Clicks & Analytics
  recordClick: (record: Omit<ClickRecord, 'id' | 'createdAt'>) => {
    const newRecord: ClickRecord = {
      ...record,
      id: `click_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    clicks.push(newRecord);

    // Update link click count
    const link = links.find(l => l.id === record.linkId);
    if (link) {
      link.clickCount = (link.clickCount || 0) + 1;
    }
    saveToDisk();
    return newRecord;
  },

  getLinkClicks: (linkId: string) => {
    return clicks.filter(c => c.linkId === linkId);
  },

  getAllClicks: () => [...clicks],

  // Folders
  getFolders: (userId?: string) => {
    if (userId) return folders.filter(f => f.userId === userId);
    return [...folders];
  },

  createFolder: (name: string, color?: string, userId: string = 'user_admin_01'): Folder => {
    const newFolder: Folder = {
      id: `folder_${Date.now()}`,
      name,
      color: color || '#3730A3',
      userId,
      createdAt: new Date().toISOString(),
    };
    folders.push(newFolder);
    return newFolder;
  },

  // API Keys
  getApiKeys: (userId?: string) => {
    if (userId) return apiKeys.filter(k => k.userId === userId);
    return [...apiKeys];
  },

  createApiKey: (name: string, userId: string = 'user_admin_01'): ApiKey => {
    const secret = `nar_live_${generateBase62Code(16)}`;
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      key: secret,
      prefix: secret.substring(0, 12),
      userId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    apiKeys.push(newKey);
    return newKey;
  },

  deleteApiKey: (id: string): boolean => {
    const idx = apiKeys.findIndex(k => k.id === id);
    if (idx === -1) return false;
    apiKeys.splice(idx, 1);
    return true;
  },

  validateApiKey: (key: string): User | null => {
    const apiKey = apiKeys.find(k => k.key === key && k.isActive);
    if (!apiKey) return null;
    apiKey.lastUsedAt = new Date().toISOString();
    return users.find(u => u.id === apiKey.userId) || null;
  },

  // Reports
  getReports: () => [...reports],
  createReport: (report: Omit<AbuseReport, 'id' | 'createdAt' | 'status'>) => {
    const newReport: AbuseReport = {
      ...report,
      id: `rep_${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    reports.push(newReport);
    return newReport;
  },

  updateReportStatus: (id: string, status: AbuseReport['status']) => {
    const rep = reports.find(r => r.id === id);
    if (rep) rep.status = status;
    return rep;
  },

  // Blocked Domains
  getBlockedDomains: () => [...blockedDomains],
  addBlockedDomain: (domain: string, reason: string) => {
    const clean = domain.trim().toLowerCase();
    if (blockedDomains.some(b => b.domain === clean)) return;
    blockedDomains.push({
      id: `block_${Date.now()}`,
      domain: clean,
      reason,
      createdAt: new Date().toISOString(),
    });
  },
  removeBlockedDomain: (id: string) => {
    const idx = blockedDomains.findIndex(b => b.id === id);
    if (idx !== -1) blockedDomains.splice(idx, 1);
  },
  isDomainBlocked: (url: string): boolean => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      return blockedDomains.some(b => host === b.domain || host.endsWith(`.${b.domain}`));
    } catch {
      return false;
    }
  },
};
