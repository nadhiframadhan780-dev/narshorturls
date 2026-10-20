import express, { Request, Response, NextFunction } from 'express';
import { Store } from './store.ts';
import {
  isValidUrl,
  normalizeUrl,
  isSelfDomain,
  buildUtmUrl,
  hashIp,
  detectDevice,
  getDeviceTargetedUrl,
  checkLinkStatus,
} from '../utils/shortener.ts';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Helper: Parse user-agent for OS and Browser
function parseUserAgent(ua: string = '') {
  let os = 'Windows';
  let browser = 'Chrome';

  if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/chrome/i.test(ua)) browser = 'Chrome';

  return { os, browser };
}

// Helper: Extract clean Referrer
function parseReferrer(refHeader: string = '') {
  if (!refHeader) return 'Direct';
  try {
    const host = new URL(refHeader).hostname.toLowerCase();
    if (host.includes('google')) return 'Google';
    if (host.includes('whatsapp')) return 'WhatsApp';
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('twitter') || host.includes('t.co') || host.includes('x.com')) return 'Twitter / X';
    if (host.includes('tiktok')) return 'TikTok';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('youtube')) return 'YouTube';
    if (host.includes('facebook')) return 'Facebook';
    return host.replace(/^www\./, '');
  } catch {
    return 'Direct';
  }
}

// Helper: Public host resolver (supports Vercel, Cloud Run, and custom domains)
export function getPublicHost(req: Request): string {
  // 1. If VERCEL_URL is set in Vercel environment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // 2. If APP_URL is defined and not localhost
  if (process.env.APP_URL && !process.env.APP_URL.includes('localhost') && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  // 3. Check x-forwarded-host
  const xfHost = req.headers['x-forwarded-host'] as string;
  const xfProto = (req.headers['x-forwarded-proto'] as string) || 'https';
  if (xfHost && !xfHost.includes('localhost')) {
    return `${xfProto}://${xfHost}`;
  }
  // 4. Check Referer or Origin header
  const origin = req.headers['origin'] || req.headers['referer'];
  if (origin && typeof origin === 'string') {
    try {
      const parsed = new URL(origin);
      if (!parsed.hostname.includes('localhost') && !parsed.hostname.includes('127.0.0.1')) {
        return parsed.origin;
      }
    } catch {
      // ignore
    }
  }
  const host = req.get('host') || 'localhost:3000';
  return `${req.protocol}://${host}`;
}

// ==========================================
// 1. PUBLIC & SHORTENER REST APIS
// ==========================================

// Check Alias Availability
app.post('/api/check-alias', (req: Request, res: Response) => {
  const { alias } = req.body;
  if (!alias || typeof alias !== 'string') {
    res.status(400).json({ error: 'Alias tidak boleh kosong' });
    return;
  }
  const clean = alias.trim().toLowerCase();
  const existing = Store.getLinkByCode(clean);
  res.json({
    alias: clean,
    available: !existing,
    message: existing ? 'Alias ini sudah dipakai' : 'Alias tersedia!',
  });
});

// Shorten Single Link
app.post('/api/links/shorten', (req: Request, res: Response) => {
  try {
    const {
      originalUrl,
      code,
      title,
      notes,
      redirectType,
      iosUrl,
      androidUrl,
      desktopUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      password,
      expiresAt,
      maxClicks,
      showPreview,
      qrColor,
      qrBgColor,
      tags,
      folderId,
      userId,
    } = req.body;

    if (!originalUrl || !isValidUrl(originalUrl)) {
      res.status(400).json({ error: 'URL yang dimasukkan tidak valid. Gunakan format http:// atau https://.' });
      return;
    }

    const host = req.get('host') || 'narshort.url';
    if (isSelfDomain(originalUrl, host)) {
      res.status(400).json({ error: 'Tidak dapat memendekkan URL yang mengarah ke narshort.url (anti-looping).' });
      return;
    }

    if (Store.isDomainBlocked(originalUrl)) {
      res.status(400).json({ error: 'Domain tujuan masuk dalam daftar hitam (blacklist) keamanan.' });
      return;
    }

    const cleanUrl = normalizeUrl(originalUrl);

    const created = Store.createLink({
      originalUrl: cleanUrl,
      code: code ? code.trim() : undefined,
      title: title?.trim(),
      notes: notes?.trim(),
      redirectType: Number(redirectType) === 301 ? 301 : Number(redirectType) === 307 ? 307 : 302,
      iosUrl: iosUrl?.trim(),
      androidUrl: androidUrl?.trim(),
      desktopUrl: desktopUrl?.trim(),
      utmSource: utmSource?.trim(),
      utmMedium: utmMedium?.trim(),
      utmCampaign: utmCampaign?.trim(),
      utmTerm: utmTerm?.trim(),
      utmContent: utmContent?.trim(),
      password: password?.trim() || undefined,
      expiresAt: expiresAt || null,
      maxClicks: maxClicks ? Number(maxClicks) : null,
      showPreview: !!showPreview,
      qrColor: qrColor || '#3730A3',
      qrBgColor: qrBgColor || '#FFFFFF',
      tags: Array.isArray(tags) ? tags : [],
      folderId: folderId || null,
      userId: userId || 'user_demo_02',
    });

    const publicBase = getPublicHost(req);

    res.status(201).json({
      success: true,
      link: created,
      shortUrl: `${publicBase}/r/${created.code}`,
      displayUrl: `narshort.url/${created.code}`,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Gagal memendekkan link' });
  }
});

// Bulk Shorten
app.post('/api/links/bulk', (req: Request, res: Response) => {
  const { urls, tags, folderId } = req.body;
  if (!Array.isArray(urls) || urls.length === 0) {
    res.status(400).json({ error: 'Daftar URL harus berupa array dan tidak boleh kosong' });
    return;
  }

  const results: any[] = [];
  const errors: any[] = [];
  const host = req.get('host') || 'narshort.url';
  const publicBase = getPublicHost(req);

  for (let i = 0; i < urls.length; i++) {
    const item = urls[i];
    const originalUrl = typeof item === 'string' ? item : item.originalUrl;
    const title = typeof item === 'object' ? item.title : undefined;

    if (!originalUrl || !isValidUrl(originalUrl) || isSelfDomain(originalUrl, host) || Store.isDomainBlocked(originalUrl)) {
      errors.push({ line: i + 1, url: originalUrl, reason: 'URL tidak valid atau diblokir' });
      continue;
    }

    try {
      const link = Store.createLink({
        originalUrl: normalizeUrl(originalUrl),
        title,
        tags: Array.isArray(tags) ? tags : [],
        folderId: folderId || null,
        userId: 'user_admin_01',
      });
      results.push({
        ...link,
        shortUrl: `${publicBase}/r/${link.code}`,
        displayUrl: `narshort.url/${link.code}`,
      });
    } catch (e: any) {
      errors.push({ line: i + 1, url: originalUrl, reason: e.message });
    }
  }

  res.json({
    totalReceived: urls.length,
    successCount: results.length,
    errorCount: errors.length,
    links: results,
    errors,
  });
});

// List Links
app.get('/api/links', (req: Request, res: Response) => {
  const { search, tag, status, folderId, userId } = req.query;
  const links = Store.getLinks({
    userId: typeof userId === 'string' ? userId : undefined,
    search: typeof search === 'string' ? search : undefined,
    tag: typeof tag === 'string' ? tag : undefined,
    status: (status as any) || 'all',
    folderId: typeof folderId === 'string' ? folderId : undefined,
  });
  res.json({
    total: links.length,
    links,
  });
});

// Get Link Details
app.get('/api/links/:id', (req: Request, res: Response) => {
  const link = Store.getLinkById(req.params.id);
  if (!link) {
    res.status(404).json({ error: 'Link tidak ditemukan' });
    return;
  }
  res.json({ link });
});

// Update Link
app.patch('/api/links/:id', (req: Request, res: Response) => {
  try {
    const updated = Store.updateLink(req.params.id, req.body);
    res.json({ success: true, link: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Gagal memperbarui link' });
  }
});

// Delete Link
app.delete('/api/links/:id', (req: Request, res: Response) => {
  const success = Store.deleteLink(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Link tidak ditemukan' });
    return;
  }
  res.json({ success: true });
});

// Detailed Link Analytics
app.get('/api/links/:id/analytics', (req: Request, res: Response) => {
  const link = Store.getLinkById(req.params.id);
  if (!link) {
    res.status(404).json({ error: 'Link tidak ditemukan' });
    return;
  }

  const clicks = Store.getLinkClicks(link.id);

  const clicksByDayMap: Record<string, { total: number; unique: number }> = {};
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    clicksByDayMap[dateStr] = { total: 0, unique: 0 };
  }

  const deviceMap: Record<string, number> = { ios: 0, android: 0, desktop: 0 };
  const osMap: Record<string, number> = {};
  const browserMap: Record<string, number> = {};
  const referrerMap: Record<string, number> = {};
  const countryMap: Record<string, number> = {};
  let totalUnique = 0;

  clicks.forEach(c => {
    const day = c.createdAt.split('T')[0];
    if (clicksByDayMap[day]) {
      clicksByDayMap[day].total += 1;
      if (c.isUnique) clicksByDayMap[day].unique += 1;
    }
    if (c.isUnique) totalUnique += 1;

    deviceMap[c.device] = (deviceMap[c.device] || 0) + 1;
    osMap[c.os] = (osMap[c.os] || 0) + 1;
    browserMap[c.browser] = (browserMap[c.browser] || 0) + 1;
    referrerMap[c.referrer] = (referrerMap[c.referrer] || 0) + 1;
    countryMap[c.country] = (countryMap[c.country] || 0) + 1;
  });

  const timeSeries = Object.entries(clicksByDayMap).map(([date, val]) => ({
    date,
    total: val.total,
    unique: val.unique,
  }));

  res.json({
    link,
    summary: {
      totalClicks: clicks.length,
      uniqueClicks: totalUnique,
      todayClicks: clicks.filter(c => c.createdAt.startsWith(now.toISOString().split('T')[0])).length,
    },
    timeSeries,
    devices: Object.entries(deviceMap).map(([name, count]) => ({ name, count })),
    operatingSystems: Object.entries(osMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count),
    browsers: Object.entries(browserMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count),
    referrers: Object.entries(referrerMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count),
    countries: Object.entries(countryMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count),
  });
});

// Global Analytics Overview
app.get('/api/analytics/global', (_req: Request, res: Response) => {
  const allLinks = Store.getLinks();
  const allClicks = Store.getAllClicks();

  const totalClicks = allClicks.length;
  const totalLinks = allLinks.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayClicks = allClicks.filter(c => c.createdAt.startsWith(todayStr)).length;

  res.json({
    totalLinks,
    totalClicks,
    todayClicks,
    topLinks: allLinks.sort((a, b) => b.clickCount - a.clickCount).slice(0, 5),
  });
});

// Folders & Tags
app.get('/api/folders', (req: Request, res: Response) => {
  res.json({ folders: Store.getFolders(req.query.userId as string) });
});

app.post('/api/folders', (req: Request, res: Response) => {
  const { name, color, userId } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Nama folder harus diisi' });
    return;
  }
  const folder = Store.createFolder(name, color, userId);
  res.status(201).json({ folder });
});

// Reports & Abuse
app.post('/api/reports', (req: Request, res: Response) => {
  const { linkCode, category, details } = req.body;
  const link = Store.getLinkByCode(linkCode);
  if (!link) {
    res.status(404).json({ error: 'Tautan yang dilaporkan tidak ditemukan.' });
    return;
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const report = Store.createReport({
    linkId: link.id,
    linkCode: link.code,
    originalUrl: link.originalUrl,
    category: category || 'PHISHING',
    details: details || 'Tidak ada keterangan tambahan.',
    reporterIpHash: hashIp(clientIp),
  });

  res.status(201).json({ success: true, message: 'Laporan Anda telah berhasil dicatat dan akan segera ditinjau oleh tim keamanan.', report });
});

app.get('/api/admin/reports', (_req: Request, res: Response) => {
  res.json({ reports: Store.getReports() });
});

app.patch('/api/admin/reports/:id', (req: Request, res: Response) => {
  const rep = Store.updateReportStatus(req.params.id, req.body.status);
  res.json({ success: true, report: rep });
});

// Admin Domain Blacklist
app.get('/api/admin/blocked-domains', (_req: Request, res: Response) => {
  res.json({ blockedDomains: Store.getBlockedDomains() });
});

app.post('/api/admin/blocked-domains', (req: Request, res: Response) => {
  const { domain, reason } = req.body;
  if (!domain) {
    res.status(400).json({ error: 'Domain wajib diisi' });
    return;
  }
  Store.addBlockedDomain(domain, reason || 'Diblokir oleh administrator');
  res.status(201).json({ success: true, message: `Domain ${domain} telah ditambahkan ke daftar hitam.` });
});

app.delete('/api/admin/blocked-domains/:id', (req: Request, res: Response) => {
  Store.removeBlockedDomain(req.params.id);
  res.json({ success: true });
});

// Admin Platform Stats
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  const links = Store.getLinks();
  const clicks = Store.getAllClicks();
  const users = Store.getUsers();
  const reports = Store.getReports();

  res.json({
    totalUsers: users.length,
    totalLinks: links.length,
    totalClicks: clicks.length,
    activeLinks: links.filter(l => l.isActive && !l.isBlocked).length,
    blockedLinks: links.filter(l => l.isBlocked).length,
    pendingReports: reports.filter(r => r.status === 'PENDING').length,
    users,
    recentReports: reports.slice(0, 5),
  });
});

// Admin Ban/Unban Link
app.post('/api/admin/links/:id/toggle-block', (req: Request, res: Response) => {
  const link = Store.getLinkById(req.params.id);
  if (!link) {
    res.status(404).json({ error: 'Link tidak ditemukan' });
    return;
  }
  const updated = Store.updateLink(link.id, { isBlocked: !link.isBlocked });
  res.json({ success: true, link: updated });
});

// Developer API Key Endpoints
app.get('/api/v1/api-keys', (req: Request, res: Response) => {
  const keys = Store.getApiKeys(req.query.userId as string);
  res.json({ apiKeys: keys });
});

app.post('/api/v1/api-keys', (req: Request, res: Response) => {
  const { name, userId } = req.body;
  const newKey = Store.createApiKey(name || 'API Key Baru', userId);
  res.status(201).json({ success: true, apiKey: newKey });
});

app.delete('/api/v1/api-keys/:id', (req: Request, res: Response) => {
  const success = Store.deleteApiKey(req.params.id);
  res.json({ success });
});

// Developer API v1 /api/v1/shorten
app.post('/api/v1/shorten', (req: Request, res: Response) => {
  const apiKeyHeader = req.headers['x-api-key'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  if (!apiKeyHeader || typeof apiKeyHeader !== 'string') {
    res.status(401).json({ error: 'Unauthorized: Header x-api-key tidak ditemukan atau tidak valid.' });
    return;
  }

  const user = Store.validateApiKey(apiKeyHeader);
  if (!user) {
    res.status(403).json({ error: 'Forbidden: API key tidak valid atau dinonaktifkan.' });
    return;
  }

  const { url, alias, title, utm_source, utm_medium, utm_campaign } = req.body;
  if (!url || !isValidUrl(url)) {
    res.status(400).json({ error: 'URL target tidak valid.' });
    return;
  }

  try {
    const link = Store.createLink({
      originalUrl: normalizeUrl(url),
      code: alias,
      title: title || 'API Created Link',
      utmSource: utm_source,
      utmMedium: utm_medium,
      utmCampaign: utm_campaign,
      userId: user.id,
    });

    const publicBase = getPublicHost(req);
    res.status(201).json({
      status: 'success',
      data: {
        id: link.id,
        code: link.code,
        shortUrl: `${publicBase}/r/${link.code}`,
        displayUrl: `narshort.url/${link.code}`,
        originalUrl: link.originalUrl,
        createdAt: link.createdAt,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Verify Password for Protected Link
app.post('/api/links/:code/verify-password', (req: Request, res: Response) => {
  const { code } = req.params;
  const { password } = req.body;
  const link = Store.getLinkByCode(code);

  if (!link) {
    res.status(404).json({ error: 'Link tidak ditemukan' });
    return;
  }

  if (!link.password) {
    res.json({ success: true, message: 'Link tidak memerlukan password' });
    return;
  }

  if (link.password === password) {
    const ua = req.headers['user-agent'] || '';
    const finalUrl = getDeviceTargetedUrl(link, ua);
    res.json({ success: true, redirectUrl: finalUrl });
  } else {
    res.status(401).json({ error: 'Kata sandi salah. Silakan coba lagi.' });
  }
});

// ==========================================
// 2. SHORT LINK REDIRECTION ENGINE (/r/:code)
// ==========================================
app.get(['/r/:code', '/s/:code'], (req: Request, res: Response) => {
  const { code } = req.params;
  const link = Store.getLinkByCode(code);

  if (!link) {
    res.redirect(`/?page=404&code=${encodeURIComponent(code)}`);
    return;
  }

  const status = checkLinkStatus({
    isActive: link.isActive,
    isBlocked: link.isBlocked,
    expiresAt: link.expiresAt,
    maxClicks: link.maxClicks,
    clickCount: link.clickCount,
    hasPassword: !!link.password,
  });

  if (!status.allowed) {
    if (status.reason === 'blocked') {
      res.redirect(`/?page=blocked&code=${encodeURIComponent(code)}`);
      return;
    }
    if (status.reason === 'expired' || status.reason === 'max_clicks_reached') {
      res.redirect(`/?page=expired&code=${encodeURIComponent(code)}&reason=${status.reason}`);
      return;
    }
    if (status.reason === 'inactive') {
      res.redirect(`/?page=inactive&code=${encodeURIComponent(code)}`);
      return;
    }
    if (status.reason === 'password_required') {
      res.redirect(`/?page=password&code=${encodeURIComponent(code)}`);
      return;
    }
  }

  if (link.showPreview && req.query.skipPreview !== 'true') {
    res.redirect(`/?page=preview&code=${encodeURIComponent(code)}`);
    return;
  }

  const ua = req.headers['user-agent'] || '';
  const deviceType = detectDevice(ua);
  let destination = getDeviceTargetedUrl(link, ua);

  if (link.utmSource || link.utmMedium || link.utmCampaign || link.utmTerm || link.utmContent) {
    destination = buildUtmUrl(destination, {
      source: link.utmSource,
      medium: link.utmMedium,
      campaign: link.utmCampaign,
      term: link.utmTerm,
      content: link.utmContent,
    });
  }

  setImmediate(() => {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const { os, browser } = parseUserAgent(ua);
      const referrer = parseReferrer(req.headers['referer'] as string);
      const lang = req.headers['accept-language'] || '';
      const country = lang.includes('id') ? 'Indonesia' : lang.includes('sg') ? 'Singapura' : 'Amerika Serikat';

      Store.recordClick({
        linkId: link.id,
        ipHash: hashIp(clientIp),
        device: deviceType,
        os,
        browser,
        country,
        city: country === 'Indonesia' ? 'Jakarta' : 'Singapore',
        referrer,
        isUnique: true,
      });
    } catch (e) {
      console.error('Click logging error:', e);
    }
  });

  const statusRedirect = link.redirectType === 301 ? 301 : link.redirectType === 307 ? 307 : 302;
  res.redirect(statusRedirect, destination);
});

export default app;
