import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconX } from '@tabler/icons-react';

const API_BASE = '/api';

interface PopupBannerData {
  enabled: boolean;
  image_url: string | null;
  button_label: string | null;
  button_link: string | null;
}

export default function PopupBanner() {
  const [visible, setVisible] = useState(false);
  const [banner, setBanner] = useState<PopupBannerData | null>(null);
  const [closed, setClosed] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const fetchBanner = async () => {
    try {
      const res = await fetch(`${API_BASE}/banners/popup_banner`);
      const data = await res.json();
      if (data.success && data.data) {
        setBanner(data.data);
        // Show popup only if enabled and not manually closed
        if (data.data.enabled && !closed) {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setVisible(true), 1000);
        }
      }
    } catch (err) {
      console.error('Error fetching popup banner:', err);
    }
  };

  // Initial fetch and listen for banner updates
  useEffect(() => {
    fetchBanner();
    
    const handleBannerUpdate = () => {
      setClosed(false); // Reset closed state when banner is updated
      fetchBanner();
    };
    window.addEventListener('banner-updated', handleBannerUpdate);
    return () => window.removeEventListener('banner-updated', handleBannerUpdate);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setClosed(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  if (!visible || !banner?.enabled || closed) return null;

  const imageUrl = banner.image_url || '/assets/ppdb-banner.webp';
  const buttonLabel = banner.button_label || 'Daftar Sekarang';
  const buttonLink = banner.button_link || '/pmb';
  const isExternalLink = buttonLink.startsWith('http://') || buttonLink.startsWith('https://') || buttonLink.startsWith('//');

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[4000] flex items-center justify-center p-5 animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors cursor-pointer"
          aria-label="Close popup"
        >
          <IconX size={18} />
        </button>

        {/* Banner Image */}
        {isExternalLink ? (
          <a href={buttonLink} target="_blank" rel="noopener noreferrer" onClick={handleClose} className="block">
            <img
              src={imageUrl}
              alt="PMB SMP Tashfia"
              className="w-full"
            />
          </a>
        ) : (
          <Link to={buttonLink} onClick={handleClose} className="block">
            <img
              src={imageUrl}
              alt="PMB SMP Tashfia"
              className="w-full"
            />
          </Link>
        )}

        {/* CTA Button */}
        <div className="p-4 bg-primary/5">
          {isExternalLink ? (
            <a
              href={buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="block w-full py-3 text-center text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
            >
              {buttonLabel}
            </a>
          ) : (
            <button
              onClick={() => { handleClose(); window.scrollTo({ top: 0, behavior: 'smooth' }); navigate(buttonLink); }}
              className="block w-full py-3 text-center text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
