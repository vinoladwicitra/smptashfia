import { IconBrandInstagram, IconBrandFacebook, IconBrandYoutube, IconMapPin, IconPhone, IconChevronRight } from '@tabler/icons-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white lg:pb-0">
      {/* Desktop Footer */}
      <div className="hidden lg:block">
        <div className="max-w-5xl mx-auto px-8 pt-16 pb-8">
          <div className="grid grid-cols-3 gap-12 mb-10">
            {/* Column 1: Logo & Social */}
            <div>
              <a href="/" className="inline-flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="SMP Tashfia" className="h-16 w-auto" />
                <div>
                  <span className="block text-lg font-bold leading-tight">SMP Tashfia</span>
                  <span className="block text-xs text-gray-300 leading-tight">Sekolah Islam Terpadu</span>
                </div>
              </a>
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
                <li><a href="/" className="hover:text-gray-200 transition-colors cursor-pointer">Home</a></li>
                <li><a href="/tentang-kami" className="hover:text-gray-200 transition-colors cursor-pointer">Tentang Kami</a></li>
                <li><a href="/program" className="hover:text-gray-200 transition-colors cursor-pointer">Program</a></li>
                <li><a href="/ppdb" className="hover:text-gray-200 transition-colors cursor-pointer">PPDB</a></li>
                <li><a href="/hubungi-kami" className="hover:text-gray-200 transition-colors cursor-pointer">Hubungi Kami</a></li>
              </ul>
            </div>
            {/* Column 3: Location */}
            <div>
              <h5 className="text-lg font-semibold mb-4">Lokasi</h5>
              <div className="flex items-start gap-2 mb-4 text-sm text-gray-300">
                <IconMapPin size={20} className="flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">Jl. Dr. Ratna No.82, RT.02/RW.08, Kel. Jatikramat, Kec. Jatiasih, Kota Bekasi, Jawa Barat 17421</p>
              </div>
              <a href="https://maps.app.goo.gl/ju7qW5xSXENTzcU89" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold hover:text-gray-200 transition-colors underline cursor-pointer">Lihat di Google Maps →</a>
            </div>
          </div>
          {/* Copyright - Centered */}
          <div className="border-t border-white/20 pt-6 text-center">
            <p className="text-sm text-gray-300">© 2023 - 2026 <strong>SMP Tashfia</strong> - All Rights Reserved</p>
          </div>
        </div>
      </div>

      {/* Mobile Footer - Compact Native App Style */}
      <div className="lg:hidden pb-24">
        <div className="px-5 pt-8 space-y-3">
          <a href="tel:+622184978071" className="flex items-center gap-3 bg-white/10 rounded-xl p-4 active:bg-white/20 transition-colors cursor-pointer">
            <IconPhone size={20} className="flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Hubungi Kami</p>
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
            {[{ label: 'Home', href: '/' }, { label: 'Tentang Kami', href: '/tentang-kami' }, { label: 'Program', href: '/program' }, { label: 'PPDB', href: '/ppdb' }, { label: 'Hubungi Kami', href: '/hubungi-kami' }].map((link) => (
              <a key={link.label} href={link.href} className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-200 active:bg-white/15 transition-colors cursor-pointer">
                <IconChevronRight size={14} />
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="text-center mt-8 px-5">
          <p className="text-xs text-gray-400">© 2023 - 2026 SMP Tashfia. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
