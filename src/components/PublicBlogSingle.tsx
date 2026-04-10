import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DOMPurify from 'dompurify';
import Header from './Header';
import MobileHeader from './MobileHeader';
import Footer from './Footer';
import StickyMobileBottomBar from './StickyMobileBottomBar';
import {
  IconHeart, IconShare3, IconBookmark, IconBookmarkFilled,
  IconCopy, IconBrandWhatsapp, IconBrandFacebook, IconBrandX,
  IconArrowUp, IconArrowLeft, IconEye,
} from '@tabler/icons-react';
import { useToast } from '../context/ToastContext';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}rb`;
  return n.toString();
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
  const [likeCount, setLikeCount] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const articleEl = document.querySelector('article');
      if (!articleEl) return;
      const rect = articleEl.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const scrolled = window.scrollY - articleTop;
      const progress = Math.min(100, Math.max(0, (scrolled / articleHeight) * 100));
      setReadProgress(Math.round(progress));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load article
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const { data: articleData, error } = await supabase
        .from('articles')
        .select(`*, article_category_mappings (article_categories (id, name, slug))`)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !articleData) { navigate('/blog/'); return; }

      let authorName = 'SMP Tashfia';
      let authorAvatar: string | null = null;
      if (articleData.author_id) {
        const { data: profileData } = await supabase.from('profiles').select('display_name, avatar_url').eq('id', articleData.author_id).single();
        if (profileData) { authorName = profileData.display_name || 'SMP Tashfia'; authorAvatar = profileData.avatar_url || null; }
      }

      const newViews = (articleData.views || 0) + 1;
      await supabase.from('articles').update({ views: newViews }).eq('id', articleData.id);

      setArticle({ ...articleData, categories: articleData.article_category_mappings?.map((m: any) => m.article_categories).filter(Boolean) || [], authorName, authorAvatar, views: newViews });
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  // Load like/bookmark state from localStorage
  useEffect(() => {
    if (article?.id) {
      const likes = JSON.parse(localStorage.getItem('blog-likes') || '{}');
      const bookmarks = JSON.parse(localStorage.getItem('blog-bookmarks') || '{}');
      setLiked(!!likes[article.id]);
      setSaved(!!bookmarks[article.id]);
      setLikeCount(article.likes_count || 0);
    }
  }, [article]);

  const handleLike = useCallback(async () => {
    if (!article?.id) return;
    const newLiked = !liked;
    setLiked(newLiked);
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    setLikeCount(newCount);
    const likes = JSON.parse(localStorage.getItem('blog-likes') || '{}');
    if (newLiked) likes[article.id] = true; else delete likes[article.id];
    localStorage.setItem('blog-likes', JSON.stringify(likes));
    await supabase.from('articles').update({ likes_count: newCount }).eq('id', article.id);
  }, [article, liked, likeCount]);

  const handleBookmark = useCallback(() => {
    if (!article?.id) return;
    const newSaved = !saved;
    setSaved(newSaved);
    const bookmarks = JSON.parse(localStorage.getItem('blog-bookmarks') || '{}');
    if (newSaved) {
      bookmarks[article.id] = { title: article.title, slug: article.slug, savedAt: Date.now() };
      toast({ type: 'success', title: 'Artikel Disimpan', description: 'Artikel ditambahkan ke bookmark.' });
    } else {
      delete bookmarks[article.id];
      toast({ type: 'info', title: 'Bookmark Dihapus', description: 'Artikel dihapus dari bookmark.' });
    }
    localStorage.setItem('blog-bookmarks', JSON.stringify(bookmarks));
  }, [article, saved, toast]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || '';
    switch (platform) {
      case 'whatsapp': window.open(`https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`, '_blank'); break;
      case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'); break;
      case 'x': window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank'); break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({ type: 'success', title: 'Link Disalin!', description: 'Link artikel berhasil disalin.' });
        break;
    }
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <>
        <Header /><MobileHeader />
        <div className="min-h-screen bg-background"><div className="max-w-screen-md mx-auto px-5 py-16 lg:pt-24 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4" /><div className="h-10 bg-gray-200 rounded w-full mb-4" />
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-8" /><div className="h-72 bg-gray-200 rounded-xl mb-8" />
          <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => (<div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${Math.random() * 40 + 60}%` }} />))}</div>
        </div></div>
      </>
    );
  }

  if (!article) return null;

  const readTime = estimateReadTime(article.content || '');

  return (
    <>
      <Header />
      <MobileHeader />
      <main className="min-h-screen bg-background pb-32 lg:pb-0">
        {/* Article Header */}
        <header className="max-w-screen-md mx-auto px-5 pt-8 lg:pt-16">
          <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/blog/'); }} className="flex items-center gap-2 text-text-light hover:text-text mb-6 transition-colors cursor-pointer">
            <IconArrowLeft size={20} /><span className="text-sm font-medium">Kembali</span>
          </button>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.categories?.map((cat: any) => (
              <span key={cat.slug} onClick={() => navigate(`/blog/?category=${cat.slug}`)} className={`transition-colors duration-300 inline-flex px-3 py-1 font-medium text-xs rounded-full ring-1 ring-inset cursor-pointer ${badgeColors[cat.slug] || 'bg-gray-50 text-gray-700 ring-gray-600/20'} hover:opacity-80`}>{cat.name}</span>
            ))}
          </div>
          <h1 className="text-neutral-900 font-semibold text-2xl sm:text-3xl lg:text-4xl xl:leading-[115%] xl:text-[2.75rem] max-w-4xl mb-4">{article.title}</h1>
          <div className="w-full border-b border-neutral-200" />
          <div className="flex flex-wrap justify-between gap-5 sm:items-end py-4">
            <div className="flex flex-wrap items-center text-left text-neutral-700 text-base flex-shrink-0 leading-none">
              <div className="flex items-center space-x-2">
                <div className="relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden font-semibold uppercase text-neutral-100 shadow-inner rounded-full h-10 w-10 sm:h-11 sm:w-11 text-xl bg-primary">
                  {article.authorAvatar ? <img src={article.authorAvatar} alt={article.authorName} className="absolute inset-0 h-full w-full object-cover rounded-full" /> : <span>{article.authorName?.[0]?.toUpperCase() || 'S'}</span>}
                </div>
                <div className="ms-3">
                  <span className="block font-semibold text-text">{article.authorName}</span>
                  <div className="mt-[6px] flex-wrap text-xs">
                    <span className="text-text-light">{formatDate(article.published_at)}</span>
                    <span className="mx-2 font-semibold text-text-light">·</span>
                    <span className="text-text-light">{readTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Desktop Actions */}
            <div className="hidden sm:flex flex-wrap items-center gap-2">
              <button onClick={handleLike} className={`group flex items-center text-xs transition-colors ${liked ? 'text-rose-600' : 'text-text hover:text-rose-600'}`}>
                <div className={`h-9 w-9 flex items-center justify-center rounded-full transition-colors ${liked ? 'bg-rose-50' : 'bg-neutral-50 hover:bg-rose-50'}`}>{liked ? <IconHeart size={18} className="fill-rose-500 text-rose-500" /> : <IconHeart size={18} />}</div>
                <span className="ms-2 min-w-[1.125rem] text-start text-text">{likeCount}</span>
              </button>
              <div className="flex items-center text-xs text-text-light">
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-neutral-50"><IconEye size={18} /></div>
                <span className="ms-2 min-w-[1.125rem] text-start">{formatViews(article.views)}</span>
              </div>
              <div className="relative">
                <button onClick={() => setShowShareMenu(!showShareMenu)} className="flex items-center justify-center rounded-full text-text h-9 w-9 bg-neutral-50 hover:bg-neutral-100 transition-colors" title="Share"><IconShare3 size={18} /></button>
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-border py-2 w-48 z-50">
                    <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 w-full"><IconBrandWhatsapp size={18} className="text-green-600" /> WhatsApp</button>
                    <button onClick={() => handleShare('facebook')} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 w-full"><IconBrandFacebook size={18} className="text-blue-600" /> Facebook</button>
                    <button onClick={() => handleShare('x')} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 w-full"><IconBrandX size={18} className="text-gray-900" /> X</button>
                    <div className="border-t border-border my-1" />
                    <button onClick={() => handleShare('copy')} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 w-full"><IconCopy size={18} /> Salin Link</button>
                  </div>
                )}
              </div>
              <button onClick={handleBookmark} className="flex items-center justify-center rounded-full h-9 w-9 bg-neutral-50 hover:bg-neutral-100 transition-colors">
                {saved ? <IconBookmarkFilled size={18} className="text-primary" /> : <IconBookmark size={18} className="text-text" />}
              </button>
            </div>
          </div>
        </header>

        {article.featured_image && (
          <div className="max-w-screen-md mx-auto mt-10 sm:mt-12 px-5">
            <img src={article.featured_image} alt={article.title} className="mx-auto rounded-xl w-full object-cover shadow-sm" />
          </div>
        )}

        <article className="max-w-screen-md mx-auto px-5 py-8">
          <div className="prose prose-lg sm:prose-xl max-w-none prose-headings:font-bold prose-headings:text-text prose-p:text-text prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-text prose-ul:text-text prose-ol:text-text prose-li:marker:text-primary prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-img:rounded-xl prose-img:shadow-md" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
        </article>

        {/* Mobile Floating Action Bar */}
        <div className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-0 bg-white/95 backdrop-blur-sm border border-black/[0.03] rounded-full shadow-lg px-3 py-1.5" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>
            {/* Like */}
            <button onClick={handleLike} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-colors ${liked ? 'text-rose-600' : 'text-text-light hover:text-rose-600'}`}>
              <div className={`w-[34px] h-[34px] flex items-center justify-center rounded-full ${liked ? 'bg-rose-50' : 'bg-gray-100'}`}>
                {liked ? <IconHeart size={16} className="fill-rose-500 text-rose-500" /> : <IconHeart size={16} />}
              </div>
              <span className="text-xs font-medium">{likeCount}</span>
            </button>

            {/* Bookmark */}
            <button onClick={handleBookmark} className={`flex items-center px-2.5 py-1.5 rounded-full transition-colors ${saved ? 'text-primary' : 'text-text-light hover:text-text'}`}>
              <div className={`w-[34px] h-[34px] flex items-center justify-center rounded-full ${saved ? 'bg-primary/10' : 'bg-gray-100'}`}>
                {saved ? <IconBookmarkFilled size={16} /> : <IconBookmark size={16} />}
              </div>
            </button>

            {/* Divider */}
            <span className="text-text-light font-light text-sm px-1">/</span>

            {/* Share Dropdown */}
            <div className="relative">
              <button onClick={() => setShowShareMenu(!showShareMenu)} className="flex items-center px-2.5 py-1.5 rounded-full text-text-light hover:text-text transition-colors">
                <div className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-gray-100"><IconShare3 size={16} /></div>
              </button>
              {showShareMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white rounded-xl shadow-lg border border-border py-2 w-48 z-50">
                  <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 w-full"><IconBrandWhatsapp size={18} className="text-green-600" /> WhatsApp</button>
                  <button onClick={() => handleShare('facebook')} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 w-full"><IconBrandFacebook size={18} className="text-blue-600" /> Facebook</button>
                  <button onClick={() => handleShare('x')} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 w-full"><IconBrandX size={18} /> X</button>
                  <div className="border-t border-border my-1" />
                  <button onClick={() => handleShare('copy')} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-gray-50 w-full"><IconCopy size={18} /> Salin Link</button>
                </div>
              )}
            </div>

            {/* Reading Progress */}
            <button onClick={() => { if (readProgress > 0) window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center px-2.5 py-1.5 rounded-full text-text-light transition-colors cursor-pointer">
              <div className="w-[34px] h-[34px] flex items-center justify-center rounded-full bg-gray-100">
                {readProgress > 0 ? (
                  <span className="text-xs font-medium text-text">{readProgress}%</span>
                ) : (
                  <IconArrowUp size={16} />
                )}
              </div>
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <StickyMobileBottomBar />
    </>
  );
}

const badgeColors: Record<string, string> = {
  'kegiatan': 'text-green-700 bg-green-50 ring-green-600/20',
  'edukasi': 'text-blue-700 bg-blue-50 ring-blue-600/20',
  'literasi-digital': 'text-purple-700 bg-purple-50 ring-purple-600/20',
  'akademik': 'text-amber-700 bg-amber-50 ring-amber-600/20',
  'pengumuman': 'text-rose-700 bg-rose-50 ring-rose-600/20',
};
