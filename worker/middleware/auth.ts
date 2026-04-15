import { createMiddleware } from 'hono/factory';
import type { Env, UserContext } from '../types';

/**
 * Authentication middleware to validate Supabase tokens
 */
export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: { user: UserContext; userToken: string } }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const verifyUrl = `${c.env.SUPABASE_URL}/auth/v1/user`;
    const response = await fetch(verifyUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': c.env.SUPABASE_ANON_KEY,
      },
    });

    if (!response.ok) {
      return c.json({ error: 'Unauthorized: Invalid token' }, 401);
    }

    const user = await response.json() as any;
    
    // Attach user and token to context
    c.set('user', {
      id: user.id,
      email: user.email,
      roles: [],
      user_metadata: user.user_metadata,
    } as UserContext);
    c.set('userToken', token);
    
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized: Authentication failed' }, 401);
  }
});

/**
 * Role-based authorization middleware
 */
export const roleMiddleware = (requiredRoles: string[]) => {
  return createMiddleware<{ Bindings: Env; Variables: { user: UserContext; userToken: string } }>(async (c, next) => {
    const user = c.get('user');
    const userToken = c.get('userToken');
    
    if (!user) {
      return c.json({ error: 'Unauthorized: User not authenticated' }, 401);
    }

    try {
      // Fetch user roles using the user's own token (needed for RLS)
      const response = await fetch(
        `${c.env.SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${user.id}&select=role_id,roles!inner(name)`,
        {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );

      if (!response.ok) {
        return c.json({ error: 'Forbidden: Could not verify roles' }, 403);
      }

      const userRoles = await response.json() as Array<{ roles?: { name?: string } }>;
      const roleNames = userRoles.map((ur) => ur.roles?.name).filter(Boolean) as string[];

      const hasRequiredRole = requiredRoles.some(role => 
        roleNames.includes(role)
      );

      if (!hasRequiredRole) {
        return c.json({ 
          error: `Forbidden: Requires one of roles: ${requiredRoles.join(', ')}` 
        }, 403);
      }

      user.roles = roleNames;
      await next();
    } catch (error) {
      return c.json({ error: 'Forbidden: Authorization failed' }, 403);
    }
  });
};
