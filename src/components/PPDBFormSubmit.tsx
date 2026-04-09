import { IconCheck } from '@tabler/icons-react';
import { SUMBER_INFO_OPTIONS } from '../lib/ppdb';
import type { PPDBFormData } from '../lib/ppdb';

interface Props { formData: PPDBFormData; updateField: (f: string, v: string) => void; }

export default function PPDBFormSubmit({ formData, updateField }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-text mb-3">Info SMP Tashfia Darimana <span className="text-red-500">*</span></h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUMBER_INFO_OPTIONS.map((opt) => (
            <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${formData.sumberInfo === opt ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
              <input type="radio" name="sumberInfo" value={opt} checked={formData.sumberInfo === opt} onChange={(e) => updateField('sumberInfo', e.target.value)} className="w-4 h-4 text-primary" />
              <span className="text-sm text-text">{opt}</span>
            </label>
          ))}
        </div>
        {formData.sumberInfo === 'Lainnya' && (
          <input type="text" value={formData.sumberInfoLainnya} onChange={(e) => updateField('sumberInfoLainnya', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors mt-3" placeholder="Sebutkan..." />
        )}
      </div>
      <div className="bg-primary/5 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-text mb-3 flex items-center gap-2"><IconCheck size={16} className="text-green-600" /> Ringkasan Pendaftaran</h4>
        <div className="space-y-2 text-sm">
          {[['Email', formData.email], ['Sekolah', formData.pemilihanSekolah], ['Nama Siswi', formData.namaLengkap], ['No. Ortu 1', formData.noTelpOrtu1], ['Nama Bapak', formData.namaBapak], ['Nama Ibu', formData.namaIbu]].map(([l, v]) => (
            <div key={l} className="flex justify-between"><span className="text-text-light">{l}</span><span className="font-medium text-text">{v}</span></div>
          ))}
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p><strong>Setelah mengirim formulir:</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Peserta akan dimasukkan ke grup WhatsApp</li>
          <li>Info tes diberikan di dalam grup WhatsApp</li>
          <li>Pendaftaran selama kuota masih tersedia</li>
        </ul>
      </div>
    </div>
  );
}
