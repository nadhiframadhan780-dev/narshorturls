import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, Sparkles, X, Palette, Sliders } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  code: string;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const PRESET_COLORS = [
  { name: 'Indigo Mewah', color: '#3730A3' },
  { name: 'Emas Elegan', color: '#C9A24B' },
  { name: 'Navy Malam', color: '#0F172A' },
  { name: 'Zamrud Tua', color: '#065F46' },
  { name: 'Hitam Pekat', color: '#000000' },
];

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
  code,
  onToast,
}) => {
  const [fgColor, setFgColor] = useState('#3730A3');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [margin, setMargin] = useState(2);
  const [size, setSize] = useState(512);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !url) return;

    // Generate PNG Data URL
    QRCode.toDataURL(url, {
      width: size,
      margin: margin,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: 'H',
    })
      .then((res) => setDataUrl(res))
      .catch((err) => console.error('QR code generation error:', err));

    // Generate SVG
    QRCode.toString(url, {
      type: 'svg',
      margin: margin,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: 'H',
    })
      .then((svg) => setSvgString(svg))
      .catch((err) => console.error('QR SVG error:', err));
  }, [isOpen, url, fgColor, bgColor, margin, size]);

  if (!isOpen) return null;

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `narshort-qr-${code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onToast('QR Code PNG berhasil diunduh', 'success');
  };

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narshort-qr-${code}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast('QR Code SVG berhasil diunduh', 'success');
  };

  const copySvg = () => {
    if (!svgString) return;
    navigator.clipboard.writeText(svgString);
    setCopied(true);
    onToast('Kode SVG berhasil disalin ke clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-100 shadow-[0_24px_50px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3730A3]/10 text-[#3730A3] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-[#C9A24B]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Kustomisasi QR Code</h3>
              <p className="text-xs text-slate-500 font-mono truncate max-w-xs">{url}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Preview Box */}
          <div className="flex flex-col items-center justify-center p-6 bg-[#FAF8F5] rounded-2xl border border-slate-200/80">
            <div
              className="p-3 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center transition-all duration-300"
              style={{ backgroundColor: bgColor }}
            >
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt={`QR Code untuk ${title}`}
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="w-48 h-48 animate-pulse bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Membuat QR...
                </div>
              )}
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pindai untuk membuka
              </span>
              <div className="text-sm font-bold text-[#3730A3] font-mono">narshort.url/{code}</div>
            </div>
          </div>

          {/* Customization Controls */}
          <div className="space-y-4">
            {/* Foreground Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#C9A24B]" /> Warna Utama (Foreground)
              </label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => setFgColor(preset.color)}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      fgColor === preset.color ? 'scale-115 border-slate-900 ring-2 ring-indigo-300' : 'border-white'
                    }`}
                  />
                ))}
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                  title="Warna kustom"
                />
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Warna Latar (Background)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBgColor('#FFFFFF')}
                  className={`px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                    bgColor === '#FFFFFF' ? 'border-[#3730A3] bg-indigo-50 text-[#3730A3]' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Putih (#FFF)
                </button>
                <button
                  type="button"
                  onClick={() => setBgColor('#FAF8F5')}
                  className={`px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                    bgColor === '#FAF8F5' ? 'border-[#3730A3] bg-indigo-50 text-[#3730A3]' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Krem (#FAF8F5)
                </button>
              </div>
            </div>

            {/* Margin Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" /> Margin Padding
                </span>
                <span className="text-slate-500">{margin} blok</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-[#3730A3]"
              />
            </div>

            {/* Resolution Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Resolusi Ekspor PNG
              </label>
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
              >
                <option value={256}>256 x 256 px (Standar Web)</option>
                <option value={512}>512 x 512 px (Resolusi Tinggi)</option>
                <option value={1024}>1024 x 1024 px (Cetak Brosur / Banner)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={copySvg}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-colors hover:bg-slate-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            Salin SVG
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadSvg}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3730A3] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh SVG (Vektor)
            </button>
            <button
              onClick={downloadPng}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#3730A3] hover:bg-[#2e2889] px-4 py-2 rounded-xl shadow-sm transition-all shadow-indigo-900/10"
            >
              <Download className="w-3.5 h-3.5 text-[#C9A24B]" />
              Unduh PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
