import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  QrCode,
  Share2,
  X,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Lock,
} from 'lucide-react';
import { LinkItem } from '../types/index.ts';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: { link: LinkItem; shortUrl: string; displayUrl: string } | null;
  onOpenQr: (link: LinkItem) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  result,
  onOpenQr,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !result) return null;

  const { link, shortUrl, displayUrl } = result;

  // Ensure shortUrl uses current active origin (e.g. Cloud Run domain) instead of internal localhost
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const effectiveShortUrl = (shortUrl && !shortUrl.includes('localhost'))
    ? shortUrl
    : (currentOrigin && !currentOrigin.includes('localhost'))
    ? `${currentOrigin}/r/${link.code}`
    : (shortUrl || `${currentOrigin}/r/${link.code}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(effectiveShortUrl);
    setCopied(true);
    onToast('Link berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`Lihat tautan ini: ${effectiveShortUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`Cek link dari narshort.url: ${effectiveShortUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(effectiveShortUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C9A24B]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Tautan Siap Digunakan!</h3>
              <p className="text-xs text-slate-500">Link Anda telah berhasil dipendekkan dan aktif.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Short Link Display Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/90 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 truncate w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <div className="font-mono font-bold text-[#3730A3] text-lg sm:text-xl truncate">
                {displayUrl}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#3730A3] hover:bg-[#2e2889] text-white shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#C9A24B]" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>

          {/* Target URL details */}
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-slate-200/70 text-xs space-y-1">
            <div className="text-slate-500 font-medium">Tujuan Asli:</div>
            <div className="text-slate-800 font-mono truncate font-semibold">{link.originalUrl}</div>
          </div>

          {/* Active Features Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {link.password && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                <Lock className="w-3 h-3 text-[#C9A24B]" /> Sandi Aktif
              </span>
            )}
            {link.showPreview && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                <ShieldCheck className="w-3 h-3" /> Preview Aman
              </span>
            )}
            {(link.iosUrl || link.androidUrl) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                <Smartphone className="w-3 h-3" /> Smart Routing
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
              Redirect {link.redirectType}
            </span>
          </div>

          {/* Share Channels */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#C9A24B]" /> Bagikan Cepat
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={shareToWhatsApp}
                className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors flex items-center justify-center gap-1.5"
              >
                WhatsApp
              </button>
              <button
                onClick={shareToTwitter}
                className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-200 text-xs font-semibold text-slate-700 hover:text-sky-700 transition-colors flex items-center justify-center gap-1.5"
              >
                Twitter / X
              </button>
              <button
                onClick={shareToLinkedIn}
                className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors flex items-center justify-center gap-1.5"
              >
                LinkedIn
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenQr(link);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3730A3] bg-white border border-indigo-200 hover:bg-indigo-50 px-3.5 py-2.5 rounded-xl transition-all"
          >
            <QrCode className="w-4 h-4 text-[#C9A24B]" />
            Buka Kustomisasi QR
          </button>

          <a
            href={effectiveShortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl transition-colors"
          >
            <span>Uji Buka Link</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
