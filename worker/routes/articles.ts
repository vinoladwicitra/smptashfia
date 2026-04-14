import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getArticles, getArticleBySlug, getCategories, getTags } from '../lib/db';
import type { Env } from '../types';

const articles = new Hono<{ Bindings: Env }>();

// Validation schemas
const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

const articleQuerySchema = z.object({
  status: z.enum(['published', 'draft', 'archived']).optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
});

// GET /api/articles - List articles
articles.get('/', zValidator('query', paginationSchema.merge(articleQuerySchema)), async (c) => {
  const { limit, offset, status, category, tag, author } = c.req.valid('query');

  try {
    const articlesData = await getArticles(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY,
      {
        status,
        category,
        tag,
        authorId: author,
        limit,
        offset,
      }
    );

    return c.json({
      success: true,
      data: articlesData,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch articles',
    }, 500);
  }
});

// GET /api/articles/latest - Get latest published articles (for home page)
articles.get('/latest', zValidator('query', z.object({
  limit: z.coerce.number().min(1).max(20).default(5),
})), async (c) => {
  const { limit } = c.req.valid('query');

  try {
    const articlesData = await getArticles(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY,
      {
        status: 'published',
        limit,
      }
    );

    return c.json({
      success: true,
      data: articlesData,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch latest articles',
    }, 500);
  }
});

// GET /api/articles/categories - Get all categories
articles.get('/categories/list', async (c) => {
  try {
    const categories = await getCategories(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY
    );

    return c.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch categories',
    }, 500);
  }
});

// GET /api/articles/tags - Get all tags
articles.get('/tags', async (c) => {
  try {
    const tags = await getTags(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY
    );

    return c.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch tags',
    }, 500);
  }
});

// GET /api/articles/:slug - Get single article
// NOTE: This dynamic route must be registered AFTER static routes (/latest, /tags, /categories/list)
articles.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  try {
    const article = await getArticleBySlug(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY,
      slug
    );

    if (!article) {
      return c.json({
        success: false,
        error: 'Article not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: article,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch article',
    }, 500);
  }
});

export default articles;
