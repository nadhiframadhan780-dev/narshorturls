import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  Globe,
  Smartphone,
  Compass,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { fetchLinkAnalytics } from '../utils/api.ts';
import { LinkAnalyticsData, LinkItem } from '../types/index.ts';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkId: string | null;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  linkId,
  onToast,
}) => {
  const [data, setData] = useState<LinkAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'traffic' | 'devices' | 'sources' | 'geo'>('traffic');

  useEffect(() => {
    if (!isOpen || !linkId) return;
    setLoading(true);
    fetchLinkAnalytics(linkId)
      .then((res) => setData(res))
      .catch((err) => {
        onToast(err.message || 'Gagal memuat analitik link', 'error');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [isOpen, linkId]);

  if (!isOpen) return null;

  const exportCsv = () => {
    if (!data) return;
    const header = ['Tanggal', 'Total Klik', 'Klik Unik'];
    const rows = data.timeSeries.map((t) => [t.date, t.total, t.unique]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `narshort-analytics-${data.link.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Laporan analitik CSV berhasil diunduh', 'success');
  };

  const maxClicksInSeries = data
    ? Math.max(...data.timeSeries.map((t) => t.total), 1)
    : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] border border-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.2)] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3730A3]/10 text-[#3730A3] flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5 text-[#C9A24B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">
                  {data?.link.title || 'Analitik Link'}
                </h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-[#3730A3] border border-indigo-100">
                  narshort.url/{data?.link.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md">
                Tujuan: {data?.link.originalUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              disabled={!data}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-sm"
              title="Ekspor CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 bg-white border-b border-slate-100 flex gap-6 overflow-x-auto">
          {[
            { id: 'traffic', label: 'Tren Klik (30 Hari)', icon: TrendingUp },
            { id: 'sources', label: 'Sumber Referrer', icon: Compass },
            { id: 'devices', label: 'Perangkat & Browser', icon: Smartphone },
            { id: 'geo', label: 'Geolokasi / Wilayah', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#3730A3] text-[#3730A3]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-[#C9A24B]' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading || !data ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#3730A3]/20 border-t-[#3730A3] rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Memuat metrik analitik...</span>
            </div>
          ) : (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium block">Total Klik</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {data.summary.totalClicks.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                    <ArrowUpRight className="w-3 h-3" /> Akumulasi
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium block">Klik Unik</span>
                  <div className="text-2xl font-bold text-[#3730A3] mt-1">
                    {data.summary.uniqueClicks.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                    {data.summary.totalClicks > 0
                      ? `${Math.round((data.summary.uniqueClicks / data.summary.totalClicks) * 100)}% dari total`
                      : '0%'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium block">Klik Hari Ini</span>
                  <div className="text-2xl font-bold text-amber-600 mt-1">
                    {data.summary.todayClicks}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                    Waktu Real-time
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium block">Privasi IP</span>
                  <div className="text-sm font-bold text-slate-800 mt-2 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>SHA-256 Hash</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                    GDPR Compliant
                  </span>
                </div>
              </div>

              {/* Tab 1: Traffic Chart */}
              {activeTab === 'traffic' && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        Frekuensi Kunjungan 30 Hari Terakhir
                      </h4>
                      <p className="text-xs text-slate-400">
                        Perbandingan klik total (indigo) dan pengunjung unik (emas)
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-[#3730A3]" />
                        <span className="text-slate-600 font-medium">Total Klik</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-[#C9A24B]" />
                        <span className="text-slate-600 font-medium">Unik</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Bar Chart */}
                  <div className="h-52 w-full flex items-end gap-1 sm:gap-2 pt-6 pb-2 border-b border-slate-100 overflow-x-auto">
                    {data.timeSeries.map((item, idx) => {
                      const totalHeight = Math.round((item.total / maxClicksInSeries) * 100);
                      const uniqueHeight = Math.round((item.unique / maxClicksInSeries) * 100);
                      const isHoverDay = idx % 5 === 0;

                      return (
                        <div
                          key={item.date}
                          className="flex-1 min-w-[12px] flex flex-col items-center justify-end h-full group relative"
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg pointer-events-none whitespace-nowrap">
                            <span className="font-semibold">{item.date}</span>
                            <span>Total: {item.total} | Unik: {item.unique}</span>
                          </div>

                          <div className="w-full flex items-end justify-center gap-0.5 h-full">
                            <div
                              style={{ height: `${Math.max(totalHeight, 4)}%` }}
                              className="w-full max-w-[8px] bg-[#3730A3] hover:bg-[#2e2889] rounded-t transition-all"
                            />
                            <div
                              style={{ height: `${Math.max(uniqueHeight, 2)}%` }}
                              className="w-full max-w-[8px] bg-[#C9A24B] hover:bg-amber-500 rounded-t transition-all"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>{data.timeSeries[0]?.date}</span>
                    <span>30 Hari Terakhir</span>
                    <span>{data.timeSeries[data.timeSeries.length - 1]?.date}</span>
                  </div>
                </div>
              )}

              {/* Tab 2: Sources / Referrers */}
              {activeTab === 'sources' && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">
                      Distribusi Sumber Rujukan (Referrers)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Kanal asal dari mana audiens mengeklik tautan Anda
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {data.referrers.map((item) => {
                      const totalClicks = data.summary.totalClicks || 1;
                      const percentage = Math.round((item.count / totalClicks) * 100);

                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{item.name}</span>
                            <span className="text-slate-500">
                              {item.count} klik ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#3730A3] to-[#C9A24B] rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Devices & Systems */}
              {activeTab === 'devices' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Device Platforms */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                    <h4 className="font-semibold text-slate-900 text-sm">
                      Kategori Perangkat
                    </h4>
                    <div className="space-y-3">
                      {data.devices.map((d) => {
                        const totalClicks = data.summary.totalClicks || 1;
                        const pct = Math.round((d.count / totalClicks) * 100);
                        const label =
                          d.name === 'android'
                            ? 'Android Mobile'
                            : d.name === 'ios'
                            ? 'Apple iOS (iPhone/iPad)'
                            : 'Desktop / Komputer';

                        return (
                          <div key={d.name} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>{label}</span>
                              <span className="text-slate-500">{pct}% ({d.count})</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-[#3730A3] rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Browsers & OS */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                    <h4 className="font-semibold text-slate-900 text-sm">
                      Browser Pengunjung
                    </h4>
                    <div className="space-y-3">
                      {data.browsers.map((b) => {
                        const totalClicks = data.summary.totalClicks || 1;
                        const pct = Math.round((b.count / totalClicks) * 100);

                        return (
                          <div key={b.name} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>{b.name}</span>
                              <span className="text-slate-500">{b.count} klik</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-[#C9A24B] rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Geo Locations */}
              {activeTab === 'geo' && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Geolokasi & Negara Pengunjung
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {data.countries.map((c) => {
                      const totalClicks = data.summary.totalClicks || 1;
                      const pct = Math.round((c.count / totalClicks) * 100);
                      return (
                        <div
                          key={c.name}
                          className="p-3 rounded-xl bg-[#FAF8F5] border border-slate-200/80 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-[#3730A3]" />
                            <span className="text-xs font-bold text-slate-800">{c.name}</span>
                          </div>
                          <div className="text-xs font-mono font-semibold text-slate-600">
                            {c.count} klik ({pct}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
