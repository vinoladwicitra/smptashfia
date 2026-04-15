import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import type { Env, UserContext } from '../types';

interface SupabaseUser {
  id: string;
  email: string;
  user_metadata?: {
    display_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  created_at?: string;
  [key: string]: any;
}

const auth = new Hono<{ Bindings: Env; Variables: { user: UserContext; userToken: string } }>();

// POST /api/auth/validate - Validate token and get user info
auth.post('/validate', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: 'Missing or invalid token',
    }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const response = await fetch(`${c.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': c.env.SUPABASE_ANON_KEY,
      },
    });

    if (!response.ok) {
      return c.json({
        success: false,
        error: 'Invalid token',
      }, 401);
    }

    const user = await response.json() as SupabaseUser;

    // Fetch user roles
    const rolesResponse = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${encodeURIComponent(user.id)}&select=*,roles(*)`,
      {
        headers: {
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!rolesResponse.ok) {
      return c.json({
        success: false,
        error: 'Failed to fetch user roles',
      }, 500);
    }

    const roles = await rolesResponse.json() as Array<Record<string, unknown>>;
    const roleNames = roles.map((ur) => (ur as { roles?: { name?: string } }).roles?.name).filter(Boolean);

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: user.created_at,
        roles: roleNames,
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Authentication failed',
    }, 500);
  }
});

// GET /api/auth/profile - Get user profile (requires auth)
auth.get('/profile', authMiddleware, async (c) => {
  const user = c.get('user');
  const userToken = c.get('userToken');

  try {
    // Fetch profile from Supabase
    const response = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=*`,
      {
        headers: {
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );

    if (!response.ok) {
      return c.json({
        success: false,
        error: 'Failed to fetch profile',
      }, 500);
    }

    const profiles = await response.json() as Array<Record<string, unknown>>;
    const profile = profiles[0] || null;

    return c.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch profile',
    }, 500);
  }
});

// PATCH /api/auth/profile - Update user profile (requires auth)
auth.patch(
  '/profile',
  authMiddleware,
  zValidator('json', z.object({
    display_name: z.string().optional(),
    avatar_url: z.string().url().optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
  })),
  async (c) => {
    const user = c.get('user');
    const userToken = c.get('userToken');
    const data = c.req.valid('json');

    try {
      // Update profiles table
      const response = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}`,
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
        return c.json({
          success: false,
          error: 'Failed to update profile table',
        }, 500);
      }

      // Sync with auth user_metadata if relevant fields are present
      if (data.display_name !== undefined || data.avatar_url !== undefined) {
        const metadata: Record<string, any> = {};
        if (data.display_name !== undefined) metadata.display_name = data.display_name;
        if (data.avatar_url !== undefined) metadata.avatar_url = data.avatar_url;

        const authSyncRes = await fetch(`${c.env.SUPABASE_URL}/auth/v1/user`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({ data: metadata }),
        });
        
        if (!authSyncRes.ok) {
          console.error('Failed to sync auth metadata:', await authSyncRes.text());
          // We don't fail the whole request since profile table is updated, 
          // but we log it. Or should we? Feedback says "drift with /validate".
        }
      }

      const result = await response.json();

      return c.json({
        success: true,
        message: 'Profile updated successfully',
        data: result,
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to update profile',
      }, 500);
    }
  }
);

// POST /api/auth/avatar - Upload and update avatar
auth.post('/avatar', authMiddleware, async (c) => {
  const user = c.get('user');
  const userToken = c.get('userToken');

  try {
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.type)) {
      return c.json({ success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }, 400);
    }

    if (file.size > 2 * 1024 * 1024) {
      return c.json({ success: false, error: 'File too large' }, 400);
    }

    // Clean up existing variants before upload to prevent stale files
    const extensions = ['jpg', 'png', 'webp', 'gif'];
    const filesToDelete = extensions.map(e => `avatars/${encodeURIComponent(user.id)}/avatar.${e}`);
    await fetch(`${c.env.SUPABASE_URL}/storage/v1/object/smptashfia`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        'apikey': c.env.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ prefixes: filesToDelete }),
    });

    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const ext = mimeToExt[file.type];
    const key = `avatars/${encodeURIComponent(user.id)}/avatar.${ext}`;

    const storageRes = await fetch(`${c.env.SUPABASE_URL}/storage/v1/object/smptashfia/${key}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'apikey': c.env.SUPABASE_ANON_KEY,
        'x-upsert': 'true',
      },
      body: file,
    });

    if (!storageRes.ok) {
      return c.json({ success: false, error: 'Failed to upload to storage' }, 500);
    }

    const publicUrl = `${c.env.SUPABASE_URL}/storage/v1/object/public/smptashfia/${key}`;

    // Update Auth Metadata
    const authRes = await fetch(`${c.env.SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        'apikey': c.env.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ data: { avatar_url: publicUrl } }),
    });

    if (!authRes.ok) {
      const rollbackStorage = await fetch(`${c.env.SUPABASE_URL}/storage/v1/object/smptashfia/${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'apikey': c.env.SUPABASE_ANON_KEY,
        },
      });
      return c.json({ 
        success: false, 
        error: 'Failed to update auth metadata',
        rollbackDetails: { storageDeleteStatus: rollbackStorage.status }
      }, 500);
    }

    // Update Profile Table
    const profileRes = await fetch(`${c.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        'apikey': c.env.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ avatar_url: publicUrl }),
    });

    if (!profileRes.ok) {
      const rollbackStorage = await fetch(`${c.env.SUPABASE_URL}/storage/v1/object/smptashfia/${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'apikey': c.env.SUPABASE_ANON_KEY,
        },
      });
      const rollbackAuth = await fetch(`${c.env.SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'apikey': c.env.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ data: { avatar_url: null } }),
      });
      return c.json({ 
        success: false, 
        error: 'Failed to update profile table',
        rollbackDetails: { 
          storageDeleteStatus: rollbackStorage.status,
          authRollbackStatus: rollbackAuth.status
        }
      }, 500);
    }

    return c.json({ success: true, data: { url: publicUrl } });
  } catch (error) {
    return c.json({ success: false, error: 'Internal server error during avatar upload' }, 500);
  }
});

// DELETE /api/auth/avatar - Delete avatar
auth.delete('/avatar', authMiddleware, async (c) => {
  const user = c.get('user');
  const userToken = c.get('userToken');

  try {
    const previousAvatar = user.user_metadata?.avatar_url;

    // 1. Update Auth Metadata First
    const authRes = await fetch(`${c.env.SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        'apikey': c.env.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ data: { avatar_url: null } }),
    });

    if (!authRes.ok) {
      return c.json({ success: false, error: 'Failed to update auth metadata' }, 500);
    }

    // 2. Update Profile Table
    const profileRes = await fetch(`${c.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        'apikey': c.env.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ avatar_url: null }),
    });

    if (!profileRes.ok) {
      // Rollback auth metadata
      await fetch(`${c.env.SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'apikey': c.env.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ data: { avatar_url: previousAvatar } }),
      });
      return c.json({ success: false, error: 'Failed to update profile table' }, 500);
    }

    // 3. Finally Delete from Storage
    const extensions = ['jpg', 'png', 'webp', 'gif'];
    const filesToDelete = extensions.map(ext => `avatars/${encodeURIComponent(user.id)}/avatar.${ext}`);

    const storageRes = await fetch(`${c.env.SUPABASE_URL}/storage/v1/object/smptashfia`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        'apikey': c.env.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ prefixes: filesToDelete }),
    });

    if (!storageRes.ok) {
      const errText = await storageRes.text();
      return c.json({ success: false, error: `Failed to delete from storage: ${errText}` }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: 'Internal server error during avatar deletion' }, 500);
  }
});

export default auth;
