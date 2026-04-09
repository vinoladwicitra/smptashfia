import type { PPDBFormData } from '../lib/ppdb';

interface Props { formData: PPDBFormData; updateField: (f: string, v: string) => void; }

export default function PPDBFormStudent({ formData, updateField }: Props) {
  const fields = [
    { key: 'namaLengkap', label: 'Nama Lengkap Calon Siswi', type: 'text', col: 'sm:col-span-2' },
    { key: 'namaPanggilan', label: 'Nama Panggilan', type: 'text', col: '' },
    { key: 'tempatLahir', label: 'Tempat Lahir', type: 'text', col: '' },
    { key: 'tanggalLahir', label: 'Tanggal Lahir', type: 'date', col: '' },
    { key: 'asalSekolah', label: 'Asal Sekolah', type: 'text', col: '' },
    { key: 'alamat', label: 'Alamat/Tempat Tinggal', type: 'textarea', col: 'sm:col-span-2' },
    { key: 'alamatSekolah', label: 'Alamat Sekolah', type: 'textarea', col: 'sm:col-span-2' },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.key} className={f.col}>
          <label className="block text-sm font-medium text-text mb-1.5">{f.label} <span className="text-red-500">*</span></label>
          {f.type === 'textarea' ? (
            <textarea value={(formData as any)[f.key]} onChange={(e) => updateField(f.key, e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" rows={3} required />
          ) : (
            <input type={f.type} value={(formData as any)[f.key]} onChange={(e) => updateField(f.key, e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
          )}
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">No. Telp Ortu/Wali I <span className="text-red-500">*</span> <span className="text-text-light text-xs">(Utama)</span></label>
        <input type="tel" value={formData.noTelpOrtu1} onChange={(e) => updateField('noTelpOrtu1', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" placeholder="08xxxxxxxxxx" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">No. Telp Ortu/Wali II <span className="text-red-500">*</span> <span className="text-text-light text-xs">(Alternatif)</span></label>
        <input type="tel" value={formData.noTelpOrtu2} onChange={(e) => updateField('noTelpOrtu2', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" placeholder="08xxxxxxxxxx" required />
      </div>
    </div>
  );
}
