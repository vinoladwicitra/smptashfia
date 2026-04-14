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
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export default function CollapsibleSidebar({
  items,
  activePath,
  onNavigate,
  onLogout,
  avatarUrl,
  collapsed,
  setCollapsed,
}: CollapsibleSidebarProps) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const effectiveCollapsed = collapsed && !mobileOpen;

  // Close mobile sidebar on route change and on small screens
  useEffect(() => {
    if (window.innerWidth < 1024) setMobileOpen(false);
  }, [activePath]);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Staff';
  const displayAvatar = avatarUrl || user?.user_metadata?.avatar_url;
  const [tooltipPos, setTooltipPos] = useState<{ label: string; top: number } | null>(null);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-border px-4 py-3 flex items-center justify-between z-40">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu navigasi"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <IconMenu2 size={22} className="text-text" />
        </button>
        <h1 className="text-sm font-semibold text-text">Staff Portal</h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          tabIndex={0}
          role="button"
          aria-label="Tutup menu"
          className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-fadeIn cursor-pointer"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMobileOpen(false); } }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-border z-50 transition-all duration-300 flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${effectiveCollapsed ? 'lg:w-[72px]' : 'lg:w-64'}
        `}
      >
        {/* Logo / Brand */}
        <div className={`flex items-center border-b border-border ${effectiveCollapsed ? 'lg:justify-center px-3' : 'px-5'} h-16 flex-shrink-0`}>
          <div className={`w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!effectiveCollapsed && (
            <span className="ml-3 text-sm font-bold text-text whitespace-nowrap overflow-hidden">SMP Tashfia</span>
          )}
        </div>

        {/* Avatar + User Info */}
        <div className={`border-b border-border ${effectiveCollapsed ? 'lg:justify-center lg:px-3' : 'px-5'} py-4 flex-shrink-0`}>
          <div className={`flex items-center gap-3 ${effectiveCollapsed ? 'lg:justify-center lg:flex-col lg:gap-2' : ''}`}>
            {displayAvatar ? (
              <img src={displayAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-primary/20" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-sm">{displayName[0]?.toUpperCase()}</span>
              </div>
            )}
            {!effectiveCollapsed && (
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

            return (
              <div key={item.href} className="relative">
                <button
                  onClick={() => onNavigate(item.href)}
                  aria-label={item.label}
                  onMouseEnter={(e) => {
                    if (effectiveCollapsed) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPos({ label: item.label, top: rect.top + rect.height / 2 });
                    }
                  }}
                  onMouseLeave={() => {
                    setTooltipPos(null);
                  }}
                  onFocus={(e) => {
                    if (effectiveCollapsed) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPos({ label: item.label, top: rect.top + rect.height / 2 });
                    }
                  }}
                  onBlur={() => {
                    setTooltipPos(null);
                  }}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer
                    ${isActive
                      ? 'bg-primary text-white'
                      : 'text-text hover:bg-gray-100'
                    }
                    ${effectiveCollapsed ? 'lg:justify-center lg:px-2' : ''}
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!effectiveCollapsed && <span className="truncate">{item.label}</span>}
                  {item.badge && !effectiveCollapsed && (
                    <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Collapse Toggle + Logout */}
        <div className="border-t border-border p-2 flex-shrink-0">
          <button
            onClick={() => { setCollapsed(!collapsed); setTooltipPos(null); }}
            aria-label={effectiveCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className="hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {effectiveCollapsed ? <IconChevronsRight size={20} /> : <IconChevronsLeft size={20} />}
            {!effectiveCollapsed && <span>Collapse</span>}
          </button>

          <button
            onClick={onLogout}
            aria-label="Logout"
            onMouseEnter={() => effectiveCollapsed && setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            onFocus={() => effectiveCollapsed && setHoveredItem('logout')}
            onBlur={() => setHoveredItem(null)}
            className={`relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer
              ${effectiveCollapsed ? 'lg:justify-center lg:px-2' : ''}
            `}
          >
            <IconLogout size={20} className="flex-shrink-0" />
            {!effectiveCollapsed && <span>Logout</span>}
            {effectiveCollapsed && hoveredItem === 'logout' && (
              <div className="hidden lg:block absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap z-[60] pointer-events-none">
                Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Fixed Tooltip - outside sidebar overflow */}
      {effectiveCollapsed && tooltipPos && (
        <div
          className="fixed left-[76px] bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap z-[9999] pointer-events-none shadow-lg"
          style={{ top: tooltipPos.top - 12 }}
        >
          {tooltipPos.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>
      )}
    </>
  );
}
