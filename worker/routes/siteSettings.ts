import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import type { Env } from '../types';

const siteSettings = new Hono<{ Bindings: Env; Variables: { userToken: string } }>();

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
    maps_embed_url: z.string().optional(),
    maps_link: z.string().optional(),
    social_instagram: z.string().optional(),
    social_instagram_label: z.string().optional(),
    social_facebook: z.string().optional(),
    social_facebook_label: z.string().optional(),
    social_youtube: z.string().optional(),
    social_youtube_label: z.string().optional(),
  })),
  async (c) => {
    const data = c.req.valid('json');
    const userToken = c.get('userToken');

    try {
      const updates = Object.entries(data);
      const results: Array<Record<string, unknown>> = [];

      for (const [key, value] of updates) {
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

        if (response.ok) {
          const result = await response.json() as Array<Record<string, unknown>>;
          if (result[0]) results.push(result[0]);
        }
      }

      return c.json({
        success: true,
        message: 'Settings updated successfully',
        data: results,
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
