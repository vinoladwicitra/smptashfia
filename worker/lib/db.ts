/**
 * Database helper functions for Supabase
 * These functions interact with the Supabase REST API
 */

/**
 * Execute a SQL query using Supabase RPC or direct query
 * This is a helper for Cloudflare D1/Supabase compatibility
 */
export async function dbQuery<T = unknown>(
  supabaseUrl: string,
  supabaseKey: string,
  query: string,
  params: unknown[] = []
): Promise<T[]> {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/db_query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ query, params }),
  });

  if (!response.ok) {
    throw new Error(`Database query failed: ${response.statusText}`);
  }

  return response.json() as Promise<T[]>;
}

/**
 * Fetch articles from Supabase
 */
export async function getArticles(
  supabaseUrl: string,
  supabaseKey: string,
  options?: {
    status?: string;
    category?: string;
    tag?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  }
) {
  const params = new URLSearchParams();
  
  if (options?.status) {
    params.set('status', 'eq.' + options.status);
  } else {
    // Default to published
    params.set('status', 'eq.published');
  }
  
  if (options?.limit) {
    params.set('limit', String(options.limit));
  }
  
  params.set('order', 'published_at.desc');

  let url = `${supabaseUrl}/rest/v1/articles?${params}`;
  
  // Add category filter if provided
  if (options?.category) {
    url = `${supabaseUrl}/rest/v1/articles?${params}&category_mappings=cs.{${options.category}}`;
  }

  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch articles: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get single article by slug
 */
export async function getArticleBySlug(
  supabaseUrl: string,
  supabaseKey: string,
  slug: string
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/articles?slug=eq.${slug}&select=*,author:profiles(*)`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.statusText}`);
  }

  const data = await response.json() as Array<Record<string, unknown>>;
  return data[0] || null;
}

/**
 * Get PPDB registrations
 */
export async function getPPDBRegistrations(
  supabaseUrl: string,
  supabaseKey: string,
  options?: {
    status?: string;
    sekolah?: string;
    limit?: number;
    offset?: number;
  }
) {
  const params = new URLSearchParams();
  
  if (options?.status) {
    params.set('status', 'eq.' + options.status);
  }
  
  if (options?.sekolah) {
    params.set('pemilihan_sekolah', 'eq.' + options.sekolah);
  }
  
  if (options?.limit) {
    params.set('limit', String(options.limit));
  }
  
  params.set('order', 'created_at.desc');

  const response = await fetch(
    `${supabaseUrl}/rest/v1/ppdb_registrations?${params}`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch PPDB registrations: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create PPDB registration
 */
export async function createPPDBRegistration(
  supabaseUrl: string,
  supabaseKey: string,
  data: Record<string, unknown>
) {
  const response = await fetch(`${supabaseUrl}/rest/v1/ppdb_registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create PPDB registration: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get article categories
 */
export async function getCategories(
  supabaseUrl: string,
  supabaseKey: string
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/article_categories?select=*`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get article tags
 */
export async function getTags(
  supabaseUrl: string,
  supabaseKey: string
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/article_tags?select=*`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all banners
 */
export async function getBanners(
  supabaseUrl: string,
  supabaseKey: string
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/banners?select=*`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch banners: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get single banner by type
 */
export async function getBannerByType(
  supabaseUrl: string,
  supabaseKey: string,
  type: string
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/banners?banner_type=eq.${type}&select=*`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch banner: ${response.statusText}`);
  }

  const data = await response.json() as Array<Record<string, unknown>>;
  return data[0] || null;
}
