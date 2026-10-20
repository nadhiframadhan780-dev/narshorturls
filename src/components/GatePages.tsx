import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldAlert,
  Clock,
  Ban,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  Key,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { verifyLinkPassword } from '../utils/api.ts';

interface GatePagesProps {
  pageType: 'password' | 'preview' | 'expired' | 'blocked' | '404' | 'inactive';
  code: string;
  onGoHome: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const GatePages: React.FC<GatePagesProps> = ({
  pageType,
  code,
  onGoHome,
  onToast,
}) => {
  // Password State
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Preview countdown
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (pageType === 'preview' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [pageType, countdown]);

  const handleUnlockPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Masukkan kata sandi terlebih dahulu');
      return;
    }

    setVerifying(true);
    setErrorMsg('');
    try {
      const res = await verifyLinkPassword(code, password.trim());
      if (res.success && res.redirectUrl) {
        onToast('Kata sandi benar. Mengalihkan...', 'success');
        window.location.href = res.redirectUrl;
      } else {
        setErrorMsg(res.error || 'Kata sandi tidak sesuai');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memverifikasi kata sandi');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-8">
        <Logo size="lg" onClick={onGoHome} />
      </div>

      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)] text-center space-y-6">
        {/* PASSWORD GATE */}
        {pageType === 'password' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#C9A24B] mx-auto flex items-center justify-center border border-amber-200/80">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">Tautan Terkunci</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tautan <span className="font-mono font-semibold text-[#3730A3]">narshort.url/{code}</span> dilindungi dengan kata sandi oleh pembuatnya.
              </p>
            </div>

            <form onSubmit={handleUnlockPassword} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Masukkan kata sandi..."
                  className="w-full text-center text-sm py-3 px-4 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3730A3]/20 focus:border-[#3730A3]"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-600 font-medium bg-rose-50 py-1.5 px-3 rounded-lg border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={verifying || !password.trim()}
                className="w-full py-3 px-4 rounded-xl bg-[#3730A3] hover:bg-[#2e2889] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-900/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {verifying ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Key className="w-4 h-4 text-[#C9A24B]" />
                    <span>Buka Tautan</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* PREVIEW INTERSTITIAL WARNING */}
        {pageType === 'preview' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#3730A3] mx-auto flex items-center justify-center border border-indigo-200/80">
              <ShieldAlert className="w-8 h-8 text-[#C9A24B]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Pemeriksaan Keamanan Anti-Phishing
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-display mt-2">
                Kamu akan dialihkan
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pastikan Anda mengenali alamat situs tujuan sebelum melanjutkan.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-slate-200 text-left font-mono text-xs text-slate-700 break-all">
              <span className="text-slate-400 block text-[10px] font-sans font-semibold mb-0.5">
                Alamat Tujuan:
              </span>
              https://example.com/destinasi-tujuan
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href={`/r/${code}?skipPreview=true`}
                className="w-full py-3 px-4 rounded-xl bg-[#3730A3] hover:bg-[#2e2889] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Lanjutkan ke Situs Tujuan</span>
                <ArrowRight className="w-4 h-4 text-[#C9A24B]" />
              </a>

              <button
                onClick={onGoHome}
                className="text-xs text-slate-500 hover:text-slate-800 py-1"
              >
                Batalkan dan Kembali ke narshort.url
              </button>
            </div>
          </>
        )}

        {/* EXPIRED PAGE */}
        {pageType === 'expired' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200/80">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Tautan Telah Kedaluwarsa
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Tautan <span className="font-mono font-semibold text-slate-800">/{code}</span> telah melewati batas waktu tayang atau telah mencapai kuota klik maksimal yang ditentukan oleh pemiliknya.
              </p>
            </div>
            <button
              onClick={onGoHome}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              Kembali ke Beranda
            </button>
          </>
        )}

        {/* BLOCKED PAGE */}
        {pageType === 'blocked' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-200/80">
              <Ban className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Tautan Ini Telah Diblokir
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Demi melindungi pengguna dari ancaman penipuan (phishing), malware, atau penyalahgunaan, sistem narshort.url telah menonaktifkan link ini secara permanen.
              </p>
            </div>
            <button
              onClick={onGoHome}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              Kembali ke Beranda
            </button>
          </>
        )}

        {/* 404 NOT FOUND */}
        {pageType === '404' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#3730A3] mx-auto flex items-center justify-center border border-indigo-100">
              <AlertOctagon className="w-8 h-8 text-[#C9A24B]" />
            </div>
            <div>
              <span className="text-3xl font-bold text-slate-900 font-display block">404</span>
              <h3 className="text-base font-bold text-slate-800 mt-1">Tautan Tidak Ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Tautan pendek yang Anda tuju tidak terdaftar di sistem kami atau telah dihapus oleh pembuatnya.
              </p>
            </div>
            <button
              onClick={onGoHome}
              className="w-full py-3 px-4 rounded-xl bg-[#3730A3] hover:bg-[#2e2889] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              Buat Tautan Baru di narshort.url
            </button>
          </>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        © narshort.url — Pendekkan link, perluas jangkauan.
      </div>
    </div>
  );
};
