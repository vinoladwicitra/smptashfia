import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import type { Env } from '../types';

const facilities = new Hono<{ Bindings: Env; Variables: { userToken: string } }>();

// =====================================================
// PUBLIC ENDPOINTS
// =====================================================

// GET /api/facilities - Get all active facilities with their images (public)
facilities.get('/', async (c) => {
  try {
    const response = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/facility_categories?select=*,facility_images(id,image_url,display_order)&order=display_order.asc&is_active=eq.true`,
      {
        headers: {
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch facilities: ${response.statusText}`);
    }

    const categories = await response.json() as Array<Record<string, unknown>>;

    // Transform data for frontend: group images per category
    const result = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon_name: cat.icon_name,
      display_order: cat.display_order,
      images: (cat.facility_images as Array<Record<string, unknown>> | null || [])
        .sort((a, b) => ((a.display_order as number) || 0) - ((b.display_order as number) || 0))
        .map(img => img.image_url as string),
    }));

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return c.json({ success: false, error: 'Failed to fetch facilities' }, 500);
  }
});

// =====================================================
// STAFF/ADMIN ENDPOINTS (Protected)
// =====================================================

// GET /api/facilities/all - Get all facilities including inactive (staff only)
facilities.get('/all', authMiddleware, roleMiddleware(['staff', 'admin']), async (c) => {
  try {
    const response = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/facility_categories?select=*,facility_images(*)&order=display_order.asc`,
      {
        headers: {
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch facilities: ${response.statusText}`);
    }

    const categories = await response.json() as Array<Record<string, unknown>>;

    const result = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon_name: cat.icon_name,
      display_order: cat.display_order,
      is_active: cat.is_active,
      images: (cat.facility_images as Array<Record<string, unknown>> || [])
        .sort((a, b) => ((a.display_order as number) || 0) - ((b.display_order as number) || 0))
        .map(img => ({
          id: img.id as string,
          image_url: img.image_url as string,
          display_order: img.display_order as number,
        })),
    }));

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching all facilities:', error);
    return c.json({ success: false, error: 'Failed to fetch facilities' }, 500);
  }
});

// POST /api/facilities/categories - Create new category (staff only)
facilities.post(
  '/categories',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.object({
    name: z.string().min(1).max(100),
    icon_name: z.string().default('IconBuilding'),
    display_order: z.number().int().nonnegative().default(0),
    is_active: z.boolean().default(true),
  })),
  async (c) => {
    const data = c.req.valid('json');
    const userToken = c.get('userToken');

    try {
      const response = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/facility_categories`,
        {
          method: 'POST',
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
        const err = await response.text();
        throw new Error(`Failed to create category: ${response.statusText} - ${err}`);
      }

      const result = await response.json() as Array<Record<string, unknown>>;
      return c.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error creating category:', error);
      return c.json({ success: false, error: 'Failed to create category' }, 500);
    }
  }
);

// PATCH /api/facilities/categories/:id - Update category (staff only)
facilities.patch(
  '/categories/:id',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.object({
    name: z.string().min(1).max(100).optional(),
    icon_name: z.string().optional(),
    display_order: z.number().int().nonnegative().optional(),
    is_active: z.boolean().optional(),
  }).refine(val => Object.keys(val).length > 0, { message: 'At least one field required' })),
  async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const userToken = c.get('userToken');

    try {
      const response = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/facility_categories?id=eq.${id}`,
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
        throw new Error(`Failed to update category: ${response.statusText}`);
      }

      const result = await response.json() as Array<Record<string, unknown>>;
      if (result.length === 0) {
        return c.json({ success: false, error: 'Category not found' }, 404);
      }

      return c.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error updating category:', error);
      return c.json({ success: false, error: 'Failed to update category' }, 500);
    }
  }
);

// DELETE /api/facilities/categories/:id - Delete category and its images (staff only)
facilities.delete(
  '/categories/:id',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  async (c) => {
    const id = c.req.param('id');
    const userToken = c.get('userToken');

    try {
      // First, fetch images to delete them from storage
      const imagesRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/facility_images?facility_category_id=eq.${id}&select=image_url`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );

      if (imagesRes.ok) {
        const images = await imagesRes.json() as Array<{ image_url: string }>;
        // Delete images from storage in parallel
        const deletePromises = images.map(img =>
          fetch(`${c.env.SUPABASE_URL}/storage/v1/object/public/facilities/${encodeURIComponent(img.image_url.split('/').pop() || '')}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${userToken}` },
          }).catch(err => {
            console.warn('Failed to delete image file:', err);
          })
        );
        await Promise.all(deletePromises);
      }

      // Delete category (cascade will remove DB records of images)
      const response = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/facility_categories?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete category: ${response.statusText}`);
      }

      return c.json({ success: true, message: 'Category deleted' });
    } catch (error) {
      console.error('Error deleting category:', error);
      return c.json({ success: false, error: 'Failed to delete category' }, 500);
    }
  }
);

// POST /api/facilities/images - Upload image for a category (staff only)
facilities.post(
  '/images',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  async (c) => {
    const body = await c.req.parseBody();
    const file = body['file'];
    const categoryId = body['category_id'];

    if (!file || Array.isArray(file) || typeof file !== 'object' || !('type' in file)) {
      return c.json({ success: false, error: 'Invalid or missing file upload or category_id' }, 400);
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return c.json({ success: false, error: 'Category ID is required' }, 400);
    }

    const fileInstance = file as File;

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(fileInstance.type)) {
      return c.json({
        success: false,
        error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.',
      }, 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (fileInstance.size > maxSize) {
      return c.json({ success: false, error: 'File too large. Maximum size is 5MB.' }, 400);
    }

    try {
      const userToken = c.get('userToken');

      // Generate unique filename
      const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
      };
      const ext = mimeToExt[fileInstance.type] || 'jpg';
      const fileName = `${Date.now()}.${ext}`;

      // Upload to Supabase Storage under facilities/{categoryId}/
      const uploadUrl = `${c.env.SUPABASE_URL}/storage/v1/object/facilities/${encodeURIComponent(categoryId)}/${fileName}`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': fileInstance.type,
        },
        body: fileInstance,
      });

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.statusText} - ${errText}`);
      }

      // Determine public URL (based on Supabase storage format)
      const publicUrl = `${c.env.SUPABASE_URL}/storage/v1/object/public/facilities/${encodeURIComponent(categoryId)}/${fileName}`;

      // Insert image record into DB
      const dbResponse = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/facility_images`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${userToken}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            facility_category_id: categoryId,
            image_url: publicUrl,
            display_order: 0, // will be set later or via reorder
          }),
        }
      );

      if (!dbResponse.ok) {
        // If DB insert fails, try to cleanup uploaded file
        await fetch(`${c.env.SUPABASE_URL}/storage/v1/object/public/facilities/${encodeURIComponent(categoryId)}/${fileName}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${userToken}` },
        }).catch(() => {});
        throw new Error(`Failed to save image record: ${dbResponse.statusText}`);
      }

      const imageRecord = await dbResponse.json() as Array<Record<string, unknown>>;

      return c.json({
        success: true,
        data: {
          id: imageRecord[0].id,
          image_url: imageRecord[0].image_url,
          display_order: imageRecord[0].display_order,
        },
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return c.json({ success: false, error: 'Failed to upload image' }, 500);
    }
  }
);

// DELETE /api/facilities/images/:id - Delete an image (staff only)
facilities.delete(
  '/images/:id',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  async (c) => {
    const imageId = c.req.param('id');
    const userToken = c.get('userToken');

    try {
      // Get image record to get URL
      const getRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/facility_images?id=eq.${imageId}&select=image_url`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );

      if (!getRes.ok) {
        throw new Error('Failed to get image record');
      }

      const images = await getRes.json() as Array<{ image_url: string }>;
      if (images.length === 0) {
        return c.json({ success: false, error: 'Image not found' }, 404);
      }

      const imageUrl = images[0].image_url;

      // Extract storage key from URL if it's a Supabase storage URL
      const keyMatch = imageUrl.match(/\/object\/public\/facilities\/(.+)/);
      if (keyMatch) {
        const storageKey = keyMatch[1];
        // Delete from storage
        const deleteStorageRes = await fetch(
          `${c.env.SUPABASE_URL}/storage/v1/object/public/facilities/${encodeURIComponent(storageKey)}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${userToken}` },
          }
        );
        // Non-fatal if already deleted
        if (!deleteStorageRes.ok && deleteStorageRes.status !== 404) {
          console.warn('Storage delete warning:', deleteStorageRes.statusText);
        }
      } else {
        // Image not stored in facilities bucket (e.g., static asset), skip storage deletion
        console.log('Image not in facilities bucket, skipping storage delete:', imageUrl);
      }

      // Delete DB record
      const dbDelRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/facility_images?id=eq.${imageId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );

      if (!dbDelRes.ok) {
        throw new Error(`Failed to delete image record: ${dbDelRes.statusText}`);
      }

      return c.json({ success: true, message: 'Image deleted' });
    } catch (error) {
      console.error('Error deleting image:', error);
      return c.json({ success: false, error: 'Failed to delete image' }, 500);
    }
  }
);

// PATCH /api/facilities/images/:id - Update image order or replace (staff only)
facilities.patch(
  '/images/:id',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.object({
    display_order: z.number().int().nonnegative().optional(),
    image_url: z.string().optional(), // for replacement (via reupload)
  }).refine(val => Object.keys(val).length > 0, { message: 'At least one field required' })),
  async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const userToken = c.get('userToken');

    try {
      const response = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/facility_images?id=eq.${id}`,
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
        throw new Error(`Failed to update image: ${response.statusText}`);
      }

      const result = await response.json() as Array<Record<string, unknown>>;
      if (result.length === 0) {
        return c.json({ success: false, error: 'Image not found' }, 404);
      }

      return c.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error updating image:', error);
      return c.json({ success: false, error: 'Failed to update image' }, 500);
    }
  }
);

// PATCH /api/facilities/reorder/categories - Reorder categories (staff only)
facilities.patch(
  '/reorder/categories',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.array(z.object({
    id: z.string(),
    display_order: z.number().int().nonnegative(),
  }))),
  async (c) => {
    const orderList = c.req.valid('json');
    const userToken = c.get('userToken');

    // Update each category's display_order in a transaction-like manner
    try {
      // Use Supabase REST to update multiple rows - can't truly batch, but do sequentially for safety
      for (const item of orderList) {
        await fetch(
          `${c.env.SUPABASE_URL}/rest/v1/facility_categories?id=eq.${item.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': c.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({ display_order: item.display_order }),
          }
        );
      }

      return c.json({ success: true, message: 'Categories reordered' });
    } catch (error) {
      console.error('Error reordering categories:', error);
      return c.json({ success: false, error: 'Failed to reorder categories' }, 500);
    }
  }
);

// PATCH /api/facilities/reorder/images - Reorder images within a category (staff only)
facilities.patch(
  '/reorder/images',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.array(z.object({
    id: z.string(),
    display_order: z.number().int().nonnegative(),
  }))),
  async (c) => {
    const orderList = c.req.valid('json');
    const userToken = c.get('userToken');

    try {
      for (const item of orderList) {
        await fetch(
          `${c.env.SUPABASE_URL}/rest/v1/facility_images?id=eq.${item.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': c.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({ display_order: item.display_order }),
          }
        );
      }

      return c.json({ success: true, message: 'Images reordered' });
    } catch (error) {
      console.error('Error reordering images:', error);
      return c.json({ success: false, error: 'Failed to reorder images' }, 500);
    }
  }
);

export default facilities;
