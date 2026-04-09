import { useState } from 'react';
import { IconInfoCircle, IconBrandWhatsapp, IconCopy, IconCheck } from '@tabler/icons-react';
import { ALUR_PENDAFARAN } from '../lib/ppdb';

export default function PPDBAlur() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('0016249074');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-8">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <IconInfoCircle size={20} className="text-primary" />
        Alur Pendaftaran
      </h3>
      <ol className="space-y-4">
        {/* Items 1-2 */}
        {ALUR_PENDAFARAN.slice(0, 2).map((c, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
            <div className="text-text-light leading-relaxed flex-1"><span dangerouslySetInnerHTML={{ __html: c }} /></div>
          </li>
        ))}
      </ol>

      {/* Copy Button between 2 and 3 */}
      <div className="ml-9 mt-3 mb-4">
        <button onClick={handleCopy} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-text hover:bg-gray-200'}`}>
          {copied ? <><IconCheck size={16} /> Berhasil Disalin</> : <><IconCopy size={16} /> Salin Nomor Rekening</>}
        </button>
      </div>

      {/* Items 3-6 */}
      <ol className="space-y-4" start={3}>
        {ALUR_PENDAFARAN.slice(2).map((c, i) => (
          <li key={i + 2} className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">{i + 3}</span>
            <div className="text-text-light leading-relaxed flex-1"><span dangerouslySetInnerHTML={{ __html: c }} /></div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border">
        <a href="https://wa.me/6285218450160" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors cursor-pointer">
          <IconBrandWhatsapp size={18} /> Konfirmasi PMB
        </a>
        <a href="https://wa.me/628111881097" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors cursor-pointer">
          <IconBrandWhatsapp size={18} /> Humas SMP Tashfia
        </a>
      </div>
    </div>
  );
}
