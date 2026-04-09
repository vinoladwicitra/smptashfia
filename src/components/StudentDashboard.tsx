import { useAuth } from '../lib/auth';
import { IconLogout, IconUser, IconBook, IconCalendar, IconClock, IconTrophy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <IconUser size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">{user?.email}</h2>
            <p className="text-xs text-text-light">Student Portal</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          <IconLogout size={16} />
          Logout
        </button>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-text mb-6">Dashboard Siswa</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <IconBook size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text">--</p>
            <p className="text-sm text-text-light">Mata Pelajaran</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <IconTrophy size={20} className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text">--</p>
            <p className="text-sm text-text-light">Hafalan (Juz)</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <IconCalendar size={20} className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text">--</p>
            <p className="text-sm text-text-light">Jadwal Hari Ini</p>
          </div>
        </div>

        {/* Placeholder */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-border text-center">
          <IconClock size={48} className="mx-auto text-text-light/30 mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">Halaman dalam pengembangan</h3>
          <p className="text-text-light text-sm">Fitur dashboard siswa akan segera tersedia.</p>
        </div>
      </main>
    </div>
  );
}
