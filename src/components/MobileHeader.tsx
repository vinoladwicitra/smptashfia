import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconUser, IconUserCheck, IconUsersGroup, IconUsers, IconSun, IconMoon } from '@tabler/icons-react';
import { useDarkMode } from '../context/DarkModeContext';

const userMenuItems = [
  { label: 'Guru', to: '/login/teacher', icon: IconUserCheck },
  { label: 'Siswa', to: '/login/student', icon: IconUsersGroup },
  { label: 'Orang Tua', to: '/login/parent', icon: IconUsers },
  { label: 'Staf', to: '/login/staff', icon: IconUsers },
];

export default function MobileHeader() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="lg:hidden bg-surface border-b border-border py-3 dark:bg-surface dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
        {/* Logo + Text */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="SMP Tashfia" className="h-10 w-auto" />
          <span className="text-lg font-bold text-primary">SMP Tashfia</span>
        </Link>

        {/* Dark Mode Toggle + User Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full border border-border shadow-sm hover:shadow-md transition-shadow text-text-light hover:text-primary cursor-pointer dark:border-gray-600 dark:text-gray-400 dark:hover:text-primary"
            aria-label="Toggle dark mode"
          >
            {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 rounded-full bg-surface border border-border shadow-sm hover:shadow-md transition-shadow text-text cursor-pointer dark:bg-surface dark:border-gray-600"
              aria-label="User menu"
            >
              <IconUser size={24} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border overflow-hidden z-20 dark:bg-surface-dark dark:border-gray-700">
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-gray-100 hover:text-primary transition-colors cursor-pointer dark:hover:bg-gray-700"
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
    </div>
  );
}
