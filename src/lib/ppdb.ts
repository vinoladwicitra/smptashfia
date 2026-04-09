import {
  IconFileUpload, IconUser, IconUsers, IconCheck,
} from '@tabler/icons-react';

export const STEPS = [
  { title: 'Pembayaran', icon: IconFileUpload },
  { title: 'Data Siswi', icon: IconUser },
  { title: 'Data Bapak', icon: IconUsers },
  { title: 'Data Ibu', icon: IconUsers },
  { title: 'Selesai', icon: IconCheck },
];

export const PENDIDIKAN_OPTIONS = ['SD', 'SMP', 'SMA', 'S1/S2/S3', 'Lainnya'];
export const SUMBER_INFO_OPTIONS = [
  'Instagram', 'Facebook', 'Youtube', 'Broadcast Whatsapp',
  'Google', 'Iklan', 'Spanduk / Banner / Flyer',
  'Saudara / Keluarga / Kerabat', 'Teman / Tetangga',
  'Promosi dari Asal Sekolah (SD)', 'Lainnya',
];

export const ALUR_PENDAFARAN = [
  'Melakukan pembayaran sebesar:<br/>– <strong>Rp 300.001</strong> bagi yang memilih <strong>Tashfia Boarding</strong><br/>– <strong>Rp 300.002</strong> bagi yang memilih <strong>Tashfia Full Day School</strong><br/><span class="text-text-light text-xs">(angka 1 atau 2 di akhir nominal harap dicantumkan)</span>',
  'Transfer ke <strong>BNI 0016249074</strong> (Kode Bank: 009) a.n <strong>SMP Tashfia</strong>',
  'Konfirmasi pembayaran melalui WhatsApp ke nomor yang tersedia',
  'Mempersiapkan berkas dalam bentuk <strong>FOTO JELAS</strong> atau scan: Bukti pembayaran',
  'Melanjutkan proses pendaftaran dengan mengisi data-data di formulir dengan lengkap dan sebenar-benarnya',
  'Setelah mengisi formulir, peserta akan dimasukkan ke dalam <strong>grup WhatsApp</strong>. Info mengenai tes diberikan di dalam grup tersebut.',
];

export interface PPDBFormData {
  email: string; buktiTransferUrl: string; pemilihanSekolah: string;
  namaLengkap: string; namaPanggilan: string; tempatLahir: string; tanggalLahir: string;
  alamat: string; asalSekolah: string; alamatSekolah: string;
  noTelpOrtu1: string; noTelpOrtu2: string;
  namaBapak: string; tempatLahirBapak: string; tanggalLahirBapak: string;
  pendidikanBapak: string; pekerjaanBapak: string;
  namaIbu: string; tempatLahirIbu: string; tanggalLahirIbu: string;
  pendidikanIbu: string; pekerjaanIbu: string;
  sumberInfo: string; sumberInfoLainnya: string;
}

export const initialFormData: PPDBFormData = {
  email: '', buktiTransferUrl: '', pemilihanSekolah: '',
  namaLengkap: '', namaPanggilan: '', tempatLahir: '', tanggalLahir: '',
  alamat: '', asalSekolah: '', alamatSekolah: '',
  noTelpOrtu1: '', noTelpOrtu2: '',
  namaBapak: '', tempatLahirBapak: '', tanggalLahirBapak: '',
  pendidikanBapak: '', pekerjaanBapak: '',
  namaIbu: '', tempatLahirIbu: '', tanggalLahirIbu: '',
  pendidikanIbu: '', pekerjaanIbu: '',
  sumberInfo: '', sumberInfoLainnya: '',
};

const STORAGE_KEY = 'pmb-form-draft';

export function saveFormDraft(data: PPDBFormData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function loadFormDraft(): PPDBFormData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearFormDraft() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
