import { LinkItem, FolderItem, ApiKeyItem, AbuseReportItem, BlockedDomainItem, LinkAnalyticsData } from '../types/index.ts';

const API_BASE = '/api';

async function parseJsonResponse(res: Response): Promise<any> {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!res.ok) {
      throw new Error(json.error || json.message || `Server error (${res.status})`);
    }
    return json;
  } catch (err: any) {
    if (err.message && !err.message.includes('JSON')) {
      throw err;
    }
    if (!res.ok) {
      throw new Error(`Server returned error (${res.status}): ${text.substring(0, 120)}`);
    }
    throw new Error(`Format respon tidak valid: ${text.substring(0, 120)}`);
  }
}

export async function fetchLinks(params?: {
  search?: string;
  tag?: string;
  status?: string;
  folderId?: string;
  userId?: string;
}): Promise<{ total: number; links: LinkItem[] }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.tag) query.set('tag', params.tag);
  if (params?.status) query.set('status', params.status);
  if (params?.folderId) query.set('folderId', params.folderId);
  if (params?.userId) query.set('userId', params.userId);

  const res = await fetch(`${API_BASE}/links?${query.toString()}`);
  return parseJsonResponse(res);
}

export async function createLink(data: any): Promise<{ success: boolean; link: LinkItem; shortUrl: string; displayUrl: string }> {
  const res = await fetch(`${API_BASE}/links/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseJsonResponse(res);
}

export async function bulkCreateLinks(data: {
  urls: Array<{ originalUrl: string; title?: string } | string>;
  tags?: string[];
  folderId?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/links/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseJsonResponse(res);
}

export async function updateLink(id: string, updates: Partial<LinkItem>): Promise<{ success: boolean; link: LinkItem }> {
  const res = await fetch(`${API_BASE}/links/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return parseJsonResponse(res);
}

export async function deleteLink(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/links/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function fetchLinkAnalytics(id: string): Promise<LinkAnalyticsData> {
  const res = await fetch(`${API_BASE}/links/${id}/analytics`);
  return parseJsonResponse(res);
}

export async function fetchGlobalAnalytics(): Promise<any> {
  const res = await fetch(`${API_BASE}/analytics/global`);
  return parseJsonResponse(res);
}

export async function checkAliasAvailability(alias: string): Promise<{ available: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/check-alias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alias }),
  });
  return parseJsonResponse(res);
}

export async function verifyLinkPassword(code: string, password: string): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/links/${code}/verify-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return parseJsonResponse(res);
}

export async function submitAbuseReport(data: {
  linkCode: string;
  category: string;
  details: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseJsonResponse(res);
}

// Folders
export async function fetchFolders(userId?: string): Promise<FolderItem[]> {
  const res = await fetch(`${API_BASE}/folders${userId ? `?userId=${userId}` : ''}`);
  const json = await parseJsonResponse(res);
  return json.folders || [];
}

export async function createFolder(name: string, color?: string, userId?: string): Promise<FolderItem> {
  const res = await fetch(`${API_BASE}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color, userId }),
  });
  const json = await parseJsonResponse(res);
  return json.folder;
}

// API Keys
export async function fetchApiKeys(userId?: string): Promise<ApiKeyItem[]> {
  const res = await fetch(`${API_BASE}/v1/api-keys${userId ? `?userId=${userId}` : ''}`);
  const json = await parseJsonResponse(res);
  return json.apiKeys || [];
}

export async function createApiKey(name: string, userId?: string): Promise<ApiKeyItem> {
  const res = await fetch(`${API_BASE}/v1/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, userId }),
  });
  const json = await parseJsonResponse(res);
  return json.apiKey;
}

export async function deleteApiKey(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/v1/api-keys/${id}`, { method: 'DELETE' });
  return res.ok;
}

// Admin
export async function fetchAdminStats(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/stats`);
  return parseJsonResponse(res);
}

export async function toggleBlockLink(id: string): Promise<LinkItem> {
  const res = await fetch(`${API_BASE}/admin/links/${id}/toggle-block`, { method: 'POST' });
  const json = await parseJsonResponse(res);
  return json.link;
}

export async function fetchAdminReports(): Promise<AbuseReportItem[]> {
  const res = await fetch(`${API_BASE}/admin/reports`);
  const json = await parseJsonResponse(res);
  return json.reports || [];
}

export async function updateReportStatus(id: string, status: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return parseJsonResponse(res);
}

export async function fetchBlockedDomains(): Promise<BlockedDomainItem[]> {
  const res = await fetch(`${API_BASE}/admin/blocked-domains`);
  const json = await parseJsonResponse(res);
  return json.blockedDomains || [];
}

export async function addBlockedDomain(domain: string, reason: string): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/blocked-domains`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, reason }),
  });
  return parseJsonResponse(res);
}

export async function removeBlockedDomain(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/blocked-domains/${id}`, { method: 'DELETE' });
  return res.ok;
}
