import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API_BASE = '/api';

interface SiteSettings {
  contact_phone: string;
  contact_phone_intl: string;
  contact_hours: string;
  contact_address_short: string;
  contact_address_full: string;
  maps_embed_url: string;
  maps_link: string;
  social_instagram: string;
  social_instagram_label: string;
  social_facebook: string;
  social_facebook_label: string;
  social_youtube: string;
  social_youtube_label: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: null,
  loading: true,
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    
    const handleSettingsUpdate = () => fetchSettings();
    window.addEventListener('settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('settings-updated', handleSettingsUpdate);
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/site-settings`);
      const data = await res.json();
      if (data.success && data.data.contact) {
        setSettings({
          ...data.data.contact,
          ...data.data.location,
          ...data.data.social,
        } as SiteSettings);
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
