import { useRef } from 'react';
import { IconUpload, IconCheck, IconSchool } from '@tabler/icons-react';
import type { PPDBFormData } from '../lib/ppdb';

interface Props {
  formData: PPDBFormData;
  updateField: (f: string, v: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PPDBFormPayment({ formData, updateField, onFileUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Email <span className="text-red-500">*</span></label>
        <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" placeholder="email@contoh.com" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Bukti Transfer <span className="text-red-500">*</span></label>
        <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${formData.buktiTransferUrl ? 'border-green-400 bg-green-50' : 'border-border hover:border-primary hover:bg-primary/5'}`}>
          {formData.buktiTransferUrl ? (
            <div className="flex flex-col items-center gap-2">
              <IconCheck size={24} className="text-green-600" />
              <p className="text-sm font-medium text-green-700">Bukti transfer berhasil diunggah</p>
              <button onClick={(e) => { e.stopPropagation(); updateField('buktiTransferUrl', ''); }} className="text-xs text-red-500 hover:text-red-700 underline">Hapus & ganti</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <IconUpload size={24} className="text-text-light" />
              <p className="text-sm text-text-light">Klik untuk upload bukti transfer</p>
              <p className="text-xs text-text-light">JPG, PNG, PDF (maks 10MB)</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={onFileUpload} />
        </div>
      </div>
      <div className="bg-yellow-50 border-2 border-dashed border-red-300 rounded-lg p-3 text-xs space-y-1">
        <strong>Catatan:</strong><br />
        <strong>Rp 300.001</strong> untuk Tashfia Boarding School (Asrama)<br />
        <strong>Rp 300.002</strong> untuk Tashfia Full Day School (Tidak Asrama)
      </div>
      <fieldset>
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
  );
}
