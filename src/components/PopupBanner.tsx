import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconX } from '@tabler/icons-react';

export default function PopupBanner() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[4000] flex items-center justify-center p-5 animate-fadeIn"
      onClick={() => setVisible(false)}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 z-10 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors cursor-pointer"
          aria-label="Close popup"
        >
          <IconX size={18} />
        </button>

        {/* Banner Image */}
        <Link to="/pmb" onClick={() => { setVisible(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block">
          <img
            src="/assets/ppdb-banner.webp"
            alt="PMB SMP Tashfia"
            className="w-full"
          />
        </Link>

        {/* CTA Button */}
        <div className="p-4 bg-primary/5">
          <button
            onClick={() => { setVisible(false); window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/pmb'); }}
            className="block w-full py-3 text-center text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
          >
            Daftar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
