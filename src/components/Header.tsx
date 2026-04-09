import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { IconHome, IconHomeFilled, IconBriefcase, IconBriefcaseFilled, IconBulb, IconBulbFilled, IconBook, IconBookFilled, IconHeadset, IconHeadsetFilled, IconX, IconPhone, IconClock, IconMapPin, IconUser, IconUserCheck, IconUsersGroup, IconUsers, IconPencil, IconPencilFilled } from '@tabler/icons-react';

const menuItems = [
  { label: 'Home', href: '/', icon: IconHome, iconFilled: IconHomeFilled, match: '/', external: false },
  { label: 'Tentang Kami', href: '/tentang-kami', icon: IconBriefcase, iconFilled: IconBriefcaseFilled, match: '/tentang-kami', external: false },
  { label: 'Program', href: '/program', icon: IconBulb, iconFilled: IconBulbFilled, match: '/program', external: false },
  { label: 'Blog', href: '/blog/', icon: IconPencil, iconFilled: IconPencilFilled, match: '/blog', external: false },
  { label: 'Perpustakaan', href: 'https://mahad-attashfiyyah.perpus.id/', icon: IconBook, iconFilled: IconBookFilled, match: '', external: true },
  { label: 'Hubungi Kami', href: '/hubungi-kami', icon: IconHeadset, iconFilled: IconHeadsetFilled, match: '/hubungi-kami', external: false },
];

const loginItems = [
  { label: 'Guru', href: '/login/teacher', icon: IconUserCheck },
  { label: 'Siswa', href: '/login/student', icon: IconUsersGroup },
  { label: 'Orang Tua', href: '/login/parent', icon: IconUsers },
  { label: 'Staf', href: '/login/staff', icon: IconUsers },
];

export default function Header() {
  const [promoVisible, setPromoVisible] = useState(true);
  const [loginDropdown, setLoginDropdown] = useState(false);
  const location = useLocation();

  return (
    <header className="relative bg-white shadow-sm z-[1000]">
      {/* Promo Bar */}
      {promoVisible && (
        <div className="bg-primary text-white py-3 relative">
          <div className="max-w-5xl mx-auto px-8 flex items-center justify-center relative">
            <span className="font-semibold text-sm tracking-wide">TELAH DIBUKA PMB TA 2026/2027</span>
            <button
              className="absolute right-4 text-white hover:text-gray-200 cursor-pointer"
              onClick={() => setPromoVisible(false)}
              aria-label="Close promo"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Top Bar - Desktop: Logo + Info + Login */}
      <div className="bg-white border-b border-border py-4 hidden lg:block">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between">
          {/* Logo + Text */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="SMP Tashfia" className="h-14 w-auto" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary leading-tight">SMP Tashfia</span>
              <span className="text-[11px] text-text-light leading-tight">Sekolah Islam Terpadu</span>
            </div>
          </Link>

          {/* Info Items */}
          <div className="flex items-center gap-8">
            <a href="tel:+622184978071" className="flex items-center gap-3 text-text">
              <IconPhone className="text-primary flex-shrink-0" size={24} />
              <div>
                <strong className="block text-sm font-semibold">Hubungi Kami</strong>
                <span className="block text-xs text-text-light">(021) 84978071</span>
              </div>
            </a>
            <div className="flex items-center gap-3 text-text">
              <IconClock className="text-primary flex-shrink-0" size={24} />
              <div>
                <strong className="block text-sm font-semibold">Jam Kerja Sekolah</strong>
                <span className="block text-xs text-text-light">Sen - Jum : 07.30 - 15.10 WIB</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-text">
              <IconMapPin className="text-primary flex-shrink-0" size={24} />
              <div>
                <strong className="block text-sm font-semibold">Alamat Sekolah</strong>
                <span className="block text-xs text-text-light">Jl. Dr. Ratna No.82, Bekasi - 17421</span>
              </div>
            </div>
          </div>

          {/* Login Dropdown */}
          <div className="relative pl-8">
            <button
              onClick={() => setLoginDropdown(!loginDropdown)}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-primary text-primary text-sm font-semibold rounded-full hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              <IconUser size={18} />
              Masuk
            </button>
            {loginDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLoginDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-lg border border-border overflow-hidden z-20">
                  {loginItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-gray-100 hover:text-primary transition-colors cursor-pointer"
                        onClick={() => setLoginDropdown(false)}
                      >
                        <Icon size={16} className="text-text-light" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header - Navigation Full Width */}
      <div className="bg-white border-b border-border hidden lg:block">
        <div className="max-w-5xl mx-auto px-8">
          <nav className="flex items-center justify-center gap-2">
            {menuItems.map((item) => {
              const isActive = item.match && (location.pathname === item.match || location.pathname.startsWith(item.match + '/'));
              const Icon = isActive ? item.iconFilled : item.icon;
              const linkProps = item.external
                ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
                : { to: item.href };

              return (
                <Component
                  key={item.label}
                  component={item.external ? 'a' : Link}
                  {...linkProps}
                  className={`flex items-center gap-2 px-4 py-3 text-[15px] font-medium rounded transition-colors cursor-pointer ${
                    isActive
                      ? 'text-primary relative after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-primary bg-primary/5'
                      : 'text-text hover:text-primary hover:bg-gray-100'
                  }`}
                >
                  <Icon size={24} />
                  <span>{item.label}</span>
                </Component>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

function Component({ component: Component, ...props }: any) {
  return <Component {...props} />;
}
