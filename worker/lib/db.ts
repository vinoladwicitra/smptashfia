/**
 * Database helper functions for Supabase
 * These functions interact with the Supabase REST API
 */

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

  if (options?.offset) {
    params.set('offset', String(options.offset));
  }

  params.set('order', 'published_at.desc');

  // Add tag filter via relational junction table
  if (options?.tag) {
    params.set('article_tag_mappings.article_tags.slug', 'eq.' + options.tag);
  }

  // Add author filter
  if (options?.authorId) {
    params.set('author_id', 'eq.' + options.authorId);
  }

  // Add category filter via relational junction table
  if (options?.category) {
    params.set('article_category_mappings.article_categories.slug', 'eq.' + options.category);
  }

  // Select article fields plus nested category mappings for frontend display
  let selectQuery = options?.category
    ? '*,article_category_mappings!inner(article_categories(name,slug))'
    : '*,article_category_mappings(article_categories(name,slug))';
  if (options?.tag) {
    selectQuery += ',article_tag_mappings!inner(article_tags(name,slug))';
  }
  params.set('select', selectQuery);

  const url = `${supabaseUrl}/rest/v1/articles?${params}`;

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
  slug: string,
  options?: { status?: string }
) {
  const params = new URLSearchParams();
  params.set('slug', 'eq.' + slug);
  params.set('select', '*,author:profiles(*)');

  // Default to published unless explicitly requested otherwise
  const status = options?.status || 'published';
  params.set('status', 'eq.' + status);

  const response = await fetch(
    `${supabaseUrl}/rest/v1/articles?${params}`,
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
    search?: string;
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

  // Server-side search across multiple fields using PostgREST or() operator
  if (options?.search) {
    // Escape SQL wildcard characters (%) and (_) before encoding
    const escaped = options.search.replace(/%/g, '\\%').replace(/_/g, '\\_');
    // Don't double-encode: use raw search term in the ilike pattern
    // PostgREST will handle the URL encoding
    params.set('or', `nama_lengkap.ilike.*${escaped}*,email.ilike.*${escaped}*,asal_sekolah.ilike.*${escaped}*`);
  }

  if (options?.limit) {
    params.set('limit', String(options.limit));
  }

  if (options?.offset) {
    params.set('offset', String(options.offset));
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
  const params = new URLSearchParams();
  params.set('banner_type', 'eq.' + type);
  params.set('select', '*');

  const response = await fetch(
    `${supabaseUrl}/rest/v1/banners?${params}`,
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
