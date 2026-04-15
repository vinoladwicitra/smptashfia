import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useToast } from '../context/ToastContext';

import { IconUser, IconMail, IconLock, IconCamera, IconDeviceFloppy, IconEye, IconEyeOff, IconTrash, IconLogout, IconSettings } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function StaffProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

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
    e.preventDefault();
    if (!user) return;
    setIsProfileSaving(true);

    try {
      const trimmedName = displayName.trim().replace(/\s+/g, ' ');
      setDisplayName(trimmedName);

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: trimmedName || null }
      });

      if (authError) {
        toast({ type: 'error', title: 'Gagal Memperbarui Metadata', description: authError.message });
        return;
      }

      // Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: trimmedName || null })
        .eq('id', user.id);

      if (updateError) {
        toast({ type: 'error', title: 'Gagal Memperbarui Profil', description: updateError.message });
        return;
      }

      toast({ type: 'success', title: 'Profil Diperbarui', description: 'Informasi Anda berhasil disimpan.' });
    } catch {
      toast({ type: 'error', title: 'Terjadi Kesalahan', description: 'Silakan coba lagi.' });
    } finally {
      setIsProfileSaving(false);
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
      const token = await getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to upload' }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setAvatarUrl(data.data.url);
        toast({ type: 'success', title: 'Avatar Diperbarui', description: 'Foto profil Anda berhasil diunggah.' });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
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
      const token = await getAuthToken();
      const res = await fetch('/api/auth/avatar', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to delete' }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setAvatarUrl(null);
        toast({ type: 'success', title: 'Avatar Dihapus', description: 'Foto profil Anda berhasil dihapus.' });
      } else {
        throw new Error(data.error || 'Delete failed');
      }
    } catch (error: any) {
      toast({ type: 'error', title: 'Gagal Menghapus Avatar', description: error?.message || 'Terjadi kesalahan saat menghapus.' });
    } finally {
      setIsUploading(false);
    }
  }, [user, toast]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordSaving(true);

    if (newPassword.length < 6) {
      toast({ type: 'error', title: 'Password Terlalu Pendek', description: 'Password baru minimal 6 karakter.' });
      setIsPasswordSaving(false);
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
      setNewPassword('');
    } catch {
      toast({ type: 'error', title: 'Terjadi Kesalahan', description: 'Silakan coba lagi.' });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Edit Profil</h1>
        <p className="text-text-light mt-1">Kelola informasi pribadi dan keamanan akun Anda</p>
      </div>

      {/* Avatar Section */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-primary" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
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
              aria-label="Upload avatar"
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-md hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer"
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
                aria-label="Delete avatar"
                className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-red-600 transition-colors disabled:opacity-60 cursor-pointer"
                disabled={isUploading}
              >
                <IconTrash size={14} />
              </button>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-text">{displayName || user?.email?.split('@')[0] || 'Staff'}</h2>
            <p className="text-sm text-text-light">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleUpdateProfile} className="bg-white rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <IconUser size={20} className="text-primary" />
          Informasi Profil
        </h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-text mb-1.5">Nama Lengkap</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-text"
              disabled={isProfileSaving}
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
            disabled={isProfileSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isProfileSaving ? (
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

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <IconSettings size={20} className="text-primary" />
          Ubah Password
        </h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-text mb-1.5">Password Baru</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light">
                <IconLock size={16} />
              </div>
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-text"
                required
                minLength={6}
                disabled={isPasswordSaving}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text transition-colors cursor-pointer"
                disabled={isPasswordSaving}
              >
                {showNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPasswordSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isPasswordSaving ? (
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

      {/* Logout */}
      <button
        onClick={handleSignOut}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
      >
        <IconLogout size={20} />
        Logout
      </button>
    </div>
  );
}
