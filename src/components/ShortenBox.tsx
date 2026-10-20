import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Link2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Key,
  Calendar,
  MousePointerClick,
  Smartphone,
  Tag,
  ShieldAlert,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { isValidUrl, normalizeUrl } from '../utils/shortener.ts';
import { checkAliasAvailability, createLink } from '../utils/api.ts';
import { LinkItem } from '../types/index.ts';

interface ShortenBoxProps {
  onSuccess: (result: { link: LinkItem; shortUrl: string; displayUrl: string }) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  currentUserId?: string;
}

export const ShortenBox: React.FC<ShortenBoxProps> = ({
  onSuccess,
  onToast,
  currentUserId,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced fields
  const [customAlias, setCustomAlias] = useState('');
  const [aliasChecking, setAliasChecking] = useState(false);
  const [aliasAvailable, setAliasAvailable] = useState<boolean | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxClicks, setMaxClicks] = useState<string>('');
  const [redirectType, setRedirectType] = useState<301 | 302 | 307>(302);
  const [showPreview, setShowPreview] = useState(false);

  // Device Targeting
  const [iosUrl, setIosUrl] = useState('');
  const [androidUrl, setAndroidUrl] = useState('');
  const [desktopUrl, setDesktopUrl] = useState('');

  // UTM
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // Tags
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['web']);

  // Real-time check alias availability debounce
  useEffect(() => {
    if (!customAlias.trim()) {
      setAliasAvailable(null);
      return;
    }
    const clean = customAlias.trim().toLowerCase();
    if (clean.length < 3) {
      setAliasAvailable(false);
      return;
    }

    setAliasChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await checkAliasAvailability(clean);
        setAliasAvailable(res.available);
      } catch {
        setAliasAvailable(null);
      } finally {
        setAliasChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [customAlias]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        onToast('URL berhasil ditempel dari clipboard', 'info');
      }
    } catch {
      onToast('Izin akses clipboard ditolak browser', 'error');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().toLowerCase();
      if (!tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      onToast('Masukkan URL tujuan terlebih dahulu', 'error');
      return;
    }

    if (!isValidUrl(url)) {
      onToast('Format URL tidak valid. Pastikan menyertakan domain seperti example.com', 'error');
      return;
    }

    if (customAlias.trim() && aliasAvailable === false) {
      onToast('Alias pilihan Anda tidak tersedia. Harap ganti alias lain.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        originalUrl: normalizeUrl(url),
        code: customAlias.trim() || undefined,
        title: title.trim() || undefined,
        notes: notes.trim() || undefined,
        redirectType,
        password: password.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        maxClicks: maxClicks ? Number(maxClicks) : undefined,
        showPreview,
        iosUrl: iosUrl.trim() || undefined,
        androidUrl: androidUrl.trim() || undefined,
        desktopUrl: desktopUrl.trim() || undefined,
        utmSource: utmSource.trim() || undefined,
        utmMedium: utmMedium.trim() || undefined,
        utmCampaign: utmCampaign.trim() || undefined,
        tags,
        userId: currentUserId || 'user_demo_02',
      };

      const result = await createLink(payload);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#3730A3', '#C9A24B', '#FAF8F5'],
        });
      } catch {
        // Ignore confetti error
      }

      onToast('Link berhasil dipendekkan!', 'success');
      onSuccess(result);

      // Reset form
      setUrl('');
      setCustomAlias('');
      setTitle('');
      setNotes('');
      setPassword('');
      setExpiresAt('');
      setMaxClicks('');
      setShowAdvanced(false);
    } catch (err: any) {
      onToast(err.message || 'Gagal memendekkan link', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-[0_12px_45px_rgba(15,23,42,0.08)] border border-slate-200/90 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Primary Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full flex items-center">
              <div className="absolute left-4 text-slate-400 flex items-center pointer-events-none">
                <Link2 className="w-5 h-5 text-[#3730A3]" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Tempel link panjang di sini (cth: https://tokopedia.com/promo)..."
                className="w-full pl-12 pr-24 py-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 text-slate-900 placeholder-slate-400 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#3730A3]/25 focus:border-[#3730A3] transition-all"
                disabled={isLoading}
              />
              {!url && (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-3 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-[#3730A3] bg-white border border-slate-200 rounded-lg transition-colors"
                >
                  Tempel
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#3730A3] hover:bg-[#2e2889] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm sm:text-base transition-all duration-200 shadow-md shadow-indigo-900/20 flex items-center justify-center gap-2 shrink-0 group cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#C9A24B] group-hover:rotate-12 transition-transform" />
                  <span>Pendekkan Link</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Custom Alias Row & Advanced Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <span className="text-xs font-semibold text-slate-500 font-mono">narshort.url/</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                  placeholder="alias-kustom (opsional)"
                  className="w-full text-xs font-mono py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                />
                {customAlias.trim() && (
                  <div className="absolute right-2 top-1.5 text-xs flex items-center">
                    {aliasChecking ? (
                      <span className="text-slate-400 text-[10px]">Cek...</span>
                    ) : aliasAvailable === true ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : aliasAvailable === false ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#3730A3] transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-50"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>Pengaturan Lanjutan</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Advanced Settings */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Judul Link (Internal)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Promo Harbolnas Instagram"
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                  />
                </div>

                {/* Password Protection */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-[#C9A24B]" /> Proteksi Kata Sandi
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kosongkan jika publik"
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                  />
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Kedaluwarsa
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                  />
                </div>

                {/* Max Clicks */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5 text-slate-400" /> Batas Jumlah Klik
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxClicks}
                    onChange={(e) => setMaxClicks(e.target.value)}
                    placeholder="Maksimal klik (cth: 500)"
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                  />
                </div>

                {/* Redirect Type */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Tipe Redirect HTTP
                  </label>
                  <select
                    value={redirectType}
                    onChange={(e) => setRedirectType(Number(e.target.value) as any)}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                  >
                    <option value={302}>302 - Temporary Redirect (Direkomendasikan)</option>
                    <option value={301}>301 - Permanent Redirect (SEO Link Equity)</option>
                    <option value={307}>307 - Strict Method Preserved</option>
                  </select>
                </div>

                {/* Anti Phishing Preview Link Switch */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Halaman Preview Aman</div>
                      <div className="text-[11px] text-slate-500">Tampilkan konfirmasi sebelum membuka link</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showPreview}
                    onChange={(e) => setShowPreview(e.target.checked)}
                    className="w-4 h-4 rounded text-[#3730A3] accent-[#3730A3] cursor-pointer"
                  />
                </div>
              </div>

              {/* Device Targeting Section */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3730A3]">
                  <Smartphone className="w-3.5 h-3.5 text-[#C9A24B]" />
                  <span>Targeting Perangkat (Smart Device Routing)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="url"
                    value={iosUrl}
                    onChange={(e) => setIosUrl(e.target.value)}
                    placeholder="URL khusus iOS (App Store)"
                    className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                  />
                  <input
                    type="url"
                    value={androidUrl}
                    onChange={(e) => setAndroidUrl(e.target.value)}
                    placeholder="URL khusus Android (Play Store)"
                    className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                  />
                  <input
                    type="url"
                    value={desktopUrl}
                    onChange={(e) => setDesktopUrl(e.target.value)}
                    placeholder="URL khusus Desktop / Laptop"
                    className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                  />
                </div>
              </div>

              {/* UTM Builder */}
              <div className="p-3.5 rounded-2xl bg-amber-50/30 border border-amber-100/60 space-y-2.5">
                <div className="text-xs font-semibold text-slate-800">
                  Pelacak Kampanye UTM (Opsional)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="utm_source (cth: ig, newsletter)"
                    className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                  />
                  <input
                    type="text"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    placeholder="utm_medium (cth: cpc, story)"
                    className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                  />
                  <input
                    type="text"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="utm_campaign (cth: promo_gajian)"
                    className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#C9A24B]" /> Tag & Label (Tekan Enter untuk menambah)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#FAF8F5] rounded-xl border border-slate-200">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-slate-600 font-bold ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Tambah tag..."
                    className="text-xs bg-transparent border-0 focus:outline-none text-slate-800 min-w-[90px]"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
