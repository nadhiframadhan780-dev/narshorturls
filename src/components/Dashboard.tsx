import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Copy,
  Check,
  QrCode,
  TrendingUp,
  MoreVertical,
  Trash2,
  Edit2,
  ExternalLink,
  Power,
  Download,
  Upload,
  Calendar,
  Lock,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  FolderOpen,
  Tag,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { LinkItem, FolderItem } from '../types/index.ts';
import { fetchLinks, updateLink, deleteLink, fetchFolders } from '../utils/api.ts';

interface DashboardProps {
  currentUserId: string;
  onOpenCreate: () => void;
  onOpenBulk: () => void;
  onOpenQr: (link: LinkItem) => void;
  onOpenAnalytics: (linkId: string) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUserId,
  onOpenCreate,
  onOpenBulk,
  onOpenQr,
  onOpenAnalytics,
  onToast,
}) => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'clicks' | 'title'>('newest');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Modal
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [linksRes, foldersRes] = await Promise.all([
        fetchLinks({
          search: search || undefined,
          tag: selectedTag !== 'all' ? selectedTag : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          folderId: selectedFolder !== 'all' ? selectedFolder : undefined,
        }),
        fetchFolders(),
      ]);
      setLinks(linksRes.links);
      setFolders(foldersRes);
    } catch (err: any) {
      onToast(err.message || 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedTag, selectedStatus, selectedFolder]);

  // Aggregate stats
  const totalClicks = links.reduce((acc, l) => acc + (l.clickCount || 0), 0);
  const activeCount = links.filter((l) => l.isActive && !l.isBlocked).length;
  const topLink = [...links].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))[0];

  // Distinct tags
  const allTags = Array.from(new Set(links.flatMap((l) => l.tags)));

  // Sorting
  const sortedLinks = [...links].sort((a, b) => {
    if (sortBy === 'clicks') return (b.clickCount || 0) - (a.clickCount || 0);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCopy = (link: LinkItem) => {
    const fullUrl = `${window.location.origin}/r/${link.code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(link.id);
    onToast(`Tautan narshort.url/${link.code} berhasil disalin`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (link: LinkItem) => {
    try {
      const res = await updateLink(link.id, { isActive: !link.isActive });
      setLinks(links.map((l) => (l.id === link.id ? res.link : l)));
      onToast(
        `Link ${link.code} berhasil ${res.link.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
        'info'
      );
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Hapus link narshort.url/${code} secara permanen?`)) return;
    try {
      await deleteLink(id);
      setLinks(links.filter((l) => l.id !== id));
      setSelectedIds(selectedIds.filter((item) => item !== id));
      onToast(`Link narshort.url/${code} telah dihapus`, 'info');
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  // Bulk actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedLinks.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Hapus ${selectedIds.length} link yang dipilih?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteLink(id)));
      setLinks(links.filter((l) => !selectedIds.includes(l.id)));
      onToast(`${selectedIds.length} link berhasil dihapus`, 'success');
      setSelectedIds([]);
    } catch (err: any) {
      onToast(err.message || 'Gagal menghapus beberapa link', 'error');
    }
  };

  const handleBulkToggleActive = async (targetActive: boolean) => {
    try {
      await Promise.all(
        selectedIds.map((id) => updateLink(id, { isActive: targetActive }))
      );
      setLinks(
        links.map((l) =>
          selectedIds.includes(l.id) ? { ...l, isActive: targetActive } : l
        )
      );
      onToast(
        `${selectedIds.length} link berhasil ${targetActive ? 'diaktifkan' : 'dinonaktifkan'}`,
        'success'
      );
      setSelectedIds([]);
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const exportAllLinksCsv = () => {
    const header = ['Kode', 'Judul', 'URL Asli', 'Total Klik', 'Status', 'Dibuat Pada'];
    const rows = sortedLinks.map((l) => [
      l.code,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      `"${l.originalUrl.replace(/"/g, '""')}"`,
      l.clickCount,
      l.isActive ? 'Aktif' : 'Nonaktif',
      l.createdAt,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = `narshort-links-export-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onToast('Ekspor data CSV berhasil diunduh', 'success');
  };

  const openEditModal = (link: LinkItem) => {
    setEditingLink(link);
    setEditTitle(link.title || '');
    setEditOriginalUrl(link.originalUrl || '');
    setEditNotes(link.notes || '');
    setEditPassword(link.password || '');
    setEditIsActive(link.isActive);
  };

  const handleSaveEdit = async () => {
    if (!editingLink) return;
    try {
      const res = await updateLink(editingLink.id, {
        title: editTitle.trim(),
        originalUrl: editOriginalUrl.trim(),
        notes: editNotes.trim(),
        password: editPassword.trim() || undefined,
        isActive: editIsActive,
      });
      setLinks(links.map((l) => (l.id === editingLink.id ? res.link : l)));
      setEditingLink(null);
      onToast('Perubahan link berhasil disimpan', 'success');
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
            Manajemen Tautan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola, monitor performa klik, dan optimasi tautan Anda secara terpusat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportAllLinksCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#C9A24B]" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onOpenBulk}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-[#3730A3] transition-colors shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Bulk Shorten</span>
          </button>
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3730A3] hover:bg-[#2e2889] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-900/15 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C9A24B]" />
            <span>Buat Link Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Tautan
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {links.length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {activeCount} tautan aktif
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Seluruh Klik
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[#3730A3] mt-2">
            {totalClicks.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">
            Terekam secara realtime
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tautan Terpopuler
          </span>
          <div className="text-base font-bold text-slate-900 mt-2 truncate font-mono">
            {topLink ? `/${topLink.code}` : '-'}
          </div>
          <span className="text-xs text-[#C9A24B] font-semibold mt-1 block">
            {topLink ? `${topLink.clickCount.toLocaleString()} total klik` : 'Belum ada klik'}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Kecepatan Redirect
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">
            &lt; 45 ms
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Cache memori & in-memory store
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan alias, judul, atau URL asli..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Tag Filter */}
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
            >
              <option value="all">Semua Tag</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
            >
              <option value="all">Semua Status</option>
              <option value="active">Hanya Aktif</option>
              <option value="inactive">Nonaktif / Terblokir</option>
            </select>

            {/* Folder Filter */}
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
            >
              <option value="all">Semua Koleksi</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
            >
              <option value="newest">Terbaru</option>
              <option value="clicks">Klik Terbanyak</option>
              <option value="title">Judul A-Z</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Strip */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-200">
            <span className="text-xs font-semibold text-[#3730A3]">
              {selectedIds.length} link terpilih
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkToggleActive(true)}
                className="px-2.5 py-1 text-xs font-medium bg-white text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50"
              >
                Aktifkan Semua
              </button>
              <button
                onClick={() => handleBulkToggleActive(false)}
                className="px-2.5 py-1 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Nonaktifkan Semua
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100"
              >
                Hapus Terpilih
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-500 hover:text-slate-800 ml-1"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Links Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#3730A3]/20 border-t-[#3730A3] rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Memuat data tautan...</span>
          </div>
        ) : sortedLinks.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3730A3] mx-auto flex items-center justify-center mb-3">
              <FolderOpen className="w-6 h-6 text-[#C9A24B]" />
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">Tidak ada link ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Cobalah ubah kata kunci pencarian atau buat link baru sekarang.
            </p>
            <button
              onClick={onOpenCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-[#3730A3] text-white text-xs font-semibold hover:bg-[#2e2889] transition-colors"
            >
              Buat Link Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FAF8F5] border-b border-slate-200 text-slate-600 font-semibold select-none">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === sortedLinks.length && sortedLinks.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-[#3730A3] accent-[#3730A3] cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Tautan & Judul</th>
                  <th className="p-4 hidden md:table-cell">Target Asli</th>
                  <th className="p-4 text-center">Total Klik</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedLinks.map((link) => {
                  const isChecked = selectedIds.includes(link.id);
                  const isCopied = copiedId === link.id;

                  return (
                    <tr
                      key={link.id}
                      className={`hover:bg-[#FAF8F5]/80 transition-colors ${
                        isChecked ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(link.id)}
                          className="rounded text-[#3730A3] accent-[#3730A3] cursor-pointer"
                        />
                      </td>

                      {/* Title & Short URL */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {link.title || 'Tanpa Judul'}
                            </span>
                            {link.password && (
                              <span title="Dilindungi Password">
                                <Lock className="w-3.5 h-3.5 text-[#C9A24B]" />
                              </span>
                            )}
                            {link.showPreview && (
                              <span title="Preview Anti-Phishing">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              </span>
                            )}
                            {(link.iosUrl || link.androidUrl) && (
                              <span title="Targeting Khusus Perangkat">
                                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 font-mono text-xs">
                            <a
                              href={`/r/${link.code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#3730A3] hover:underline font-semibold flex items-center gap-1"
                            >
                              <span>narshort.url/{link.code}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                            <button
                              onClick={() => handleCopy(link)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                              title="Salin short link"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Tags badge row */}
                          {link.tags && link.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {link.tags.map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Original Target URL */}
                      <td className="p-4 hidden md:table-cell max-w-[220px]">
                        <span className="text-slate-600 truncate block font-mono text-xs" title={link.originalUrl}>
                          {link.originalUrl}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {new Date(link.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Click Count */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onOpenAnalytics(link.id)}
                          className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-[#3730A3] hover:underline cursor-pointer group"
                        >
                          <span>{link.clickCount.toLocaleString()}</span>
                          <TrendingUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C9A24B]" />
                        </button>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4 text-center">
                        {link.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                            Diblokir
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(link)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                              link.isActive
                                ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                link.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                              }`}
                            />
                            <span>{link.isActive ? 'Aktif' : 'Nonaktif'}</span>
                          </button>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onOpenQr(link)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#3730A3] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Unduh QR Code"
                          >
                            <QrCode className="w-4 h-4 text-[#C9A24B]" />
                          </button>
                          <button
                            onClick={() => onOpenAnalytics(link.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#3730A3] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Buka Analitik"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(link)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Link"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(link.id, link.code)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Link Modal */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.2)] overflow-hidden flex flex-col">
            <div className="px-6 py-5 bg-[#FAF8F5] border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Edit Pengaturan Link</h3>
                <span className="text-xs font-mono text-[#3730A3]">
                  narshort.url/{editingLink.code}
                </span>
              </div>
              <button
                onClick={() => setEditingLink(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Judul Tautan
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  URL Tujuan Asli
                </label>
                <input
                  type="url"
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Kata Sandi (Proteksi)
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan jika terbuka untuk umum"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Catatan Internal
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Status Tautan Aktif</span>
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#3730A3] accent-[#3730A3]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setEditingLink(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-[#3730A3] text-white text-xs font-semibold hover:bg-[#2e2889] transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
