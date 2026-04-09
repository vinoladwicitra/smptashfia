import { PENDIDIKAN_OPTIONS } from '../lib/ppdb';
import type { PPDBFormData } from '../lib/ppdb';

interface Props { formData: PPDBFormData; updateField: (f: string, v: string) => void; }

function RadioGroup({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PENDIDIKAN_OPTIONS.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(opt)} className={`px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-inset transition-colors ${value === opt ? 'bg-primary text-white ring-primary' : 'bg-white text-text-light ring-border hover:bg-gray-50'}`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function PPDBFormMother({ formData, updateField }: Props) {
  return (
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
        <RadioGroup value={formData.pendidikanIbu} onChange={(v) => updateField('pendidikanIbu', v)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Pekerjaan Ibu</label>
        <input type="text" value={formData.pekerjaanIbu} onChange={(e) => updateField('pekerjaanIbu', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" placeholder="Opsional" />
      </div>
    </div>
  );
}
