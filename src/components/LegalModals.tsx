import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] border border-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.2)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {type === 'terms' ? (
              <FileText className="w-5 h-5 text-[#3730A3]" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-[#C9A24B]" />
            )}
            <h3 className="font-bold text-slate-900 text-base">
              {type === 'terms' ? 'Syarat & Ketentuan Layanan' : 'Kebijakan Privasi & Perlindungan Data'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          {type === 'terms' ? (
            <>
              <p className="font-semibold text-slate-800">1. Ketentuan Umum Penggunaan</p>
              <p>
                Dengan mengakses dan menggunakan layanan <strong>narshort.url</strong>, Anda setuju untuk tunduk pada seluruh ketentuan operasional ini. Layanan ini dirancang untuk memendekkan tautan sah bagi kepentingan produktivitas, pemasaran, dan analitik.
              </p>

              <p className="font-semibold text-slate-800">2. Larangan Penyalahgunaan (Zero Tolerance Abuse)</p>
              <p>
                Dilarang keras menggunakan narshort.url untuk tujuan phishing, penyebaran malware, spam massal, konten pornografi ilegal, materi penipuan finansial, atau impersonasi merek yang melanggar hukum Republik Indonesia dan regulasi internasional. Tautan yang terindikasi melanggar akan segera diblokir permanen.
              </p>

              <p className="font-semibold text-slate-800">3. Ketersediaan Layanan & SLA</p>
              <p>
                Kami berupaya mempertahankan uptime 99.99% dengan arsitektur multi-cloud dan cache memori terdistribusi. Kami berhak melakukan pemeliharaan rutin dengan pemberitahuan sebelumnya.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-800">1. Komitmen Privasi Pengunjung</p>
              <p>
                Di <strong>narshort.url</strong>, privasi pengunjung adalah prioritas utama. Kami tidak pernah menyimpan alamat IP mentah pengunjung dalam database. Seluruh alamat IP dianonimisasi seketika menggunakan enkripsi satu arah SHA-256 dengan cryptographic salt sebelum dicatat dalam analitik.
              </p>

              <p className="font-semibold text-slate-800">2. Data Analitik yang Dicatat</p>
              <p>
                Untuk menyajikan statistik bagi pemilik tautan, sistem hanya merekam data agregat: jenis perangkat (iOS/Android/Desktop), browser, sistem operasi, negara/kota perkiraan, dan asal rujukan (referrer URL). Data ini tidak dapat digunakan untuk mengidentifikasi individu secara personal.
              </p>

              <p className="font-semibold text-slate-800">3. Kepatuhan Regulasi (GDPR & PDP)</p>
              <p>
                Kebijakan kami mematuhi prinsip Undang-Undang Perlindungan Data Pribadi (UU PDP) dan standar GDPR terkait hak privasi digital.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
