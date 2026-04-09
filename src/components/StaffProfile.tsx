import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useToast } from '../context/ToastContext';
import { uploadAvatar, deleteAvatar } from '../lib/storage';
import { IconUser, IconSettings, IconBell, IconHelp, IconLogout, IconMail, IconLock, IconCamera, IconDeviceFloppy, IconEye, IconEyeOff, IconArrowLeft, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { icon: IconUser, label: 'Profil', href: '/staff/profile', color: 'bg-blue-100 text-blue-600' },
  { icon: IconBell, label: 'Notifikasi', href: '/staff/notifications', color: 'bg-amber-100 text-amber-600', badge: 3 },
  { icon: IconSettings, label: 'Pengaturan', href: '/staff/settings', color: 'bg-gray-100 text-gray-600' },
  { icon: IconHelp, label: 'Bantuan', href: '/staff/help', color: 'bg-green-100 text-green-600' },
];

export default function StaffProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load avatar URL from profiles table on mount
  useEffect(() => {
    if (user) {
      const loadProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setDisplayName(data.display_name || '');
          setAvatarUrl(data.avatar_url || null);
        }
      };
      loadProfile();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    if (!user) return;
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: displayName || undefined })
        .eq('id', user.id);

      if (updateError) {
        toast({ type: 'error', title: 'Gagal Memperbarui Profil', description: updateError.message });
        return;
      }

      toast({ type: 'success', title: 'Profil Diperbarui', description: 'Informasi Anda berhasil disimpan.' });
    } catch {
      toast({ type: 'error', title: 'Terjadi Kesalahan', description: 'Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ type: 'error', title: 'File Tidak Valid', description: 'Hanya file gambar yang diperbolehkan.' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ type: 'error', title: 'File Terlalu Besar', description: 'Ukuran file maksimal 2MB.' });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadAvatar(user.id, file);
      // Save to user metadata AND profiles table
      await supabase.auth.updateUser({ data: { avatar_url: url } });
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      setAvatarUrl(url);
      toast({ type: 'success', title: 'Avatar Diperbarui', description: 'Foto profil Anda berhasil diunggah.' });
    } catch (error: any) {
      toast({ type: 'error', title: 'Gagal Mengunggah Avatar', description: error?.message || 'Terjadi kesalahan saat mengunggah.' });
    } finally {
      setIsUploading(false);
    }
  }, [user, toast]);

  const handleDeleteAvatar = useCallback(async () => {
    if (!user) return;
    setIsUploading(true);
    try {
      await deleteAvatar(user.id);
      await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
      setAvatarUrl(null);
      toast({ type: 'success', title: 'Avatar Dihapus', description: 'Foto profil Anda berhasil dihapus.' });
    } catch (error: any) {
      toast({ type: 'error', title: 'Gagal Menghapus Avatar', description: error?.message || 'Terjadi kesalahan saat menghapus.' });
    } finally {
      setIsUploading(false);
    }
  }, [user, toast]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword.length < 6) {
      toast({ type: 'error', title: 'Password Terlalu Pendek', description: 'Password baru minimal 6 karakter.' });
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast({ type: 'error', title: 'Gagal Mengubah Password', description: updateError.message });
        return;
      }

      toast({ type: 'success', title: 'Password Diubah', description: 'Password baru Anda berhasil disimpan.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      toast({ type: 'error', title: 'Terjadi Kesalahan', description: 'Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="lg:hidden bg-primary text-white sticky top-0 z-50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate('/staff')} className="p-1">
            <IconArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold">Edit Profil</h1>
        </div>
      </header>

      {/* Desktop Sidebar + Content Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-border flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-primary" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconUser size={20} className="text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-text">Staff Portal</h3>
                <p className="text-xs text-text-light truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{item.badge}</span>
                  )}
                </a>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <IconLogout size={16} />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-text">Edit Profil</h1>
                <p className="text-text-light mt-1">Kelola informasi pribadi dan keamanan akun Anda</p>
              </div>
            </div>

            {/* Profile Form */}
            <ProfileForm
              user={user}
              displayName={displayName}
              setDisplayName={setDisplayName}
              isLoading={isLoading}
              onSubmit={handleUpdateProfile}
            />

            {/* Change Password */}
            <ChangePasswordForm
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              showCurrentPassword={showCurrentPassword}
              showNewPassword={showNewPassword}
              setShowCurrentPassword={setShowCurrentPassword}
              setShowNewPassword={setShowNewPassword}
              isLoading={isLoading}
              onSubmit={handleChangePassword}
            />
          </div>
        </main>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden">
        {/* Avatar Section */}
        <div className="bg-white px-6 py-8 text-center border-b border-border">
          <div className="relative inline-block">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-primary" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <IconUser size={40} className="text-primary" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={isUploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-md hover:bg-primary-dark transition-colors disabled:opacity-60"
              disabled={isUploading}
            >
              {isUploading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <IconCamera size={16} />
              )}
            </button>
            {avatarUrl && (
              <button
                onClick={handleDeleteAvatar}
                className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-red-600 transition-colors disabled:opacity-60"
                disabled={isUploading}
              >
                <IconTrash size={14} />
              </button>
            )}
          </div>
          <h2 className="text-lg font-bold text-text mt-4">{displayName || user?.email?.split('@')[0] || 'Staff'}</h2>
          <p className="text-sm text-text-light">{user?.email}</p>
        </div>

        {/* Profile Form */}
        <div className="px-5 py-6">
          <ProfileForm
            user={user}
            displayName={displayName}
            setDisplayName={setDisplayName}
            isLoading={isLoading}
            onSubmit={handleUpdateProfile}
          />

          {/* Change Password */}
          <ChangePasswordForm
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            showCurrentPassword={showCurrentPassword}
            showNewPassword={showNewPassword}
            setShowCurrentPassword={setShowCurrentPassword}
            setShowNewPassword={setShowNewPassword}
            isLoading={isLoading}
            onSubmit={handleChangePassword}
          />

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors mt-4"
          >
            <IconLogout size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Profile Form Component
function ProfileForm({
  user,
  displayName,
  setDisplayName,
  isLoading,
  onSubmit,
}: {
  user: any;
  displayName: string;
  setDisplayName: (v: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-sm border border-border p-6 mb-6">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <IconUser size={20} className="text-primary" />
        Informasi Profil
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Nama Lengkap</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Masukkan nama lengkap"
            className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-text"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Email</label>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg text-text-light">
            <IconMail size={18} />
            <span>{user?.email || 'email@example.com'}</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Menyimpan...
            </>
          ) : (
            <>
              <IconDeviceFloppy size={18} />
              Simpan Profil
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Change Password Form Component
function ChangePasswordForm({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  showCurrentPassword,
  showNewPassword,
  setShowCurrentPassword,
  setShowNewPassword,
  isLoading,
  onSubmit,
}: {
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  setShowCurrentPassword: (v: boolean) => void;
  setShowNewPassword: (v: boolean) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <IconSettings size={20} className="text-primary" />
        Ubah Password
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Password Saat Ini</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light">
              <IconLock size={16} />
            </div>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password saat ini"
              className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-text"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text transition-colors"
              disabled={isLoading}
            >
              {showCurrentPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Password Baru</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light">
              <IconLock size={16} />
            </div>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-text"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text transition-colors"
              disabled={isLoading}
            >
              {showNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Mengubah...
            </>
          ) : (
            'Ubah Password'
          )}
        </button>
      </div>
    </form>
  );
}
