import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconEye, IconCalendar, IconFileText, IconFilter } from '@tabler/icons-react';

// Sample data - will be replaced with Supabase fetch later
const sampleArticles = [
  {
    id: '1',
    title: 'Komunitas Belajar Guru SMP Tashfia – November 2025',
    excerpt: 'Alhamdulillah, kegiatan Komunitas Belajar Guru SMP Tashfia bulan November 2025 telah terlaksana dengan lancar.',
    status: 'published',
    category: 'Kegiatan',
    date: '13 Des 2025',
    views: 124,
  },
  {
    id: '2',
    title: 'Cyberbullying: Bahaya Terbesar Media Sosial',
    excerpt: 'Pada zaman digital sekarang media sosial tidak seaman yang kita bayangkan, terutama di kalangan remaja.',
    status: 'published',
    category: 'Edukasi',
    date: '12 Des 2025',
    views: 89,
  },
  {
    id: '3',
    title: 'Draft: Persiapan Ujian Akhir Semester',
    excerpt: 'Panduan lengkap persiapan ujian akhir semester untuk semua kelas.',
    status: 'draft',
    category: 'Akademik',
    date: '10 Des 2025',
    views: 0,
  },
];

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

export default function StaffBlogList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredArticles = sampleArticles.filter((article) => {
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

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
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
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-xl shadow-sm border border-border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[article.status]}`}>
                    {statusLabels[article.status]}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-text mb-1 line-clamp-1">{article.title}</h3>
                  <p className="text-sm text-text-light line-clamp-2 mb-2">{article.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-light">
                    <span className="flex items-center gap-1">
                      <IconCalendar size={14} />
                      {article.date}
                    </span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                    {article.status === 'published' && (
                      <span className="flex items-center gap-1">
                        <IconEye size={14} />
                        {article.views} views
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <button
                    onClick={() => navigate(`/staff/blog/edit/${article.id}`)}
                    className="p-2 rounded-lg text-text-light hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Edit"
                  >
                    <IconEdit size={18} />
                  </button>
                  <button
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
