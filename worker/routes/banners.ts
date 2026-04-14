import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import type { Env } from '../types';

const banners = new Hono<{ Bindings: Env; Variables: { userToken: string } }>();

// GET /api/banners - Get all banners (public)
banners.get('/', async (c) => {
  try {
    const response = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/banners?select=*`,
      {
        headers: {
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch banners: ${response.statusText}`);
    }

    const banners = await response.json() as Array<Record<string, unknown>>;

    // Convert to key-value format for easier frontend usage
    const bannerMap: Record<string, Record<string, unknown>> = {};
    for (const banner of banners) {
      const type = banner.banner_type as string;
      bannerMap[type] = banner;
    }

    return c.json({
      success: true,
      data: bannerMap,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch banners',
    }, 500);
  }
});

// GET /api/banners/:type - Get single banner by type (public)
banners.get('/:type', async (c) => {
  const type = c.req.param('type');

  if (!['top_banner', 'popup_banner'].includes(type)) {
    return c.json({
      success: false,
      error: 'Invalid banner type',
    }, 400);
  }

  try {
    const response = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/banners?banner_type=eq.${type}&select=*`,
      {
        headers: {
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch banner: ${response.statusText}`);
    }

    const data = await response.json() as Array<Record<string, unknown>>;

    if (data.length === 0) {
      return c.json({
        success: false,
        error: 'Banner not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch banner',
    }, 500);
  }
});

// PATCH /api/banners/:type - Update banner (staff/admin/teacher only)
banners.patch(
  '/:type',
  authMiddleware,
  roleMiddleware(['staff', 'admin', 'teacher']),
  zValidator('json', z.object({
    enabled: z.boolean().optional(),
    text: z.string().optional(),
    image_url: z.string().optional(),
    button_label: z.string().optional(),
    button_link: z.string().optional(),
  })),
  async (c) => {
    const type = c.req.param('type');

    if (!['top_banner', 'popup_banner'].includes(type)) {
      return c.json({
        success: false,
        error: 'Invalid banner type',
      }, 400);
    }

    const data = c.req.valid('json');

    try {
      const userToken = c.get('userToken');
      const response = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/banners?banner_type=eq.${type}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${userToken}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to update banner: ${response.statusText} - ${errText}`);
      }

      const result = await response.json() as Array<Record<string, unknown>>;

      return c.json({
        success: true,
        message: 'Banner updated successfully',
        data: result[0],
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to update banner',
      }, 500);
    }
  }
);

// POST /api/banners/upload - Upload banner image (staff/admin/teacher only)
banners.post(
  '/upload',
  authMiddleware,
  roleMiddleware(['staff', 'admin', 'teacher']),
  async (c) => {
    const body = await c.req.parseBody();
    const file = body['file'] as File | undefined;

    if (!file) {
      return c.json({
        success: false,
        error: 'No file provided',
      }, 400);
    }

    try {
      const userToken = c.get('userToken');
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `banner-${Date.now()}.${ext}`;

      // Upload to Supabase Storage
      const uploadResponse = await fetch(
        `${c.env.SUPABASE_URL}/storage/v1/object/banners/${fileName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
          body: file,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
      }

      const publicUrl = `${c.env.SUPABASE_URL}/storage/v1/object/public/banners/${fileName}`;

      return c.json({
        success: true,
        data: {
          url: publicUrl,
          fileName,
        },
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to upload image',
      }, 500);
    }
  }
);

export default banners;
