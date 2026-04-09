import { useState } from 'react';
import { IconChevronUp, IconChevronRight, IconBook, IconSchool, IconUsers, IconHeartHandshake, IconMedicalCross, IconBook2, IconBuilding, IconSparkles, IconListCheck } from '@tabler/icons-react';

const programItems = [
  {
    title: 'Program Unggulan',
    icon: IconSparkles,
    content: (
      <div className="space-y-6">
        <p className="text-text text-sm leading-relaxed">SMP Tashfia memiliki berbagai program unggulan yang dirancang untuk membentuk generasi muslimah yang berkualitas dalam ilmu agama dan umum.</p>
        
        {/* Mulazamah Al Qaidah */}
        <div className="bg-primary/5 rounded-xl p-5">
          <h4 className="font-bold text-text mb-2 flex items-center gap-2">
            <IconBook size={18} className="text-primary" />
            1. MULAZAMAH AL QAIDAH AS SAMERIYAH
          </h4>
          <p className="text-sm text-text-light leading-relaxed mb-3">Secara bahasa, mulazamah bisa diartikan menetapi dan tidak meninggalkan. Secara Istilah, metode pendidikan non-formal, dimana para santri menetapi dan tinggal bersama gurunya dalam rangka mempelajari suatu ilmu.</p>
          <p className="text-sm font-semibold text-text mb-2">Metode ini bertujuan:</p>
          <ul className="text-sm text-text-light space-y-1">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Siswa/i mampu melafazhkan huruf hijaiyyah dengan fasih.</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Siswa/i mampu mengeja kata & kalimat Arab dengan benar.</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Siswa/i mampu membaca kalimat Arab dengan benar.</li>
          </ul>
        </div>

        {/* Mulazamah Aqidatuna */}
        <div className="bg-primary/5 rounded-xl p-5">
          <h4 className="font-bold text-text mb-2 flex items-center gap-2">
            <IconBook size={18} className="text-primary" />
            2. MULAZAMAH AQIDATUNA
          </h4>
          <p className="text-sm text-text-light leading-relaxed mb-3">Metode pendidikan non-formal, dimana para santri menetapi dan tinggal bersama gurunya dalam rangka mempelajari suatu ilmu.</p>
          <p className="text-sm font-semibold text-text mb-2">Metode ini bertujuan:</p>
          <ul className="text-sm text-text-light space-y-1">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Siswa/i menghafal poin-poin terpenting dari aqidah ahlussunnah wal jama'ah dalam bahasa Arab</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Siswa/i memahami poin-poin terpenting dari aqidah ahlussunnah wal jama'ah</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Siswa/i menghafal ratusan mufrodat dan kalimat dalam bahasa Arab</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Siswa/i mampu menjawab pertanyaan seputar akidah, sesuai yang telah dihafal dan dipahami</li>
          </ul>
        </div>

        {/* Matrikulasi Matematika */}
        <div className="bg-primary/5 rounded-xl p-5">
          <h4 className="font-bold text-text mb-2 flex items-center gap-2">
            <IconBook size={18} className="text-primary" />
            3. MATRIKULASI MATEMATIKA
          </h4>
          <p className="text-sm text-text-light leading-relaxed mb-3">Program kegiatan belajar tambahan yang diberikan kepada siswa untuk menunjang pembelajaran matematika yang akan diberikan pada pembelajaran selanjutnya.</p>
          <p className="text-sm font-semibold text-text mb-2">Tujuan kegiatan ini:</p>
          <ul className="text-sm text-text-light space-y-1">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Untuk menyeragamkan pemahaman terhadap matematika dasar, karena input dari siswa yang masuk berbeda-beda, jadi diharapkan nanti ada keseragaman dalam pemahaman tentang matematika dasar.</li>
          </ul>
        </div>

        {/* Daurah Tahfidz */}
        <div className="bg-primary/5 rounded-xl p-5">
          <h4 className="font-bold text-text mb-2 flex items-center gap-2">
            <IconBook size={18} className="text-primary" />
            4. DAURAH TAHFIDZ
          </h4>
          <p className="text-sm text-text-light leading-relaxed mb-3">Kegiatan yang diselenggarakan oleh SMP TASHFIA BOARDING SCHOOL, berupa kegiatan daurah dengan fokus menghafal Alqur'an dibawah pengawasan dan bimbingan beberapa Ustadzah.</p>
          <p className="text-sm font-semibold text-text mb-2">Tujuan Kegiatan:</p>
          <ul className="text-sm text-text-light space-y-1">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Meningkatkan kualitas bacaan dan hafalan bagi peserta didik</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Memperbaiki cara membaca dan ilmu tajwid</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Camp Tahfizh dilaksanakan selama 2 bulan (Agustus – September)</li>
          </ul>
        </div>

        {/* Daurah Bahasa Arab */}
        <div className="bg-primary/5 rounded-xl p-5">
          <h4 className="font-bold text-text mb-2 flex items-center gap-2">
            <IconBook size={18} className="text-primary" />
            5. DAURAH BAHASA ARAB
          </h4>
          <p className="text-sm text-text-light leading-relaxed mb-3">Jenis program short course (kursus singkat), namun lebih intensif membahas kitab dan dibuat berjenjang (level).</p>
          <p className="text-sm font-semibold text-text mb-2">Kegiatan ini sebagai salah sarana untuk:</p>
          <ul className="text-sm text-text-light space-y-1">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Meningkatkan kemampuan berbahasa (mufrodat)</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Meningkatkan kemampuan berkomunikasi (hiwar)</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Meningkatkan ketrampilan dan mengembangkan wawasan (tsaqofah)</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: 'Kurikulum',
    icon: IconListCheck,
    content: (
      <div className="space-y-6">
        <p className="text-sm text-text-light leading-relaxed">SMP Tashfia telah mendapatkan status terakreditasi <strong>A</strong> dari Depdiknas dan saat ini telah menerapkan <strong>Kurikulum Merdeka</strong>.</p>
        
        {/* Kurikulum Merdeka */}
        <div className="bg-primary/5 rounded-xl p-5">
          <h4 className="font-bold text-text mb-3 flex items-center gap-2">
            <IconSchool size={18} className="text-primary" />
            Kurikulum Merdeka
          </h4>
          <p className="text-sm text-text-light leading-relaxed">Sebagai bagian dari upaya pemulihan pembelajaran, Kurikulum Merdeka dikembangkan sebagai kerangka kurikulum yang lebih fleksibel, sekaligus berfokus pada materi esensial dan pengembangan karakter dan kompetensi murid. Karakteristik utamanya:</p>
          <ul className="text-sm text-text-light space-y-1 mt-3">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Pembelajaran berbasis projek untuk pengembangan soft skills dan karakter sesuai profil pelajar Pancasila</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Fokus pada materi esensial sehingga ada waktu cukup untuk pembelajaran yang mendalam bagi kompetensi dasar seperti literasi dan numerasi</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Fleksibilitas bagi guru untuk melakukan pembelajaran yang terdiferensiasi</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Projek penguatan profil pelajar Pancasila untuk mengeksplorasi ilmu pengetahuan</li>
          </ul>
        </div>

        {/* Kurikulum Syar'i */}
        <div className="bg-primary/5 rounded-xl p-5">
          <h4 className="font-bold text-text mb-3 flex items-center gap-2">
            <IconBook2 size={18} className="text-primary" />
            Kurikulum Ilmu-ilmu Syar'i (Pendidikan Agama Islam)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="border border-border p-2 text-left text-text">No</th>
                  <th className="border border-border p-2 text-left text-text">Pelajaran</th>
                  <th className="border border-border p-2 text-left text-text">Pokok Bahasan</th>
                  <th className="border border-border p-2 text-left text-text">Jam</th>
                  <th className="border border-border p-2 text-left text-text">Rujukan</th>
                </tr>
              </thead>
              <tbody className="text-text-light">
                <tr><td className="border border-border p-2">1</td><td className="border border-border p-2">Hafalan Al Qur'an</td><td className="border border-border p-2">Juz 30, 29, 28, 27</td><td className="border border-border p-2">harian</td><td className="border border-border p-2">Al Qur'an</td></tr>
                <tr><td className="border border-border p-2">2</td><td className="border border-border p-2">Tafsir</td><td className="border border-border p-2">Tafsir Juz 'Amma</td><td className="border border-border p-2">30</td><td className="border border-border p-2">Tafsir Juz 'Amma (Dr. Sulaiman Al Asyqar)</td></tr>
                <tr><td className="border border-border p-2">3</td><td className="border border-border p-2">Tauhid / Aqidah</td><td className="border border-border p-2">Pengertian dan urgensi aqidah, macam tauhid, wala' dan baro'</td><td className="border border-border p-2">32</td><td className="border border-border p-2">Qaul Mufid, Kitab Tauhid</td></tr>
                <tr><td className="border border-border p-2">4</td><td className="border border-border p-2">Akhlaq</td><td className="border border-border p-2">Adab kepada Allah, kitab-Nya, Rasul-Nya, dan manusia</td><td className="border border-border p-2">30</td><td className="border border-border p-2">Syarah Riyadhus Shalihin</td></tr>
                <tr><td className="border border-border p-2">5</td><td className="border border-border p-2">Hadits</td><td className="border border-border p-2">Hadits tentang Aqidah, Ibadah, dan Mu'amalah</td><td className="border border-border p-2">17</td><td className="border border-border p-2">Riyadhus Shalihin</td></tr>
                <tr><td className="border border-border p-2">6</td><td className="border border-border p-2">Fiqh</td><td className="border border-border p-2">Taharah, Shalat, zakat, dan haji</td><td className="border border-border p-2">30</td><td className="border border-border p-2">Shahih Fiqh Sunnah, Al Wajiz</td></tr>
                <tr><td className="border border-border p-2">7</td><td className="border border-border p-2">Tsaqafah Islamiyah</td><td className="border border-border p-2">Keadaan jazirah Arab sebelum dan sesudah diutusnya Nabi</td><td className="border border-border p-2">30</td><td className="border border-border p-2">Ar Rahiqul Makhtum</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Kompetensi */}
        <div className="bg-primary/5 rounded-xl p-5">
          <h4 className="font-bold text-text mb-3">Kompetensi Lulusan</h4>
          <ul className="text-sm text-text-light space-y-1.5">
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Memahami aqidah Ahlus Sunnah wal Jama'ah</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Beribadah sesuai sunnah</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Hafal sekurang-kurangnya 4 juz</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Paham dan hafal sejumlah matan hadits</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Lulus Ujian Nasional</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Kompeten untuk melanjutkan ke SMA, MA, SMK</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: 'Kesiswaan',
    icon: IconUsers,
    content: <p className="text-sm text-text-light">Konten kesiswaan akan segera ditambahkan.</p>,
  },
  {
    title: 'BK (Bimbingan Konseling)',
    icon: IconHeartHandshake,
    content: <p className="text-sm text-text-light">Konten bimbingan konseling akan segera ditambahkan.</p>,
  },
  {
    title: 'UKS',
    icon: IconMedicalCross,
    content: <p className="text-sm text-text-light">Konten unit kesehatan siswa akan segera ditambahkan.</p>,
  },
  {
    title: 'PAI (Pendidikan Agama Islam)',
    icon: IconBook2,
    content: <p className="text-sm text-text-light">Konten pendidikan agama islam akan segera ditambahkan.</p>,
  },
  {
    title: 'Asrama',
    icon: IconBuilding,
    content: <p className="text-sm text-text-light">Konten asrama akan segera ditambahkan.</p>,
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: typeof programItems[0]; isOpen: boolean; onToggle: () => void }) {
  const Icon = item.icon;
  return (
    <div className="border border-border rounded-xl overflow-hidden mb-4 transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Icon size={22} className="text-primary" />
          <span className="font-semibold text-text">{item.title}</span>
        </div>
        {isOpen ? <IconChevronUp size={20} className="text-text-light" /> : <IconChevronRight size={20} className="text-text-light" />}
      </button>
      {isOpen && (
        <div className="px-4 pt-4 pb-6 bg-white leading-relaxed border-t border-border">
          {item.content}
        </div>
      )}
    </div>
  );
}

export default function ProgramPage() {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 0: true });

  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Program SMP Tashfia</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">Berbagai program unggulan dan kurikulum yang kami terapkan untuk mencetak generasi muslimah terbaik.</p>
        </div>
      </section>

      {/* Toggle Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-8">
          <div className="max-w-3xl mx-auto">
            {programItems.map((item, index) => (
              <AccordionItem
                key={item.title}
                item={item}
                isOpen={!!openSections[index]}
                onToggle={() => toggleSection(index)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
