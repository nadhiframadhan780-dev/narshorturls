import React from 'react';
import { X, Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onToast }) => {
  if (!isOpen) return null;

  const handleSelectPlan = (planName: string) => {
    onToast(`Permintaan paket ${planName} dipilih. Struktur pembayaran Midtrans/Xendit siap diintegrasikan.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] border border-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.2)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold mb-1">
              <Crown className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>Paket Berlangganan narshort.url</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg sm:text-xl font-display">
              Pilih Paket Sesuai Kebutuhan Anda
            </h3>
            <p className="text-xs text-slate-500">
              Tanpa biaya tersembunyi. Batalkan langganan kapan saja.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* FREE */}
          <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-slate-200 flex flex-col justify-between space-y-5">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Gratis (Starter)
              </span>
              <div className="text-3xl font-bold text-slate-900 mt-2">Rp 0</div>
              <span className="text-xs text-slate-400 block">Selamanya gratis</span>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>50 Tautan per bulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Analitik standar (7 hari)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Generator QR Code standar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Proteksi anti-phishing</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('Gratis')}
              className="w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors"
            >
              Paket Saat Ini
            </button>
          </div>

          {/* PRO (Featured) */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#3730A3] shadow-lg relative flex flex-col justify-between space-y-5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C9A24B] text-slate-900 font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
              Paling Populer
            </div>

            <div>
              <span className="text-xs font-semibold text-[#3730A3] uppercase tracking-wider block">
                Pro Creator
              </span>
              <div className="text-3xl font-bold text-slate-900 mt-2 flex items-baseline gap-1">
                <span>Rp 79.000</span>
                <span className="text-xs text-slate-400 font-normal">/bulan</span>
              </div>
              <span className="text-xs text-slate-500 block">Untuk creator & bisnis bertumbuh</span>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-[#C9A24B] shrink-0" />
                  <span>Tautan tanpa batas</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-[#C9A24B] shrink-0" />
                  <span>Kustom alias permanen</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-[#C9A24B] shrink-0" />
                  <span>Targeting perangkat iOS/Android</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-[#C9A24B] shrink-0" />
                  <span>Proteksi password & batas klik</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-[#C9A24B] shrink-0" />
                  <span>Kustomisasi QR Vektor (SVG/PNG)</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-[#C9A24B] shrink-0" />
                  <span>Analitik lengkap 365 hari</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('Pro Creator')}
              className="w-full py-3 rounded-xl bg-[#3730A3] hover:bg-[#2e2889] text-white text-xs font-semibold shadow-md shadow-indigo-900/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>Tingkatkan ke Pro</span>
            </button>
          </div>

          {/* BUSINESS */}
          <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-slate-200 flex flex-col justify-between space-y-5">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Bisnis & Developer
              </span>
              <div className="text-3xl font-bold text-slate-900 mt-2 flex items-baseline gap-1">
                <span>Rp 249.000</span>
                <span className="text-xs text-slate-400 font-normal">/bulan</span>
              </div>
              <span className="text-xs text-slate-400 block">Skala korporasi & tim besar</span>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Semua fitur paket Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Akses REST API tanpa batas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dukungan domain kustom</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-user tim & role RBAC</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SLA 99.99% & Dedicated Support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('Bisnis')}
              className="w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Hubungi Tim Penjualan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
