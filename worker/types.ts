/**
 * Environment variables and bindings for Cloudflare Workers
 */
export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
  DB?: D1Database; // Optional: for future D1 migration
}

/**
 * User context attached by auth middleware
 */
export interface UserContext {
  id: string;
  email: string;
  roles: string[];
  display_name?: string;
}

/**
 * Hono context variables
 */
export interface ContextVariables {
  user: UserContext;
}
