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

export default function PPDBFormFather({ formData, updateField }: Props) {
  return (
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
        <RadioGroup value={formData.pendidikanBapak} onChange={(v) => updateField('pendidikanBapak', v)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Pekerjaan Bapak <span className="text-red-500">*</span></label>
        <input type="text" value={formData.pekerjaanBapak} onChange={(e) => updateField('pekerjaanBapak', e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors" required />
      </div>
    </div>
  );
}
