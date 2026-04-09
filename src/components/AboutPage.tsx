import { useState } from 'react';
import { IconChevronUp, IconChevronRight, IconBuilding, IconShieldCheck, IconUsers, IconScale, IconFileText, IconMapPin, IconTarget, IconListCheck } from '@tabler/icons-react';

const accordionItems = [
  {
    title: 'Dewan Pembina',
    icon: IconShieldCheck,
    content: (
      <>
        <strong>H. Syarmana</strong><br />
        <strong>Ir. Herry Rechnaidi</strong><br />
        <strong>Ir. Kezaldo Firdaus</strong>
      </>
    ),
  },
  {
    title: 'Dewan Pengawas',
    icon: IconUsers,
    content: <strong>Najmudin Ahmad</strong>,
  },
  {
    title: 'Dewan Pengurus',
    icon: IconBuilding,
    content: (
      <>
        <strong>Ketua : Ir. Wibisono Hadiputro</strong><br />
        <strong>Wakil : M. Syamsul Arief</strong><br />
        <strong>Bendahara : Ir. Risanti Meirani</strong><br />
        <strong>Sekretaris : Dra. Eni Juhaeni</strong>
      </>
    ),
  },
  {
    title: 'Pengelola',
    icon: IconFileText,
    content: (
      <>
        <strong>Kepala Pesantren : M. Syamsul Arief</strong><br />
        <strong>Kepala Sekolah : Ir. Saptawati</strong>
      </>
    ),
  },
  {
    title: 'Legalitas',
    icon: IconScale,
    content: (
      <>
        <strong>Akte Notaris M. Yuhendar, SH No. 2/6 April 2001</strong><br />
        <strong>Akte Notaris M. Syafii, SH No 10 Tahun 2007</strong>
      </>
    ),
  },
  {
    title: 'Sekretariat Yayasan',
    icon: IconMapPin,
    content: (
      <>
        <strong>Pesantren Tashfia,</strong><br />
        <strong>Jl. Ratna 82, Jatiasih, Bekasi</strong><br />
        <strong>Telp. 021-84978071, 021-91765070</strong>
      </>
    ),
  },
];

const misiItems = [
  'Melakukan penelitian dan pengembangan model pendidikan integral yang efektif dan unggul, meliputi penelitian dan pengembangan kurikulum, metode dan managemen pendidikan.',
  'Melakukan kegiatan pendidikan dan pelatihan bagi pimpinan, guru dan staff sekolah.',
  'Mengembangkan pendekatan partisipatif dengan melibatkan seluruh warga sekolah dan stakeholder dalam perencanaan, pelaksanaan, dan evaluasi penyelenggaraan pendidikan.',
  'Melakukan komunikasi dan kerjasama dengan orangtua, masyarakat, instansi terkait, sekolah sejenis dan lembaga penelitian pengembangan pendidikan untuk meningkatkan kualitas.',
  'Menyelenggarakan system sekolah berasrama (boarding) untuk intensifikasi proses pendidikan dan penanaman nilai Islam.',
  'Memfokuskan seluruh sumberdaya dan proses pendidikan kepada perwujudan tujuan hakiki pendidikan Islam.',
  'Mendisain dan menetapkan system dan manhaj pendidikan tersendiri yang lebih berorientasi kepada system dan manhaj pendidikan Islam dengan berinterelasi secara taktis terhadap Sistem Pendidikan Nasional (SPN).',
  'Penyelenggaraan bersifat inklusif berbasis kaidah-kaidah Islam.',
  'Menyelenggarakan pembelajaran ekstrakurikuler secara efektif sesuai minat dan bakat sehingga setiap peserta didik tergali potensinya secara optimal.',
  'Menerapkan prinsip taat prioritas ilmu yang bermanfaat bagi keselamatan hidup di akherat (Aqidah, Akhlaq, ibadah, dll).',
  'Menerapkan system pembelajaran dengan metode yang efektif sehingga peserta didik dapat menguasai materi (mastery learning).',
  'Menerapkan system pembelajaran yang berbuah amal, tidak sekadar ilmu pengetahuan.',
  'Menerapkan life skill education sebagai bekal pengembangan diri.',
  'Menumbuhkan sikap peduli di lingkungan keluarga, sekolah dan masyarakat.',
  'Menerapkan pembiasaan dan pelatihan intensif dalam rangka pembentukan karakter dan kesadaran akan kebutuhan beribadah.',
  'Mengembangkan Program yang mendorong terwujudnya budaya literasi dan menyediakan sarana dan prasarana penunjang yang memadai.',
];

function AccordionItem({ item, isOpen, onToggle }: { item: typeof accordionItems[0]; isOpen: boolean; onToggle: () => void }) {
  const Icon = item.icon;
  return (
    <div className="border border-border rounded-xl overflow-hidden mb-3 transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-primary" />
          <span className="font-semibold text-text">{item.title}</span>
        </div>
        {isOpen ? <IconChevronUp size={20} className="text-text-light" /> : <IconChevronRight size={20} className="text-text-light" />}
      </button>
      {isOpen && (
        <div className="px-4 pt-4 pb-4 text-sm text-text-light bg-white leading-relaxed">
          {item.content}
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 0: true });

  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tentang Kami</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">Mengenal lebih dekat Yayasan Tashfia dan perjalanan kami dalam mendidik generasi muslimah terbaik.</p>
        </div>
      </section>

      {/* Yayasan Tashfia Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <IconBuilding size={24} className="text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-text">Yayasan Tashfia</h2>
            </div>
            <p className="text-text-light leading-relaxed mb-10">
              Badan Penyelenggara Pesantren Tashfia adalah Yayasan Islam Salsabila. Yayasan tersebut didirikan pada Tahun 2001. Dengan diterbitkannya Undang-Undang Yayasan, pada Tahun 2006 Yayasan Islam Salsabila mengubah namanya menjadi Yayasan Tashfia. Perubahan nama ini karena undang-undang tidak memperkenankan adanya nama yayasan yang sama di seluruh wilayah Indonesia.
            </p>

            {/* Toggle */}
            <div className="mb-16">
              {accordionItems.map((item, index) => (
                <AccordionItem
                  key={item.title}
                  item={item}
                  isOpen={!!openSections[index]}
                  onToggle={() => toggleSection(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visi Section */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-5xl mx-auto px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <IconTarget size={32} className="text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-text mb-6">Visi</h2>
            <p className="text-xl text-text leading-relaxed font-medium">
              Sekolah yang menghasilkan Muslimah yang 'Abidah, 'Afifah, Cinta Ilmu dan Terampil.
            </p>
          </div>
        </div>
      </section>

      {/* Misi Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <IconListCheck size={24} className="text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-text">Misi</h2>
            </div>
            <ul className="space-y-4">
              {misiItems.map((item, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-text-light leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
