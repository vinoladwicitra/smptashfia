/**
 * Assign categories to all uncategorized articles
 * Run: node db/assign-categories.cjs
 */

const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const categoryMap = {
  // Kegiatan
  kegiatan: [
    'CLASSMEETING', 'Kunjungan', 'Museum', 'LDKS', 'Pramuka', 'Dauroh Tahfizh',
    'Pekan Kreativitas', 'Program P5', 'Seminar dan Penyuluhan', 'Baksos',
    'Donasi Osis', 'Juara 1', 'Dokumentasi Asesmen', 'Kelulusan', 'Kenaikan kelas',
    'Kedatangan Siswi Baru', 'Karya Tashfia', 'Komunitas Belajar', 'Tasmi',
    'Bedah Buku', 'Content Creator', 'Selamat Ananda',
  ],
  // Edukasi
  edukasi: [
    'Metode Rasulullah', 'Mendidik Anak', 'Tips Agar', 'Muslimah yang Menarik',
    'Show-Off', 'Mulazamah', 'SRBI',
  ],
  // Literasi Digital
  'literasi-digital': [
    'Cyberbullying', 'Bahaya Terbesar', 'CERDAS BERMEDIA', 'Serangan Tanpa Wajah',
    'Netizen Asik', 'Content Creator',
  ],
  // Akademik
  akademik: [
    'PKKS', 'Asesmen Nasional', 'Asesmen Sosiometri',
  ],
  // Pengumuman
  pengumuman: [
    'PENGUMUMAN', 'PPDB', 'Penerimaan Murid Baru', 'Brosur PMB',
  ],
};

async function main() {
  console.log('📂 Fetching all articles and categories...\n');

  // Get category IDs
  const { rows: categories } = await pool.query('SELECT id, name, slug FROM public.article_categories');
  const catIds = {};
  categories.forEach(c => { catIds[c.slug] = c.id; });
  console.log('Categories:', categories.map(c => c.name).join(', '));

  // Get all articles
  const { rows: articles } = await pool.query('SELECT id, title, published_at FROM public.articles ORDER BY published_at ASC');
  console.log(`Total articles: ${articles.length}\n`);

  // Get current category mappings
  const { rows: mappings } = await pool.query('SELECT article_id, category_id FROM public.article_category_mappings');
  const mappedArticleIds = new Set(mappings.map(m => m.article_id));

  let assigned = 0;
  let skipped = 0;
  const results = [];

  for (const article of articles) {
    if (mappedArticleIds.has(article.id)) {
      skipped++;
      continue;
    }

    const title = article.title.toUpperCase();
    let matchedCategory = null;

    // Try each category's keywords
    for (const [slug, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(kw => title.includes(kw.toUpperCase()))) {
        matchedCategory = slug;
        break;
      }
    }

    // Default fallback
    if (!matchedCategory) {
      // Analyze content type: if it has "announcement/PPDB" → Pengumuman, else → Kegiatan
      if (title.includes('PENGUMUMAN') || title.includes('PPDB') || title.includes('PENDAFTARAN') || title.includes('BROSUR')) {
        matchedCategory = 'pengumuman';
      } else {
        matchedCategory = 'kegiatan';
      }
    }

    const catId = catIds[matchedCategory];
    if (!catId) {
      console.log(`❌ No category ID for slug: ${matchedCategory} (${article.title})`);
      continue;
    }

    await pool.query(
      'INSERT INTO public.article_category_mappings (article_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [article.id, catId]
    );

    const catName = categories.find(c => c.slug === matchedCategory)?.name || matchedCategory;
    console.log(`✅ [${catName}] ${article.title}`);
    results.push({ title: article.title, category: catName });
    assigned++;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Assigned: ${assigned}`);
  console.log(`⏭️ Skipped (already categorized): ${skipped}`);
  console.log(`📊 Total: ${articles.length}`);

  await pool.end();
}

main().catch(console.error);
