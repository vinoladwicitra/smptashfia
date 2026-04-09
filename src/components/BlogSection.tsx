import { IconCalendar, IconUser } from '@tabler/icons-react';

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

const categoryColors: Record<string, string> = {
  'Kegiatan': 'bg-green-100 text-green-700',
  'Edukasi': 'bg-blue-100 text-blue-700',
  'Literasi Digital': 'bg-purple-100 text-purple-700',
  'Akademik': 'bg-amber-100 text-amber-700',
};

export default function BlogSection() {
  const displayPosts = blogPosts.slice(0, 10);

  return (
    <section className="py-8 bg-background">
      <div className="max-w-5xl mx-auto px-8">
        {/* Section Title */}
        <h2 className="text-[22px] font-bold text-text mb-4 lg:text-[40px] lg:leading-[50px] lg:font-medium lg:text-center lg:mb-12">Artikel & Berita</h2>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8 lg:mb-12">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <a href={post.href} className="block overflow-hidden">
                <img src={post.image} alt={post.title} loading="lazy" className="w-full h-60 object-cover hover:scale-105 transition-transform duration-300" />
              </a>
              <div className="p-5">
                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'} mb-2`}>{post.category}</span>
                <h3 className="text-lg font-semibold leading-tight mb-3"><a href={post.href} className="hover:text-primary transition-colors">{post.title}</a></h3>
                <p className="text-sm leading-relaxed text-text-light mb-4 line-clamp-3">{post.excerpt}</p>
                <a href={post.href} className="inline-block text-sm font-semibold text-primary hover:text-primary-dark transition-colors">Baca Selengkapnya »</a>
                <div className="flex justify-between items-center pt-3 border-t border-border text-xs text-text-light">
                  <span>smptashfia</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile: Compact Horizontal Cards */}
        <div className="lg:hidden space-y-3 mb-5">
          {displayPosts.map((post) => (
            <a key={post.id} href={post.href} className="flex h-28 bg-white rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform">
              {/* Image Left - Square */}
              <div className="flex-shrink-0 w-28 h-28">
                <img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover" />
              </div>
              {/* Content Right */}
              <div className="flex-1 h-28 p-2.5 flex flex-col overflow-hidden">
                <div>
                  {/* Badge + Category */}
                  <div className="mb-1">
                    <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>{post.category}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-text leading-tight line-clamp-2 mb-0.5">{post.title}</h3>
                  <p className="text-[10px] text-text-light line-clamp-1">{post.excerpt}</p>
                </div>
                {/* Date Left + Author Right */}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <span className="flex items-center gap-1 text-[9px] text-text-light">
                    <IconCalendar size={10} />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-text-light">
                    <IconUser size={10} />
                    {post.author}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Desktop: View All Button */}
        <div className="hidden lg:flex lg:justify-center lg:mt-10">
          <a href="/blog/" className="inline-flex items-center px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm cursor-pointer">
            Lihat Semua Artikel →
          </a>
        </div>

        {/* View All Button (Mobile) */}
        <div className="lg:hidden">
          <a href="/blog/" className="block w-full py-3 text-center text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors cursor-pointer">
            Lihat Semua Artikel
          </a>
        </div>

        {/* Desktop Pagination - Removed */}
        <div className="hidden">
          <button className="px-4 py-2.5 text-sm font-medium text-text bg-white border border-border rounded hover:bg-primary hover:text-white hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            « Prev
          </button>
          <button className="px-4 py-2.5 text-sm font-medium text-white bg-primary border border-primary rounded transition-colors">1</button>
          <button className="px-4 py-2.5 text-sm font-medium text-text bg-white border border-border rounded hover:bg-primary hover:text-white hover:border-primary transition-colors">2</button>
          <button className="px-4 py-2.5 text-sm font-medium text-text bg-white border border-border rounded hover:bg-primary hover:text-white hover:border-primary transition-colors">3</button>
          <button className="px-4 py-2.5 text-sm font-medium text-text bg-white border border-border rounded hover:bg-primary hover:text-white hover:border-primary transition-colors">Next »</button>
        </div>
      </div>
    </section>
  );
}
