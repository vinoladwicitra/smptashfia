import { Link } from 'react-router-dom';
import { IconBrandInstagram, IconBrandFacebook, IconBrandYoutube, IconMapPin, IconPhone, IconChevronRight } from '@tabler/icons-react';

function InternalLink({ to, children, className, ...props }: any) {
  return (
    <Link
      to={to}
      className={className}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      {...props}
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="bg-primary text-white lg:pb-0">
      {/* Desktop Footer */}
      <div className="hidden lg:block">
        <div className="max-w-5xl mx-auto px-8 pt-16 pb-8">
          <div className="grid grid-cols-3 gap-12 mb-10">
            {/* Column 1: Logo & Social */}
            <div>
              <InternalLink to="/" className="inline-flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="SMP Tashfia" className="h-16 w-auto" />
                <div>
                  <span className="block text-lg font-bold leading-tight">SMP Tashfia</span>
                  <span className="block text-xs text-gray-300 leading-tight">Sekolah Islam Terpadu</span>
                </div>
              </InternalLink>
              <ul className="space-y-3 mb-6">
                <li><a href="https://www.instagram.com/smptashfia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-gray-200 transition-colors cursor-pointer"><IconBrandInstagram size={20} /><span>@smptashfia</span></a></li>
                <li><a href="https://web.facebook.com/smp.tashfia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-gray-200 transition-colors cursor-pointer"><IconBrandFacebook size={20} /><span>SMP Tashfia</span></a></li>
                <li><a href="https://www.youtube.com/channel/UCjZZ5GwNF4bi0d7iPCZIMGA" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-gray-200 transition-colors cursor-pointer"><IconBrandYoutube size={20} /><span>Ma'had Putri Tashfia</span></a></li>
              </ul>
            </div>
            {/* Column 2: Quick Links */}
            <div>
              <h5 className="text-lg font-semibold mb-4">Tautan Cepat</h5>
              <ul className="space-y-2">
                <li><InternalLink to="/" className="hover:text-gray-200 transition-colors cursor-pointer">Home</InternalLink></li>
                <li><InternalLink to="/tentang-kami" className="hover:text-gray-200 transition-colors cursor-pointer">Tentang</InternalLink></li>
                <li><InternalLink to="/program" className="hover:text-gray-200 transition-colors cursor-pointer">Program</InternalLink></li>
                <li><InternalLink to="/blog/" className="hover:text-gray-200 transition-colors cursor-pointer">Artikel</InternalLink></li>
                <li><InternalLink to="/pmb" className="hover:text-gray-200 transition-colors cursor-pointer">PMB</InternalLink></li>
                <li><InternalLink to="/hubungi-kami" className="hover:text-gray-200 transition-colors cursor-pointer">Kontak</InternalLink></li>
              </ul>
            </div>
            {/* Column 3: Location with Embedded Map */}
            <div>
              <h5 className="text-lg font-semibold mb-4">Lokasi</h5>
              <div className="flex items-start gap-2 mb-4 text-sm text-gray-300">
                <IconMapPin size={20} className="flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">Jl. Dr. Ratna No.82, RT.02/RW.08, Kel. Jatikramat, Kec. Jatiasih, Kota Bekasi, Jawa Barat 17421</p>
              </div>
              <div className="rounded-xl overflow-hidden shadow-md h-48">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15863.614022201797!2d106.9516837!3d-6.2764164!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698d730bca8f7f%3A0xa7c63c7cbe29afe3!2sSMP%20Tashfia!5e0!3m2!1sid!2sid!4v1775721806664!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi SMP Tashfia"
                ></iframe>
              </div>
            </div>
          </div>
          {/* Copyright - Centered, White text */}
          <div className="border-t border-white/20 pt-6 text-center">
            <p className="text-sm text-white">© 2023 - 2026 <strong>SMP Tashfia</strong> - All Rights Reserved</p>
          </div>
        </div>
      </div>

      {/* Mobile Footer - Compact Native App Style */}
      <div className="lg:hidden pb-24">
        <div className="px-5 pt-8 space-y-3">
          <a href="tel:+622184978071" className="flex items-center gap-3 bg-white/10 rounded-xl p-4 active:bg-white/20 transition-colors cursor-pointer">
            <IconPhone size={20} className="flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Kontak</p>
              <p className="text-xs text-gray-300">(021) 84978071</p>
            </div>
            <IconChevronRight size={16} className="ml-auto text-gray-300" />
          </a>
          <a href="https://maps.app.goo.gl/ju7qW5xSXENTzcU89" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/10 rounded-xl p-4 active:bg-white/20 transition-colors cursor-pointer">
            <IconMapPin size={20} className="flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-0.5">Lokasi</p>
              <p className="text-xs text-gray-300 leading-relaxed">Jl. Dr. Ratna No.82, RT.02/RW.08, Kel. Jatikramat, Kec. Jatiasih, Kota Bekasi 17421</p>
            </div>
            <IconChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </a>
        </div>
        <div className="px-5 mt-6">
          <h5 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Ikuti Kami</h5>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/smptashfia" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-white/10 rounded-xl py-3 text-sm active:bg-white/20 transition-colors cursor-pointer">
              <IconBrandInstagram size={18} /> Instagram
            </a>
            <a href="https://web.facebook.com/smp.tashfia" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-white/10 rounded-xl py-3 text-sm active:bg-white/20 transition-colors cursor-pointer">
              <IconBrandFacebook size={18} /> Facebook
            </a>
            <a href="https://www.youtube.com/channel/UCjZZ5GwNF4bi0d7iPCZIMGA" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-white/10 rounded-xl py-3 text-sm active:bg-white/20 transition-colors cursor-pointer">
              <IconBrandYoutube size={18} /> YouTube
            </a>
          </div>
        </div>
        <div className="px-5 mt-6">
          <h5 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Tautan</h5>
          <div className="grid grid-cols-2 gap-2">
            {[{ label: 'Home', to: '/' }, { label: 'Tentang', to: '/tentang-kami' }, { label: 'Program', to: '/program' }, { label: 'Artikel', to: '/blog/' }, { label: 'PMB', to: '/pmb' }, { label: 'Kontak', to: '/hubungi-kami' }].map((link) => (
              <InternalLink key={link.label} to={link.to} className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-200 active:bg-white/15 transition-colors cursor-pointer">
                <IconChevronRight size={14} />
                {link.label}
              </InternalLink>
            ))}
          </div>
        </div>
        <div className="text-center mt-8 px-5">
          <p className="text-xs text-white">© 2023 - 2026 SMP Tashfia. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
