import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import type { Env } from '../types';

const siteSettings = new Hono<{ Bindings: Env; Variables: { userToken: string } }>();

// Helper validators
function isHttpsUrl(url?: string): boolean {
  if (!url || url === '') return true;
  try {
    const u = new URL(url);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isGoogleMapsEmbedUrl(url?: string): boolean {
  if (!url || url === '') return true;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname.endsWith('google.com') && u.pathname.startsWith('/maps/embed');
  } catch {
    return false;
  }
}

// GET /api/site-settings - Get all settings grouped (public)
siteSettings.get('/', async (c) => {
  try {
    const response = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/site_settings?select=*`,
      {
        headers: {
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.statusText}`);
    }

    const settings = await response.json() as Array<Record<string, unknown>>;

    // Convert to key-value format grouped by setting_group
    const grouped: Record<string, Record<string, string>> = {};
    for (const s of settings) {
      const group = (s.setting_group as string) || 'general';
      if (!grouped[group]) grouped[group] = {};
      grouped[group][s.setting_key as string] = (s.setting_value as string) || '';
    }

    return c.json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch settings',
    }, 500);
  }
});

// PATCH /api/site-settings - Update multiple settings (staff/admin/teacher only)
siteSettings.patch(
  '/',
  authMiddleware,
  roleMiddleware(['staff', 'admin', 'teacher']),
  zValidator('json', z.object({
    contact_phone: z.string().optional(),
    contact_phone_intl: z.string().optional(),
    contact_hours: z.string().optional(),
    contact_address_short: z.string().optional(),
    contact_address_full: z.string().optional(),
    maps_embed_url: z.string().refine(isGoogleMapsEmbedUrl, { message: 'maps_embed_url must be a valid Google Maps embed URL (or empty)' }).optional(),
    maps_link: z.string().refine(isHttpsUrl, { message: 'maps_link must be a valid HTTPS URL' }).optional(),
    social_instagram: z.string().refine(isHttpsUrl, { message: 'social_instagram must be a valid HTTPS URL' }).optional(),
    social_instagram_label: z.string().optional(),
    social_facebook: z.string().refine(isHttpsUrl, { message: 'social_facebook must be a valid HTTPS URL' }).optional(),
    social_facebook_label: z.string().optional(),
    social_youtube: z.string().refine(isHttpsUrl, { message: 'social_youtube must be a valid HTTPS URL' }).optional(),
    social_youtube_label: z.string().optional(),
  })),
  async (c) => {
    const data = c.req.valid('json');
    const userToken = c.get('userToken');

    try {
      const updates = Object.entries(data);

      // Fire all PATCH requests in parallel
      const results = await Promise.allSettled(
        updates.map(async ([key, value]) => {
          const response = await fetch(
            `${c.env.SUPABASE_URL}/rest/v1/site_settings?setting_key=eq.${key}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': c.env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${userToken}`,
                'Prefer': 'return=representation',
              },
              body: JSON.stringify({ setting_value: value }),
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to update ${key}: ${response.status}`);
          }

          const result = await response.json() as Array<Record<string, unknown>>;
          return result[0];
        })
      );

      // Collect successful results and failed keys
      const successfulResults: Array<Record<string, unknown>> = [];
      const failedKeys: string[] = [];

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled' && result.value) {
          successfulResults.push(result.value);
        } else {
          failedKeys.push(updates[i][0]);
        }
      }

      if (failedKeys.length > 0) {
        return c.json({
          success: false,
          error: `Failed to update settings: ${failedKeys.join(', ')}`,
          data: successfulResults,
        }, 500);
      }

      return c.json({
        success: true,
        message: 'Settings updated successfully',
        data: successfulResults,
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to update settings',
      }, 500);
    }
  }
);

export default siteSettings;
