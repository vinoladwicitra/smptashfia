import { Link, useLocation } from 'react-router-dom';
import { IconHome, IconHomeFilled, IconBulb, IconBulbFilled, IconFileText, IconFileTextFilled, IconPencil, IconPencilFilled, IconPhone, IconPhoneFilled } from '@tabler/icons-react';

const items = [
  { label: 'Home', href: '/', icon: IconHome, iconFilled: IconHomeFilled },
  { label: 'Program', href: '/program', icon: IconBulb, iconFilled: IconBulbFilled },
  { label: 'PMB', href: '/pmb', icon: IconFileText, iconFilled: IconFileTextFilled },
  { label: 'Artikel', href: '/blog/', icon: IconPencil, iconFilled: IconPencilFilled },
  { label: 'Kontak', href: '/hubungi-kami', icon: IconPhone, iconFilled: IconPhoneFilled },
];

export default function StickyMobileBottomBar() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg lg:hidden z-[1000]">
      <nav className="flex items-center justify-around py-1.5">
        {items.map((item) => {
          const normalizePath = (path: string) => path === '/' ? '/' : path.replace(/\/+$/, '');
          const currentPath = normalizePath(location.pathname);
          // For blog, match both /blog/ and /blog/slug
          const isActive = item.href === '/blog/'
            ? currentPath.startsWith('/blog')
            : currentPath === normalizePath(item.href);
          const Icon = isActive ? item.iconFilled : item.icon;
          return (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-150 active:scale-90 cursor-pointer ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-text'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
