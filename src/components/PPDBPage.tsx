import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { STEPS, initialFormData } from '../lib/ppdb';
import type { PPDBFormData } from '../lib/ppdb';
import PPDBAlur from './PPDBAlur';
import PPDBFormPayment from './PPDBFormPayment';
import PPDBFormStudent from './PPDBFormStudent';
import PPDBFormFather from './PPDBFormFather';
import PPDBFormMother from './PPDBFormMother';
import PPDBFormSubmit from './PPDBFormSubmit';
import { IconChevronRight, IconChevronLeft, IconArrowLeft, IconCheck } from '@tabler/icons-react';

const VALIDATION: Record<number, (d: PPDBFormData) => string | null> = {
  1: (d) => !d.email || !d.email.includes('@') ? 'Email Tidak Valid' : !d.buktiTransferUrl ? 'Bukti Transfer Diperlukan' : !d.pemilihanSekolah ? 'Pilih Sekolah' : null,
  2: (d) => (!d.namaLengkap || !d.namaPanggilan || !d.tempatLahir || !d.tanggalLahir || !d.alamat || !d.asalSekolah || !d.alamatSekolah || !d.noTelpOrtu1 || !d.noTelpOrtu2) ? 'Lengkapi Semua Data Siswi' : null,
  3: (d) => (!d.namaBapak || !d.tempatLahirBapak || !d.tanggalLahirBapak || !d.pendidikanBapak || !d.pekerjaanBapak) ? 'Lengkapi Semua Data Bapak' : null,
  4: (d) => (!d.namaIbu || !d.tempatLahirIbu || !d.tanggalLahirIbu || !d.pendidikanIbu) ? 'Lengkapi Semua Data Ibu' : null,
  5: (d) => !d.sumberInfo ? 'Pilih Sumber Informasi' : null,
};

const FORM_COMPONENTS = [null, PPDBFormPayment, PPDBFormStudent, PPDBFormFather, PPDBFormMother, PPDBFormSubmit];

export default function PPDBPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PPDBFormData>(initialFormData);

  const updateField = useCallback((f: string, v: string) => setFormData(p => ({ ...p, [f]: v })), []);

  const handleCopyRekening = useCallback(() => {
    navigator.clipboard.writeText('0016249074');
    toast({ type: 'success', title: 'Nomor Rekening Disalin!', description: '0016249074 (BNI a.n SMP Tashfia)' });
  }, [toast]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast({ type: 'error', title: 'File Terlalu Besar', description: 'Maksimal 10MB.' }); return; }
    const key = `bukti-transfer/${Date.now()}.${file.name.split('.').pop() || 'jpg'}`;
    const { error } = await supabase.storage.from('ppdb-documents').upload(key, file);
    if (error) { toast({ type: 'error', title: 'Gagal Upload', description: error.message }); return; }
    const { data: { publicUrl } } = supabase.storage.from('ppdb-documents').getPublicUrl(key);
    updateField('buktiTransferUrl', publicUrl);
    toast({ type: 'success', title: 'Upload Berhasil' });
  }, [updateField, toast]);

  const validate = useCallback((s: number) => {
    const err = VALIDATION[s]?.(formData);
    if (err) toast({ type: 'error', title: err });
    return !err;
  }, [formData, toast]);

  const handleNext = useCallback(() => { if (validate(step) && step < 5) setStep(s => s + 1); }, [step, validate]);
  const handlePrev = useCallback(() => { if (step > 1) { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } }, [step]);

  const handleSubmit = useCallback(async () => {
    if (!validate(step)) return;
    setSubmitting(true);
    const { error } = await supabase.from('ppdb_registrations').insert({
      email: formData.email, bukti_transfer_url: formData.buktiTransferUrl, pemilihan_sekolah: formData.pemilihanSekolah,
      nama_lengkap: formData.namaLengkap, nama_panggilan: formData.namaPanggilan, tempat_lahir: formData.tempatLahir,
      tanggal_lahir: formData.tanggalLahir, alamat: formData.alamat, asal_sekolah: formData.asalSekolah,
      alamat_sekolah: formData.alamatSekolah, no_telp_ortu_1: formData.noTelpOrtu1, no_telp_ortu_2: formData.noTelpOrtu2,
      nama_bapak: formData.namaBapak, tempat_lahir_bapak: formData.tempatLahirBapak, tanggal_lahir_bapak: formData.tanggalLahirBapak,
      pendidikan_bapak: formData.pendidikanBapak, pekerjaan_bapak: formData.pekerjaanBapak,
      nama_ibu: formData.namaIbu, tempat_lahir_ibu: formData.tempatLahirIbu, tanggal_lahir_ibu: formData.tanggalLahirIbu,
      pendidikan_ibu: formData.pendidikanIbu, pekerjaan_ibu: formData.pekerjaanIbu || '',
      sumber_info: formData.sumberInfo, sumber_info_lainnya: formData.sumberInfo === 'Lainnya' ? formData.sumberInfoLainnya : null,
    });
    setSubmitting(false);
    if (error) { toast({ type: 'error', title: 'Gagal Mengirim', description: error.message }); return; }
    toast({ type: 'success', title: 'Pendaftaran Berhasil!' });
    navigate('/');
  }, [formData, validate, toast, navigate]);

  const progress = (step / STEPS.length) * 100;
  const FormComponent = FORM_COMPONENTS[step] as any;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Cost Banners */}
      <section className="bg-gray-50 border-b border-border">
        <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-text mb-4">Rincian Biaya Tashfia Boarding</h3>
            <img src="https://file.smptashfia.sch.id/2025/08/1-2.png" alt="Biaya Boarding" className="mx-auto max-w-sm rounded-xl shadow-sm" loading="lazy" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-text mb-4">Rincian Biaya Tashfia Fullday</h3>
            <img src="https://file.smptashfia.sch.id/2025/08/2-2.png" alt="Biaya Fullday" className="mx-auto max-w-sm rounded-xl shadow-sm" loading="lazy" />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm"><span className="font-medium text-text">Step {step} dari {STEPS.length}</span><span className="text-text-light">{Math.round(progress)}%</span></div>
          <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} /></div>
          <div className="flex justify-between mt-4">
            {STEPS.map((s, i) => { const done = i + 1 < step; const cur = i + 1 === step; return (
              <div key={s.title} className={`flex flex-col items-center ${done || cur ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? 'bg-primary text-white' : cur ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-gray-200'}`}>{done ? <s.icon  size={14} /> : i + 1}</div>
                <span className="text-[10px] mt-1 hidden sm:block">{s.title}</span>
              </div>
            ); })}
          </div>
        </div>

        {/* Alur */}
        <PPDBAlur onCopyRekening={handleCopyRekening} />

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Formulir Pendaftaran — Step {step}</h3>
          {FormComponent && <FormComponent formData={formData} updateField={updateField} onFileUpload={handleFileUpload} />}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
            {step > 1
              ? <button onClick={handlePrev} className="flex items-center gap-2 px-5 py-2.5 bg-white text-text font-semibold border border-border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"><IconChevronLeft size={18} /> Sebelumnya</button>
              : <button onClick={() => navigate('/')} className="flex items-center gap-2 px-5 py-2.5 bg-white text-text font-semibold border border-border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"><IconArrowLeft size={18} /> Kembali</button>
            }
            {step < 5
              ? <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors cursor-pointer">Selanjutnya <IconChevronRight size={18} /></button>
              : <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 cursor-pointer">
                  {submitting
                    ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Mengirim...</>
                    : <>Kirim Pendaftaran <IconCheck size={18} /></>
                  }
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
