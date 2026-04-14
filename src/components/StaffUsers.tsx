import { useState, useEffect, useCallback } from 'react';
import {
  IconSearch, IconUserPlus, IconEdit, IconKey, IconTrash, IconBan, IconCheck,
  IconLoader2, IconChevronLeft, IconChevronRight, IconFilter, IconX,
  IconUser, IconUsers, IconBriefcase,
} from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const API_BASE = '/api';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: {
    display_name?: string;
    can_login?: boolean;
  };
  profile?: {
    display_name?: string;
    avatar_url?: string;
    phone?: string;
    bio?: string;
  };
  roles?: string[];
  can_login: boolean;
}

const roleColors: Record<string, string> = {
  teacher: 'bg-blue-100 text-blue-700',
  student: 'bg-green-100 text-green-700',
  staff: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
};

const roleIcons: Record<string, React.ElementType> = {
  teacher: IconUser,
  student: IconUsers,
  staff: IconBriefcase,
};

export default function StaffUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('created_at');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({ email: '', password: '', display_name: '', role: 'teacher' as string });
  const [editForm, setEditForm] = useState({ display_name: '', phone: '', bio: '', can_login: true });
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '20',
        sort: sortFilter,
        order: 'desc',
      });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);

      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Users API error:', err);
        toast({ type: 'error', title: 'Gagal', description: err.error || 'Gagal memuat data user' });
        setUsers([]);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setTotalPages(Math.ceil((data.pagination.total || 0) / data.pagination.per_page) || 1);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, sortFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const handleAddUser = async () => {
    if (!addForm.email || !addForm.password || !addForm.display_name) {
      toast({ type: 'error', title: 'Gagal', description: 'Semua field harus diisi' });
      return;
    }
    setSubmitting(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (data.success) {
        toast({ type: 'success', title: 'Berhasil', description: 'User berhasil ditambahkan' });
        setShowAddModal(false);
        setAddForm({ email: '', password: '', display_name: '', role: 'teacher' });
        fetchUsers();
      } else {
        toast({ type: 'error', title: 'Gagal', description: data.error || 'Gagal menambahkan user' });
      }
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Terjadi kesalahan' });
    } finally { setSubmitting(false); }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json();
        toast({ type: 'error', title: 'Gagal', description: err.error || 'Gagal memperbarui user' });
        return;
      }
      if (newRole && newRole !== (editingUser.roles?.[0] || '')) {
        const roleRes = await fetch(`${API_BASE}/users/${editingUser.id}/change-role`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ role: newRole }),
        });
        if (!roleRes.ok) {
          const err = await roleRes.json();
          toast({ type: 'error', title: 'Gagal', description: err.error || 'Gagal mengubah role' });
          return;
        }
      }
      toast({ type: 'success', title: 'Berhasil', description: 'User berhasil diperbarui' });
      setEditingUser(null);
      fetchUsers();
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Terjadi kesalahan' });
    } finally { setSubmitting(false); }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUserId || !newPassword) return;
    setSubmitting(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/users/${resetPasswordUserId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ new_password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ type: 'success', title: 'Berhasil', description: 'Password berhasil direset' });
        setResetPasswordUserId(null);
        setNewPassword('');
      } else {
        toast({ type: 'error', title: 'Gagal', description: data.error || 'Gagal mereset password' });
      }
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Terjadi kesalahan' });
    } finally { setSubmitting(false); }
  };

  const handleRestrictLogin = async (user: UserData) => {
    setSubmitting(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ can_login: !user.can_login }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast({ type: 'error', title: 'Gagal', description: err.error || 'Gagal mengubah status login' });
        return;
      }
      toast({ type: 'success', title: 'Berhasil', description: user.can_login ? 'User dibatasi loginnya' : 'User diizinkan login kembali' });
      fetchUsers();
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Terjadi kesalahan' });
    } finally { setSubmitting(false); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.')) return;
    setSubmitting(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast({ type: 'success', title: 'Berhasil', description: 'User berhasil dihapus' });
        fetchUsers();
      } else {
        toast({ type: 'error', title: 'Gagal', description: data.error || 'Gagal menghapus user' });
      }
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Terjadi kesalahan' });
    } finally { setSubmitting(false); }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const openEditModal = (user: UserData) => {
    setEditingUser(user);
    setEditForm({
      display_name: user.profile?.display_name || user.user_metadata?.display_name || '',
      phone: user.profile?.phone || '',
      bio: user.profile?.bio || '',
      can_login: user.can_login,
    });
    setNewRole(user.roles?.[0] || 'teacher');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Manajemen Pengguna</h1>
          <p className="text-text-light mt-1">Kelola user, role, dan akses login</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
        >
          <IconUserPlus size={18} />
          <span>Tambah User</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari email atau nama..."
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text cursor-pointer"
            />
          </div>
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              showFilters || roleFilter || sortFilter !== 'created_at'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-border text-text-light hover:text-text hover:bg-gray-50'
            }`}
          >
            <IconFilter size={18} />
            Filter
            {(roleFilter || sortFilter !== 'created_at') && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">Filter Role</label>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text cursor-pointer"
              >
                <option value="">Semua Role</option>
                <option value="teacher">Guru</option>
                <option value="student">Siswa</option>
                <option value="staff">Staf</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">Urutkan</label>
              <select
                value={sortFilter}
                onChange={(e) => { setSortFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text cursor-pointer"
              >
                <option value="created_at">Terbaru</option>
                <option value="last_sign_in_at">Terakhir Login</option>
                <option value="email">Email (A-Z)</option>
              </select>
            </div>
            {(roleFilter || sortFilter !== 'created_at') && (
              <div className="sm:col-span-2">
                <button
                  onClick={() => { setRoleFilter(''); setSortFilter('created_at'); setPage(1); }}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark cursor-pointer"
                >
                  <IconX size={14} /> Reset Filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Dibuat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Login Terakhir</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><IconLoader2 size={24} className="animate-spin mx-auto text-primary" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-text-light">Tidak ada user ditemukan</td></tr>
              ) : (
                users.map((user) => {
                  const displayName = user.profile?.display_name || user.user_metadata?.display_name || user.email;
                  const primaryRole = user.roles?.[0] || '';
                  const RoleIcon = roleIcons[primaryRole] || IconUser;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm flex-shrink-0">
                            {(displayName as string).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text truncate">{displayName}</p>
                            <p className="text-xs text-text-light truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {primaryRole ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[primaryRole] || 'bg-gray-100 text-gray-700'}`}>
                            <RoleIcon size={12} />
                            {primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-text-light">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-light">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3 text-sm text-text-light">{formatDate(user.last_sign_in_at)}</td>
                      <td className="px-4 py-3">
                        {user.can_login ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                            <IconCheck size={12} /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                            <IconBan size={12} /> Dibatasi
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditModal(user)} className="p-2 rounded-lg hover:bg-gray-100 text-text-light hover:text-primary transition-colors cursor-pointer" title="Edit">
                            <IconEdit size={16} />
                          </button>
                          <button onClick={() => setResetPasswordUserId(user.id)} className="p-2 rounded-lg hover:bg-gray-100 text-text-light hover:text-amber-600 transition-colors cursor-pointer" title="Reset Password">
                            <IconKey size={16} />
                          </button>
                          <button onClick={() => handleRestrictLogin(user)} className="p-2 rounded-lg hover:bg-gray-100 text-text-light hover:text-orange-600 transition-colors cursor-pointer" title={user.can_login ? 'Batasi Login' : 'Izinkan Login'}>
                            {user.can_login ? <IconBan size={16} /> : <IconCheck size={16} />}
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 rounded-lg hover:bg-gray-100 text-text-light hover:text-red-600 transition-colors cursor-pointer" title="Hapus">
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {loading ? (
            <div className="px-4 py-12 text-center"><IconLoader2 size={24} className="animate-spin mx-auto text-primary" /></div>
          ) : users.length === 0 ? (
            <div className="px-4 py-12 text-center text-text-light">Tidak ada user ditemukan</div>
          ) : (
            users.map((user) => {
              const displayName = user.profile?.display_name || user.user_metadata?.display_name || user.email;
              const primaryRole = user.roles?.[0] || '';
              const RoleIcon = roleIcons[primaryRole] || IconUser;

              return (
                <div key={user.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium flex-shrink-0">
                        {(displayName as string).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{displayName}</p>
                        <p className="text-xs text-text-light truncate">{user.email}</p>
                      </div>
                    </div>
                    {primaryRole && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ml-2 ${roleColors[primaryRole]}`}>
                        <RoleIcon size={10} />
                        {primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-light mb-3">
                    <span>Dibuat: {formatDate(user.created_at)}</span>
                    {user.can_login ? (
                      <span className="text-green-700 font-medium flex items-center gap-1"><IconCheck size={12} /> Aktif</span>
                    ) : (
                      <span className="text-red-700 font-medium flex items-center gap-1"><IconBan size={12} /> Dibatasi</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(user)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-xs font-medium text-text hover:bg-gray-50 transition-colors cursor-pointer">
                      <IconEdit size={14} /> Edit
                    </button>
                    <button onClick={() => setResetPasswordUserId(user.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-xs font-medium text-text hover:bg-gray-50 transition-colors cursor-pointer">
                      <IconKey size={14} /> Password
                    </button>
                    <button onClick={() => handleRestrictLogin(user)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-xs font-medium text-text hover:bg-gray-50 transition-colors cursor-pointer">
                      {user.can_login ? <><IconBan size={14} /> Batasi</> : <><IconCheck size={14} /> Izinkan</>}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-text-light">Halaman {page} dari {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border text-text-light hover:text-text hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <IconChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-border text-text-light hover:text-text hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text mb-4">Tambah User Baru</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Email</label>
                <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="user@smptashfia.sch.id" className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Password</label>
                <input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} placeholder="Minimal 6 karakter" className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Nama Lengkap</label>
                <input type="text" value={addForm.display_name} onChange={(e) => setAddForm({ ...addForm, display_name: e.target.value })} placeholder="Nama lengkap" className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Role</label>
                <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text cursor-pointer">
                  <option value="teacher">Guru</option>
                  <option value="student">Siswa</option>
                  <option value="staff">Staf</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-text hover:bg-gray-50 transition-colors cursor-pointer">Batal</button>
                <button onClick={handleAddUser} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer">
                  {submitting ? <><IconLoader2 size={16} className="animate-spin" /> Menyimpan...</> : 'Tambah User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text mb-4">Edit User</h2>
            <p className="text-sm text-text-light mb-4 truncate">{editingUser.email}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Nama Lengkap</label>
                <input type="text" value={editForm.display_name} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Telepon</label>
                <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Bio</label>
                <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={2} className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Role</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text cursor-pointer">
                  <option value="teacher">Guru</option>
                  <option value="student">Siswa</option>
                  <option value="staff">Staf</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-text">Izinkan Login</label>
                  <p className="text-xs text-text-light mt-0.5">Nonaktifkan untuk membatasi login (misal: resign)</p>
                </div>
                <button
                  onClick={() => setEditForm({ ...editForm, can_login: !editForm.can_login })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${editForm.can_login ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.can_login ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-text hover:bg-gray-50 transition-colors cursor-pointer">Batal</button>
                <button onClick={handleEditUser} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer">
                  {submitting ? <><IconLoader2 size={16} className="animate-spin" /> Menyimpan...</> : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUserId && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={() => { setResetPasswordUserId(null); setNewPassword(''); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text mb-2">Reset Password</h2>
            <p className="text-sm text-text-light mb-4">Masukkan password baru untuk user ini.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Password Baru</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setResetPasswordUserId(null); setNewPassword(''); }} className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-text hover:bg-gray-50 transition-colors cursor-pointer">Batal</button>
                <button onClick={handleResetPassword} disabled={submitting || !newPassword} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-60 cursor-pointer">
                  {submitting ? <><IconLoader2 size={16} className="animate-spin" /> Reset...</> : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
