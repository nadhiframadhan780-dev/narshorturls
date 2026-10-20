import React, { useState, useEffect } from 'react';
import {
  Code,
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  Terminal,
  Play,
  Send,
  Sparkles,
  Layers,
  Shield,
  FileCode,
} from 'lucide-react';
import { ApiKeyItem } from '../types/index.ts';
import { fetchApiKeys, createApiKey, deleteApiKey } from '../utils/api.ts';

interface ApiDocsViewProps {
  currentUserId: string;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ApiDocsView: React.FC<ApiDocsViewProps> = ({ currentUserId, onToast }) => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [activeLang, setActiveLang] = useState<'curl' | 'javascript' | 'python'>('curl');

  // Interactive Tester
  const [testUrl, setTestUrl] = useState('https://stripe.com/docs');
  const [testAlias, setTestAlias] = useState('');
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [testing, setTesting] = useState(false);

  // Copied indicator
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const loadKeys = async () => {
    try {
      const data = await fetchApiKeys(currentUserId);
      setKeys(data);
    } catch (err: any) {
      onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, [currentUserId]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsCreatingKey(true);
    try {
      const created = await createApiKey(newKeyName.trim(), currentUserId);
      setKeys([...keys, created]);
      setNewKeyName('');
      onToast('API Key baru berhasil dibuat!', 'success');
    } catch (err: any) {
      onToast(err.message, 'error');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleDeleteKey = async (id: string, name: string) => {
    if (!window.confirm(`Cabut dan hapus API Key '${name}'?`)) return;
    try {
      await deleteApiKey(id);
      setKeys(keys.filter((k) => k.id !== id));
      onToast(`API Key '${name}' berhasil dicabut`, 'info');
    } catch (err: any) {
      onToast(err.message, 'error');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    onToast('Disalin ke clipboard', 'success');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const sampleApiKey = keys[0]?.key || 'nar_live_demo84729103847';

  const codeSnippets = {
    curl: `curl -X POST https://narshort.url/api/v1/shorten \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${sampleApiKey}" \\
  -d '{
    "url": "${testUrl}",
    "alias": "${testAlias || 'promo-khusus'}",
    "title": "Dokumentasi Developer"
  }'`,

    javascript: `const response = await fetch("https://narshort.url/api/v1/shorten", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${sampleApiKey}"
  },
  body: JSON.stringify({
    url: "${testUrl}",
    alias: "${testAlias || 'promo-khusus'}",
    title: "Dokumentasi Developer"
  })
});

const data = await response.json();
console.log("Shortened URL:", data.data.shortUrl);`,

    python: `import requests

url = "https://narshort.url/api/v1/shorten"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${sampleApiKey}"
}
payload = {
    "url": "${testUrl}",
    "alias": "${testAlias || 'promo-khusus'}",
    "title": "Dokumentasi Developer"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
  };

  const runLiveTest = async () => {
    setTesting(true);
    setTestResponse(null);
    try {
      const activeKey = keys[0]?.key || 'nar_live_demo84729103847';
      const res = await fetch('/api/v1/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': activeKey,
        },
        body: JSON.stringify({
          url: testUrl,
          alias: testAlias.trim() || undefined,
          title: 'Uji Coba API Playground',
        }),
      });
      const json = await res.json();
      setTestResponse({ status: res.status, data: json });
      if (res.ok) {
        onToast('Permintaan API berhasil dijalankan!', 'success');
      } else {
        onToast(json.error || 'Permintaan gagal', 'error');
      }
    } catch (err: any) {
      setTestResponse({ error: err.message });
      onToast(err.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-[#3730A3] mb-2">
          <Terminal className="w-3.5 h-3.5 text-[#C9A24B]" />
          <span>Developer Platform & REST API</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
          Dokumentasi API & Kunci Akses
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1">
          Integrasikan pemendekan URL instan, kustom alias, dan analitik performa langsung ke dalam aplikasi atau pipeline CI/CD Anda.
        </p>
      </div>

      {/* API Key Management Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#C9A24B]" />
              <span>Kelola API Keys</span>
            </h3>
            <p className="text-xs text-slate-500">
              Jangan pernah membagikan API key Anda di kode client-side publik.
            </p>
          </div>

          <form onSubmit={handleCreateKey} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Label kunci (cth: Production App)..."
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
            />
            <button
              type="submit"
              disabled={isCreatingKey || !newKeyName.trim()}
              className="px-4 py-2 rounded-xl bg-[#3730A3] hover:bg-[#2e2889] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>Buat Kunci</span>
            </button>
          </form>
        </div>

        {/* Keys Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3">Nama Kunci</th>
                <th className="p-3">Nilai API Key</th>
                <th className="p-3 hidden sm:table-cell">Terakhir Dipakai</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50">
                  <td className="p-3 font-sans font-semibold text-slate-800">{k.name}</td>
                  <td className="p-3 text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#3730A3]">{k.key}</span>
                      <button
                        onClick={() => copyToClipboard(k.key, k.id)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title="Salin"
                      >
                        {copiedKeyId === k.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="p-3 hidden sm:table-cell text-slate-400 font-sans text-[11px]">
                    {k.lastUsedAt
                      ? new Date(k.lastUsedAt).toLocaleString('id-ID')
                      : 'Belum pernah digunakan'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteKey(k.id, k.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Cabut Kunci"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Examples & Interactive Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Snippets Section */}
        <div className="bg-[#0F172A] rounded-3xl p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#C9A24B]" />
              <span className="font-semibold text-sm">Contoh Implementasi Kode</span>
            </div>
            {/* Lang Tabs */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
              {(['curl', 'javascript', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-3 py-1 rounded-lg transition-colors capitalize ${
                    activeLang === lang
                      ? 'bg-[#3730A3] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'javascript' ? 'Node.js' : lang}
                </button>
              ))}
            </div>
          </div>

          {/* Snippet box */}
          <div className="relative">
            <pre className="text-xs font-mono bg-slate-950/80 p-4 rounded-2xl overflow-x-auto text-emerald-400 leading-relaxed border border-slate-800">
              <code>{codeSnippets[activeLang]}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(codeSnippets[activeLang], 'snippet')}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/90 text-slate-400 hover:text-white transition-colors"
              title="Salin cuplikan kode"
            >
              {copiedKeyId === 'snippet' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed">
            * Endpoint menghasilkan status <code>201 Created</code> dengan format JSON terstruktur lengkap dengan shortened URL dan display URL.
          </div>
        </div>

        {/* Live Interactive API Tester */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-[#C9A24B]" />
                <span>Playground Pengujian Langsung</span>
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                POST /api/v1/shorten
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Target URL untuk Uji Coba:
              </label>
              <input
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://contoh.com/artikel"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Custom Alias (Opsional):
              </label>
              <input
                type="text"
                value={testAlias}
                onChange={(e) => setTestAlias(e.target.value)}
                placeholder="test-api-link"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-[#FAF8F5] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3730A3]"
              />
            </div>

            <button
              onClick={runLiveTest}
              disabled={testing || !testUrl.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#3730A3] hover:bg-[#2e2889] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#C9A24B]" />
                  <span>Kirim Permintaan Uji Coba</span>
                </>
              )}
            </button>
          </div>

          {/* Test Response Window */}
          {testResponse && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Respon Server:</span>
                <span className="font-mono text-emerald-600">
                  Status: {testResponse.status || 200} OK
                </span>
              </div>
              <pre className="text-[11px] font-mono bg-slate-900 text-emerald-400 p-3 rounded-xl max-h-40 overflow-y-auto">
                {JSON.stringify(testResponse.data || testResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
