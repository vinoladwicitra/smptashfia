import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import type { Env } from '../types';

const users = new Hono<{ Bindings: Env; Variables: { userToken: string } }>();

// Helper: call Supabase Auth Admin API
async function authAdminRequest(
  env: Env,
  method: string,
  path: string,
  body?: Record<string, unknown>
) {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Auth admin API error: ${response.statusText} - ${errText}`);
  }

  return response.json();
}

// GET /api/users - List users with search and filters
users.get(
  '/',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  async (c) => {
    const search = c.req.query('search') || '';
    const role = c.req.query('role') || '';
    const sortBy = c.req.query('sort') || 'created_at';
    const sortOrder = c.req.query('order') || 'desc';
    const page = parseInt(c.req.query('page') || '1');
    const perPage = parseInt(c.req.query('per_page') || '20');

    try {
      // Fetch users from Supabase Auth Admin API
      const response = await fetch(
        `${c.env.SUPABASE_URL}/auth/v1/admin/users?${new URLSearchParams({
          page: String(page),
          per_page: String(perPage),
          sort: sortBy,
          order: sortOrder,
        })}`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json() as { users: Array<Record<string, unknown>>; total?: number };
      let usersList = data.users || [];

      // Filter by role if specified (via profiles join)
      if (role) {
        const profileResponse = await fetch(
          `${c.env.SUPABASE_URL}/rest/v1/user_roles?select=user_id,roles!inner(name)&roles.name=eq.${role}`,
          {
            headers: {
              'apikey': c.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
            },
          }
        );
        const profileData = profileResponse.ok ? await profileResponse.json() as Array<Record<string, unknown>> : [];
        const roleUserIds = new Set(profileData.map((r: any) => r.user_id));
        usersList = usersList.filter((u: any) => roleUserIds.has(u.id));
      }

      // Client-side search filter (by email)
      if (search) {
        const searchLower = search.toLowerCase();
        usersList = usersList.filter((u: any) =>
          u.email?.toLowerCase().includes(searchLower) ||
          u.user_metadata?.display_name?.toLowerCase().includes(searchLower)
        );
      }

      // Fetch profiles and roles for all users
      const userIds = usersList.map((u: any) => u.id);
      const profilesRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/profiles?id=in.(${userIds.join(',')})&select=*`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      const profiles = profilesRes.ok ? await profilesRes.json() as Array<Record<string, unknown>> : [];

      const userRolesRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/user_roles?user_id=in.(${userIds.join(',')})&select=user_id,roles!inner(name)`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      const userRolesData = userRolesRes.ok ? await userRolesRes.json() as Array<Record<string, unknown>> : [];

      // Merge profiles and roles into users
      const enrichedUsers = usersList.map((u: any) => {
        const profile = profiles.find((p: any) => p.id === u.id);
        const roles = userRolesData
          .filter((r: any) => r.user_id === u.id)
          .map((r: any) => (r as any).roles?.name)
          .filter(Boolean);
        return {
          ...u,
          profile,
          roles,
          can_login: u.user_metadata?.can_login !== false,
        };
      });

      return c.json({
        success: true,
        data: enrichedUsers,
        pagination: {
          page,
          per_page: perPage,
          total: data.total || usersList.length,
        },
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to fetch users',
      }, 500);
    }
  }
);

// POST /api/users - Create new user (staff/admin only)
users.post(
  '/',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.object({
    email: z.string().email(),
    password: z.string().min(6),
    display_name: z.string().min(1),
    role: z.enum(['teacher', 'student', 'staff']),
  })),
  async (c) => {
    const { email, password, display_name, role } = c.req.valid('json');

    try {
      // Create user via Supabase Auth Admin API with email auto-confirm
      const userData = await authAdminRequest(c.env, 'POST', '/users', {
        email,
        password,
        email_confirm: true, // Skip email verification
        user_metadata: { display_name, can_login: true },
      }) as Record<string, unknown>;

      const userId = (userData as any).id;

      // Get role ID
      const rolesRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/roles?name=eq.${role}&select=id`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      const rolesData = await rolesRes.json() as Array<Record<string, unknown>>;
      const roleId = rolesData[0]?.id;

      // Assign role via user_roles
      if (roleId) {
        await fetch(`${c.env.SUPABASE_URL}/rest/v1/user_roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ user_id: userId, role_id: roleId }),
        });
      }

      return c.json({
        success: true,
        message: 'User created successfully',
        data: userData,
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      }, 500);
    }
  }
);

// PUT /api/users/:id - Update user profile and settings
users.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.object({
    display_name: z.string().optional(),
    avatar_url: z.string().url().optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
    can_login: z.boolean().optional(),
  })),
  async (c) => {
    const userId = c.req.param('id');
    const data = c.req.valid('json');

    try {
      // Update auth user metadata
      if (data.can_login !== undefined) {
        await authAdminRequest(c.env, 'PUT', `/users/${userId}`, {
          user_metadata: { can_login: data.can_login },
        });
      }

      // Update profile
      const profileUpdate: Record<string, unknown> = {};
      if (data.display_name !== undefined) profileUpdate.display_name = data.display_name;
      if (data.avatar_url !== undefined) profileUpdate.avatar_url = data.avatar_url;
      if (data.phone !== undefined) profileUpdate.phone = data.phone;
      if (data.bio !== undefined) profileUpdate.bio = data.bio;

      if (Object.keys(profileUpdate).length > 0) {
        await fetch(
          `${c.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': c.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(profileUpdate),
          }
        );
      }

      return c.json({
        success: true,
        message: 'User updated successfully',
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to update user',
      }, 500);
    }
  }
);

// POST /api/users/:id/reset-password - Reset user password
users.post(
  '/:id/reset-password',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.object({
    new_password: z.string().min(6),
  })),
  async (c) => {
    const userId = c.req.param('id');
    const { new_password } = c.req.valid('json');

    try {
      await authAdminRequest(c.env, 'PUT', `/users/${userId}`, {
        password: new_password,
      });

      return c.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to reset password',
      }, 500);
    }
  }
);

// POST /api/users/:id/change-role - Change user role
users.post(
  '/:id/change-role',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.object({
    role: z.enum(['teacher', 'student', 'staff']),
  })),
  async (c) => {
    const userId = c.req.param('id');
    const { role } = c.req.valid('json');

    try {
      // Get role ID
      const rolesRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/roles?name=eq.${role}&select=id`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      const rolesData = await rolesRes.json() as Array<Record<string, unknown>>;
      const roleId = rolesData[0]?.id;

      if (!roleId) {
        return c.json({ success: false, error: 'Role not found' }, 404);
      }

      // Remove existing roles
      await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );

      // Assign new role
      await fetch(`${c.env.SUPABASE_URL}/rest/v1/user_roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ user_id: userId, role_id: roleId }),
      });

      return c.json({
        success: true,
        message: 'Role updated successfully',
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to change role',
      }, 500);
    }
  }
);

// DELETE /api/users/:id - Delete user (staff/admin only)
users.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (c) => {
    const userId = c.req.param('id');

    try {
      await authAdminRequest(c.env, 'DELETE', `/users/${userId}`);

      return c.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to delete user',
      }, 500);
    }
  }
);

export default users;
