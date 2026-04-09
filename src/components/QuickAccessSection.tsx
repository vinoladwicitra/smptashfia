import { Link } from 'react-router-dom';
import { IconUserPlus, IconBulb, IconCalendar, IconNews, IconBook, IconHeadset, IconSchool, IconBriefcase } from '@tabler/icons-react';

const quickAccessItems = [
  { title: 'PMB', to: '/ppdb', icon: IconUserPlus, bg: '#dbeafe', color: '#2563eb', external: false },
  { title: 'Program', to: '/program/', icon: IconBulb, bg: '#fef3c7', color: '#d97706', external: false },
  { title: 'Artikel', to: '/blog/', icon: IconNews, bg: '#e0e7ff', color: '#4f46e5', external: false },
  { title: 'Acara', to: '/acara/', icon: IconCalendar, bg: '#fce7f3', color: '#db2777', external: false },
];

const quickAccessItems2 = [
  { title: 'Perpus', to: 'https://mahad-attashfiyyah.perpus.id/', icon: IconBook, bg: '#d1fae5', color: '#059669', external: true },
  { title: 'Kontak', to: '/hubungi-kami/', icon: IconHeadset, bg: '#ede9fe', color: '#7c3aed', external: false },
  { title: 'Tentang', to: '/tentang-kami/', icon: IconSchool, bg: '#ffedd5', color: '#ea580c', external: false },
  { title: 'Karir', to: '/karir/', icon: IconBriefcase, bg: '#f1f5f9', color: '#475569', external: false },
];

function IconBoxItem({ title, to, icon: Icon, bg, color, external }: { title: string; to: string; icon: React.ElementType; bg: string; color: string; external?: boolean }) {
  const content = (
    <div className="flex flex-col items-center gap-1.5 py-3 active:scale-95 transition-transform cursor-pointer">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: bg, color }}
      >
        <Icon size={22} />
      </div>
      <span className="text-[11px] font-semibold text-text">{title}</span>
    </div>
  );

  return external ? (
    <a href={to} target="_blank" rel="noopener noreferrer">{content}</a>
  ) : (
    <Link to={to}>{content}</Link>
  );
}

export default function QuickAccessSection() {
  return (
    <section className="lg:hidden bg-white border-b border-border pt-4">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-4">
          {quickAccessItems.map((item) => (
            <IconBoxItem key={item.title} {...item} />
          ))}
        </div>
        <div className="grid grid-cols-4">
          {quickAccessItems2.map((item) => (
            <IconBoxItem key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
