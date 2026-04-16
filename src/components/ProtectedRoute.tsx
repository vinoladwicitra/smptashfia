import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

// Define role requirements for each route
const routeRoles: Record<string, string[]> = {
  '/teacher': ['teacher', 'admin'],
  '/student': ['student', 'admin'],
  '/staff': ['staff', 'admin'],
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setAuthorized(false);
      setChecking(false);
      return;
    }

    const checkRole = async () => {
      const requiredRoles = Object.entries(routeRoles).find(([path]) =>
        location.pathname === path || location.pathname.startsWith(path + '/')
      )?.[1];

      if (!requiredRoles) {
        setAuthorized(true);
        setChecking(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('user_roles')
          .select(`
            roles (name)
          `)
          .eq('user_id', user.id);

        const userRoles = data?.map((r: any) => r.roles?.name).filter(Boolean) || [];
        const hasRole = userRoles.some((role: string) => requiredRoles.includes(role));
        setAuthorized(hasRole);
      } catch {
        setAuthorized(false);
      } finally {
        setChecking(false);
      }
    };

    checkRole();
  }, [user, loading, location.pathname]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto text-primary mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-text-light text-sm">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const loginPath = location.pathname.startsWith('/teacher') ? '/login/teacher'
      : location.pathname.startsWith('/student') ? '/login/student'
      : location.pathname.startsWith('/staff') ? '/login/staff'
      : location.pathname.startsWith('/parents') ? '/login/parent'
      : '/login/teacher';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
