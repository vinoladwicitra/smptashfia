import { useNavigate } from 'react-router-dom';
import { IconCalendar, IconArrowRight } from '@tabler/icons-react';

const blogPosts = [
  { id: 1, title: 'Komunitas Belajar Guru SMP Tashfia – November 2025', excerpt: 'Alhamdulillah, kegiatan Komunitas Belajar Guru SMP Tashfia bulan November 2025 telah terlaksana.', image: 'https://file.smptashfia.sch.id/2025/12/FEEDS-IG-TASHFIA-45-9-1-240x300.png', category: 'Kegiatan', date: '13 Des 2025' },
  { id: 2, title: 'Cyberbullying: Bahaya Terbesar Media Sosial', excerpt: 'Pada zaman digital sekarang media sosial tidak seaman yang kita bayangkan.', image: 'https://file.smptashfia.sch.id/2025/12/WhatsApp-Image-2025-12-12-at-11.13.19-1-232x300.jpeg', category: 'Edukasi', date: '12 Des 2025' },
  { id: 3, title: 'Cerdas Bermedia Sosial: Dampak Psikologis Cyberbullying', excerpt: 'Cyberbullying ialah salah satu bentuk perundungan dengan teknologi digital.', image: 'https://file.smptashfia.sch.id/2025/12/WhatsApp-Image-2025-12-12-at-11.13.19-246x300.jpeg', category: 'Edukasi', date: '12 Des 2025' },
  { id: 4, title: 'Serangan Tanpa Wajah SLN 2025', excerpt: 'Hati-hati dengan setiap ketikan agar tidak tergelincir menjadi Cyberbullying.', image: 'https://file.smptashfia.sch.id/2025/12/1-300x150.png', category: 'Literasi Digital', date: '12 Des 2025' },
  { id: 5, title: 'Netizen Asik Bukan Toxic SLN 2025', excerpt: 'Perundungan yang dilakukan menggunakan teknologi digital melalui berbagai platform.', image: 'https://file.smptashfia.sch.id/2025/12/WhatsApp-Image-2025-12-12-at-08.07.33-2-300x300.jpeg', category: 'Literasi Digital', date: '12 Des 2025' },
];

const categoryStyles: Record<string, string> = {
  'Kegiatan': 'bg-green-100 text-green-700 ring-green-600/20',
  'Edukasi': 'bg-blue-100 text-blue-700 ring-blue-600/20',
  'Literasi Digital': 'bg-purple-100 text-purple-700 ring-purple-600/20',
  'Akademik': 'bg-amber-100 text-amber-700 ring-amber-600/20',
};

export default function BlogSection() {
  const navigate = useNavigate();
  const display = blogPosts.slice(0, 5);

  return (
    <section className="py-8 bg-background lg:py-16 lg:bg-white">
      <div className="max-w-5xl mx-auto px-8">
        {/* Title - Mobile */}
        <h2 className="text-[22px] font-bold text-text mb-4 lg:hidden">Artikel & Berita</h2>

        {/* Title - Desktop */}
        <div className="hidden lg:block text-center mb-12">
          <h2 className="text-[40px] leading-[50px] font-medium text-text mb-4">Artikel & Berita</h2>
          <p className="text-text-light max-w-xl mx-auto">Informasi terkini, kegiatan, dan edukasi dari SMP Tashfia.</p>
        </div>

        {/* Desktop: Square Bento Grid (1 large + 4 small) */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-4 lg:mb-10">
          {/* Hero - Square 2x2 */}
          <div
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/blog/'); }}
            className="col-span-2 relative rounded-xl overflow-hidden shadow-md group cursor-pointer aspect-square"
          >
            <img src={display[0].image} alt={display[0].title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className={`inline-flex px-2.5 py-0.5 font-medium text-xs rounded-full ring-1 ring-inset mb-2 ${categoryStyles[display[0].category] || 'bg-white/20 text-white ring-white/30'}`}>{display[0].category}</span>
              <h3 className="text-xl font-bold text-white mb-3 leading-tight line-clamp-3">{display[0].title}</h3>
              <div className="flex items-center gap-3 text-xs text-white/70 mb-3">
                <span className="flex items-center gap-1"><IconCalendar size={13} />{display[0].date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                Baca Selengkapnya <IconArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* 4 Small Square Tiles */}
          {display.slice(1).map((post) => (
            <div key={post.id} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/blog/'); }} className="relative rounded-xl overflow-hidden shadow-md group cursor-pointer aspect-square">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className={`inline-flex px-2 py-0.5 font-medium text-[10px] rounded-full ring-1 ring-inset mb-1.5 ${categoryStyles[post.category] || 'bg-white/20 text-white ring-white/30'}`}>{post.category}</span>
                <h3 className="text-sm font-bold text-white mb-1 leading-tight line-clamp-2">{post.title}</h3>
                <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium group-hover:text-white transition-colors">
                  Baca <IconArrowRight size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Compact Horizontal Cards */}
        <div className="lg:hidden space-y-3 mb-5">
          {blogPosts.slice(0, 5).map((post) => (
            <div key={post.id} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/blog/'); }} className="flex h-28 bg-white rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
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
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="hidden lg:flex lg:justify-center">
          <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/blog/'); }} className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors cursor-pointer">
            Lihat Semua Artikel <IconArrowRight size={18} />
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
