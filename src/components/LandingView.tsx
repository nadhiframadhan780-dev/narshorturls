import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Smartphone,
  QrCode,
  Lock,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  Globe2,
  Terminal,
  Layers,
} from 'lucide-react';
import { ShortenBox } from './ShortenBox.tsx';
import { LinkItem } from '../types/index.ts';

interface LandingViewProps {
  onSuccessShorten: (result: { link: LinkItem; shortUrl: string; displayUrl: string }) => void;
  onOpenPricing: () => void;
  onChangeView: (view: 'landing' | 'dashboard' | 'api-docs' | 'admin') => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSuccessShorten,
  onOpenPricing,
  onChangeView,
  onToast,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Apakah tautan yang saya pendekkan bisa kedaluwarsa?',
      a: 'Secara default, tautan Anda aktif selamanya tanpa batas waktu. Namun, Anda juga memiliki opsi untuk mengatur tanggal kedaluwarsa atau batas jumlah klik maksimal sesuai kebutuhan promosi atau kampanye Anda.',
    },
    {
      q: 'Bagaimana cara kerja Smart Device Targeting (iOS vs Android)?',
      a: 'Ketika pengunjung mengeklik link Anda, sistem mendeteksi jenis perangkat secara real-time. Jika pengunjung menggunakan iPhone, mereka akan diarahkan langsung ke App Store; jika Android diarahkan ke Google Play; dan pengguna laptop/desktop ke website Anda.',
    },
    {
      q: 'Bagaimana narshort.url melindungi privasi pengunjung?',
      a: 'Kami menjunjung tinggi kepatuhan privasi (GDPR & UU PDP). Alamat IP pengunjung tidak pernah disimpan secara utuh, melainkan di-hash seketika dengan enkripsi satu arah SHA-256. Pemilik link hanya melihat statistik agregat anonim.',
    },
    {
      q: 'Bisakah saya menggunakan REST API untuk integrasi sistem?',
      a: 'Tentu saja! Kami menyediakan REST API v1 lengkap dengan otentikasi API Key, rate limit tinggi, dan dokumentasi interaktif dengan contoh kode cURL, JavaScript, dan Python.',
    },
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative pt-8 pb-12 overflow-hidden text-center">
        {/* Subtle Luxury Gradient Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#3730A3]/8 via-[#C9A24B]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#C9A24B]" />
            <span>Platform Pemendek Tautan Mewah & Profesional</span>
            <span className="text-[#3730A3] font-bold">narshort.url</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] font-display">
            Pendekkan link, <br />
            <span className="italic font-normal text-[#3730A3]">perluas jangkauan.</span>
          </h1>

          {/* Subhead */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Kelola tautan pemasaran Anda dengan analitik mendalam, QR Code vektor kustom, proteksi kata sandi, dan smart device routing. Cepat, aman, dan berkelas.
          </p>

          {/* Flagship Shorten Box */}
          <div className="pt-4">
            <ShortenBox onSuccess={onSuccessShorten} onToast={onToast} />
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Klik Terlayani
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 block">
                10,000,000+
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Kecepatan Redirect
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1 block">
                &lt; 45 ms
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Keamanan & Uptime
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#3730A3] mt-1 block">
                99.99% SLA
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Privasi Pengunjung
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#C9A24B] mt-1 block">
                SHA-256 Hash
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-[#C9A24B] uppercase tracking-wider">
            Fitur Kelas Dunia
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display">
            Segala Hal yang Anda Butuhkan untuk Mengontrol Tautan
          </h2>
          <p className="text-sm text-slate-500">
            Dibuat khusus untuk creator, tim marketing, hingga pengembang perangkat lunak tingkat tinggi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Smart Device Routing */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3730A3] flex items-center justify-center font-bold">
              <Smartphone className="w-6 h-6 text-[#C9A24B]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Smart Device Routing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kirim pengguna iPhone langsung ke Apple App Store dan pengguna Android ke Google Play Store hanya dengan satu link pintar.
            </p>
          </div>

          {/* Card 2: QR Code Vektor */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C9A24B] flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Kustomisasi QR Code</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Otomatis buat kode QR untuk setiap link. Sesuaikan palet warna, margin, dan unduh dalam format SVG tanpa pecah atau PNG tajam.
            </p>
          </div>

          {/* Card 3: Analitik Realtime */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Analitik Mendalam</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lacak asal lalu lintas: WhatsApp, Instagram, Google, kota pengunjung, jenis browser, dan rasio klik unik vs total klik.
            </p>
          </div>

          {/* Card 4: Proteksi Sandi & Expiry */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3730A3] flex items-center justify-center font-bold">
              <Lock className="w-6 h-6 text-[#C9A24B]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Proteksi Sandi & Batas Klik</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kunci link rahasia dengan password gate. Batasi jumlah klik maksimal atau atur tanggal kedaluwarsa otomatis.
            </p>
          </div>

          {/* Card 5: Anti Phishing */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Anti-Phishing & Interstitial</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Perlindungan preview tautan bagi audiens untuk memastikan keamanan situs tujuan sebelum dialihkan.
            </p>
          </div>

          {/* Card 6: Developer REST API */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Terminal className="w-6 h-6 text-[#3730A3]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">REST API Pengembang</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kunci API pribadi, respons JSON super cepat, dan rate limit tinggi untuk mengotomasi alur kerja aplikasi Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Showcase Comparison Strip */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] text-white shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#C9A24B] uppercase tracking-wider">
                Pengalaman Mewah Tanpa Iklan
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-display mt-1">
                Mengapa Memilih narshort.url?
              </h3>
            </div>
            <button
              onClick={() => onChangeView('dashboard')}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              Buka Dashboard Pengguna
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800 text-xs">
            <div className="space-y-2">
              <div className="font-bold text-[#C9A24B] text-sm">100% Bebas Iklan</div>
              <p className="text-slate-300">
                Pengunjung langsung dialihkan tanpa countdown palsu, pop-up mengganggu, atau iklan spam.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-[#C9A24B] text-sm">Privasi Terjaga</div>
              <p className="text-slate-300">
                Alamat IP mentah di-hash dengan SHA-256 dan salt, mematuhi prinsip regulasi GDPR dan UU PDP.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-[#C9A24B] text-sm">Latensi Tercepat</div>
              <p className="text-slate-300">
                Redirect dieksekusi di bawah 45 milidetik dengan in-memory cache dan non-blocking click tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-3xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Pertanyaan yang Sering Diajukan
          </h3>
          <p className="text-xs text-slate-500">
            Semua jawaban untuk pertanyaan seputar platform narshort.url
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#3730A3] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Card */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-white border border-slate-200/90 shadow-[0_20px_60px_rgba(15,23,42,0.06)] space-y-5">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display">
            Siap Memperluas Jangkauan Tautan Anda?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Mulai perpendek tautan pertama Anda secara gratis dalam hitungan detik. Tanpa registrasi rumit.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-[#3730A3] hover:bg-[#2e2889] text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-900/15 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#C9A24B]" />
              <span>Coba Sekarang Gratis</span>
            </button>
            <button
              onClick={onOpenPricing}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Lihat Paket & Harga
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
