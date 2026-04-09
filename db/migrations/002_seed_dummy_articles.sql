-- =====================================================
-- SEED DUMMY ARTICLES for Staff Blog Editor testing
-- =====================================================

-- Get the admin user ID
DO $$
DECLARE
  v_author_id UUID;
  v_cat_kegiatan UUID;
  v_cat_edukasi UUID;
  v_cat_akademik UUID;
  v_cat_pengumuman UUID;
  v_cat_literasi UUID;
BEGIN
  -- Get admin user as author
  SELECT id INTO v_author_id
  FROM auth.users
  WHERE email = 'elgi@smptashfia.sch.id'
  LIMIT 1;

  -- Get categories
  SELECT id INTO v_cat_kegiatan FROM public.article_categories WHERE slug = 'kegiatan' LIMIT 1;
  SELECT id INTO v_cat_edukasi FROM public.article_categories WHERE slug = 'edukasi' LIMIT 1;
  SELECT id INTO v_cat_akademik FROM public.article_categories WHERE slug = 'akademik' LIMIT 1;
  SELECT id INTO v_cat_pengumuman FROM public.article_categories WHERE slug = 'pengumuman' LIMIT 1;
  SELECT id INTO v_cat_literasi FROM public.article_categories WHERE slug = 'literasi-digital' LIMIT 1;

  -- Article 1
  INSERT INTO public.articles (id, title, slug, content, author_id, status, published_at, created_at)
  VALUES (
    gen_random_uuid(),
    'Komunitas Belajar Guru SMP Tashfia – November 2025',
    'komunitas-belajar-guru-smp-tashfia-november-2025',
    '<p>Alhamdulillah, kegiatan Komunitas Belajar Guru SMP Tashfia bulan November 2025 telah terlaksana dengan lancar.</p><p>Melalui pelatihan penyusunan modul pembelajaran mendalam, koding, dan kecerdasan artifisial, para guru terus mengembangkan kompetensi profesional mereka.</p><p>Kegiatan ini diikuti oleh seluruh guru SMP Tashfia dan dipandu oleh narasumber berpengalaman dari berbagai institusi pendidikan.</p>',
    v_author_id,
    'published',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  );

  -- Article 2
  INSERT INTO public.articles (id, title, slug, content, author_id, status, published_at, created_at)
  VALUES (
    gen_random_uuid(),
    'Cyberbullying: Bahaya Terbesar Media Sosial',
    'cyberbullying-bahaya-terbesar-media-sosial',
    '<p>Pada zaman digital sekarang media sosial tidak seaman yang kita bayangkan, terutama di kalangan remaja.</p><p>Kekhawatiran tersebut muncul berdasar data bahwa semakin banyak kasus cyberbullying yang terjadi di kalangan pelajar. Oleh karena itu, SMP Tashfia mengadakan sosialisasi tentang bahaya cyberbullying dan cara mencegahnya.</p><p>Para siswa diajak untuk lebih bijak dalam menggunakan media sosial dan melaporkan jika ada kasus bullying yang terjadi di lingkungan mereka.</p>',
    v_author_id,
    'published',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  );

  -- Article 3
  INSERT INTO public.articles (id, title, slug, content, author_id, status, published_at, created_at)
  VALUES (
    gen_random_uuid(),
    'Dokumentasi Asesmen Sumatif Akhir Semester',
    'dokumentasi-asesmen-sumatif-akhir-semester',
    '<p>Alhamdulillah, siswi SMP Tashfia telah menyelesaikan rangkaian kegiatan ASAS dengan baik.</p><p>Semoga Allah mudahkan untuk menuntut ilmu di jalan-Nya, serta memberikan hasil terbaik bagi mereka yang telah berusaha dengan sungguh-sungguh.</p><p>Para guru dan staf juga telah bekerja keras dalam mempersiapkan dan melaksanakan asesmen ini dengan baik.</p>',
    v_author_id,
    'published',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  );

  -- Article 4 (Draft)
  INSERT INTO public.articles (id, title, slug, content, author_id, status, created_at)
  VALUES (
    gen_random_uuid(),
    'Persiapan Ujian Akhir Semester Genap',
    'persiapan-ujian-akhir-semester-genap',
    '<p>Ujian Akhir Semester Genap akan segera dilaksanakan. Berikut adalah beberapa tips persiapan yang bisa dilakukan siswa:</p><ul><li>Belajar secara rutin setiap hari</li><li>Membuat ringkasan materi</li><li>Berdiskusi dengan teman sekelas</li><li>Istirahat yang cukup sebelum ujian</li></ul><p>Semoga semua siswa dapat meraih hasil terbaik.</p>',
    v_author_id,
    'draft',
    NOW() - INTERVAL '1 day'
  );

  -- Link categories to articles
  INSERT INTO public.article_category_mappings (article_id, category_id)
  SELECT a.id, v_cat_kegiatan
  FROM public.articles a
  WHERE a.slug = 'komunitas-belajar-guru-smp-tashfia-november-2025';

  INSERT INTO public.article_category_mappings (article_id, category_id)
  SELECT a.id, v_cat_edukasi
  FROM public.articles a
  WHERE a.slug = 'cyberbullying-bahaya-terbesar-media-sosial';

  INSERT INTO public.article_category_mappings (article_id, category_id)
  SELECT a.id, v_cat_akademik
  FROM public.articles a
  WHERE a.slug = 'dokumentasi-asesmen-sumatif-akhir-semester';

  INSERT INTO public.article_category_mappings (article_id, category_id)
  SELECT a.id, v_cat_pengumuman
  FROM public.articles a
  WHERE a.slug = 'persiapan-ujian-akhir-semester-genap';

  RAISE NOTICE '✅ 4 dummy articles seeded successfully!';
END $$;
