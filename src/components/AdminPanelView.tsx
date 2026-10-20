import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Link2,
  Ban,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  Lock,
} from 'lucide-react';
import {
  fetchAdminStats,
  toggleBlockLink,
  fetchAdminReports,
  updateReportStatus,
  fetchBlockedDomains,
  addBlockedDomain,
  removeBlockedDomain,
  deleteLink,
  fetchLinks,
} from '../utils/api.ts';
import { AbuseReportItem, BlockedDomainItem, LinkItem, User } from '../types/index.ts';

interface AdminPanelViewProps {
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ onToast }) => {
  const [activeTab, setActiveTab] = useState<'links' | 'reports' | 'blacklist' | 'users'>('links');
  const [stats, setStats] = useState<any | null>(null);
  const [reports, setReports] = useState<AbuseReportItem[]>([]);
  const [blockedDomains, setBlockedDomains] = useState<BlockedDomainItem[]>([]);
  const [allLinks, setAllLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Blacklist Input
  const [newDomain, setNewDomain] = useState('');
  const [newReason, setNewReason] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsData, reportsData, domainsData, linksData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminReports(),
        fetchBlockedDomains(),
        fetchLinks(),
      ]);
      setStats(statsData);
      setReports(reportsData);
      setBlockedDomains(domainsData);
      setAllLinks(linksData.links);
    } catch (err: any) {
      onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggleBlockLink = async (id: string, currentBlocked: boolean) => {
    try {
      await toggleBlockLink(id);
      onToast(`Status blokir link berhasil diperbarui`, 'success');
      loadAll();
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const handleDeleteLink = async (id: string, code: string) => {
    if (!window.confirm(`Hapus permanen link ${code}?`)) return;
    try {
      await deleteLink(id);
      onToast(`Link ${code} telah dihapus`, 'info');
      loadAll();
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const handleUpdateReport = async (id: string, status: string) => {
    try {
      await updateReportStatus(id, status);
      onToast(`Status laporan diubah ke ${status}`, 'success');
      setReports(reports.map((r) => (r.id === id ? { ...r, status: status as any } : r)));
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const handleAddBlockedDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    try {
      await addBlockedDomain(newDomain.trim(), newReason.trim() || 'Diblokir oleh administrator');
      setNewDomain('');
      setNewReason('');
      onToast(`Domain berhasil ditambahkan ke daftar hitam`, 'success');
      const updated = await fetchBlockedDomains();
      setBlockedDomains(updated);
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const handleRemoveBlockedDomain = async (id: string) => {
    try {
      await removeBlockedDomain(id);
      setBlockedDomains(blockedDomains.filter((d) => d.id !== id));
      onToast('Domain dihapus dari daftar hitam', 'info');
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#C9A24B]" />
            <span>Administrator Control Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
            Admin & Keamanan Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor kesehatan sistem, kelola keluhan phishing, dan blokir domain berbahaya.
          </p>
        </div>

        <button
          onClick={loadAll}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Admin KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Total Pengguna</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalUsers}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Akun terdaftar</span>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Total Tautan</span>
            <div className="text-2xl font-bold text-[#3730A3] mt-1">{stats.totalLinks}</div>
            <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">
              {stats.activeLinks} tautan aktif
            </span>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Laporan Tertunda</span>
            <div className="text-2xl font-bold text-rose-600 mt-1">{stats.pendingReports}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Perlu ditinjau</span>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Tautan Diblokir</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{stats.blockedLinks}</div>
            <span className="text-xs text-slate-400 mt-0.5 block">Keamanan platform</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'links', label: 'Tinjau Semua Tautan', count: stats?.totalLinks },
          { id: 'reports', label: 'Laporan Penyalahgunaan', count: reports.length },
          { id: 'blacklist', label: 'Daftar Hitam Domain', count: blockedDomains.length },
          { id: 'users', label: 'Pengguna & Hak Akses', count: stats?.totalUsers },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#3730A3] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Moderasi Tautan */}
      {activeTab === 'links' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 text-xs font-semibold text-slate-700">
            Daftar Seluruh Tautan Platform
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Kode & Judul</th>
                  <th className="p-3">Tujuan Asli</th>
                  <th className="p-3 text-center">Klik</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Aksi Moderasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {allLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-[#3730A3]">/{link.code}</div>
                      <div className="text-[11px] text-slate-500 font-sans truncate max-w-xs">
                        {link.title || 'Tanpa Judul'}
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 truncate max-w-xs">{link.originalUrl}</td>
                    <td className="p-3 text-center font-bold text-slate-900">{link.clickCount}</td>
                    <td className="p-3 text-center">
                      {link.isBlocked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Diblokir
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleBlockLink(link.id, link.isBlocked)}
                          className={`px-2.5 py-1 text-[11px] font-sans font-medium rounded-lg border transition-colors ${
                            link.isBlocked
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {link.isBlocked ? 'Buka Blokir' : 'Blokir Tautan'}
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id, link.code)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus Link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 text-xs text-slate-500 text-center">
            Gunakan tindakan cepat di tabel Dashboard utama untuk mengedit atau menonaktifkan link per tautan secara instan.
          </div>
        </div>
      )}

      {/* Tab 2: Laporan Penyalahgunaan */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 text-xs font-semibold text-slate-700">
            Daftar Laporan yang Dikirimkan oleh Pengguna / Publik
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Tautan Dilaporkan</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Keterangan</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-mono font-bold text-[#3730A3]">/{r.linkCode}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                        {r.originalUrl}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {r.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 text-xs max-w-sm">{r.details}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateReport(r.id, 'RESOLVED')}
                          className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                        >
                          Selesaikan
                        </button>
                        <button
                          onClick={() => handleUpdateReport(r.id, 'REJECTED')}
                          className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200"
                        >
                          Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Daftar Hitam Domain */}
      {activeTab === 'blacklist' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-600" />
              <span>Tambah Domain ke Daftar Hitam (Anti-Phishing / Malware)</span>
            </h3>
            <form
              onSubmit={handleAddBlockedDomain}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="Domain (cth: phishing-site.com)"
                className="text-xs p-2.5 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
              />
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Alasan pemblokiran..."
                className="text-xs p-2.5 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
              />
              <button
                type="submit"
                disabled={!newDomain.trim()}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Blokir Domain</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Domain</th>
                  <th className="p-3">Alasan Pemblokiran</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {blockedDomains.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-rose-700">{b.domain}</td>
                    <td className="p-3 text-slate-600 font-sans">{b.reason}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRemoveBlockedDomain(b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus dari daftar hitam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Pengguna */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3">Nama</th>
                <th className="p-3">Email</th>
                <th className="p-3">Peran (Role)</th>
                <th className="p-3">Paket Langganan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(stats?.users || []).map((u: User) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{u.name}</td>
                  <td className="p-3 font-mono text-slate-600">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {u.plan}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
