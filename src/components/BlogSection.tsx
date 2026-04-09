import { useNavigate } from 'react-router-dom';
import { IconCalendar, IconUser, IconClock, IconArrowRight } from '@tabler/icons-react';

const blogPosts = [
  {
    id: 1,
    title: 'Komunitas Belajar Guru SMP Tashfia – November 2025',
    excerpt: 'Alhamdulillah, kegiatan Komunitas Belajar Guru SMP Tashfia bulan November 2025 telah terlaksana dengan lancar.',
    image: 'https://file.smptashfia.sch.id/2025/12/FEEDS-IG-TASHFIA-45-9-1-240x300.png',
    category: 'Kegiatan',
    date: '13 Des 2025',
    author: 'smptashfia',
    href: '/komunitas-belajar-guru-smp-tashfia-november-2025/',
  },
  {
    id: 2,
    title: 'Cyberbullying: Bahaya Terbesar Media Sosial',
    excerpt: 'Pada zaman digital sekarang media sosial tidak seaman yang kita bayangkan, terutama di kalangan remaja.',
    image: 'https://file.smptashfia.sch.id/2025/12/WhatsApp-Image-2025-12-12-at-11.13.19-1-232x300.jpeg',
    category: 'Edukasi',
    date: '12 Des 2025',
    author: 'smptashfia',
    href: '/cyberbullying-bahaya-terbesar-media-sosial/',
  },
  {
    id: 3,
    title: 'Cerdas Bermedia Sosial: Memahami Dampak Psikologis Cyberbullying',
    excerpt: 'Cyberbullying ialah salah satu bentuk perundungan dengan menggunakan teknologi digital.',
    image: 'https://file.smptashfia.sch.id/2025/12/WhatsApp-Image-2025-12-12-at-11.13.19-246x300.jpeg',
    category: 'Edukasi',
    date: '12 Des 2025',
    author: 'smptashfia',
    href: '/cerdas-bermedia-sosial-memahami-dampakpsikologis-cyberbullying-pada-remaja-sln-2025/',
  },
  {
    id: 4,
    title: 'Serangan Tanpa Wajah SLN 2025',
    excerpt: 'Hati-hati dengan setiap ketikan yang dituliskan agar tidak tergelincir menjadi Cyberbullying.',
    image: 'https://file.smptashfia.sch.id/2025/12/1-300x150.png',
    category: 'Literasi Digital',
    date: '12 Des 2025',
    author: 'smptashfia',
    href: '/serangan-tanpa-wajah-sln-2025/',
  },
  {
    id: 5,
    title: 'Netizen Asik Bukan Toxic SLN 2025',
    excerpt: 'Perundungan yang dilakukan menggunakan teknologi digital melalui berbagai platform seperti media sosial.',
    image: 'https://file.smptashfia.sch.id/2025/12/WhatsApp-Image-2025-12-12-at-08.07.33-2-300x300.jpeg',
    category: 'Literasi Digital',
    date: '12 Des 2025',
    author: 'smptashfia',
    href: '/netizen-asik-bukan-toxic-sln-2025/',
  },
  {
    id: 6,
    title: 'Dokumentasi Asesmen Sumatif Akhir Semester',
    excerpt: 'Alhamdulillah, siswi SMP Tashfia telah menyelesaikan rangkaian kegiatan ASAS dengan baik.',
    image: 'https://file.smptashfia.sch.id/2025/12/FEEDS-IG-TASHFIA-45-9-240x300.png',
    category: 'Akademik',
    date: '11 Des 2025',
    author: 'smptashfia',
    href: '/dokumentasi-asesmen-sumatif-akhir-semester/',
  },
];

const categoryStyles: Record<string, string> = {
  'Kegiatan': 'bg-green-100 text-green-700 ring-green-600/20',
  'Edukasi': 'bg-blue-100 text-blue-700 ring-blue-600/20',
  'Literasi Digital': 'bg-purple-100 text-purple-700 ring-purple-600/20',
  'Akademik': 'bg-amber-100 text-amber-700 ring-amber-600/20',
};

export default function BlogSection() {
  const navigate = useNavigate();
  const displayPosts = blogPosts.slice(0, 10);
  const first = blogPosts[0];
  const rest = blogPosts.slice(1, 4);

  return (
    <section className="py-8 bg-background">
      <div className="max-w-5xl mx-auto px-8">
        {/* Section Title - Desktop */}
        <div className="hidden lg:block text-center mb-12">
          <h2 className="text-[40px] leading-[50px] font-medium text-text mb-4">Artikel & Berita</h2>
          <p className="text-text-light max-w-xl mx-auto">Informasi terkini, kegiatan, dan edukasi dari SMP Tashfia.</p>
        </div>

        {/* Section Title - Mobile */}
        <h2 className="text-[22px] font-bold text-text mb-4 lg:hidden">Artikel & Berita</h2>

        {/* Desktop: Featured + Grid */}
        {first && (
          <div className="hidden lg:block">
            {/* Featured Post */}
            <div onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/blog/'); }} className="group cursor-pointer mb-10">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className="grid grid-cols-2 gap-0">
                  <div className="relative overflow-hidden">
                    <img src={first.image} alt={first.title} loading="lazy" className="w-full h-full min-h-[280px] object-cover group-hover:scale-[1.02] transition-transform duration-300 rounded-l-2xl" />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span className={`inline-flex px-3 py-1 font-medium text-xs rounded-full ring-1 ring-inset ${categoryStyles[first.category] || 'bg-gray-100 text-gray-700 ring-gray-600/20'} mb-4 w-fit`}>{first.category}</span>
                    <h3 className="text-2xl font-bold text-text mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">{first.title}</h3>
                    <p className="text-text-light line-clamp-3 mb-5">{first.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-text-light mb-5">
                      <span className="flex items-center gap-1"><IconCalendar size={14} />{first.date}</span>
                      <span className="flex items-center gap-1"><IconUser size={14} />{first.author}</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                      Baca Selengkapnya <IconArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Grid */}
            {rest.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-text mb-5 flex items-center gap-2"><IconClock size={18} className="text-primary" /> Terbaru Lainnya</h3>
                <div className="grid grid-cols-3 gap-6 mb-10">
                  {rest.map((post) => (
                    <div key={post.id} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/blog/'); }} className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer">
                      <div className="relative overflow-hidden">
                        <img src={post.image} alt={post.title} loading="lazy" className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                      </div>
                      <div className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 font-medium text-xs rounded-full ring-1 ring-inset ${categoryStyles[post.category] || 'bg-gray-100 text-gray-700 ring-gray-600/20'} mb-2`}>{post.category}</span>
                        <h4 className="text-sm font-semibold text-text mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-text-light">
                          <span className="flex items-center gap-1"><IconCalendar size={12} />{post.date}</span>
                          <span className="flex items-center gap-1"><IconUser size={12} />{post.author}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Mobile: Compact Horizontal Cards */}
        <div className="lg:hidden space-y-3 mb-5">
          {displayPosts.map((post) => (
            <a key={post.id} href={post.href} className="flex h-28 bg-white rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform">
              <div className="flex-shrink-0 w-28 h-28">
                <img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 h-28 p-2.5 flex flex-col overflow-hidden">
                <div>
                  <div className="mb-1">
                    <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${categoryStyles[post.category] || 'bg-gray-100 text-gray-700'}`}>{post.category}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-text leading-tight line-clamp-2 mb-0.5">{post.title}</h3>
                  <p className="text-[10px] text-text-light line-clamp-1">{post.excerpt}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-1">
                  <span className="flex items-center gap-1 text-[9px] text-text-light"><IconCalendar size={10} />{post.date}</span>
                  <span className="flex items-center gap-1 text-[9px] text-text-light"><IconUser size={10} />{post.author}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View All Button */}
        <div className="hidden lg:flex lg:justify-center lg:mt-10">
          <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/blog/'); }} className="inline-flex items-center px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm cursor-pointer">
            Lihat Semua Artikel →
          </button>
        </div>
        <div className="lg:hidden">
          <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/blog/'); }} className="block w-full py-3 text-center text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors cursor-pointer">
            Lihat Semua Artikel
          </button>
        </div>
      </div>
    </section>
  );
}
