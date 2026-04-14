import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import type { Env } from '../types';

const googleSheets = new Hono<{ Bindings: Env; Variables: { userToken: string } }>();

// Google OAuth2 constants
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_SHEETS_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

// Helper: get current config from DB
async function getConfig(supabaseUrl: string, supabaseAnonKey: string, supabaseServiceKey?: string) {
  const key = supabaseServiceKey || supabaseAnonKey;
  const res = await fetch(`${supabaseUrl}/rest/v1/google_sheets_config?select=*&limit=1`, {
    headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${key}` },
  });
  if (!res.ok) return null;
  const data = await res.json() as Array<Record<string, unknown>>;
  return data[0] || null;
}

// Helper: build OAuth redirect URI from request URL (always https, SPA route)
function buildRedirectUri(url: string): string {
  const u = new URL(url);
  return `https://${u.host}/staff/google-sheets/callback`;
}

// Helper: get Google credentials from DB
async function getGoogleCredentials(supabaseUrl: string, supabaseAnonKey: string, supabaseServiceKey?: string) {
  const key = supabaseServiceKey || supabaseAnonKey;
  const res = await fetch(`${supabaseUrl}/rest/v1/google_credentials?select=*&limit=1`, {
    headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${key}` },
  });
  if (!res.ok) return null;
  const data = await res.json() as Array<Record<string, unknown>>;
  return data[0] as { id?: string; client_id: string; client_secret: string; redirect_uri?: string | null } | null;
}

// Helper: refresh Google access token
async function refreshAccessToken(env: Env, refreshToken: string) {
  const creds = await getGoogleCredentials(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  if (!creds?.client_id || !creds?.client_secret) {
    throw new Error('Google OAuth credentials not configured. Set them in Staff > Google Sheets > Pengaturan.');
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  return {
    accessToken: data.access_token,
    expiry: new Date(Date.now() + data.expires_in * 1000),
  };
}

// Helper: get valid access token (refresh if needed)
async function getValidAccessToken(env: Env, config: Record<string, unknown>) {
  const expiry = config.token_expiry as string | null;
  const now = new Date();

  // Refresh if expired or will expire in 5 minutes
  if (!expiry || new Date(expiry) < new Date(now.getTime() + 5 * 60 * 1000)) {
    const refreshed = await refreshAccessToken(env, config.refresh_token as string);

    // Update config in DB
    await fetch(
      `${env.SUPABASE_URL}/rest/v1/google_sheets_config?id=eq.${config.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          access_token: refreshed.accessToken,
          token_expiry: refreshed.expiry.toISOString(),
        }),
      }
    );

    return refreshed.accessToken;
  }

  return config.access_token as string;
}

// GET /api/google-sheets/auth-url - Generate OAuth authorization URL
googleSheets.get('/auth-url', async (c) => {
  const creds = await getGoogleCredentials(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, c.env.SUPABASE_SERVICE_KEY);
  const redirectUri = buildRedirectUri(c.req.url);
  
  if (!creds?.client_id) {
    return c.json({
      success: true,
      data: {
        authUrl: null,
        redirectUri: redirectUri,
        clientId: '',
        clientSecret: '',
        scopes: GOOGLE_SHEETS_SCOPES.split(' '),
        configured: false,
        message: 'Google OAuth credentials not configured. Set them below.',
      },
    });
  }

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set('client_id', creds.client_id);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GOOGLE_SHEETS_SCOPES);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  return c.json({
    success: true,
    data: {
      authUrl: authUrl.toString(),
      redirectUri: redirectUri,
      clientId: creds.client_id,
      scopes: GOOGLE_SHEETS_SCOPES.split(' '),
      configured: true,
    },
  });
});

// PUT /api/google-sheets/credentials - Save Google OAuth credentials
googleSheets.put(
  '/credentials',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.object({
    client_id: z.string().min(1),
    client_secret: z.string().min(1),
    redirect_uri: z.string().url().optional(),
  })),
  async (c) => {
    const data = c.req.valid('json');
    const FIXED_ID = '00000000-0000-0000-0000-000000000001';

    try {
      // Use upsert with on_conflict=id to handle single row constraint
      const res = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/google_credentials?on_conflict=id`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            id: FIXED_ID,
            client_id: data.client_id,
            client_secret: data.client_secret,
            ...(data.redirect_uri ? { redirect_uri: data.redirect_uri } : {}),
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        return c.json({ success: false, error: `Failed to save: ${errText}` }, 500);
      }

      return c.json({ success: true, message: 'Credentials saved successfully' });
    } catch (error) {
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save credentials',
      }, 500);
    }
  }
);

// POST /api/google-sheets/oauth/callback - Process OAuth code (called from SPA)
googleSheets.post(
  '/oauth/callback',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  async (c) => {
    const { code, error: oauthError } = await c.req.json();

    if (oauthError) {
      return c.json({ success: false, error: `OAuth cancelled: ${oauthError}` }, 400);
    }

    if (!code) {
      return c.json({ success: false, error: 'No authorization code' }, 400);
    }

    const creds = await getGoogleCredentials(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, c.env.SUPABASE_SERVICE_KEY);
    if (!creds?.client_id || !creds?.client_secret) {
      return c.json({ success: false, error: 'Google OAuth credentials not configured' }, 500);
    }

    // Use the redirect URI from DB (user-configured) or build dynamically
    const redirectUri = creds?.redirect_uri || buildRedirectUri(c.req.url);

    // Exchange code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: creds.client_id,
        client_secret: creds.client_secret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return c.json({ success: false, error: `Token exchange failed: ${err}` }, 400);
    }

    const tokenData = await tokenRes.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope: string;
    };

    // Get user email
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userInfoRes.json() as { email: string };

    // Upsert config (single row always)
    const existingConfig = await getConfig(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, c.env.SUPABASE_SERVICE_KEY);
    const expiry = new Date(Date.now() + tokenData.expires_in * 1000);

    if (existingConfig) {
      await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/google_sheets_config?id=eq.${existingConfig.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || existingConfig.refresh_token,
            token_expiry: expiry.toISOString(),
            user_email: userInfo.email,
          }),
        }
      );
    } else {
      await fetch(`${c.env.SUPABASE_URL}/rest/v1/google_sheets_config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expiry: expiry.toISOString(),
          user_email: userInfo.email,
        }),
      });
    }

    return c.json({ success: true, message: 'Google connected successfully' });
  }
);

// POST /api/google-sheets/refresh - Manually refresh token
googleSheets.post(
  '/refresh-token',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  async (c) => {
    try {
      const config = await getConfig(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, c.env.SUPABASE_SERVICE_KEY);
      if (!config?.refresh_token) {
        return c.json({ success: false, error: 'No refresh token available' }, 400);
      }

      const refreshed = await refreshAccessToken(c.env, config.refresh_token as string);

      await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/google_sheets_config?id=eq.${config.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            access_token: refreshed.accessToken,
            token_expiry: refreshed.expiry.toISOString(),
          }),
        }
      );

      return c.json({ success: true, message: 'Token refreshed successfully' });
    } catch (error) {
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh token',
      }, 500);
    }
  }
);

// GET /api/google-sheets/spreadsheets - List user's Google Sheets files
googleSheets.get(
  '/spreadsheets',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  async (c) => {
    try {
      const config = await getConfig(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, c.env.SUPABASE_SERVICE_KEY);
      if (!config?.access_token) {
        return c.json({ success: false, error: 'Not authenticated with Google' }, 401);
      }

      const accessToken = await getValidAccessToken(c.env, config);

      // Search for spreadsheets in Drive
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,createdTime,modifiedTime)&pageSize=50&orderBy=modifiedTime desc`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) {
        throw new Error(`Drive API error: ${res.statusText}`);
      }

      const data = await res.json() as { files: Array<{ id: string; name: string; createdTime: string; modifiedTime: string }> };

      return c.json({
        success: true,
        data: data.files || [],
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list spreadsheets',
      }, 500);
    }
  }
);

// GET /api/google-sheets/sheets/:spreadsheetId - Get sheets/tabs in a spreadsheet
googleSheets.get(
  '/sheets/:spreadsheetId',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  async (c) => {
    try {
      const spreadsheetId = c.req.param('spreadsheetId');
      const config = await getConfig(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, c.env.SUPABASE_SERVICE_KEY);
      if (!config?.access_token) {
        return c.json({ success: false, error: 'Not authenticated with Google' }, 401);
      }

      const accessToken = await getValidAccessToken(c.env, config);

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) {
        throw new Error(`Sheets API error: ${res.statusText}`);
      }

      const data = await res.json() as { sheets: Array<{ properties: { sheetId: number; title: string } }> };
      const sheets = data.sheets?.map((s) => ({
        id: s.properties.sheetId,
        name: s.properties.title,
      })) || [];

      return c.json({ success: true, data: sheets });
    } catch (error) {
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list sheets',
      }, 500);
    }
  }
);

// GET /api/google-sheets/config - Get current config
googleSheets.get('/config', authMiddleware, roleMiddleware(['staff', 'admin']), async (c) => {
  try {
    const config = await getConfig(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, c.env.SUPABASE_SERVICE_KEY);
    return c.json({
      success: true,
      data: config || { connected: false },
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to get config' }, 500);
  }
});

// PUT /api/google-sheets/config - Update config (spreadsheet, sheet selection)
googleSheets.put(
  '/config',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.object({
    spreadsheet_id: z.string().optional(),
    spreadsheet_title: z.string().optional(),
    sheet_name: z.string().optional(),
    auto_sync: z.boolean().optional(),
  })),
  async (c) => {
    const data = c.req.valid('json');

    try {
      const config = await getConfig(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, c.env.SUPABASE_SERVICE_KEY);
      if (!config) {
        return c.json({ success: false, error: 'Not connected to Google Sheets' }, 400);
      }

      await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/google_sheets_config?id=eq.${config.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(data),
        }
      );

      return c.json({ success: true, message: 'Config updated' });
    } catch (error) {
      return c.json({ success: false, error: 'Failed to update config' }, 500);
    }
  }
);

// GET /api/google-sheets/sheet-headers/:spreadsheetId/:sheetName - Get headers from sheet's first row
googleSheets.get(
  '/sheet-headers/:spreadsheetId/:sheetName',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  async (c) => {
    try {
      const spreadsheetId = c.req.param('spreadsheetId');
      const sheetName = decodeURIComponent(c.req.param('sheetName'));
      const config = await getConfig(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, c.env.SUPABASE_SERVICE_KEY);
      if (!config?.access_token) {
        return c.json({ success: false, error: 'Not authenticated with Google' }, 401);
      }

      const accessToken = await getValidAccessToken(c.env, config);

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:ZZ1`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) {
        throw new Error(`Sheets API error: ${res.statusText}`);
      }

      const data = await res.json() as { values?: Array<string[]> };
      const headers = data.values?.[0] || [];

      return c.json({
        success: true,
        data: { headers },
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch sheet headers',
      }, 500);
    }
  }
);

// GET /api/google-sheets/mappings - Get field-to-column mappings
googleSheets.get('/mappings', async (c) => {
  try {
    const res = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/google_sheets_mappings?select=*&order=column_letter.asc`,
      {
        headers: {
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch mappings: ${res.statusText}`);
    }

    const mappings = await res.json() as Array<Record<string, unknown>>;

    // Group by field_name for easier frontend use
    const fieldMap: Record<string, { column_letter: string; column_label: string }> = {};
    for (const m of mappings) {
      fieldMap[m.field_name as string] = {
        column_letter: m.column_letter as string,
        column_label: (m.column_label as string) || m.column_letter as string,
      };
    }

    return c.json({ success: true, data: { mappings, fieldMap } });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch mappings' }, 500);
  }
});

// PUT /api/google-sheets/mappings - Update a mapping
googleSheets.put(
  '/mappings/:fieldName',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.object({
    column_letter: z.string().min(1),
    column_label: z.string().optional(),
  })),
  async (c) => {
    const fieldName = c.req.param('fieldName');
    const data = c.req.valid('json');

    try {
      const existing = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/google_sheets_mappings?field_name=eq.${fieldName}&select=id`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      const existingData = await existing.json() as Array<Record<string, unknown>>;

      if (existingData.length > 0) {
        // Update existing
        await fetch(
          `${c.env.SUPABASE_URL}/rest/v1/google_sheets_mappings?id=eq.${existingData[0].id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': c.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(data),
          }
        );
      } else {
        // Create new
        await fetch(`${c.env.SUPABASE_URL}/rest/v1/google_sheets_mappings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ field_name: fieldName, ...data }),
        });
      }

      return c.json({ success: true, message: 'Mapping updated' });
    } catch (error) {
      return c.json({ success: false, error: 'Failed to update mapping' }, 500);
    }
  }
);

// POST /api/google-sheets/sync - Sync all PPDB data to Google Sheets
googleSheets.post(
  '/sync',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  async (c) => {
    try {
      const config = await getConfig(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, c.env.SUPABASE_SERVICE_KEY);
      if (!config?.spreadsheet_id || !config?.sheet_name) {
        return c.json({
          success: true,
          data: { headers: [], rows: [], total: 0, lastSync: null, notConfigured: true },
        });
      }

      const accessToken = await getValidAccessToken(c.env, config);

      // Get mappings
      const mappingsRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/google_sheets_mappings?select=*&order=column_letter.asc`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      const mappings = await mappingsRes.json() as Array<Record<string, unknown>>;

      // Get all PPDB registrations
      const ppdbRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/ppdb_registrations?select=*&order=created_at.asc`,
        {
          headers: {
            'apikey': c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      const ppdbData = await ppdbRes.json() as Array<Record<string, unknown>>;

      // Build header row from mappings (column_letter now stores the actual header name)
      const headerRow = mappings.map((m) => (m.column_letter as string) || (m.column_label as string) || '');

      // Build data rows - map fields to columns using the order in mappings
      const rows = ppdbData.map((reg) => {
        return mappings.map((m) => {
          const field = m.field_name as string;
          let value = reg[field];
          if (value instanceof Date) {
            value = (value as Date).toISOString().split('T')[0];
          }
          return value !== null && value !== undefined ? String(value) : '';
        });
      });

      // Clear existing data and write new
      const spreadsheetId = config.spreadsheet_id as string;
      const sheetName = config.sheet_name as string;

      // Compute dynamic end column from header count (A, B, ..., Z, AA, AB, ...)
      const numCols = headerRow.length || 1;
      const colIndexToLetter = (n: number): string => {
        let letters = '';
        while (n > 0) {
          n -= 1;
          letters = String.fromCharCode(65 + (n % 26)) + letters;
          n = Math.floor(n / 26);
        }
        return letters;
      };
      const endCol = colIndexToLetter(numCols);

      // Clear
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A2:${endCol}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: [] }),
        }
      );

      // Write headers (row 1) and data (row 2+)
      const allValues = [headerRow, ...rows];

      const writeRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:${endCol}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: allValues }),
        }
      );

      if (!writeRes.ok) {
        throw new Error(`Sheets API write error: ${writeRes.statusText}`);
      }

      // Update last_sync_at
      if (config.id) {
        await fetch(
          `${c.env.SUPABASE_URL}/rest/v1/google_sheets_config?id=eq.${config.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': c.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ last_sync_at: new Date().toISOString() }),
          }
        );
      }

      return c.json({
        success: true,
        message: `Synced ${rows.length} records to Google Sheets`,
        data: { synced: rows.length },
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync',
      }, 500);
    }
  }
);

// GET /api/google-sheets/data - Get data from Google Sheets (for staff UI viewing)
googleSheets.get(
  '/data',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  async (c) => {
    try {
      const config = await getConfig(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, c.env.SUPABASE_SERVICE_KEY);
      if (!config?.spreadsheet_id || !config?.sheet_name) {
        return c.json({
          success: true,
          data: { headers: [], rows: [], total: 0, lastSync: null, notConfigured: true },
        });
      }

      const accessToken = await getValidAccessToken(c.env, config);
      const spreadsheetId = config.spreadsheet_id as string;
      const sheetName = config.sheet_name as string;

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:Z`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) {
        throw new Error(`Sheets API error: ${res.statusText}`);
      }

      const data = await res.json() as { values?: Array<string[]>; range: string };

      // Convert to array of objects using header row
      const headers = data.values?.[0] || [];
      const rows = (data.values?.slice(1) || []).map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = row[i] || '';
        });
        return obj;
      });

      return c.json({
        success: true,
        data: {
          headers,
          rows,
          total: rows.length,
          lastSync: config.last_sync_at as string | null,
        },
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Google Sheets data',
      }, 500);
    }
  }
);

export default googleSheets;
