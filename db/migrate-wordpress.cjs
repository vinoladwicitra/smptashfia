/**
 * WordPress XML → Supabase Migration Script
 * 
 * Usage: node db/migrate-wordpress.js
 * 
 * Uses: pg for database, S3-compatible API for storage uploads
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

require('dotenv').config();

const { Pool } = require('pg');

// ========== CONFIG ==========
const XML_PATH = '/tmp/smptashfia-export.xml';
const AUTHOR_ID = '4ac3f5cf-68ad-4268-a776-b1be874db0ea'; // elgi
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'smptashfia';

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const s3 = new S3Client({
  region: process.env.SUPABASE_STORAGE_REGION || 'ap-southeast-1',
  endpoint: process.env.SUPABASE_STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const STORAGE_BASE = process.env.SUPABASE_STORAGE_ENDPOINT?.replace('/storage/v1/s3', '');

// ========== XML PARSER ==========
function parseCDATA(str) {
  if (!str) return '';
  const match = str.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return match ? match[1].trim() : str.trim();
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? parseCDATA(match[1]) : '';
}

function extractWPTag(xml, tag) {
  const regex = new RegExp(`<wp:${tag}>([\\s\\S]*?)</wp:${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? parseCDATA(match[1]) : '';
}

function extractItems(xml) {
  const items = [];
  const regex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const itemXml = match[1];
    const postType = extractWPTag(itemXml, 'post_type');
    const status = extractWPTag(itemXml, 'status');

    if (postType !== 'post' || status !== 'publish') continue;

    const content = extractTag(itemXml, 'content:encoded');
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');
    const excerpt = extractTag(itemXml, 'excerpt:encoded');
    const postName = extractWPTag(itemXml, 'post_name');

    // Extract categories
    const categories = [];
    const catRegex = /<category domain="category"><!\[CDATA\[([^\]]*)\]\]><\/category>/g;
    let catMatch;
    while ((catMatch = catRegex.exec(itemXml)) !== null) {
      const name = catMatch[1];
      categories.push({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') });
    }

    // Featured image from content (first image)
    const imgMatch = content.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/);
    const featuredImage = imgMatch ? imgMatch[1] : null;

    items.push({
      title,
      slug: postName || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content,
      excerpt: excerpt || content.replace(/<[^>]+>/g, '').substring(0, 200),
      pubDate,
      featuredImage,
      categories,
    });
  }
  return items;
}

// ========== DOWNLOAD ==========
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { followRedirect: true, maxRedirects: 5 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const contentType = res.headers['content-type'] || 'image/jpeg';
        resolve({ buffer: Buffer.concat(chunks), contentType });
      });
    }).on('error', reject);
  });
}

// ========== UPLOAD TO S3 ==========
async function uploadToS3(key, buffer, contentType) {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3.send(cmd);
  return `${STORAGE_BASE}/storage/v1/object/public/${BUCKET}/${key}`;
}

// ========== DATABASE ==========
async function getOrCreateCategory(name, slug) {
  const { rows } = await db.query(
    "SELECT id FROM public.article_categories WHERE slug = $1",
    [slug]
  );
  if (rows.length > 0) return rows[0].id;

  const { rows: inserted } = await db.query(
    "INSERT INTO public.article_categories (name, slug) VALUES ($1, $2) RETURNING id",
    [name, slug]
  );
  return inserted[0].id;
}

async function insertArticle(article) {
  const { rows } = await db.query(
    `INSERT INTO public.articles 
      (title, slug, excerpt, content, featured_image, author_id, status, published_at, views, likes_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [article.title, article.slug, article.excerpt, article.content, article.featuredImage, article.authorId, article.status, article.publishedAt, article.views, article.likesCount]
  );
  return rows[0].id;
}

async function linkCategory(articleId, categoryId) {
  await db.query(
    "INSERT INTO public.article_category_mappings (article_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [articleId, categoryId]
  );
}

// ========== MAIN ==========
async function main() {
  console.log('📖 Reading WordPress export...');
  const xml = fs.readFileSync(XML_PATH, 'utf-8');
  const posts = extractItems(xml);
  console.log(`✅ Found ${posts.length} published posts\n`);

  const migrated = [];
  const errors = [];
  const imageCache = {};

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const num = i + 1;
    process.stdout.write(`[${num}/${posts.length}] ${post.title.substring(0, 60)}... `);

    try {
      // Featured image
      let featuredUrl = null;
      if (post.featuredImage) {
        if (imageCache[post.featuredImage]) {
          featuredUrl = imageCache[post.featuredImage];
        } else {
          try {
            const { buffer, contentType } = await downloadImage(post.featuredImage);
            const ext = contentType.includes('png') ? 'png' : 'jpg';
            const ts = new Date(post.pubDate).getTime() || Date.now();
            const key = `blog/featured/featured-${AUTHOR_ID}-${ts}.${ext}`;
            featuredUrl = await uploadToS3(key, buffer, contentType);
            imageCache[post.featuredImage] = featuredUrl;
          } catch (e) {
            // Skip image on error
          }
        }
      }

      // Replace content image URLs
      let content = post.content;
      const imgUrls = [...content.matchAll(/src=["'](https?:\/\/file\.smptashfia\.sch\.id\/[^"']+)["']/g)];
      for (const m of imgUrls) {
        const oldUrl = m[1];
        if (!imageCache[oldUrl]) {
          try {
            const { buffer, contentType } = await downloadImage(oldUrl);
            const ext = contentType.includes('png') ? 'png' : 'jpg';
            const key = `blog/content/content-${AUTHOR_ID}-${Date.now()}.${ext}`;
            const newUrl = await uploadToS3(key, buffer, contentType);
            imageCache[oldUrl] = newUrl;
          } catch (e) {
            // Skip
          }
        }
        const newUrl = imageCache[oldUrl];
        if (newUrl) {
          content = content.split(oldUrl).join(newUrl);
        }
      }

      // Insert article
      const publishedAt = post.pubDate ? new Date(post.pubDate).toISOString() : new Date().toISOString();
      const articleId = await insertArticle({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content,
        featuredImage: featuredUrl,
        authorId: AUTHOR_ID,
        status: 'published',
        publishedAt,
        views: 0,
        likesCount: 0,
      });

      // Categories
      for (const cat of post.categories) {
        const catId = await getOrCreateCategory(cat.name, cat.slug);
        await linkCategory(articleId, catId);
      }

      console.log(`✅ ${articleId}`);
      migrated.push({ title: post.title, id: articleId, slug: post.slug, date: publishedAt });
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errors.push({ title: post.title, error: err.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Migrated: ${migrated.length}`);
  console.log(`❌ Failed: ${errors.length}`);
  console.log(`📸 Images cached: ${Object.keys(imageCache).length}`);
  
  if (errors.length > 0) {
    console.log('\nFailed:');
    errors.forEach(e => console.log(`  - ${e.title}: ${e.error}`));
  }

  fs.writeFileSync('/tmp/migration-report.json', JSON.stringify({ migrated, errors, imageCount: Object.keys(imageCache).length }, null, 2));
  console.log('\n📄 Report: /tmp/migration-report.json');
  
  await db.end();
}

main().catch(console.error);
