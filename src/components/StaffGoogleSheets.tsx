import { useState, useEffect } from 'react';
import {
  IconLoader2, IconLink, IconUnlink, IconRefresh, IconFileSpreadsheet,
  IconSettings, IconColumns, IconTable, IconCheck,
  IconAlertTriangle, IconCopy, IconEye, IconEyeOff,
} from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const API_BASE = '/api';

export default function StaffGoogleSheets() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'data' | 'mapping' | 'settings'>('data');

  // Settings state
  const [authUrl, setAuthUrl] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [savingCreds, setSavingCreds] = useState(false);
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [spreadsheets, setSpreadsheets] = useState<Array<{ id: string; name: string }>>([]);
  const [sheets, setSheets] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState('');
  const [selectedSpreadsheetTitle, setSelectedSpreadsheetTitle] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mapping state
  const [mappings, setMappings] = useState<Array<{ field_name: string; column_letter: string; column_label: string }>>([]);
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([]);
  const [savingMapping, setSavingMapping] = useState<string | null>(null);

  // Data state
  const [sheetData, setSheetData] = useState<{ headers: string[]; rows: Array<Record<string, string>>; total: number; lastSync: string | null; notConfigured?: boolean } | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => { fetchConfig(); }, []);
  useEffect(() => { if (activeTab === 'mapping') fetchMappings(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'data') fetchData(); }, [activeTab]);

  // Check for OAuth success from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth') === 'success') {
      fetchConfig();
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const fetchConfig = async () => {
    try {
      const token = await getAuthToken();

      // Get auth URL and credentials
      const authRes = await fetch(`${API_BASE}/google-sheets/auth-url`);
      const authData = await authRes.json();
      if (authData.success) {
        setAuthUrl(authData.data.authUrl);
        setRedirectUri(authData.data.redirectUri);
        setClientId(authData.data.clientId || '');
      }

      // Get config
      const configRes = await fetch(`${API_BASE}/google-sheets/config`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const configData = await configRes.json();
      if (configData.success && configData.data?.access_token) {
        setConnected(true);
        setUserEmail(configData.data.user_email || '');
        setSelectedSpreadsheet(configData.data.spreadsheet_id || '');
        setSelectedSpreadsheetTitle(configData.data.spreadsheet_title || '');
        setSelectedSheet(configData.data.sheet_name || '');
        setAutoSync(configData.data.auto_sync !== false);
        setLastSync(configData.data.last_sync_at || null);

        // Always load spreadsheets when connected (even if none selected yet)
        fetchSpreadsheets();

        // If sheet already selected, fetch headers
        if (configData.data.spreadsheet_id && configData.data.sheet_name) {
          try {
            const token = await getAuthToken();
            const res = await fetch(`${API_BASE}/google-sheets/sheet-headers/${configData.data.spreadsheet_id}/${encodeURIComponent(configData.data.sheet_name)}`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
              setSheetHeaders(data.data.headers || []);
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const fetchSpreadsheets = async () => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/google-sheets/spreadsheets`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSpreadsheets(data.data);
      }
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Gagal memuat spreadsheet' });
    }
  };

  const fetchSheets = async (spreadsheetId: string) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/google-sheets/sheets/${spreadsheetId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSheets(data.data);
      }
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Gagal memuat sheets' });
    }
  };

  const handleCopyRedirectUri = () => {
    if (redirectUri) {
      navigator.clipboard.writeText(redirectUri).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = redirectUri;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleSheetChange = async (name: string) => {
    setSelectedSheet(name);
    // Fetch headers from the sheet's first row
    if (selectedSpreadsheet && name) {
      try {
        const token = await getAuthToken();
        const res = await fetch(`${API_BASE}/google-sheets/sheet-headers/${selectedSpreadsheet}/${encodeURIComponent(name)}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setSheetHeaders(data.data.headers || []);
        } else {
          setSheetHeaders([]);
        }
      } catch {
        setSheetHeaders([]);
      }
    }
  };

  const handleSaveCredentials = async () => {
    if (!clientId || !clientSecret) {
      toast({ type: 'error', title: 'Gagal', description: 'Client ID dan Client Secret harus diisi' });
      return;
    }
    setSavingCreds(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/google-sheets/credentials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ type: 'success', title: 'Berhasil', description: 'Google OAuth credentials disimpan' });
        fetchConfig();
      } else {
        toast({ type: 'error', title: 'Gagal', description: data.error || 'Gagal menyimpan credentials' });
      }
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Terjadi kesalahan' });
    } finally { setSavingCreds(false); }
  };

  const handleSpreadsheetChange = (id: string) => {
    setSelectedSpreadsheet(id);
    const ss = spreadsheets.find((s) => s.id === id);
    setSelectedSpreadsheetTitle(ss?.name || '');
    setSheets([]);
    setSelectedSheet('');
    setSheetHeaders([]);
    if (id) fetchSheets(id);
  };

  const handleSaveConfig = async () => {
    if (!selectedSpreadsheet || !selectedSheet) {
      toast({ type: 'error', title: 'Gagal', description: 'Pilih spreadsheet dan sheet terlebih dahulu' });
      return;
    }
    setSaving(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/google-sheets/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          spreadsheet_id: selectedSpreadsheet,
          spreadsheet_title: selectedSpreadsheetTitle,
          sheet_name: selectedSheet,
          auto_sync: autoSync,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ type: 'success', title: 'Berhasil', description: 'Pengaturan disimpan' });
      } else {
        toast({ type: 'error', title: 'Gagal', description: data.error || 'Gagal menyimpan pengaturan' });
      }
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Terjadi kesalahan' });
    } finally { setSaving(false); }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/google-sheets/sync`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast({ type: 'success', title: 'Berhasil', description: `${data.data.synced} data berhasil disinkronkan` });
        setLastSync(new Date().toISOString());
        if (activeTab === 'data') fetchData();
      } else {
        toast({ type: 'error', title: 'Gagal', description: data.error || 'Gagal sinkronisasi' });
      }
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Terjadi kesalahan' });
    } finally { setSyncing(false); }
  };

  const handleDisconnect = async () => {
    if (!confirm('Putuskan koneksi Google Sheets? Data mapping tetap tersimpan.')) return;
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/google-sheets/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          spreadsheet_id: '',
          spreadsheet_title: '',
          sheet_name: '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast({ type: 'error', title: 'Gagal', description: data.error || 'Gagal memutuskan koneksi' });
        return;
      }
      setConnected(false);
      setUserEmail('');
      setSelectedSpreadsheet('');
      setSelectedSheet('');
      setSpreadsheets([]);
      setSheets([]);
      toast({ type: 'success', title: 'Berhasil', description: 'Koneksi Google Sheets diputuskan' });
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Gagal memutuskan koneksi' });
    }
  };

  const fetchMappings = async () => {
    try {
      const res = await fetch(`${API_BASE}/google-sheets/mappings`);
      const data = await res.json();
      if (data.success) {
        setMappings(data.data.mappings);
      }
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Gagal memuat mapping' });
    }
  };

  const handleMappingChange = async (fieldName: string, headerName: string) => {
    setSavingMapping(fieldName);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/google-sheets/mappings/${fieldName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ column_letter: headerName, column_label: headerName }),
      });
      const data = await res.json();
      if (data.success) {
        setMappings((prev) => prev.map((m) =>
          m.field_name === fieldName ? { ...m, column_letter: headerName, column_label: headerName } : m
        ));
      }
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Gagal menyimpan mapping' });
    } finally { setSavingMapping(null); }
  };

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/google-sheets/data`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSheetData(data.data);
      } else {
        setSheetData(null);
      }
    } catch {
      setSheetData(null);
    } finally { setDataLoading(false); }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'Belum pernah';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Integrasi Google Sheets</h1>
          <p className="text-text-light mt-1">Sinkronisasi data PMB ke Google Sheets secara otomatis</p>
        </div>
        {connected && (
          <button
            onClick={handleSync}
            disabled={syncing || !selectedSpreadsheet || !selectedSheet}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {syncing ? <><IconLoader2 size={18} className="animate-spin" /> Sinkronisasi...</> : <><IconRefresh size={18} /> Sinkronisasi Sekarang</>}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-border">
        {[
          { key: 'data' as const, label: 'Data Sheets', icon: IconTable },
          { key: 'mapping' as const, label: 'Mapping Kolom', icon: IconColumns },
          { key: 'settings' as const, label: 'Pengaturan', icon: IconSettings },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-light hover:text-text hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Google OAuth Credentials */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Google OAuth Credentials</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Buat OAuth credentials di <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Cloud Console</a>. 
                  Enable Google Sheets API & Google Drive API, lalu buat OAuth 2.0 Client ID (Web application).
                </p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-800 mb-2">⚠️ Penting: Redirect URI Harus Sama Persis</p>
                <p className="text-xs text-amber-700 mb-2">Copy redirect URI di bawah, lalu paste di Google Cloud Console → Authorized redirect URIs.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-mono text-amber-900 truncate">
                    {redirectUri || '-'}
                  </code>
                  <button
                    onClick={handleCopyRedirectUri}
                    className="p-2 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
                    title="Salin URI"
                  >
                    {copied ? <IconCheck size={16} className="text-green-600" /> : <IconCopy size={16} className="text-amber-700" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Client ID</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="xxx.apps.googleusercontent.com"
                  className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Client Secret</label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="GOCSPX-xxx"
                    className="w-full px-3 py-2.5 pr-10 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showSecret ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Authorized Redirect URI</label>
                <input
                  type="text"
                  value={redirectUri}
                  onChange={(e) => setRedirectUri(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-xs text-text font-mono bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-text-light mt-1.5">
                  URI ini otomatis (SPA route). Tambahkan persis di Google Cloud Console → Authorized redirect URIs.
                </p>
              </div>
              <button
                onClick={handleSaveCredentials}
                disabled={savingCreds}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer"
              >
                {savingCreds ? <><IconLoader2 size={16} className="animate-spin" /> Menyimpan...</> : <><IconCheck size={16} /> Simpan Credentials</>}
              </button>
            </div>
          </div>

          {/* OAuth Connection Status */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Koneksi Google</h2>
            {connected ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <IconCheck size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">Terhubung ke Google</p>
                    <p className="text-xs text-text-light">{userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <IconUnlink size={16} /> Putuskan
                </button>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <IconLink size={32} className="text-text-light" />
                </div>
                <p className="text-text-light mb-4">Hubungkan akun Google Anda untuk mulai sinkronisasi</p>
                <a
                  href={authUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  <IconLink size={18} /> Hubungkan Google Sheets
                </a>

                {/* Debug payload info */}
                {authUrl && (
                  <div className="mt-6 text-left">
                    <p className="text-xs font-semibold text-text mb-2">📤 Payload OAuth yang dikirim:</p>
                    <div className="space-y-2">
                      {[
                        ['client_id', authUrl.match(/client_id=([^&]+)/)?.[1] || '-'],
                        ['redirect_uri', decodeURIComponent(authUrl.match(/redirect_uri=([^&]+)/)?.[1] || '-')],
                        ['scope', authUrl.match(/scope=([^&]+)/)?.[1] || '-'],
                        ['access_type', 'offline'],
                        ['prompt', 'consent'],
                      ].map(([key, val]) => (
                        <div key={key} className="flex items-start gap-2 text-xs">
                          <code className="w-28 shrink-0 text-text-light">{key}</code>
                          <code className="flex-1 px-2 py-1 bg-gray-50 rounded border border-border font-mono break-all text-text">{val}</code>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-red-600 mt-3 font-medium">
                      ⚠️ Jika "redirect_uri" berbeda dengan yang ada di Google Cloud Console → Error 400: redirect_uri_mismatch
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Spreadsheet Selection */}
          {connected && (
            <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-text mb-4">Pilih Spreadsheet & Sheet</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Spreadsheet</label>
                  <select
                    value={selectedSpreadsheet}
                    onChange={(e) => handleSpreadsheetChange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text cursor-pointer"
                  >
                    <option value="">Pilih Spreadsheet...</option>
                    {spreadsheets.map((ss) => (
                      <option key={ss.id} value={ss.id}>{ss.name}</option>
                    ))}
                  </select>
                </div>

                {sheets.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">Sheet/Tab</label>
                    <select
                      value={selectedSheet}
                      onChange={(e) => handleSheetChange(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text cursor-pointer"
                    >
                      <option value="">Pilih Sheet...</option>
                      {sheets.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-text">Auto Sync</label>
                    <p className="text-xs text-text-light mt-0.5">Otomatis sync saat ada pendaftaran baru</p>
                  </div>
                  <button
                    onClick={() => setAutoSync(!autoSync)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${autoSync ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${autoSync ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-text-light">Terakhir Sync</span>
                  <span className="text-sm font-medium text-text">{formatDateTime(lastSync)}</span>
                </div>

                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {saving ? <><IconLoader2 size={16} className="animate-spin" /> Menyimpan...</> : <><IconCheck size={16} /> Simpan Pengaturan</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mapping Tab */}
      {activeTab === 'mapping' && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-text">Mapping Kolom</h2>
              <p className="text-sm text-text-light mt-0.5">Tentukan kolom Google Sheets untuk setiap field form</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Field Form</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Kolom Google Sheets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mappings.map((m) => (
                  <tr key={m.field_name} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text">{m.column_label}</p>
                      <p className="text-xs text-text-light font-mono">{m.field_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={m.column_letter}
                        onChange={(e) => handleMappingChange(m.field_name, e.target.value)}
                        disabled={savingMapping === m.field_name}
                        className="px-3 py-2 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text cursor-pointer disabled:opacity-60"
                      >
                        {sheetHeaders.length > 0 ? (
                          sheetHeaders.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))
                        ) : (
                          <option value="">Pilih sheet terlebih dahulu</option>
                        )}
                      </select>
                      {savingMapping === m.field_name && (
                        <IconLoader2 size={14} className="animate-spin ml-2 inline text-primary" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-text">Data Google Sheets</h2>
              <p className="text-sm text-text-light mt-0.5">
                {sheetData ? `${sheetData.total} baris data` : 'Belum ada data'}
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={dataLoading}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-text hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <IconRefresh size={16} className={dataLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <IconLoader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : !connected || !selectedSpreadsheet ? (
            <div className="text-center py-12 text-text-light">
              <IconFileSpreadsheet size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Hubungkan Google Sheets terlebih dahulu di tab Pengaturan</p>
            </div>
          ) : sheetData?.notConfigured ? (
            <div className="text-center py-12 text-text-light">
              <IconFileSpreadsheet size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-4">Pilih Spreadsheet dan Sheet terlebih dahulu di tab Pengaturan</p>
              <button
                onClick={() => setActiveTab('settings')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <IconSettings size={16} /> Buka Pengaturan
              </button>
            </div>
          ) : sheetData && sheetData.rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    {sheetData.headers.map((h) => (
                      <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-text-light uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sheetData.rows.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      {sheetData.headers.map((h) => (
                        <td key={h} className="px-3 py-2 text-text whitespace-nowrap">{row[h] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {sheetData.rows.length > 50 && (
                <p className="text-xs text-text-light text-center mt-4">Menampilkan 50 dari {sheetData.rows.length} baris. Buka Google Sheets untuk data lengkap.</p>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-text-light">
              <IconAlertTriangle size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-4">Belum ada data di Google Sheets</p>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer"
              >
                {syncing ? <><IconLoader2 size={16} className="animate-spin" /> Sinkronisasi...</> : <><IconRefresh size={16} /> Sinkronisasi Sekarang</>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
