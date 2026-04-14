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

  // Add tag filter
  if (options?.tag) {
    params.set('tag_mappings', 'cs.{' + encodeURIComponent(options.tag) + '}');
  }

  // Add author filter
  if (options?.authorId) {
    params.set('author_id', 'eq.' + options.authorId);
  }

  // Add category filter
  if (options?.category) {
    params.set('category_mappings', 'cs.{' + encodeURIComponent(options.category) + '}');
  }

  // Select article fields plus nested category mappings for frontend display
  params.set('select', '*,article_category_mappings(article_categories(name,slug))');

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
  params.set('slug', 'eq.' + encodeURIComponent(slug));
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
  params.set('banner_type', 'eq.' + encodeURIComponent(type));
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
