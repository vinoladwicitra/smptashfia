import { IconInfoCircle, IconBrandWhatsapp, IconCopy } from '@tabler/icons-react';
import { ALUR_PENDAFARAN } from '../lib/ppdb';

function AlurItem({ number, content, onClickCopy }: { number: number; content: string; onClickCopy?: () => void }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">{number}</span>
      <div className="text-text-light leading-relaxed flex-1">
        <span dangerouslySetInnerHTML={{ __html: content }} />
        {onClickCopy && (
          <button onClick={onClickCopy} className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-gray-100 text-text text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors align-middle">
            <IconCopy size={14} /> Salin Nomor Rekening
          </button>
        )}
      </div>
    </li>
  );
}

export default function PPDBAlur({ onCopyRekening }: { onCopyRekening: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-8">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <IconInfoCircle size={20} className="text-primary" />
        Alur Pendaftaran
      </h3>
      <ol className="space-y-4">
        {ALUR_PENDAFARAN.map((c, i) => (
          <AlurItem key={i} number={i + 1} content={c} onClickCopy={i === 1 ? onCopyRekening : undefined} />
        ))}
      </ol>
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border">
        <a href="https://wa.me/6285218450160" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
          <IconBrandWhatsapp size={18} /> Konfirmasi PMB
        </a>
        <a href="https://wa.me/628111881097" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
          <IconBrandWhatsapp size={18} /> Humas SMP Tashfia
        </a>
      </div>
    </div>
  );
}
