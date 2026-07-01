import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { IconUsers, IconBook, IconCalendar, IconClock, IconTrendingUp, IconMessageCircle } from '@tabler/icons-react';

const stats = [
  { icon: IconBook, label: 'Total Artikel', value: '--', color: 'bg-blue-100 text-blue-600', trend: '+0 bulan ini' },
  { icon: IconClock, label: 'Draft', value: '--', color: 'bg-amber-100 text-amber-600', trend: 'Menunggu review' },
  { icon: IconTrendingUp, label: 'Published', value: '--', color: 'bg-green-100 text-green-600', trend: 'Aktif' },
  { icon: IconMessageCircle, label: 'Komentar', value: '--', color: 'bg-purple-100 text-purple-600', trend: 'Menunggu' },
];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Staff';

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-text">Selamat Datang, {displayName}!</h1>
        <p className="text-text-light mt-1">Kelola artikel dan informasi sekolah dari sini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs text-text-light bg-gray-50 px-2 py-1 rounded-full">{stat.trend}</span>
              </div>
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-sm text-text-light">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div onClick={() => navigate('/staff/blog/new')} className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <IconBook size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Tulis Artikel</p>
              <p className="text-xs text-text-light">Buat artikel baru</p>
            </div>
          </div>
          <div onClick={() => navigate('/staff/blog')} className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <IconCalendar size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Kelola Artikel</p>
              <p className="text-xs text-text-light">Lihat semua artikel</p>
            </div>
          </div>
          <div onClick={() => navigate('/staff/profile')} className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <IconUsers size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Edit Profil</p>
              <p className="text-xs text-text-light">Ubah data diri</p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center mt-8">
        <IconClock size={48} className="mx-auto text-text-light/30 mb-4" />
        <h3 className="text-lg font-semibold text-text mb-2">Aktivitas Terbaru</h3>
        <p className="text-text-light text-sm">Belum ada aktivitas. Mulai tulis artikel pertamamu!</p>
      </div>
    </div>
  );
}
