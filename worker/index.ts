import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors';
import articles from './routes/articles';
import ppdb from './routes/ppdb';
import auth from './routes/auth';
import banners from './routes/banners';
import siteSettings from './routes/siteSettings';
import users from './routes/users';
import googleSheets from './routes/googleSheets';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// Apply CORS middleware globally
app.use('*', corsMiddleware);

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'smptashfia-api',
  });
});

// API routes
app.route('/api/articles', articles);
app.route('/api/ppdb', ppdb);
app.route('/api/auth', auth);
app.route('/api/banners', banners);
app.route('/api/site-settings', siteSettings);
app.route('/api/users', users);
app.route('/api/google-sheets', googleSheets);

// Fallback for non-API routes (let Cloudflare Pages handle them)
app.notFound((c) => {
  // Return 404 only for API routes
  if (c.req.path.startsWith('/api/')) {
    return c.json({
      success: false,
      error: 'Not Found',
    }, 404);
  }
  
  // For non-API routes, let the Pages assets handle it
  // This will be handled by the SPA fallback in wrangler.jsonc
  return new Response(null, { status: 404 });
});

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  if (c.req.path.startsWith('/api/')) {
    return c.json({
      success: false,
      error: 'Internal Server Error',
    }, 500);
  }

  return new Response('Internal Server Error', { status: 500 });
});

export default app;
