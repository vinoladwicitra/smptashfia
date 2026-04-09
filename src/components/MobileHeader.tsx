import { useState } from 'react';
import { IconUser, IconUserCheck, IconUsersGroup, IconUsers } from '@tabler/icons-react';

const userMenuItems = [
  { label: 'Teacher', href: '/teacher', icon: IconUserCheck },
  { label: 'Student', href: '/student', icon: IconUsersGroup },
  { label: 'Staff', href: '/staff', icon: IconUsers },
];

export default function MobileHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="lg:hidden bg-white border-b border-border py-3">
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
        {/* Logo + Text */}
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="SMP Tashfia" className="h-10 w-auto" />
          <span className="text-lg font-bold text-primary">SMP Tashfia</span>
        </a>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded-full bg-white border border-border shadow-sm hover:shadow-md transition-shadow text-text cursor-pointer"
            aria-label="User menu"
          >
            <IconUser size={24} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-border overflow-hidden z-20">
                {userMenuItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-gray-100 hover:text-primary transition-colors cursor-pointer"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <item.icon size={18} className="text-text-light" />
                    {item.label}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
