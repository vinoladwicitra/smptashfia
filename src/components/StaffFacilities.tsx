import { useState, useEffect, useRef } from 'react';
import {
  IconPhotoPlus, IconTrash, IconEdit, IconCheck, IconX,
  IconArrowUp, IconArrowDown, IconPlus, IconBuilding, IconDeviceDesktop,
  IconFlask, IconSchool, IconBook, IconUsers, IconSwimming, IconBallTennis,
  IconLoader2, IconAlertCircle, IconPhoto,
} from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const API_BASE = '/api';

// Define available icons for picker - limited to common ones
const AVAILABLE_ICONS = [
  { name: 'IconBuilding', label: 'Gedung', Icon: IconBuilding },
  { name: 'IconFlask', label: 'Laboratorium', Icon: IconFlask },
  { name: 'IconDeviceDesktop', label: 'Komputer', Icon: IconDeviceDesktop },
  { name: 'IconSchool', label: 'Sekolah', Icon: IconSchool },
  { name: 'IconBook', label: 'Perpustakaan', Icon: IconBook },
  { name: 'IconUsers', label: 'Rapat', Icon: IconUsers },
  { name: 'IconSwimming', label: 'Kolam Renang', Icon: IconSwimming },
  { name: 'IconBallTennis', label: 'Olahraga', Icon: IconBallTennis },
];

type FacilityCategory = {
  id: string;
  name: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
  images: FacilityImage[];
};

type FacilityImage = {
  id: string;
  image_url: string;
  display_order: number;
};

export default function StaffFacilities() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null); // categoryId uploading
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [categories, setCategories] = useState<FacilityCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCategory, setEditCategory] = useState<FacilityCategory | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<string | null>(null);

  // New/Edit form state
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('IconBuilding');
  const [formIsActive, setFormIsActive] = useState(true);

  // Image file input refs per category
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/facilities/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        if (data.data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data.data[0].id);
        }
      }
     } catch {
       toast({ type: 'error', title: 'Error', description: 'Gagal memuat data fasilitas' });
     } finally {
      setLoading(false);
    }
  };

  const getAuthToken = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || null;

  // Category CRUD
  const handleAddCategory = async () => {
    if (!formName.trim()) {
      toast({ type: 'error', title: 'Gagal', description: 'Nama fasilitas harus diisi' });
      return;
    }
    setSaving(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/facilities/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          icon_name: formIcon,
          display_order: categories.length,
          is_active: formIsActive,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menambahkan');
      }
      toast({ type: 'success', title: 'Berhasil', description: 'Fasilitas ditambahkan' });
      setShowAddModal(false);
      resetForm();
      fetchFacilities();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ type: 'error', title: 'Gagal', description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory || !formName.trim()) return;
    setSaving(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/facilities/categories/${editCategory.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          icon_name: formIcon,
          is_active: formIsActive,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memperbarui');
      }
      toast({ type: 'success', title: 'Berhasil', description: 'Fasilitas diperbarui' });
      setEditCategory(null);
      resetForm();
      fetchFacilities();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ type: 'error', title: 'Gagal', description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setSaving(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/facilities/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghapus');
      }
      toast({ type: 'success', title: 'Berhasil', description: 'Fasilitas dihapus' });
      setDeleteConfirmCategory(null);
      fetchFacilities();
      if (selectedCategoryId === id) setSelectedCategoryId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ type: 'error', title: 'Gagal', description: message });
    } finally {
      setSaving(false);
    }
  };

  // Image management
  const handleImageUpload = async (categoryId: string, file: File) => {
    setUploading(categoryId);
    try {
      const token = await getAuthToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category_id', categoryId);

      const res = await fetch(`${API_BASE}/facilities/images`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload gagal');
      }

      toast({ type: 'success', title: 'Berhasil', description: 'Gambar ditambahkan' });
      fetchFacilities();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ type: 'error', title: 'Gagal', description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Hapus gambar ini?')) return;
    setDeletingImageId(imageId);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/facilities/images/${imageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghapus gambar');
      }
      toast({ type: 'success', title: 'Berhasil', description: 'Gambar dihapus' });
      fetchFacilities();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast({ type: 'error', title: 'Gagal', description: message });
    } finally {
      setSaving(false);
    }
  };

  // Reorder helpers
  const moveImage = (images: FacilityImage[], fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    return newImages.map((img, idx) => ({ ...img, display_order: idx }));
  };

  const handleMoveImage = async (categoryId: string, imageId: string, direction: 'up' | 'down') => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    const idx = cat.images.findIndex(img => img.id === imageId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === cat.images.length - 1) return;

    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    const reordered = moveImage(cat.images, idx, newIdx);

    // Optimistically update UI
    setCategories(prev => prev.map(c => {
      if (c.id === categoryId) return { ...c, images: reordered };
      return c;
    }));

    // Persist reorder for all images in this category
    try {
      const token = await getAuthToken();
      const updates = reordered.map((img, order) => ({
        id: img.id,
        display_order: order,
      }));
      // Send all updates
       await fetch(`${API_BASE}/facilities/reorder/images`, {
         method: 'PATCH',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
         },
         body: JSON.stringify(updates),
       });
     } catch {
       toast({ type: 'error', title: 'Gagal', description: 'Gagal memperbarui urutan' });
       fetchFacilities(); // Revert
     }
   };

  const moveCategory = (categories: FacilityCategory[], fromIndex: number, toIndex: number) => {
    const newCats = [...categories];
    const [moved] = newCats.splice(fromIndex, 1);
    newCats.splice(toIndex, 0, moved);
    return newCats.map((cat, idx) => ({ ...cat, display_order: idx }));
  };

  const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const idx = categories.findIndex(c => c.id === categoryId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === categories.length - 1) return;

    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    const reordered = moveCategory(categories, idx, newIdx);

    setCategories(reordered);

    try {
      const token = await getAuthToken();
      const updates = reordered.map((cat, order) => ({
        id: cat.id,
        display_order: order,
      }));
       await fetch(`${API_BASE}/facilities/reorder/categories`, {
         method: 'PATCH',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
         },
         body: JSON.stringify(updates),
       });
     } catch {
       toast({ type: 'error', title: 'Gagal', description: 'Gagal memperbarui urutan kategori' });
       fetchFacilities();
     }
   };

  // Form helpers
  const resetForm = () => {
    setFormName('');
    setFormIcon('IconBuilding');
    setFormIsActive(true);
  };

  const openEditModal = (cat: FacilityCategory) => {
    setEditCategory(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon_name);
    setFormIsActive(cat.is_active);
  };

  const handleTriggerFileInput = (categoryId: string) => {
    fileInputRefs.current[categoryId]?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast({ type: 'error', title: 'File tidak valid', description: 'Hanya JPG, PNG, GIF, WEBP' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ type: 'error', title: 'File terlalu besar', description: 'Maksimal 5MB' });
      return;
    }
    handleImageUpload(categoryId, file);
    e.target.value = '';
  };

  // Render
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Fasilitas & Pelayanan</h1>
          <p className="text-text-light mt-1">Kelola kategori fasilitas dan gambar.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
        >
          <IconPlus size={18} />
          <span>Tambah Fasilitas</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Categories List */}
        <div className="lg:w-1/3 space-y-3">
          {categories.map((cat, idx) => {
            const IconComponent = AVAILABLE_ICONS.find(i => i.name === cat.icon_name)?.Icon || IconBuilding;
            const isSelected = selectedCategoryId === cat.id;
            return (
              <div
                key={cat.id}
                className={`bg-white rounded-xl border transition-all p-4 cursor-pointer ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text">{cat.name}</h3>
                      <p className="text-xs text-text-light">{cat.images.length} gambar</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {cat.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                {/* Order buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveCategory(cat.id, 'up'); }}
                    disabled={idx === 0}
                    className="p-1.5 rounded border border-border hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                    title="Pindah ke atas"
                  >
                    <IconArrowUp size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveCategory(cat.id, 'down'); }}
                    disabled={idx === categories.length - 1}
                    className="p-1.5 rounded border border-border hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                    title="Pindah ke bawah"
                  >
                    <IconArrowDown size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(cat); }}
                    className="p-1.5 rounded border border-border hover:bg-gray-50 cursor-pointer"
                    title="Edit"
                  >
                    <IconEdit size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmCategory(cat.id); }}
                    className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Hapus"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Images Panel */}
        <div className="flex-1 bg-white rounded-xl border border-border p-4 sm:p-6">
          {selectedCategory ? (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-text">{selectedCategory.name}</h2>
                <p className="text-xs text-text-light">Kelola gambar untuk fasilitas ini</p>
              </div>

              {/* Upload Area */}
              <div
                onClick={() => handleTriggerFileInput(selectedCategory.id)}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 hover:border-primary/50 transition-colors mb-6"
              >
                <input
                  ref={el => { fileInputRefs.current[selectedCategory.id] = el; }}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => handleFileChange(e, selectedCategory.id)}
                  className="hidden"
                />
                {uploading === selectedCategory.id ? (
                  <div className="flex items-center justify-center gap-2 text-text-light">
                    <IconLoader2 size={20} className="animate-spin" />
                    <span>Mengupload...</span>
                  </div>
                ) : (
                  <>
                    <IconPhotoPlus size={32} className="mx-auto mb-2 text-text-light" />
                    <p className="text-sm text-text-light">Klik untuk upload gambar baru</p>
                    <p className="text-xs text-text-light mt-1">Maks. 5MB (JPG, PNG, GIF, WebP)</p>
                  </>
                )}
              </div>

              {/* Images Grid */}
              {selectedCategory.images.length === 0 ? (
                <div className="text-center py-8 text-text-light">
                  <IconPhoto size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Belum ada gambar. Upload gambar pertama!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedCategory.images.map((img, idx) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border">
                      <img
                        src={img.image_url}
                        alt={`${selectedCategory.name} ${idx + 1}`}
                        className="w-full aspect-square object-cover"
                        loading="lazy"
                      />
                      {/* Hover overlay with actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleMoveImage(selectedCategory.id, img.id, 'up')}
                          disabled={idx === 0}
                          className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                          title="Pindah ke atas"
                        >
                          <IconArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveImage(selectedCategory.id, img.id, 'down')}
                          disabled={idx === selectedCategory.images.length - 1}
                          className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                          title="Pindah ke bawah"
                        >
                          <IconArrowDown size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          disabled={deletingImageId === img.id}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-60"
                          title="Hapus"
                        >
                          {deletingImageId === img.id ? <IconLoader2 size={16} className="animate-spin" /> : <IconTrash size={16} />}
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 text-center">
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </>
            ) : (
            <div className="flex items-center justify-center h-full text-text-light">
              Pilih fasilitas untuk melihat gambar
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editCategory) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text">{showAddModal ? 'Tambah Fasilitas' : 'Edit Fasilitas'}</h2>
              <button onClick={() => { setShowAddModal(false); setEditCategory(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <IconX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Nama Fasilitas</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Lab IPA"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Icon</label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_ICONS.map(({ name, label, Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormIcon(name)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                        formIcon === name ? 'border-primary bg-primary/5' : 'border-border hover:bg-gray-50'
                      }`}
                      title={label}
                    >
                      <Icon size={24} className={formIcon === name ? 'text-primary' : 'text-text-light'} />
                      <span className="text-xs text-text-light truncate w-full text-center">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text">Status Aktif</label>
                <button
                  role="switch"
                  aria-checked={formIsActive}
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formIsActive ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formIsActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); setEditCategory(null); }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={showAddModal ? handleAddCategory : handleUpdateCategory}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-60"
              >
                {saving ? <IconLoader2 size={16} className="animate-spin" /> : <IconCheck size={16} />}
                {showAddModal ? 'Tambah' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                <IconAlertCircle size={24} />
              </div>
              <h2 className="text-lg font-bold text-text">Hapus Fasilitas?</h2>
            </div>
            <p className="text-text-light text-sm mb-6">
              Semua gambar di dalamnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmCategory(null)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteConfirmCategory)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? <IconLoader2 size={16} className="animate-spin" /> : <IconTrash size={16} />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
