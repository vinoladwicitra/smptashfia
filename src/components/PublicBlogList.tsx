import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Header from './Header';
import MobileHeader from './MobileHeader';
import Footer from './Footer';
import StickyMobileBottomBar from './StickyMobileBottomBar';
import { IconCalendar, IconEye, IconArrowRight, IconSearch } from '@tabler/icons-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string | null;
  views: number;
  article_categories?: { name: string; slug: string }[];
}

const badgeColors: Record<string, string> = {
  'kegiatan': 'bg-green-100 text-green-700 ring-green-600/20',
  'edukasi': 'bg-blue-100 text-blue-700 ring-blue-600/20',
  'literasi-digital': 'bg-purple-100 text-purple-700 ring-purple-600/20',
  'akademik': 'bg-amber-100 text-amber-700 ring-amber-600/20',
  'pengumuman': 'bg-rose-100 text-rose-700 ring-rose-600/20',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}rb`;
  return n.toString();
}

export default function PublicBlogList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'all';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(urlCategory);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  // Sync URL param with active category
  useEffect(() => {
    setActiveCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('article_categories').select('name, slug').order('name');
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      let query = supabase
        .from('articles')
        .select(`
          id, title, slug, excerpt, featured_image, published_at, views,
          article_category_mappings (
            article_categories (name, slug)
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (activeCategory !== 'all') {
        query = query.contains('article_category_mappings', [{ article_categories: { slug: activeCategory } }]);
      }

      const { data, error } = await query;

      if (!error && data) {
        const formatted = data.map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          featured_image: a.featured_image,
          published_at: a.published_at,
          views: a.views || 0,
          article_categories: a.article_category_mappings?.map((m: any) => m.article_categories).filter(Boolean) || [],
        }));
        setArticles(formatted);
      }
      setLoading(false);
    };
    fetchArticles();
  }, [activeCategory]);

  // Featured article (first one)
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <>
      <Header />
      <MobileHeader />
      <main className="min-h-screen bg-background pb-20 lg:pb-0">
        {/* Hero Header */}
        <section className="bg-primary/5 border-b border-border">
          <div className="max-w-6xl mx-auto px-5 py-10 lg:py-16 text-center">
            <h1 className="text-3xl lg:text-5xl font-bold text-text mb-3">Blog & Artikel</h1>
            <p className="text-text-light max-w-xl mx-auto">Kumpulan berita, tips, dan informasi terkini dari SMP Tashfia.</p>
          </div>
        </section>

        {/* Category Filter */}
        <div className="sticky top-0 lg:top-[120px] z-30 bg-white/80 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-5 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => { setActiveCategory('all'); navigate('/blog/'); }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ring-1 ring-inset
                  ${activeCategory === 'all'
                    ? 'bg-primary text-white ring-primary'
                    : 'bg-white text-text-light ring-border hover:bg-gray-50'
                  }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => { setActiveCategory(cat.slug); navigate(`/blog/?category=${cat.slug}`); }}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ring-1 ring-inset
                    ${activeCategory === cat.slug
                      ? 'bg-primary text-white ring-primary'
                      : 'bg-white text-text-light ring-border hover:bg-gray-50'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 py-8">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-5 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Featured Article */}
          {!loading && featured && (
            <Link to={`/blog/${featured.slug}`} className="block mb-10 group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative overflow-hidden">
                    {featured.featured_image ? (
                      <img src={featured.featured_image} alt={featured.title} className="w-full h-64 lg:h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-64 lg:h-full bg-primary/5 flex items-center justify-center" />
                    )}
                  </div>
                  <div className="p-6 lg:p-10 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {featured.article_categories?.map((cat) => (
                        <span key={cat.slug} onClick={(e) => { e.preventDefault(); navigate(`/blog/?category=${cat.slug}`); }} className={`inline-flex px-3 py-1 font-medium text-xs rounded-full ring-1 ring-inset cursor-pointer ${badgeColors[cat.slug] || 'bg-gray-100 text-gray-700 ring-gray-600/20'}`}>
                          {cat.name}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-text mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-3">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-text-light line-clamp-3 mb-5">{featured.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-text-light">
                      <span className="flex items-center gap-1"><IconCalendar size={14} />{formatDate(featured.published_at)}</span>
                      <span className="flex items-center gap-1"><IconEye size={14} />{formatViews(featured.views)} views</span>
                      <span className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">Baca selengkapnya <IconArrowRight size={14} /></span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Articles Grid */}
          {!loading && rest.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-text mb-5">Artikel Terbaru</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((article) => (
                  <Link key={article.id} to={`/blog/${article.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="relative overflow-hidden">
                      {article.featured_image ? (
                        <img src={article.featured_image} alt={article.title} className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-48 bg-primary/5 flex items-center justify-center" />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {article.article_categories?.map((cat) => (
                          <span key={cat.slug} onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/blog/?category=${cat.slug}`); }} className={`inline-flex px-2.5 py-1 font-medium text-xs rounded-full ring-1 ring-inset cursor-pointer ${badgeColors[cat.slug] || 'bg-gray-100 text-gray-700 ring-gray-600/20'}`}>
                            {cat.name}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-base font-semibold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h4>
                      {article.excerpt && (
                        <p className="text-sm text-text-light line-clamp-2 mb-3">{article.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-text-light">
                        <span className="flex items-center gap-1"><IconCalendar size={13} />{formatDate(article.published_at)}</span>
                        <span className="flex items-center gap-1"><IconEye size={13} />{formatViews(article.views)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && articles.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <IconSearch size={24} className="text-text-light" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Belum ada artikel</h3>
              <p className="text-text-light">Artikel akan segera ditambahkan.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <StickyMobileBottomBar />
    </>
  );
}
