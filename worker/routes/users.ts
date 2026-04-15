import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import type { Env } from '../types';

const users = new Hono<{ Bindings: Env; Variables: { userToken: string } }>();

// Helper: validate UUID format
const isValidUuid = (v: string): boolean => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

// Helper: call Supabase Auth Admin API
async function authAdminRequest(
  env: Env,
  method: string,
  path: string,
  body?: Record<string, unknown>
) {
  if (!env.SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_KEY is required for admin operations');
  }

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
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
    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const perPage = Math.max(1, Math.min(100, parseInt(c.req.query('per_page') || '20')));

    try {
      // Fetch ALL users from Supabase Auth Admin API for local filtering and pagination
      let allUsers: Array<Record<string, unknown>> = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `${c.env.SUPABASE_URL}/auth/v1/admin/users?${new URLSearchParams({
            sort: sortBy,
            order: sortOrder,
            page: String(currentPage),
            per_page: '50'
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
        const fetchedUsers = data.users || [];
        
        allUsers = allUsers.concat(fetchedUsers);
        
        if (fetchedUsers.length < 50) {
          hasMore = false;
        } else {
          currentPage++;
        }
      }

      // Fetch user roles for all users if role filter is applied
      let userRolesData: Array<Record<string, unknown>> = [];
      if (role) {
         // We might need to batch this if allUsers is huge, but we assume it's manageable for now
         // Or just fetch all user_roles
          const allRolesRes = await fetch(
            `${c.env.SUPABASE_URL}/rest/v1/user_roles?select=user_id,roles!inner(name)`,
            {
              headers: {
                'apikey': c.env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
              },
            }
          );
          if (!allRolesRes.ok) {
            const errorText = await allRolesRes.text();
            throw new Error(`Failed to fetch roles: ${errorText}`);
          }
          userRolesData = await allRolesRes.json() as Array<Record<string, unknown>>;
      }

      // Client-side search filter (by email or display name)
      if (search) {
        const searchLower = search.toLowerCase();
        allUsers = allUsers.filter((u: any) =>
          (u.email ?? '').toLowerCase().includes(searchLower) ||
          (u.user_metadata?.display_name ?? '').toLowerCase().includes(searchLower)
        );
      }

      // Filter by role if specified
      if (role) {
        const roleUserIds = new Set(
          userRolesData
            .filter((r: any) => (r as any).roles?.name === role)
            .map((r: any) => r.user_id)
        );
        allUsers = allUsers.filter((u: any) => roleUserIds.has(u.id));
      }

      const totalMatches = allUsers.length;
      
      // Apply pagination
      const paginatedUsers = allUsers.slice((page - 1) * perPage, page * perPage);
      const userIds = paginatedUsers.map((u: any) => u.id);

      // Fetch profiles and roles for the paginated users
      let profiles: Array<Record<string, unknown>> = [];
      if (userIds.length > 0) {
        const profilesRes = await fetch(
          `${c.env.SUPABASE_URL}/rest/v1/profiles?id=in.(${userIds.join(',')})&select=*`,
          {
            headers: {
              'apikey': c.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
            },
          }
        );
        profiles = profilesRes.ok
          ? await profilesRes.json() as Array<Record<string, unknown>>
          : [];
      }

      // If we didn't fetch all roles above, fetch them for the paginated page
      let pageRolesData = userRolesData.filter((r: any) => userIds.includes(r.user_id));
      if (!role && userIds.length > 0) {
        const pageRolesRes = await fetch(
          `${c.env.SUPABASE_URL}/rest/v1/user_roles?user_id=in.(${userIds.join(',')})&select=user_id,roles!inner(name)`,
          {
            headers: {
              'apikey': c.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
            },
          }
        );
        if (pageRolesRes.ok) {
           pageRolesData = await pageRolesRes.json() as Array<Record<string, unknown>>;
        }
      }

      // Merge profiles and roles into users
      const enrichedUsers = paginatedUsers.map((u: any) => {
        const profile = profiles.find((p: any) => p.id === u.id);
        const roles = pageRolesData
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
          total: totalMatches,
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
    const caller = c.get('user');

    if (role === 'staff' && !caller.roles.includes('admin')) {
      return c.json({ success: false, error: 'Only admins can create staff accounts' }, 403);
    }

    try {
      // Get role ID before creating user to fail early if invalid
      const rolesRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/roles?name=eq.${role}&select=id`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      if (!rolesRes.ok) {
        return c.json({ success: false, error: 'Failed to fetch roles' }, 500);
      }
      const rolesData = await rolesRes.json() as Array<Record<string, unknown>>;
      const roleId = rolesData[0]?.id;

      if (!roleId) {
        return c.json({
          success: false,
          error: `Role '${role}' not found`,
        }, 400);
      }

      // Create user via Supabase Auth Admin API with email auto-confirm
      const userData = await authAdminRequest(c.env, 'POST', '/users', {
        email,
        password,
        email_confirm: true, // Skip email verification
        user_metadata: { display_name, can_login: true },
      }) as Record<string, unknown>;

      const userId = (userData as any).id;

      // Assign new role
      const roleRes = await fetch(`${c.env.SUPABASE_URL}/rest/v1/user_roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ user_id: userId, role_id: roleId }),
      });

      if (!roleRes.ok) {
        // Cleanup: delete the created auth user
        await authAdminRequest(c.env, 'DELETE', `/users/${userId}`).catch(console.error);
        return c.json({
          success: false,
          error: `Failed to assign role: ${roleRes.statusText}`,
        }, 500);
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

    if (!isValidUuid(userId)) {
      return c.json({ success: false, error: 'Invalid user ID format' }, 400);
    }

    try {
      // Update auth user metadata
      if (data.can_login !== undefined) {
        const targetUser = await authAdminRequest(c.env, 'GET', `/users/${userId}`) as any;

        const targetRolesRes = await fetch(
          `${c.env.SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}&select=role_id,roles!inner(name)`,
          {
            headers: {
              'apikey': c.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
            },
          }
        );
        if (!targetRolesRes.ok) {
          return c.json({ success: false, error: 'Failed to verify target user roles' }, 500);
        }
        const targetRolesData = await targetRolesRes.json() as Array<{ roles?: { name?: string } }>;
        const targetRoleNames = targetRolesData.map((r) => r.roles?.name).filter(Boolean);

        if (targetRoleNames.includes('admin')) {
          const callerRoles = (c.get('user') as any).roles || [];
          if (!callerRoles.includes('admin')) {
            return c.json({ success: false, error: 'Forbidden: staff cannot modify admin accounts' }, 403);
          }
        }

        const currentMetadata = targetUser.user_metadata || {};
        await authAdminRequest(c.env, 'PUT', `/users/${userId}`, {
          user_metadata: { ...currentMetadata, can_login: data.can_login },
        });
      }

      // Update profile
      const profileUpdate: Record<string, unknown> = {};
      if (data.display_name !== undefined) profileUpdate.display_name = data.display_name;
      if (data.avatar_url !== undefined) profileUpdate.avatar_url = data.avatar_url;
      if (data.phone !== undefined) profileUpdate.phone = data.phone;
      if (data.bio !== undefined) profileUpdate.bio = data.bio;

      if (Object.keys(profileUpdate).length > 0) {
        const profileRes = await fetch(
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

        if (!profileRes.ok) {
          return c.json({ success: false, error: 'Failed to update profile' }, 500);
        }

        const updatedData = await profileRes.json() as Array<Record<string, unknown>>;
        if (!updatedData || updatedData.length === 0) {
          return c.json({ success: false, error: 'Profile not found or no rows updated' }, 404);
        }
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
    const user = c.get('user');

    if (!isValidUuid(userId)) {
      return c.json({ success: false, error: 'Invalid user ID format' }, 400);
    }

    try {
      // Prevent staff from modifying admin users (privilege escalation prevention)
      const userRolesRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}&select=user_id,roles!inner(name)`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!userRolesRes.ok) {
        return c.json({
          success: false,
          error: 'Failed to verify target user roles',
        }, 500);
      }

      const userRolesData = await userRolesRes.json() as Array<Record<string, unknown>>;
      const targetRoles = userRolesData.map((r: any) => (r as any).roles?.name).filter(Boolean);

      if (targetRoles.includes('admin')) {
        const callerRoles = (user as any).roles || [];
        if (!callerRoles.includes('admin')) {
          return c.json({
            success: false,
            error: 'Forbidden: staff cannot reset admin passwords',
          }, 403);
        }
      }

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

    if (!isValidUuid(userId)) {
      return c.json({ success: false, error: 'Invalid user ID format' }, 400);
    }

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
      if (!rolesRes.ok) {
        return c.json({ success: false, error: 'Failed to fetch roles' }, 500);
      }
      const rolesData = await rolesRes.json() as Array<Record<string, unknown>>;
      const roleId = rolesData[0]?.id;

      if (!roleId) {
        return c.json({ success: false, error: 'Role not found' }, 404);
      }

      // Fetch target user's existing roles
      const targetRolesRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}&select=role_id,roles!inner(name)`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      if (!targetRolesRes.ok) {
        return c.json({ success: false, error: 'Failed to verify target user roles' }, 500);
      }
      const targetRolesData = await targetRolesRes.json() as Array<{ role_id: string; roles?: { name?: string } }>;
      const targetRoleNames = targetRolesData.map((r) => r.roles?.name).filter(Boolean);

      // Prevent staff from changing roles of admins
      if (targetRoleNames.includes('admin')) {
        const callerRoles = (c.get('user') as any).roles || [];
        if (!callerRoles.includes('admin')) {
          return c.json({ success: false, error: 'Forbidden: staff cannot modify admin roles' }, 403);
        }
      }

      // Store previous roles for potential rollback
      const previousRoles = targetRolesData.map(r => ({ role_id: r.role_id }));

      // Remove existing roles
      const deleteRes = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!deleteRes.ok) {
        return c.json({ success: false, error: 'Failed to remove existing roles' }, 500);
      }

      // Assign new role
      const roleRes = await fetch(`${c.env.SUPABASE_URL}/rest/v1/user_roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ user_id: userId, role_id: roleId }),
      });

      if (!roleRes.ok) {
        // Attempt rollback: restore previous roles
        for (const prev of previousRoles) {
          await fetch(`${c.env.SUPABASE_URL}/rest/v1/user_roles`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': c.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ user_id: userId, role_id: prev.role_id }),
          });
        }
        return c.json({
          success: false,
          error: `Failed to assign role: ${roleRes.statusText}`,
        }, 500);
      }

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

    if (!isValidUuid(userId)) {
      return c.json({ success: false, error: 'Invalid user ID format' }, 400);
    }

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
