import React, { useState } from 'react';
import { X, ShieldAlert, Send, Sparkles } from 'lucide-react';
import { submitAbuseReport } from '../utils/api.ts';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onToast }) => {
  const [linkCode, setLinkCode] = useState('');
  const [category, setCategory] = useState('PHISHING');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkCode.trim()) {
      onToast('Masukkan alias atau tautan yang ingin dilaporkan', 'error');
      return;
    }

    const cleanCode = linkCode.trim().replace(/^https?:\/\/narshort\.url\/(r\/)?/i, '');

    setSubmitting(true);
    try {
      await submitAbuseReport({
        linkCode: cleanCode,
        category,
        details: details.trim(),
      });
      onToast('Laporan berhasil dikirim ke tim keamanan narshort.url', 'success');
      onClose();
      setLinkCode('');
      setDetails('');
    } catch (err: any) {
      onToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.18)] overflow-hidden">
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Laporkan Penyalahgunaan</h3>
              <p className="text-xs text-slate-500">Bantu kami menjaga ekosistem tetap aman dan terpercaya.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Kode Alias atau Tautan yang Dilaporkan:
            </label>
            <input
              type="text"
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value)}
              placeholder="cth: promo-oktober atau https://narshort.url/..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Kategori Pelanggaran:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
            >
              <option value="PHISHING">Phishing / Pencurian Kredensial Akun</option>
              <option value="MALWARE">Penyebaran Malware / Virus / APK Jahat</option>
              <option value="SPAM">Spam Massal yang Mengganggu</option>
              <option value="COPYRIGHT">Pelanggaran Hak Cipta / Brand Impersonation</option>
              <option value="HARASSMENT">Pelecehan / Konten Berbahaya Lainnya</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Keterangan Tambahan:
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Jelaskan alasan laporan atau bukti tautan berbahaya..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !linkCode.trim()}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Laporan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
