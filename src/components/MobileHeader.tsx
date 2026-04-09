import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconUser, IconUserCheck, IconUsersGroup, IconUsers } from '@tabler/icons-react';

const userMenuItems = [
  { label: 'Guru', to: '/login/teacher', icon: IconUserCheck },
  { label: 'Siswa', to: '/login/student', icon: IconUsersGroup },
  { label: 'Orang Tua', to: '/login/parent', icon: IconUsers },
  { label: 'Staf', to: '/login/staff', icon: IconUsers },
];

export default function MobileHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="lg:hidden bg-white border-b border-border py-3">
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
        {/* Logo + Text */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="SMP Tashfia" className="h-10 w-auto" />
          <span className="text-lg font-bold text-primary">SMP Tashfia</span>
        </Link>

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
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-gray-100 hover:text-primary transition-colors cursor-pointer"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <item.icon size={18} className="text-text-light" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
