import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import Header from './Header';
import MobileHeader from './MobileHeader';
import Footer from './Footer';
import StickyMobileBottomBar from './StickyMobileBottomBar';
import {
  IconChevronRight, IconChevronLeft, IconUpload, IconCheck,
  IconFileUpload, IconSchool, IconUser,
  IconUsers, IconInfoCircle, IconArrowLeft,
} from '@tabler/icons-react';

const STEPS = [
  { title: 'Pembayaran', icon: IconFileUpload },
  { title: 'Data Siswi', icon: IconUser },
  { title: 'Data Bapak', icon: IconUsers },
  { title: 'Data Ibu', icon: IconUsers },
  { title: 'Selesai', icon: IconCheck },
];

const PENDIDIKAN_OPTIONS = ['SD', 'SMP', 'SMA', 'S1/S2/S3', 'Lainnya'];
const SUMBER_INFO_OPTIONS = [
  'Instagram', 'Facebook', 'Youtube', 'Broadcast Whatsapp',
  'Google', 'Iklan', 'Spanduk / Banner / Flyer',
  'Saudara / Keluarga / Kerabat', 'Teman / Tetangga',
  'Promosi dari Asal Sekolah (SD)', 'Lainnya',
];

export default function PPDBPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: '',
    buktiTransferUrl: '',
    pemilihanSekolah: '',
    namaLengkap: '',
    namaPanggilan: '',
    tempatLahir: '',
    tanggalLahir: '',
    alamat: '',
    asalSekolah: '',
    alamatSekolah: '',
    noTelpOrtu1: '',
    noTelpOrtu2: '',
    namaBapak: '',
    tempatLahirBapak: '',
    tanggalLahirBapak: '',
    pendidikanBapak: '',
    pekerjaanBapak: '',
    namaIbu: '',
    tempatLahirIbu: '',
    tanggalLahirIbu: '',
    pendidikanIbu: '',
    pekerjaanIbu: '',
    sumberInfo: '',
    sumberInfoLainnya: '',
  });

  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ type: 'error', title: 'File Terlalu Besar', description: 'Maksimal 10MB.' });
      return;
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const key = `bukti-transfer/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('ppdb-documents')
      .upload(key, file);

    if (error) {
      toast({ type: 'error', title: 'Gagal Upload', description: error.message });
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('ppdb-documents').getPublicUrl(key);
    setFormData(prev => ({ ...prev, buktiTransferUrl: publicUrl }));
    toast({ type: 'success', title: 'Upload Berhasil', description: 'Bukti transfer berhasil diunggah.' });
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.email || !formData.email.includes('@')) {
          toast({ type: 'error', title: 'Email Tidak Valid' }); return false;
        }
        if (!formData.buktiTransferUrl) {
          toast({ type: 'error', title: 'Bukti Transfer Diperlukan' }); return false;
        }
        if (!formData.pemilihanSekolah) {
          toast({ type: 'error', title: 'Pilih Sekolah' }); return false;
        }
        return true;
      case 2:
        if (!formData.namaLengkap || !formData.namaPanggilan || !formData.tempatLahir || !formData.tanggalLahir || !formData.alamat || !formData.asalSekolah || !formData.alamatSekolah || !formData.noTelpOrtu1 || !formData.noTelpOrtu2) {
          toast({ type: 'error', title: 'Lengkapi Semua Data Siswi' }); return false;
        }
        return true;
      case 3:
        if (!formData.namaBapak || !formData.tempatLahirBapak || !formData.tanggalLahirBapak || !formData.pendidikanBapak || !formData.pekerjaanBapak) {
          toast({ type: 'error', title: 'Lengkapi Semua Data Bapak' }); return false;
        }
        return true;
      case 4:
        if (!formData.namaIbu || !formData.tempatLahirIbu || !formData.tanggalLahirIbu || !formData.pendidikanIbu) {
          toast({ type: 'error', title: 'Lengkapi Semua Data Ibu' }); return false;
        }
        return true;
      case 5:
        if (!formData.sumberInfo) {
          toast({ type: 'error', title: 'Pilih Sumber Informasi' }); return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);

    const { error } = await supabase.from('ppdb_registrations').insert({
      email: formData.email,
      bukti_transfer_url: formData.buktiTransferUrl,
      pemilihan_sekolah: formData.pemilihanSekolah,
      nama_lengkap: formData.namaLengkap,
      nama_panggilan: formData.namaPanggilan,
      tempat_lahir: formData.tempatLahir,
      tanggal_lahir: formData.tanggalLahir,
      alamat: formData.alamat,
      asal_sekolah: formData.asalSekolah,
      alamat_sekolah: formData.alamatSekolah,
      no_telp_ortu_1: formData.noTelpOrtu1,
      no_telp_ortu_2: formData.noTelpOrtu2,
      nama_bapak: formData.namaBapak,
      tempat_lahir_bapak: formData.tempatLahirBapak,
      tanggal_lahir_bapak: formData.tanggalLahirBapak,
      pendidikan_bapak: formData.pendidikanBapak,
      pekerjaan_bapak: formData.pekerjaanBapak,
      nama_ibu: formData.namaIbu,
      tempat_lahir_ibu: formData.tempatLahirIbu,
      tanggal_lahir_ibu: formData.tanggalLahirIbu,
      pendidikan_ibu: formData.pendidikanIbu,
      pekerjaan_ibu: formData.pekerjaanIbu || '',
      sumber_info: formData.sumberInfo,
      sumber_info_lainnya: formData.sumberInfo === 'Lainnya' ? formData.sumberInfoLainnya : null,
    });

    setSubmitting(false);

    if (error) {
      toast({ type: 'error', title: 'Gagal Mengirim Formulir', description: error.message });
      return;
    }

    toast({ type: 'success', title: 'Pendaftaran Berhasil!', description: 'Silakan tunggu informasi selanjutnya di grup WhatsApp.' });
    navigate('/');
  };

  const progressPercent = (step / STEPS.length) * 100;

  return (
    <>
      <Header />
      <MobileHeader />
      <main className="min-h-screen bg-background pb-20 lg:pb-0">
        {/* Hero */}
        <section className="bg-primary text-white border-b border-primary">
          <div className="max-w-4xl mx-auto px-5 py-10 lg:py-16 text-center">
            <h1 className="text-3xl lg:text-5xl font-bold mb-3">PMB Tahun Ajaran 2026/2027</h1>
            <p className="text-white/80 max-w-xl mx-auto">Penerimaan Murid Baru SMP Tashfia</p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-5 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text">Step {step} dari {STEPS.length}</span>
              <span className="text-sm text-text-light">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            {/* Step indicators */}
            <div className="flex justify-between mt-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = i + 1 <= step;
                return (
                  <div key={s.title} className={`flex flex-col items-center ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                      {i + 1 < step ? <IconCheck size={14} /> : <Icon size={14} />}
                    </div>
                    <span className="text-[10px] mt-1 hidden sm:block">{s.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 1: Pembayaran */}
          {step === 1 && (
            <div className="space-y-8">
              {/* Biaya Boarding */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text mb-4">Rincian Biaya Tashfia Boarding</h3>
                <img src="https://file.smptashfia.sch.id/2025/08/1-2.png" alt="Biaya Boarding" className="mx-auto max-w-sm rounded-xl shadow-sm" loading="lazy" />
              </div>
              {/* Biaya Fullday */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text mb-4">Rincian Biaya Tashfia Fullday</h3>
                <img src="https://file.smptashfia.sch.id/2025/08/2-2.png" alt="Biaya Fullday" className="mx-auto max-w-sm rounded-xl shadow-sm" loading="lazy" />
              </div>

              {/* Form Section */}
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <IconFileUpload size={20} className="text-primary" />
                  Konfirmasi Pendaftaran
                </h3>

                {/* Alur Info */}
                <div className="bg-primary/5 rounded-lg p-4 mb-6 text-sm text-text space-y-2">
                  <p><strong>Alur pendaftaran:</strong></p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Melakukan pembayaran sebesar:<br />
                      – <strong>Rp 300.001</strong> bagi yang memilih Tashfia Boarding<br />
                      – <strong>Rp 300.002</strong> bagi yang memilih Tashfia Full Day School<br />
                      <span className="text-text-light">(angka 1 atau 2 di akhir nominal harap dicantumkan)</span>
                    </li>
                    <li>Transfer ke <strong>BNI 0016249074</strong> (Kode Bank: 009) a.n <strong>SMP Tashfia</strong></li>
                    <li>Upload bukti transfer di bawah ini</li>
                  </ol>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a href="https://wa.me/6285218450160" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                      Konfirmasi PMB
                    </a>
                    <a href="https://wa.me/628111881097" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                      Humas SMP Tashfia
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" placeholder="email@contoh.com" required />
                </div>

                {/* Bukti Transfer */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text mb-1.5">Bukti Transfer Pembayaran <span className="text-red-500">*</span></label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${formData.buktiTransferUrl ? 'border-green-400 bg-green-50' : 'border-border hover:border-primary hover:bg-primary/5'}`}
                  >
                    {formData.buktiTransferUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <IconCheck size={24} className="text-green-600" />
                        <p className="text-sm font-medium text-green-700">Bukti transfer berhasil diunggah</p>
                        <button onClick={(e) => { e.stopPropagation(); updateField('buktiTransferUrl', ''); }} className="text-xs text-red-500 hover:text-red-700">Hapus & ganti</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <IconUpload size={24} className="text-text-light" />
                        <p className="text-sm text-text-light">Klik untuk upload bukti transfer</p>
                        <p className="text-xs text-text-light">JPG, PNG, PDF (maks 10MB)</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileUpload} />
                  </div>
                </div>

                {/* Catatan Biaya */}
                <div className="bg-yellow-50 border-2 border-dashed border-red-300 rounded-lg p-3 text-xs mb-4">
                  <strong>Catatan:</strong><br />
                  <strong>Rp 300.001</strong> untuk Tashfia Boarding School (Asrama)<br />
                  <strong>Rp 300.002</strong> untuk Tashfia Full Day School (Tidak Asrama)
                </div>

                {/* Pemilihan Sekolah */}
                <fieldset className="mb-4">
                  <legend className="block text-sm font-medium text-text mb-3">Pemilihan Sekolah <span className="text-red-500">*</span></legend>
                  <div className="space-y-2">
                    {[
                      { value: 'Tashfia Boarding School', label: 'Tashfia Boarding School' },
                      { value: 'Tashfia Full Day School', label: 'Tashfia Full Day School' },
                    ].map((opt) => (
                      <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${formData.pemilihanSekolah === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <input type="radio" name="pemilihanSekolah" value={opt.value} checked={formData.pemilihanSekolah === opt.value} onChange={(e) => updateField('pemilihanSekolah', e.target.value)} className="w-4 h-4 text-primary" />
                        <IconSchool size={18} className="text-text-light" />
                        <span className="text-sm font-medium text-text">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          )}

          {/* Step 2: Data Siswi */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <IconUser size={20} className="text-primary" />
                Data Calon Siswi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text mb-1.5">Nama Lengkap Calon Siswi <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.namaLengkap} onChange={(e) => updateField('namaLengkap', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Nama Panggilan <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.namaPanggilan} onChange={(e) => updateField('namaPanggilan', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Tempat Lahir <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.tempatLahir} onChange={(e) => updateField('tempatLahir', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Tanggal Lahir <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.tanggalLahir} onChange={(e) => updateField('tanggalLahir', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Asal Sekolah <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.asalSekolah} onChange={(e) => updateField('asalSekolah', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text mb-1.5">Alamat/Tempat Tinggal <span className="text-red-500">*</span></label>
                  <textarea value={formData.alamat} onChange={(e) => updateField('alamat', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" rows={3} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text mb-1.5">Alamat Sekolah <span className="text-red-500">*</span></label>
                  <textarea value={formData.alamatSekolah} onChange={(e) => updateField('alamatSekolah', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" rows={3} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">No. Telp Ortu/Wali I <span className="text-red-500">*</span> <span className="text-text-light text-xs">(Utama – masuk grup WA)</span></label>
                  <input type="tel" value={formData.noTelpOrtu1} onChange={(e) => updateField('noTelpOrtu1', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" placeholder="08xxxxxxxxxx" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">No. Telp Ortu/Wali II <span className="text-red-500">*</span> <span className="text-text-light text-xs">(Alternatif)</span></label>
                  <input type="tel" value={formData.noTelpOrtu2} onChange={(e) => updateField('noTelpOrtu2', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" placeholder="08xxxxxxxxxx" required />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Data Bapak */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <IconUsers size={20} className="text-primary" />
                Data Bapak
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Nama Bapak <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.namaBapak} onChange={(e) => updateField('namaBapak', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Tempat Lahir Bapak <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.tempatLahirBapak} onChange={(e) => updateField('tempatLahirBapak', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Tanggal Lahir Bapak <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.tanggalLahirBapak} onChange={(e) => updateField('tanggalLahirBapak', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Pendidikan Terakhir Bapak <span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {PENDIDIKAN_OPTIONS.map((opt) => (
                      <button key={opt} type="button" onClick={() => updateField('pendidikanBapak', opt)} className={`px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-inset transition-colors ${formData.pendidikanBapak === opt ? 'bg-primary text-white ring-primary' : 'bg-white text-text-light ring-border hover:bg-gray-50'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Pekerjaan Bapak <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.pekerjaanBapak} onChange={(e) => updateField('pekerjaanBapak', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Data Ibu */}
          {step === 4 && (
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <IconUsers size={20} className="text-primary" />
                Data Ibu
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Nama Ibu <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.namaIbu} onChange={(e) => updateField('namaIbu', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Tempat Lahir Ibu <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.tempatLahirIbu} onChange={(e) => updateField('tempatLahirIbu', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Tanggal Lahir Ibu <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.tanggalLahirIbu} onChange={(e) => updateField('tanggalLahirIbu', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Pendidikan Terakhir Ibu <span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {PENDIDIKAN_OPTIONS.map((opt) => (
                      <button key={opt} type="button" onClick={() => updateField('pendidikanIbu', opt)} className={`px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-inset transition-colors ${formData.pendidikanIbu === opt ? 'bg-primary text-white ring-primary' : 'bg-white text-text-light ring-border hover:bg-gray-50'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">Pekerjaan Ibu</label>
                  <input type="text" value={formData.pekerjaanIbu} onChange={(e) => updateField('pekerjaanIbu', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" placeholder="Opsional" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Sumber Info & Submit */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <IconInfoCircle size={20} className="text-primary" />
                  Info SMP Tashfia Darimana <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUMBER_INFO_OPTIONS.map((opt) => (
                    <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${formData.sumberInfo === opt ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <input type="radio" name="sumberInfo" value={opt} checked={formData.sumberInfo === opt} onChange={(e) => updateField('sumberInfo', e.target.value)} className="w-4 h-4 text-primary" />
                      <span className="text-sm text-text">{opt}</span>
                    </label>
                  ))}
                </div>
                {formData.sumberInfo === 'Lainnya' && (
                  <div className="mt-3">
                    <input type="text" value={formData.sumberInfoLainnya} onChange={(e) => updateField('sumberInfoLainnya', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" placeholder="Sebutkan..." />
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <IconCheck size={20} className="text-green-600" />
                  Ringkasan Pendaftaran
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-text-light">Email</span><span className="font-medium text-text">{formData.email}</span></div>
                  <div className="flex justify-between"><span className="text-text-light">Sekolah</span><span className="font-medium text-text">{formData.pemilihanSekolah}</span></div>
                  <div className="flex justify-between"><span className="text-text-light">Nama Siswi</span><span className="font-medium text-text">{formData.namaLengkap}</span></div>
                  <div className="flex justify-between"><span className="text-text-light">No. Ortu 1</span><span className="font-medium text-text">{formData.noTelpOrtu1}</span></div>
                  <div className="flex justify-between"><span className="text-text-light">Nama Bapak</span><span className="font-medium text-text">{formData.namaBapak}</span></div>
                  <div className="flex justify-between"><span className="text-text-light">Nama Ibu</span><span className="font-medium text-text">{formData.namaIbu}</span></div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-sm text-blue-800">
                  <p><strong>Setelah mengirim formulir:</strong></p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Peserta akan dimasukkan ke grup WhatsApp</li>
                    <li>Info tes diberikan di dalam grup WhatsApp</li>
                    <li>Pendaftaran selama kuota masih tersedia</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button onClick={handlePrev} className="flex items-center gap-2 px-5 py-2.5 bg-white text-text font-semibold border border-border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <IconChevronLeft size={18} /> Sebelumnya
              </button>
            ) : (
              <button onClick={() => navigate('/')} className="flex items-center gap-2 px-5 py-2.5 bg-white text-text font-semibold border border-border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <IconArrowLeft size={18} /> Kembali
              </button>
            )}

            {step < 5 ? (
              <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors cursor-pointer">
                Selanjutnya <IconChevronRight size={18} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 cursor-pointer">
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Mengirim...
                  </>
                ) : (
                  <>Kirim Pendaftaran <IconCheck size={18} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <StickyMobileBottomBar />
    </>
  );
}
