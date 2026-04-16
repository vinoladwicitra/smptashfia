import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { IconHome, IconFileText, IconUser, IconSpeakerphone, IconGlobe, IconUsers, IconUserCheck, IconTable } from '@tabler/icons-react';
import { useAuth } from '../lib/auth';
import CollapsibleSidebar, { type SidebarMenuItem } from './CollapsibleSidebar';

const staffMenuItems: SidebarMenuItem[] = [
  { icon: IconHome, label: 'Dashboard', href: '/staff' },
  { icon: IconFileText, label: 'Artikel', href: '/staff/blog' },
  { icon: IconUsers, label: 'Pengguna', href: '/staff/users' },
  { icon: IconUserCheck, label: 'PMB', href: '/staff/pmb' },
  { icon: IconTable, label: 'Google Sheets', href: '/staff/google-sheets' },
  { icon: IconSpeakerphone, label: 'Banner', href: '/staff/banners' },
  { icon: IconGlobe, label: 'Situs', href: '/staff/site-settings' },
  { icon: IconUser, label: 'Profil', href: '/staff/profile' },
];

export default function StaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved !== null ? saved === 'true' : true;
  });

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

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
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      {/* Mobile padding top for fixed header */}
      <div className="lg:hidden h-14" />
      {/* Main content area with sidebar offset */}
      <main className={`transition-all duration-300 p-4 lg:p-8 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        <Outlet />
      </main>
    </div>
  );
}
