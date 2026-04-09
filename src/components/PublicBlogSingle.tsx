import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Header from './Header';
import MobileHeader from './MobileHeader';
import Footer from './Footer';
import StickyMobileBottomBar from './StickyMobileBottomBar';
import {
  IconHeart, IconShare3, IconBookmark, IconBookmarkFilled, IconDots,
  IconLink, IconCopy,
  IconBrandWhatsapp, IconBrandFacebook, IconBrandX,
} from '@tabler/icons-react';
import { useToast } from '../context/ToastContext';

const badgeColors: Record<string, string> = {
  'kegiatan': 'text-green-700 bg-green-50 ring-green-600/20',
  'edukasi': 'text-blue-700 bg-blue-50 ring-blue-600/20',
  'literasi-digital': 'text-purple-700 bg-purple-50 ring-purple-600/20',
  'akademik': 'text-amber-700 bg-amber-50 ring-amber-600/20',
  'pengumuman': 'text-rose-700 bg-rose-50 ring-rose-600/20',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function PublicBlogSingle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(2);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMobileShare, setShowMobileShare] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          article_category_mappings (
            article_categories (id, name, slug)
          ),
          profiles!articles_author_id_fkey (display_name)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        navigate('/blog');
        return;
      }

      // Increment views
      await supabase.from('articles').update({ views: (data.views || 0) + 1 }).eq('id', data.id);
      data.views = (data.views || 0) + 1;

      setArticle({
        ...data,
        categories: data.article_category_mappings?.map((m: any) => m.article_categories).filter(Boolean) || [],
        authorName: data.profiles?.display_name || 'SMP Tashfia',
      });
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || '';

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'x':
        window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({ type: 'success', title: 'Link Disalin!', description: 'Link artikel berhasil disalin ke clipboard.' });
        break;
    }
    setShowShareMenu(false);
    setShowMobileShare(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <MobileHeader />
        <div className="min-h-screen bg-background">
          <div className="max-w-screen-md mx-auto px-5 py-16 lg:pt-24 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
            <div className="h-10 bg-gray-200 rounded w-full mb-4" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-8" />
            <div className="h-72 bg-gray-200 rounded-xl mb-8" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${Math.random() * 40 + 60}%` }} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!article) return null;

  const readTime = estimateReadTime(article.content || '');

  return (
    <>
      <Header />
      <MobileHeader />
      <main className="min-h-screen bg-background pb-20 lg:pb-0">
        {/* Article Header */}
        <header className="max-w-screen-md mx-auto px-5 pt-8 lg:pt-16">
          {/* Category Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.categories?.map((cat: any) => (
              <span
                key={cat.slug}
                onClick={() => navigate(`/blog?category=${cat.slug}`)}
                className={`transition-colors duration-300 inline-flex px-3 py-1 font-medium text-xs rounded-full ring-1 ring-inset ${badgeColors[cat.slug] || 'bg-gray-50 text-gray-700 ring-gray-600/20'} hover:opacity-80`}
              >
                {cat.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-neutral-900 font-semibold text-2xl sm:text-3xl lg:text-4xl xl:leading-[115%] xl:text-[2.75rem] max-w-4xl mb-4">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <div className="max-w-screen-md break-words pb-4 text-base text-neutral-500 lg:text-lg">
              <p>{article.excerpt}</p>
            </div>
          )}

          {/* Divider */}
          <div className="w-full border-b border-neutral-200" />

          {/* Meta Row */}
          <div className="flex flex-wrap justify-between gap-5 sm:items-end py-4">
            {/* Author Info */}
            <div className="flex flex-wrap items-center text-left text-neutral-700 text-base flex-shrink-0 leading-none">
              <div className="flex items-center space-x-2">
                <div className="relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden font-semibold uppercase text-neutral-100 shadow-inner rounded-full h-10 w-10 sm:h-11 sm:w-11 text-xl bg-primary">
                  {article.authorName?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="ms-3">
                  <div className="flex items-center">
                    <span className="block font-semibold text-text">{article.authorName}</span>
                  </div>
                  <div className="mt-[6px] flex-wrap text-xs">
                    <span className="text-text-light">{formatDate(article.published_at)}</span>
                    <span className="mx-2 font-semibold text-text-light">·</span>
                    <span className="text-text-light">{readTime} min read</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Like */}
              <button
                onClick={() => { setLiked(!liked); setLikeCount(prev => liked ? prev - 1 : prev + 1); }}
                className={`group relative flex items-center text-xs transition-colors ${liked ? 'text-rose-600' : 'text-text hover:text-rose-600'}`}
              >
                <div className={`h-9 w-9 flex flex-shrink-0 items-center justify-center rounded-full transition-colors ${liked ? 'bg-rose-50' : 'bg-neutral-50 hover:bg-rose-50'}`}>
                  {liked ? <IconHeart size={18} className="fill-rose-500 text-rose-500" /> : <IconHeart size={18} />}
                </div>
                <span className="ms-2 min-w-[1.125rem] flex-shrink-0 text-start text-text">{likeCount}</span>
              </button>

              {/* Share (Desktop) */}
              <div className="hidden sm:block relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center justify-center rounded-full text-text h-9 w-9 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  title="Share"
                >
                  <IconShare3 size={18} />
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-border py-2 w-48 z-50">
                    <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 w-full">
                      <IconBrandWhatsapp size={18} className="text-green-600" /> WhatsApp
                    </button>
                    <button onClick={() => handleShare('facebook')} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 w-full">
                      <IconBrandFacebook size={18} className="text-blue-600" /> Facebook
                    </button>
                    <button onClick={() => handleShare('x')} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 w-full">
                      <IconBrandX size={18} className="text-sky-500" /> X
                    </button>
                    <div className="border-t border-border my-1" />
                    <button onClick={() => handleShare('copy')} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 w-full">
                      <IconCopy size={18} /> Salin Link
                    </button>
                  </div>
                )}
              </div>

              {/* Bookmark */}
              <button
                onClick={() => setSaved(!saved)}
                className="flex items-center justify-center rounded-full h-9 w-9 bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                {saved ? <IconBookmarkFilled size={18} className="text-primary" /> : <IconBookmark size={18} className="text-text" />}
              </button>

              {/* More */}
              <button className="flex items-center justify-center rounded-full text-text-light h-9 w-9 bg-neutral-50 hover:bg-neutral-100 transition-colors">
                <IconDots size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="max-w-screen-lg mx-auto my-10 sm:my-12 px-5">
            <img
              src={article.featured_image}
              alt={article.title}
              className="mx-auto rounded-xl w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="max-w-screen-md mx-auto px-5">
          <div
            className="prose prose-lg sm:prose-xl max-w-none
              prose-headings:font-bold prose-headings:text-text
              prose-p:text-text prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-text
              prose-ul:text-text prose-ol:text-text
              prose-li:marker:text-primary
              prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
              prose-img:rounded-xl prose-img:shadow-md
              prose-hr:border-border"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* Mobile Share Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-5 py-3 flex items-center justify-around z-50" style={{ paddingBottom: 'calc(0.75rem + 3.5rem)' }}>
          <button onClick={() => { setLiked(!liked); setLikeCount(prev => liked ? prev - 1 : prev + 1); }} className={`flex items-center gap-1.5 text-xs ${liked ? 'text-rose-600' : 'text-text-light'}`}>
            {liked ? <IconHeart size={18} className="fill-rose-500" /> : <IconHeart size={18} />} {likeCount}
          </button>
          <button onClick={() => setShowMobileShare(true)} className="flex items-center gap-1.5 text-xs text-text-light">
            <IconShare3 size={18} /> Bagikan
          </button>
          <button onClick={() => setSaved(!saved)} className="flex items-center gap-1.5 text-xs text-text-light">
            {saved ? <IconBookmarkFilled size={18} className="text-primary" /> : <IconBookmark size={18} />} Simpan
          </button>
        </div>

        {/* Mobile Share Modal */}
        {showMobileShare && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={() => setShowMobileShare(false)}>
            <div className="bg-white rounded-t-2xl w-full p-6 animate-slideUp" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-text mb-4">Bagikan Artikel</h3>
              <div className="grid grid-cols-4 gap-4">
                <button onClick={() => handleShare('whatsapp')} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"><IconBrandWhatsapp size={24} className="text-green-600" /></div>
                  <span className="text-xs text-text">WhatsApp</span>
                </button>
                <button onClick={() => handleShare('facebook')} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"><IconBrandFacebook size={24} className="text-blue-600" /></div>
                  <span className="text-xs text-text">Facebook</span>
                </button>
                <button onClick={() => handleShare('x')} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center"><IconBrandX size={24} className="text-sky-500" /></div>
                  <span className="text-xs text-text">X</span>
                </button>
                <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"><IconLink size={24} className="text-text" /></div>
                  <span className="text-xs text-text">Salin Link</span>
                </button>
              </div>
              <button onClick={() => setShowMobileShare(false)} className="w-full mt-4 py-3 text-text font-medium text-sm">Tutup</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <StickyMobileBottomBar />
    </>
  );
}
