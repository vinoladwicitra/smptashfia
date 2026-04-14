import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import type { Env, UserContext } from '../types';

interface SupabaseUser {
  id: string;
  email: string;
  [key: string]: unknown;
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
      `${c.env.SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${user.id}&select=*,roles(*)`,
      {
        headers: {
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const roles = rolesResponse.ok ? await rolesResponse.json() as Array<Record<string, unknown>> : [];
    const roleNames = roles.map((ur) => (ur as { roles?: { name?: string } }).roles?.name).filter(Boolean);

    return c.json({
      success: true,
      data: {
        ...user as Record<string, unknown>,
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

  try {
    // Fetch profile from Supabase
    const response = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=*`,
      {
        headers: {
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
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
    const data = c.req.valid('json');

    try {
      const response = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`,
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

      if (!response.ok) {
        return c.json({
          success: false,
          error: 'Failed to update profile',
        }, 500);
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

export default auth;
