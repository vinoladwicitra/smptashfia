import { useState, useEffect } from 'react';
import { IconPhone, IconBrandInstagram, IconMapPin, IconLoader2, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const API_BASE = '/api';

export default function StaffSiteSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'contact' | 'social' | 'location'>('contact');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Contact settings
  const [contactPhone, setContactPhone] = useState('');
  const [contactPhoneIntl, setContactPhoneIntl] = useState('');
  const [contactHours, setContactHours] = useState('');
  const [contactAddressShort, setContactAddressShort] = useState('');
  const [contactAddressFull, setContactAddressFull] = useState('');

  // Social settings
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialInstagramLabel, setSocialInstagramLabel] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialFacebookLabel, setSocialFacebookLabel] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialYoutubeLabel, setSocialYoutubeLabel] = useState('');

  // Location settings
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState('');
  const [mapsLink, setMapsLink] = useState('');

  // Validate Google Maps embed URL
  const isValidMapsEmbed = (url: string): boolean => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && parsed.hostname === 'www.google.com' && parsed.pathname.includes('/maps/embed');
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/site-settings`);
      if (!res.ok) {
        throw new Error(`Fetch site-settings failed: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        const c = data.data.contact || {};
        const l = data.data.location || {};
        const s = data.data.social || {};
        setContactPhone(c.contact_phone || '');
        setContactPhoneIntl(c.contact_phone_intl || '');
        setContactHours(c.contact_hours || '');
        setContactAddressShort(c.contact_address_short || '');
        setContactAddressFull(c.contact_address_full || '');
        setSocialInstagram(s.social_instagram || '');
        setSocialInstagramLabel(s.social_instagram_label || '');
        setSocialFacebook(s.social_facebook || '');
        setSocialFacebookLabel(s.social_facebook_label || '');
        setSocialYoutube(s.social_youtube || '');
        setSocialYoutubeLabel(s.social_youtube_label || '');
        setMapsEmbedUrl(l.maps_embed_url || '');
        setMapsLink(l.maps_link || '');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getAuthToken();
      const payload: Record<string, string> = {};

      if (activeTab === 'contact') {
        payload.contact_phone = contactPhone;
        payload.contact_phone_intl = contactPhoneIntl;
        payload.contact_hours = contactHours;
        payload.contact_address_short = contactAddressShort;
        payload.contact_address_full = contactAddressFull;
      } else if (activeTab === 'social') {
        payload.social_instagram = socialInstagram;
        payload.social_instagram_label = socialInstagramLabel;
        payload.social_facebook = socialFacebook;
        payload.social_facebook_label = socialFacebookLabel;
        payload.social_youtube = socialYoutube;
        payload.social_youtube_label = socialYoutubeLabel;
      } else if (activeTab === 'location') {
        payload.maps_embed_url = mapsEmbedUrl;
        payload.maps_link = mapsLink;
      }

      const res = await fetch(`${API_BASE}/site-settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new CustomEvent('settings-updated'));
        toast({
          type: 'success',
          title: 'Berhasil',
          description: 'Pengaturan situs berhasil diperbarui',
        });
      } else {
        toast({
          type: 'error',
          title: 'Gagal',
          description: data.error || 'Gagal memperbarui pengaturan',
        });
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      toast({
        type: 'error',
        title: 'Gagal',
        description: 'Terjadi kesalahan saat menyimpan',
      });
    } finally {
      setSaving(false);
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
        <h1 className="text-2xl font-bold text-text">Pengaturan Situs</h1>
        <p className="text-text-light mt-1">Kelola informasi kontak, media sosial, dan lokasi</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-border">
        {[
          { key: 'contact' as const, label: 'Kontak', icon: IconPhone },
          { key: 'social' as const, label: 'Media Sosial', icon: IconBrandInstagram },
          { key: 'location' as const, label: 'Lokasi', icon: IconMapPin },
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

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Nomor Telepon (Display)</label>
              <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="(021) 84978071" className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Nomor Telepon (Internasional)</label>
              <input type="text" value={contactPhoneIntl} onChange={(e) => setContactPhoneIntl(e.target.value)} placeholder="+622184978071" className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
              <p className="text-xs text-text-light mt-1.5">Format untuk link tel:</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Jam Kerja</label>
              <input type="text" value={contactHours} onChange={(e) => setContactHours(e.target.value)} placeholder="Sen - Jum : 07.30 - 15.10 WIB" className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Alamat (Singkat)</label>
              <input type="text" value={contactAddressShort} onChange={(e) => setContactAddressShort(e.target.value)} placeholder="Jl. Dr. Ratna No.82, Bekasi - 17421" className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
              <p className="text-xs text-text-light mt-1.5">Tampil di header desktop</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Alamat (Lengkap)</label>
              <textarea value={contactAddressFull} onChange={(e) => setContactAddressFull(e.target.value)} rows={3} placeholder="Jl. Dr. Ratna No.82, RT.02/RW.08, Kel. Jatikramat, Kec. Jatiasih, Kota Bekasi, Jawa Barat 17421" className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text resize-none" />
              <p className="text-xs text-text-light mt-1.5">Tampil di footer dan mobile</p>
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
              {saving ? <><IconLoader2 size={16} className="animate-spin" /> Menyimpan...</> : <><IconCheck size={16} /> Simpan Perubahan</>}
            </button>
          </div>
        </div>
      )}

      {/* Social Tab */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text mb-2">URL Instagram</label>
              <input type="text" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="https://www.instagram.com/smptashfia" className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Label Instagram</label>
              <input type="text" value={socialInstagramLabel} onChange={(e) => setSocialInstagramLabel(e.target.value)} placeholder="@smptashfia" className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">URL Facebook</label>
              <input type="text" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="https://web.facebook.com/smp.tashfia" className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Label Facebook</label>
              <input type="text" value={socialFacebookLabel} onChange={(e) => setSocialFacebookLabel(e.target.value)} placeholder="SMP Tashfia" className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">URL YouTube</label>
              <input type="text" value={socialYoutube} onChange={(e) => setSocialYoutube(e.target.value)} placeholder="https://www.youtube.com/channel/..." className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Label YouTube</label>
              <input type="text" value={socialYoutubeLabel} onChange={(e) => setSocialYoutubeLabel(e.target.value)} placeholder="Ma'had Putri Tashfia" className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
              {saving ? <><IconLoader2 size={16} className="animate-spin" /> Menyimpan...</> : <><IconCheck size={16} /> Simpan Perubahan</>}
            </button>
          </div>
        </div>
      )}

      {/* Location Tab */}
      {activeTab === 'location' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Google Maps Embed URL</label>
                <textarea value={mapsEmbedUrl} onChange={(e) => setMapsEmbedUrl(e.target.value)} rows={3} placeholder="https://www.google.com/maps/embed?pb=..." className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text font-mono resize-none" />
                <p className="text-xs text-text-light mt-1.5">
                  Dari Google Maps → Share → Embed a map → Copy iframe src
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Google Maps Link</label>
                <input type="text" value={mapsLink} onChange={(e) => setMapsLink(e.target.value)} placeholder="https://maps.app.goo.gl/..." className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
                <p className="text-xs text-text-light mt-1.5">Link langsung untuk mobile</p>
              </div>
              <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                {saving ? <><IconLoader2 size={16} className="animate-spin" /> Menyimpan...</> : <><IconCheck size={16} /> Simpan Perubahan</>}
              </button>
            </div>
          </div>

          {/* Maps Preview */}
          {mapsEmbedUrl && isValidMapsEmbed(mapsEmbedUrl) && (
            <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6">
              <label className="block text-sm font-medium text-text mb-4">Preview Peta</label>
              <div className="rounded-xl overflow-hidden border border-border h-64 sm:h-80">
                <iframe
                  src={mapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Maps preview"
                />
              </div>
            </div>
          )}
          {mapsEmbedUrl && !isValidMapsEmbed(mapsEmbedUrl) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
              <IconAlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">URL embed tidak valid</p>
                <p className="text-xs text-red-600 mt-1">Pastikan URL dari Google Maps → Share → Embed a map. Format yang valid: https://www.google.com/maps/embed?pb=...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
