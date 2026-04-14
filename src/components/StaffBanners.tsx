import { useState, useEffect } from 'react';
import { IconSpeakerphone, IconBroadcast, IconUpload, IconLoader2, IconCheck } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const API_BASE = '/api';

export default function StaffBanners() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'top' | 'popup'>('top');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Top banner state
  const [topEnabled, setTopEnabled] = useState<boolean | null>(null);
  const [topText, setTopText] = useState('');

  // Popup banner state
  const [popupEnabled, setPopupEnabled] = useState<boolean | null>(null);
  const [popupImageUrl, setPopupImageUrl] = useState('');
  const [popupButtonLabel, setPopupButtonLabel] = useState('');
  const [popupButtonLink, setPopupButtonLink] = useState('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_BASE}/banners`);
      const data = await res.json();
      if (data.success) {
        if (data.data.top_banner) {
          setTopEnabled(data.data.top_banner.enabled);
          setTopText(data.data.top_banner.text || '');
        }
        if (data.data.popup_banner) {
          setPopupEnabled(data.data.popup_banner.enabled);
          setPopupImageUrl(data.data.popup_banner.image_url || '');
          setPopupButtonLabel(data.data.popup_banner.button_label || '');
          setPopupButtonLink(data.data.popup_banner.button_link || '');
        }
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const handleTopBannerSave = async () => {
    if (topEnabled === null) return; // Not loaded yet
    setSaving(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/banners/top_banner`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled: topEnabled,
          text: topText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new CustomEvent('banner-updated'));
        toast({
          type: 'success',
          title: 'Berhasil',
          description: 'Top banner berhasil diperbarui',
        });
      } else {
        toast({
          type: 'error',
          title: 'Gagal',
          description: data.error || 'Gagal memperbarui top banner',
        });
      }
    } catch (err) {
      console.error('Error saving top banner:', err);
      toast({
        type: 'error',
        title: 'Gagal',
        description: 'Terjadi kesalahan saat menyimpan',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePopupBannerSave = async () => {
    if (popupEnabled === null) return; // Not loaded yet
    setSaving(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/banners/popup_banner`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled: popupEnabled,
          image_url: popupImageUrl,
          button_label: popupButtonLabel,
          button_link: popupButtonLink,
        }),
      });

      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new CustomEvent('banner-updated'));
        toast({
          type: 'success',
          title: 'Berhasil',
          description: 'Popup banner berhasil diperbarui',
        });
      } else {
        toast({
          type: 'error',
          title: 'Gagal',
          description: data.error || 'Gagal memperbarui popup banner',
        });
      }
    } catch (err) {
      console.error('Error saving popup banner:', err);
      toast({
        type: 'error',
        title: 'Gagal',
        description: 'Terjadi kesalahan saat menyimpan',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/banners/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setPopupImageUrl(data.data.url);
        toast({
          type: 'success',
          title: 'Upload Berhasil',
          description: 'Gambar banner berhasil diupload',
        });
      } else {
        toast({
          type: 'error',
          title: 'Upload Gagal',
          description: data.error || 'Gagal mengupload gambar',
        });
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      toast({
        type: 'error',
        title: 'Upload Gagal',
        description: 'Terjadi kesalahan saat mengupload',
      });
    } finally {
      setUploading(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold text-text">Pengaturan Banner</h1>
        <p className="text-text-light mt-1">Kelola banner utama dan popup di halaman depan</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-border">
        <button
          onClick={() => setActiveTab('top')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'top'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-light hover:text-text hover:bg-gray-50'
          }`}
        >
          <IconSpeakerphone size={18} />
          <span>Top Banner</span>
        </button>
        <button
          onClick={() => setActiveTab('popup')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'popup'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-light hover:text-text hover:bg-gray-50'
          }`}
        >
          <IconBroadcast size={18} />
          <span>Popup Banner</span>
        </button>
      </div>

      {/* Top Banner Tab */}
      {activeTab === 'top' && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
          <div className="space-y-5">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-text cursor-pointer" onClick={() => setTopEnabled(!topEnabled)}>Status</label>
                <p className="text-xs text-text-light mt-0.5">Aktifkan atau nonaktifkan banner atas</p>
              </div>
              <button
                onClick={() => setTopEnabled(!topEnabled)}
                disabled={topEnabled === null}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 cursor-pointer ${
                  topEnabled ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${
                    topEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Custom Text */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Teks Banner</label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="TELAH DIBUKA PMB TA 2026/2027"
                className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-text text-sm"
                disabled={!topEnabled}
              />
              <p className="text-xs text-text-light mt-1.5">Teks yang muncul di banner hijau bagian atas</p>
            </div>

            {/* Live Preview */}
            {topEnabled && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">Preview</label>
                <div className="bg-primary text-white py-3 px-4 rounded-lg text-center">
                  <span className="text-sm font-medium tracking-wide">
                    {topText || 'Teks banner akan muncul di sini'}
                  </span>
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleTopBannerSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Popup Banner Tab */}
      {activeTab === 'popup' && (
        <div className="space-y-6">
          {/* Settings Card */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
            <div className="space-y-5">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-text cursor-pointer" onClick={() => setPopupEnabled(!popupEnabled)}>Status</label>
                  <p className="text-xs text-text-light mt-0.5">Aktifkan atau nonaktifkan popup banner</p>
                </div>
                <button
                  onClick={() => setPopupEnabled(!popupEnabled)}
                  disabled={popupEnabled === null}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 cursor-pointer ${
                    popupEnabled ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${
                      popupEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Gambar Banner</label>

                {/* Current Image Preview */}
                {popupImageUrl && (
                  <div className="mb-3 relative group rounded-xl overflow-hidden border border-border">
                    <img
                      src={popupImageUrl}
                      alt="Current popup banner"
                      className="w-full max-h-64 object-contain bg-gray-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center cursor-pointer">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 text-white">
                        <IconUpload size={24} />
                        <span className="text-xs font-medium">Ganti Gambar</span>
                      </div>
                    </div>
                    {/* Hidden file input for replace */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm">
                    <IconUpload size={16} className="text-text-light" />
                    <span className="font-medium text-text">{popupImageUrl ? 'Ganti Gambar' : 'Upload Gambar'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-text-light">
                      <IconLoader2 size={16} className="animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>
                {!popupImageUrl && (
                  <p className="text-xs text-text-light mt-1.5">Belum ada gambar. Upload gambar untuk popup banner.</p>
                )}
              </div>

              {/* Button Label */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Label Tombol</label>
                <input
                  type="text"
                  value={popupButtonLabel}
                  onChange={(e) => setPopupButtonLabel(e.target.value)}
                  placeholder="Daftar Sekarang"
                  className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-text text-sm"
                  disabled={!popupEnabled}
                />
              </div>

              {/* Button Link */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Link Tombol</label>
                <input
                  type="text"
                  value={popupButtonLink}
                  onChange={(e) => setPopupButtonLink(e.target.value)}
                  placeholder="/pmb"
                  className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-text text-sm"
                  disabled={!popupEnabled}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handlePopupBannerSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? (
                  <>
                    <IconLoader2 size={16} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Popup Preview Card */}
          {popupEnabled && (
            <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
              <label className="block text-sm font-medium text-text mb-4">Preview Popup Banner</label>
              <div className="flex justify-center">
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl border border-border max-w-sm w-full">
                  {/* Close Button Preview */}
                  <div className="absolute top-3 right-3 z-10 bg-black/50 text-white p-1.5 rounded-full">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </div>

                  {/* Image Preview */}
                  {popupImageUrl ? (
                    <img
                      src={popupImageUrl}
                      alt="Popup banner preview"
                      className="w-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.insertAdjacentHTML('afterbegin',
                          '<div class="w-full h-48 bg-gray-100 flex items-center justify-center text-text-light text-sm">Gambar gagal dimuat</div>'
                        );
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center text-text-light">
                      <IconUpload size={32} className="mb-2 opacity-50" />
                      <span className="text-xs">Belum ada gambar</span>
                    </div>
                  )}

                  {/* CTA Button Preview */}
                  <div className="p-4 bg-primary/5">
                    <div className="block w-full py-3 text-center text-sm font-semibold text-white bg-primary rounded-xl">
                      {popupButtonLabel || 'Daftar Sekarang'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
