import { useNavigate, Link } from 'react-router-dom';
import { IconHome, IconHeadset, IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="max-w-md mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <IconAlertCircle size={40} className="text-primary" />
        </div>

        {/* 404 Number */}
        <h1 className="text-[80px] leading-none font-bold text-primary mb-3">
          404
        </h1>

        {/* Divider */}
        <div className="w-16 h-1 bg-primary mx-auto mb-6 rounded-full"></div>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-text mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-text-light leading-relaxed mb-8 text-sm">
          Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
          Silakan kembali ke halaman utama atau hubungi kami untuk bantuan.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all text-sm cursor-pointer"
          >
            <IconHome size={18} />
            Kembali ke Beranda
          </Link>
          <Link
            to="/hubungi-kami"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-text font-semibold border border-border rounded-xl hover:border-primary hover:text-primary transition-all text-sm cursor-pointer"
          >
            <IconHeadset size={18} />
            Hubungi Kami
          </Link>
        </div>

        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mt-6 text-text-light hover:text-primary transition-colors text-sm cursor-pointer"
        >
          <IconArrowLeft size={16} />
          Kembali ke halaman sebelumnya
        </button>
      </div>
    </div>
  );
}
