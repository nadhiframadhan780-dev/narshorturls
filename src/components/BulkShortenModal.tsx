import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
} from 'lucide-react';
import { bulkCreateLinks } from '../utils/api.ts';

interface BulkShortenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BulkShortenModal: React.FC<BulkShortenModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onToast,
}) => {
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // Parse lines
        const lines = content
          .split(/\r?\n/)
          .map((l) => l.trim().replace(/^["']|["']$/g, ''))
          .filter((l) => l.length > 0 && (l.startsWith('http') || l.includes('.')));
        setTextInput(lines.join('\n'));
        onToast(`Berhasil membaca ${lines.length} URL dari CSV`, 'info');
      }
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    const rawLines = textInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLines.length === 0) {
      onToast('Masukkan setidaknya satu URL', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await bulkCreateLinks({
        urls: rawLines,
        tags: ['bulk-import'],
      });
      setResults(res.links);
      onToast(`Berhasil memendekkan ${res.successCount} link secara massal!`, 'success');
      onSuccess();
    } catch (err: any) {
      onToast(err.message || 'Gagal memproses bulk shortening', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResultsCsv = () => {
    if (!results || results.length === 0) return;
    const header = ['URL Asli', 'Short Code', 'Short URL', 'Tanggal Dibuat'];
    const rows = results.map((r) => [r.originalUrl, r.code, r.shortUrl, r.createdAt]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `narshort-bulk-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('File hasil bulk CSV berhasil diunduh', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] border border-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3730A3]/10 text-[#3730A3] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-[#C9A24B]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Bulk Shortener (Massal)</h3>
              <p className="text-xs text-slate-500">Pendekkan puluhan hingga ratusan link sekaligus.</p>
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!results ? (
            <>
              {/* File Upload Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 border-dashed flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-[#3730A3]" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 block">Unggah Dokumen CSV</span>
                    <span className="text-slate-500">Satu URL per baris pada berkas spreadsheet</span>
                  </div>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#3730A3] transition-colors shadow-sm">
                  <span>Pilih Berkas CSV</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Text Area Input */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Daftar URL (Satu link per baris):</span>
                  <span className="text-slate-400 font-mono">
                    {textInput.split('\n').filter((l) => l.trim()).length} URL terdeteksi
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="https://tokopedia.com/produk-1&#10;https://shopee.co.id/flash-sale&#10;https://youtube.com/watch?v=xyz"
                  className="w-full text-xs font-mono p-3 rounded-2xl border border-slate-200 bg-[#FAF8F5] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3730A3]/20 focus:border-[#3730A3]"
                />
              </div>
            </>
          ) : (
            /* Results View */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{results.length} link berhasil dibuat!</span>
                </div>
                <button
                  onClick={downloadResultsCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh CSV Hasil
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-3">Original URL</th>
                      <th className="p-3">Short Link</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {results.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="p-3 truncate max-w-[180px] text-slate-600">
                          {r.originalUrl}
                        </td>
                        <td className="p-3 font-semibold text-[#3730A3]">
                          narshort.url/{r.code}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(r.shortUrl);
                              onToast(`Disalin: narshort.url/${r.code}`, 'success');
                            }}
                            className="p-1 text-slate-500 hover:text-[#3730A3]"
                            title="Salin"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {!results ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
              >
                Batal
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={isLoading || !textInput.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3730A3] hover:bg-[#2e2889] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A24B]" />
                    <span>Proses Sekarang</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setResults(null);
                  setTextInput('');
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Buat Batch Baru
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
              >
                Selesai
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
