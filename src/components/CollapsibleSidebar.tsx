import { useState, useEffect } from 'react';
import { IconChevronsLeft, IconChevronsRight, IconLogout, IconMenu2 } from '@tabler/icons-react';
import { useAuth } from '../lib/auth';

export interface SidebarMenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

interface CollapsibleSidebarProps {
  items: SidebarMenuItem[];
  activePath: string;
  onNavigate: (href: string) => void;
  onLogout: () => void;
  avatarUrl?: string | null;
}

export default function CollapsibleSidebar({
  items,
  activePath,
  onNavigate,
  onLogout,
  avatarUrl,
}: CollapsibleSidebarProps) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [activePath]);

  // Check screen size on mount and resize
  useEffect(() => {
    const check = () => setCollapsed(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Staff';
  const displayAvatar = avatarUrl || user?.user_metadata?.avatar_url;

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-border px-4 py-3 flex items-center justify-between z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <IconMenu2 size={22} className="text-text" />
        </button>
        <h1 className="text-sm font-semibold text-text">Staff Portal</h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-border z-50 transition-all duration-300 flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-[72px]' : 'lg:w-64'}
        `}
      >
        {/* Logo / Brand */}
        <div className={`flex items-center border-b border-border ${collapsed ? 'lg:justify-center px-3' : 'px-5'} h-16 flex-shrink-0`}>
          <div className={`w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!collapsed && (
            <span className="ml-3 text-sm font-bold text-text whitespace-nowrap overflow-hidden">SMP Tashfia</span>
          )}
        </div>

        {/* Avatar + User Info */}
        <div className={`border-b border-border ${collapsed ? 'lg:justify-center lg:px-3' : 'px-5'} py-4 flex-shrink-0`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'lg:justify-center lg:flex-col lg:gap-2' : ''}`}>
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-primary/20" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-sm">{displayName[0]?.toUpperCase()}</span>
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0 overflow-hidden">
                <p className="text-sm font-semibold text-text truncate">{displayName}</p>
                <p className="text-xs text-text-light truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.href;
            const isHovered = hoveredItem === item.href;

            return (
              <div key={item.href} className="relative">
                <button
                  onClick={() => onNavigate(item.href)}
                  onMouseEnter={() => collapsed && setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-primary text-white'
                      : 'text-text hover:bg-gray-100'
                    }
                    ${collapsed ? 'lg:justify-center lg:px-2' : ''}
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {item.badge && !collapsed && (
                    <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Tooltip for collapsed state */}
                {collapsed && isHovered && (
                  <div className="hidden lg:block absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap z-[60] pointer-events-none">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse Toggle + Logout */}
        <div className="border-t border-border p-2 flex-shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text hover:bg-gray-100 transition-colors"
          >
            {collapsed ? <IconChevronsRight size={20} /> : <IconChevronsLeft size={20} />}
            {!collapsed && <span>Collapse</span>}
          </button>

          <button
            onClick={onLogout}
            onMouseEnter={() => collapsed && setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            className={`relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors
              ${collapsed ? 'lg:justify-center lg:px-2' : ''}
            `}
          >
            <IconLogout size={20} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
            {collapsed && hoveredItem === 'logout' && (
              <div className="hidden lg:block absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap z-[60] pointer-events-none">
                Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main content offset */}
      <div
        className={`transition-all duration-300 min-h-screen
          ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}
        `}
      />
    </>
  );
}
