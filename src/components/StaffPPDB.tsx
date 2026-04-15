import { useState, useEffect, useCallback, useRef } from 'react';
import {
  IconSearch, IconLoader2, IconChevronLeft, IconChevronRight,
  IconEye, IconX, IconExternalLink, IconRefresh,
} from '@tabler/icons-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const API_BASE = '/api';

interface PPDBRegistration {
  id: string;
  email: string;
  bukti_transfer_url: string | null;
  pemilihan_sekolah: string;
  nama_lengkap: string;
  nama_panggilan: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  asal_sekolah: string;
  alamat_sekolah: string;
  no_telp_ortu_1: string;
  no_telp_ortu_2: string;
  nama_bapak: string;
  tempat_lahir_bapak: string;
  tanggal_lahir_bapak: string;
  pendidikan_bapak: string;
  pekerjaan_bapak: string;
  nama_ibu: string;
  tempat_lahir_ibu: string;
  tanggal_lahir_ibu: string;
  pendidikan_ibu: string;
  pekerjaan_ibu: string | null;
  sumber_info: string;
  sumber_info_lainnya: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewed: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending: 'Menunggu',
  reviewed: 'Ditinjau',
  accepted: 'Diterima',
  rejected: 'Ditolak',
};

export default function StaffPPDB() {
  const { toast } = useToast();
  const latestReqId = useRef(0);
  const [registrations, setRegistrations] = useState<PPDBRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sekolahFilter, setSekolahFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const perPage = 20;

  const [detailReg, setDetailReg] = useState<PPDBRegistration | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [prevActiveEl, setPrevActiveEl] = useState<Element | null>(null);

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDetail(false);
      return;
    }
    if (e.key === 'Tab') {
      const modal = modalRef.current;
      if (!modal) return;
      const focusableElements = modal.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])');
      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  };

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const fetchRegistrations = useCallback(async (signal?: AbortSignal) => {
    const reqId = ++latestReqId.current;
    const controller = signal ? null : new AbortController();
    const effectiveSignal = signal || controller?.signal;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(perPage + 1),
        offset: String((page - 1) * perPage),
      });
      if (statusFilter) params.set('status', statusFilter);
      if (sekolahFilter) params.set('sekolah', sekolahFilter);
      if (search) params.set('search', search);

      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/ppdb/list?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: effectiveSignal,
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.success) {
        if (reqId === latestReqId.current && !effectiveSignal?.aborted) {
          const hasNext = data.data.length > perPage;
          setRegistrations(data.data.slice(0, perPage) as PPDBRegistration[]);
          setHasMore(hasNext);
        }
      } else {
        throw new Error(data.error || 'API Error');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast({ type: 'error', title: 'Gagal', description: 'Gagal memuat data pendaftaran' });
      }
    } finally {
      if (reqId === latestReqId.current && !effectiveSignal?.aborted) {
        setLoading(false);
      }
    }
  }, [page, statusFilter, sekolahFilter, search, toast]);

  useEffect(() => {
    const controller = new AbortController();
    fetchRegistrations(controller.signal);
    return () => controller.abort();
  }, [fetchRegistrations]);

  useEffect(() => {
    if (showDetail) {
      setPrevActiveEl(document.activeElement);
      modalRef.current?.focus();
    } else if (prevActiveEl) {
      (prevActiveEl as HTMLElement).focus?.();
      setPrevActiveEl(null);
    }
  }, [showDetail]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDetail) {
        setShowDetail(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDetail]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingStatus(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/ppdb/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        toast({ type: 'success', title: 'Berhasil', description: `Status diubah ke ${statusLabels[status]}` });
        fetchRegistrations();
        setDetailReg(prev => prev?.id === id ? { ...prev, status } : prev);
      } else {
        toast({ type: 'error', title: 'Gagal', description: data.error || 'Gagal mengubah status' });
      }
    } catch {
      toast({ type: 'error', title: 'Gagal', description: 'Terjadi kesalahan' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Data Pendaftaran PMB</h1>
        <p className="text-text-light mt-1">Lihat dan kelola pendaftaran siswa baru</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nama, email, atau asal sekolah..."
              aria-label="Search by name, email, or school"
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            aria-label="Filter by status"
            className="px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="reviewed">Ditinjau</option>
            <option value="accepted">Diterima</option>
            <option value="rejected">Ditolak</option>
          </select>
          <select
            value={sekolahFilter}
            onChange={(e) => { setSekolahFilter(e.target.value); setPage(1); }}
            aria-label="Filter by school"
            className="px-3 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text cursor-pointer"
          >
            <option value="">Semua Sekolah</option>
            <option value="Tashfia Boarding School">Boarding School</option>
            <option value="Tashfia Full Day School">Full Day School</option>
          </select>
          <button
            onClick={() => fetchRegistrations()}
            className="p-2.5 border border-border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Refresh registrations"
          >
            <IconRefresh size={18} className="text-text-light" />
          </button>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Tanggal Daftar</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Nama Siswi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Sekolah</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Asal Sekolah</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><IconLoader2 size={24} className="animate-spin mx-auto text-primary" /></td></tr>
              ) : registrations.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-text-light">Tidak ada data pendaftaran</td></tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-text-light">{formatDate(reg.created_at)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text">{reg.nama_lengkap}</p>
                      <p className="text-xs text-text-light">{reg.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-light">{reg.pemilihan_sekolah === 'Tashfia Boarding School' ? 'Boarding' : 'Full Day'}</td>
                    <td className="px-4 py-3 text-sm text-text-light">{reg.asal_sekolah}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[reg.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[reg.status] || reg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setDetailReg(reg); setShowDetail(true); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                      >
                        <IconEye size={16} /> Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {loading ? (
            <div className="px-4 py-12 text-center"><IconLoader2 size={24} className="animate-spin mx-auto text-primary" /></div>
          ) : registrations.length === 0 ? (
            <div className="px-4 py-12 text-center text-text-light">Tidak ada data pendaftaran</div>
          ) : (
            registrations.map((reg) => (
              <div key={reg.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-text">{reg.nama_lengkap}</p>
                    <p className="text-xs text-text-light">{reg.email}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[reg.status] || 'bg-gray-100 text-gray-700'}`}>
                    {statusLabels[reg.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-light">
                  <span>{reg.pemilihan_sekolah === 'Tashfia Boarding School' ? 'Boarding' : 'Full Day'} • {reg.asal_sekolah}</span>
                  <button
                    onClick={() => { setDetailReg(reg); setShowDetail(true); }}
                    className="inline-flex items-center gap-1 text-primary font-medium cursor-pointer"
                  >
                    <IconEye size={14} /> Detail
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {(hasMore || page > 1) && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-text-light">Halaman {page}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border text-text-light hover:text-text hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <IconChevronLeft size={16} />
              </button>
              {hasMore && (
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-lg border border-border text-text-light hover:text-text hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <IconChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && detailReg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detailModalTitle"
          className="fixed inset-0 bg-black/60 z-[2000] flex items-start justify-center p-4 pt-16 overflow-y-auto"
          onClick={() => setShowDetail(false)}
        >
          <div 
            ref={modalRef}
            tabIndex={-1}
            onKeyDown={handleModalKeyDown}
            className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mb-8 focus:outline-none" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-border flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 id="detailModalTitle" className="text-lg font-semibold text-text">Detail Pendaftaran</h2>
                <p className="text-xs text-text-light mt-0.5">Diterima pada {formatDateTime(detailReg.created_at)}</p>
              </div>
              <button onClick={() => setShowDetail(false)} aria-label="Close detail dialog" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <IconX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-text">Status Pendaftaran</p>
                  <p className="text-xs text-text-light mt-0.5">Ubah status pendaftaran</p>
                </div>
                <div className="flex items-center gap-2">
                  {['pending', 'reviewed', 'accepted', 'rejected'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(detailReg.id, s)}
                      disabled={updatingStatus || detailReg.status === s}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        detailReg.status === s
                          ? statusColors[s]
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Siswi */}
              <DetailSection title="Data Siswi" fields={[
                ['Nama Lengkap', detailReg.nama_lengkap],
                ['Nama Panggilan', detailReg.nama_panggilan],
                ['Tempat/Tgl Lahir', `${detailReg.tempat_lahir}, ${formatDate(detailReg.tanggal_lahir)}`],
                ['Asal Sekolah', detailReg.asal_sekolah],
                ['Alamat Sekolah', detailReg.alamat_sekolah],
                ['Alamat', detailReg.alamat],
              ]} />

              {/* Data Orang Tua */}
              <DetailSection title="Data Bapak" fields={[
                ['Nama', detailReg.nama_bapak],
                ['Tempat/Tgl Lahir', `${detailReg.tempat_lahir_bapak}, ${formatDate(detailReg.tanggal_lahir_bapak)}`],
                ['Pendidikan', detailReg.pendidikan_bapak],
                ['Pekerjaan', detailReg.pekerjaan_bapak],
              ]} />

              <DetailSection title="Data Ibu" fields={[
                ['Nama', detailReg.nama_ibu],
                ['Tempat/Tgl Lahir', `${detailReg.tempat_lahir_ibu}, ${formatDate(detailReg.tanggal_lahir_ibu)}`],
                ['Pendidikan', detailReg.pendidikan_ibu],
                ['Pekerjaan', detailReg.pekerjaan_ibu || '-'],
              ]} />

              {/* Contact */}
              <DetailSection title="Kontak" fields={[
                ['Email', detailReg.email],
                ['No. Telp Ortu 1', detailReg.no_telp_ortu_1],
                ['No. Telp Ortu 2', detailReg.no_telp_ortu_2],
                ['Sekolah Pilihan', detailReg.pemilihan_sekolah],
                ['Sumber Info', detailReg.sumber_info_lainnya || detailReg.sumber_info],
              ]} />

              {/* Bukti Transfer */}
              {detailReg.bukti_transfer_url && (
                <div>
                  <h3 className="text-sm font-semibold text-text mb-2">Bukti Transfer</h3>
                  <a href={detailReg.bukti_transfer_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                    <IconExternalLink size={16} />
                    Lihat Bukti Transfer
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailSection({ title, fields }: { title: string; fields: [string, string | null | undefined][] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-3 pb-2 border-b border-border">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-text-light">{label}</p>
            <p className="text-sm text-text font-medium">{value || '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
