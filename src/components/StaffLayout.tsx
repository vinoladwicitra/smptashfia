import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { IconHome, IconFileText, IconSettings, IconUser } from '@tabler/icons-react';
import { useAuth } from '../lib/auth';
import CollapsibleSidebar, { type SidebarMenuItem } from './CollapsibleSidebar';

const staffMenuItems: SidebarMenuItem[] = [
  { icon: IconHome, label: 'Dashboard', href: '/staff' },
  { icon: IconFileText, label: 'Artikel', href: '/staff/blog' },
  { icon: IconUser, label: 'Profil', href: '/staff/profile' },
  { icon: IconSettings, label: 'Pengaturan', href: '/staff/settings' },
];

export default function StaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CollapsibleSidebar
        items={staffMenuItems}
        activePath={location.pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      {/* Mobile padding top for fixed header */}
      <div className="lg:hidden h-14" />
      <main className="p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
