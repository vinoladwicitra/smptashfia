import { createMiddleware } from 'hono/factory';

/**
 * CORS middleware for handling cross-origin requests
 */
export const corsMiddleware = createMiddleware(async (c, next) => {
  const origin = c.req.header('Origin');
  const allowedOrigins = [
    'http://localhost:5173',
    'https://smptashfia.pages.dev',
    'https://smptashfia.sch.id',
  ];

  // Allow wildcard subdomains (*.smptashfia.sch.id) - parse hostname to prevent spoofing
  let isAllowedSubdomain = false;
  if (origin) {
    try {
      const parsedOrigin = new URL(origin);
      const baseHost = 'smptashfia.sch.id';
      const hostname = parsedOrigin.hostname;
      isAllowedSubdomain = hostname === baseHost || hostname.endsWith('.' + baseHost);
    } catch {
      // Invalid origin URL, not allowed
    }
  }

  if (origin && (allowedOrigins.includes(origin) || isAllowedSubdomain)) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Vary', 'Origin');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
    c.header('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
});
