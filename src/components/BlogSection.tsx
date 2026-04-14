import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconCalendar, IconArrowRight } from '@tabler/icons-react';

const API_BASE = '/api';

const categoryStyles: Record<string, string> = {
  'Kegiatan': 'bg-green-100 text-green-700 ring-green-600/20',
  'Kegiatan Sekolah': 'bg-green-100 text-green-700 ring-green-600/20',
  'Edukasi': 'bg-blue-100 text-blue-700 ring-blue-600/20',
  'Literasi Digital': 'bg-purple-100 text-purple-700 ring-purple-600/20',
  'Akademik': 'bg-amber-100 text-amber-700 ring-amber-600/20',
  'Pengumuman': 'bg-rose-100 text-rose-700 ring-rose-600/20',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  article_category_mappings?: Array<{
    article_categories?: { name: string; slug: string };
  }>;
}

export default function BlogSection() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    date: string;
    category: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE}/articles/latest?limit=5`);
        const data = await res.json();
        if (data.success && data.data) {
          const formatted = data.data.map((a: Article) => ({
            ...a,
            category: a.article_category_mappings?.[0]?.article_categories?.name || 'Umum',
            date: formatDate(a.published_at),
          }));
          setPosts(formatted);
        }
      } catch (err) {
        console.error('Error fetching latest articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (posts.length === 0 && !loading) return null;

  const display = posts.slice(0, 5);

  return (
    <section className="py-8 bg-background lg:py-16 lg:bg-white">
      <div className="max-w-5xl mx-auto px-8">
        {/* Title */}
        <h2 className="text-[22px] font-bold text-text mb-4 lg:hidden">Artikel & Berita</h2>
        <div className="hidden lg:block text-center mb-12">
          <h2 className="text-[40px] leading-[50px] font-medium text-text mb-4">Artikel & Berita</h2>
          <p className="text-text-light max-w-xl mx-auto">Informasi terkini, kegiatan, dan edukasi dari SMP Tashfia.</p>
        </div>

        {/* Desktop Grid */}
        {loading ? (
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-4 lg:mb-10">
            <div className="col-span-2 row-span-2 rounded-xl bg-gray-200 animate-pulse aspect-square" />
            {[1, 2, 3, 4].map((i) => <div key={i} className="rounded-xl bg-gray-200 animate-pulse aspect-square" />)}
          </div>
        ) : display.length > 0 && (
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-4 lg:mb-10">
            <div onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate(`/blog/${display[0].slug}`); }} className="col-span-2 row-span-2 relative rounded-xl overflow-hidden shadow-md group cursor-pointer aspect-square">
              {display[0].featured_image ? <img src={display[0].featured_image} alt={display[0].title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" /> : <div className="w-full h-full bg-primary/10" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className={`inline-flex px-2.5 py-0.5 font-medium text-xs rounded-full ring-1 ring-inset mb-2 cursor-pointer ${categoryStyles[display[0].category] || 'bg-white/20 text-white ring-white/30'}`}>{display[0].category}</span>
                <h3 className="text-xl font-bold text-white mb-3 leading-tight line-clamp-3 cursor-pointer">{display[0].title}</h3>
                <div className="flex items-center gap-3 text-xs text-white/70 mb-3"><span className="flex items-center gap-1 cursor-pointer"><IconCalendar size={13} />{display[0].date}</span></div>
                <div className="flex items-center gap-1.5 text-white/80 text-sm font-medium group-hover:text-white transition-colors cursor-pointer">Baca Selengkapnya <IconArrowRight size={14} /></div>
              </div>
            </div>
            {display.slice(1).map((post: any) => (
              <div key={post.id} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate(`/blog/${post.slug}`); }} className="relative rounded-xl overflow-hidden shadow-md group cursor-pointer aspect-square">
                {post.featured_image ? <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" /> : <div className="w-full h-full bg-primary/10" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className={`inline-flex px-2 py-0.5 font-medium text-[10px] rounded-full ring-1 ring-inset mb-1.5 cursor-pointer ${categoryStyles[post.category] || 'bg-white/20 text-white ring-white/30'}`}>{post.category}</span>
                  <h3 className="text-sm font-bold text-white mb-1 leading-tight line-clamp-2 cursor-pointer">{post.title}</h3>
                  <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium group-hover:text-white transition-colors cursor-pointer">Baca <IconArrowRight size={12} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Cards */}
        {loading ? (
          <div className="lg:hidden space-y-3 mb-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex h-28 bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="flex-shrink-0 w-28 h-28 bg-gray-200" />
                <div className="flex-1 h-28 p-2.5 flex flex-col gap-1.5">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="flex items-center justify-between mt-auto pt-1"><div className="h-3 bg-gray-200 rounded w-12" /><div className="h-3 bg-gray-200 rounded w-16" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : display.length > 0 && (
          <div className="lg:hidden space-y-3 mb-5">
            {display.map((post: any) => (
              <div key={post.id} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate(`/blog/${post.slug}`); }} className="flex h-28 bg-white rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
                <div className="flex-shrink-0 w-28 h-28 cursor-pointer">
                  {post.featured_image ? <img src={post.featured_image} alt={post.title} loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/10" />}
                </div>
                <div className="flex-1 h-28 p-2.5 flex flex-col overflow-hidden">
                  <div>
                    <div className="mb-1"><span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded cursor-pointer ${categoryStyles[post.category] || 'bg-gray-100 text-gray-700'}`}>{post.category}</span></div>
                    <h3 className="text-xs font-semibold text-text leading-tight line-clamp-2 mb-0.5 cursor-pointer">{post.title}</h3>
                    {post.excerpt && <p className="text-[10px] text-text-light line-clamp-1 cursor-pointer">{post.excerpt}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-1"><span className="flex items-center gap-1 text-[9px] text-text-light cursor-pointer"><IconCalendar size={10} />{post.date}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {display.length > 0 && (
          <>
            <div className="hidden lg:flex lg:justify-center">
              <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/blog/'); }} className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors cursor-pointer">Lihat Semua Artikel <IconArrowRight size={18} /></button>
            </div>
            <div className="lg:hidden">
              <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/blog/'); }} className="block w-full py-3 text-center text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors cursor-pointer">Lihat Semua Artikel</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
