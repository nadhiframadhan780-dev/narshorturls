import React from 'react';
import { Logo } from './Logo.tsx';
import { ShieldCheck, Heart, Github, Twitter, Linkedin } from 'lucide-react';

interface FooterProps {
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onOpenReport: () => void;
  onOpenPricing: () => void;
  onChangeView: (view: 'landing' | 'dashboard' | 'api-docs' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTerms,
  onOpenPrivacy,
  onOpenReport,
  onOpenPricing,
  onChangeView,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-100">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="lg" showTagline={true} />
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mt-3">
              Platform pemendek tautan (URL Shortener) modern dan berkinerja tinggi. Dilengkapi analitik mendalam, kustomisasi QR Vektor, smart device routing, dan REST API untuk developer.
            </p>
            <div className="flex items-center gap-2 pt-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-500">
                Sistem Operasional: Uptime 99.99% • Cache Laten &lt; 45ms
              </span>
            </div>
          </div>

          {/* Col 1: Produk */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Produk & Fitur
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onChangeView('landing')}
                  className="hover:text-[#3730A3] transition-colors"
                >
                  Pemendek URL Instan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onChangeView('dashboard')}
                  className="hover:text-[#3730A3] transition-colors"
                >
                  Dashboard Manajemen
                </button>
              </li>
              <li>
                <button
                  onClick={() => onChangeView('landing')}
                  className="hover:text-[#3730A3] transition-colors"
                >
                  Generator QR Code Kustom
                </button>
              </li>
              <li>
                <button
                  onClick={() => onChangeView('dashboard')}
                  className="hover:text-[#3730A3] transition-colors"
                >
                  Smart Device Routing
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPricing}
                  className="hover:text-[#3730A3] transition-colors"
                >
                  Paket & Harga
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Pengembang */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pengembang
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onChangeView('api-docs')}
                  className="hover:text-[#3730A3] transition-colors"
                >
                  Dokumentasi REST API
                </button>
              </li>
              <li>
                <button
                  onClick={() => onChangeView('api-docs')}
                  className="hover:text-[#3730A3] transition-colors"
                >
                  Playground Pengujian
                </button>
              </li>
              <li>
                <button
                  onClick={() => onChangeView('api-docs')}
                  className="hover:text-[#3730A3] transition-colors"
                >
                  Kelola API Key
                </button>
              </li>
              <li>
                <span className="text-slate-400">Webhooks (Segera Hadir)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Keamanan & Legal */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Keamanan & Privasi
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={onOpenReport}
                  className="hover:text-rose-600 text-rose-700 font-medium transition-colors"
                >
                  Laporkan Penyalahgunaan
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTerms}
                  className="hover:text-[#3730A3] transition-colors"
                >
                  Syarat & Ketentuan
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-[#3730A3] transition-colors"
                >
                  Kebijakan Privasi (GDPR)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onChangeView('admin')}
                  className="hover:text-[#3730A3] text-amber-800 transition-colors"
                >
                  Admin & Blacklist
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="font-semibold text-slate-700">
            © narshort.url — Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-slate-600 cursor-pointer">Twitter / X</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-pointer">LinkedIn</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-pointer">GitHub</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
