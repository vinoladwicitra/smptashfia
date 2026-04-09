import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconEye, IconCalendar, IconFileText, IconFilter } from '@tabler/icons-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  status: string;
  published_at: string | null;
  views: number;
  created_at: string;
  category?: { name: string; slug: string } | null;
}

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-amber-100 text-amber-700',
  archived: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  published: 'Terbit',
  draft: 'Draft',
  archived: 'Arsip',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Belum dipublikasi';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function StaffBlogList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id, title, slug, excerpt, featured_image, status, published_at, views, created_at,
        article_category_mappings!inner (
          article_categories (id, name, slug)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ type: 'error', title: 'Gagal Memuat Artikel', description: error.message });
    } else {
      const formatted = (data || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        featured_image: a.featured_image,
        status: a.status,
        published_at: a.published_at,
        views: a.views || 0,
        created_at: a.created_at,
        category: a.article_category_mappings?.[0]?.article_categories || null,
      }));
      setArticles(formatted);
    }
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus artikel "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) {
      toast({ type: 'error', title: 'Gagal Menghapus', description: error.message });
    } else {
      toast({ type: 'success', title: 'Artikel Dihapus', description: `"${title}" berhasil dihapus.` });
      fetchArticles();
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || article.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Artikel & Berita</h1>
          <p className="text-text-light mt-1">Kelola semua artikel dan berita sekolah.</p>
        </div>
        <button
          onClick={() => navigate('/staff/blog/new')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm whitespace-nowrap"
        >
          <IconPlus size={18} />
          Tulis Artikel
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <input
              type="text"
              placeholder="Cari artikel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text"
            />
          </div>
          <div className="relative">
            <IconFilter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-border rounded-lg outline-none focus:border-primary transition-colors text-sm text-text bg-white appearance-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="published">Terbit</option>
              <option value="draft">Draft</option>
              <option value="archived">Arsip</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {/* Articles List */}
      {!loading && filteredArticles.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
          <IconFileText size={48} className="mx-auto text-text-light/30 mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">
            {searchQuery || filterStatus !== 'all' ? 'Tidak ada artikel ditemukan' : 'Belum ada artikel'}
          </h3>
          <p className="text-text-light text-sm mb-6">
            {searchQuery || filterStatus !== 'all'
              ? 'Coba ubah filter atau kata kunci pencarian.'
              : 'Mulai tulis artikel pertamamu sekarang!'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <button
              onClick={() => navigate('/staff/blog/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              <IconPlus size={18} />
              Tulis Artikel Pertama
            </button>
          )}
        </div>
      )}

      {!loading && filteredArticles.length > 0 && (
        <div className="space-y-3">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Featured Image */}
                <div className="sm:w-40 sm:flex-shrink-0">
                  {article.featured_image ? (
                    <img src={article.featured_image} alt={article.title} className="w-full h-32 sm:h-full object-cover" />
                  ) : (
                    <div className="w-full h-32 sm:h-full bg-primary/5 flex items-center justify-center">
                      <IconFileText size={32} className="text-text-light/20" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[article.status]}`}>
                        {statusLabels[article.status]}
                      </span>
                      {article.category && (
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                          {article.category.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-text mb-1 line-clamp-1">{article.title}</h3>
                    {article.excerpt && (
                      <p className="text-sm text-text-light line-clamp-2 mb-2">{article.excerpt}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-light">
                      <span className="flex items-center gap-1">
                        <IconCalendar size={14} />
                        {formatDate(article.published_at || article.created_at)}
                      </span>
                      {article.status === 'published' && (
                        <span className="flex items-center gap-1">
                          <IconEye size={14} />
                          {article.views} views
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 px-4 pb-4 sm:py-4 sm:flex-shrink-0">
                  <button
                    onClick={() => navigate(`/staff/blog/edit/${article.id}`)}
                    className="p-2 rounded-lg text-text-light hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Edit"
                  >
                    <IconEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    className="p-2 rounded-lg text-text-light hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
