-- =====================================================
-- FIX: Infinite recursion in user_roles RLS policies
-- =====================================================

-- 1. Drop ALL existing problematic policies
DROP POLICY IF EXISTS "Admin can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- 2. Create simple non-recursive policies

-- user_roles: Allow authenticated users to manage their own roles
CREATE POLICY "user_roles_self_select"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "user_roles_self_insert"
    ON public.user_roles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_roles_self_delete"
    ON public.user_roles FOR DELETE
    USING (auth.uid() = user_id);

-- profiles: Simple self-access policy
CREATE POLICY "profiles_self_select"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "profiles_self_update"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "profiles_self_insert"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. Clean up seed articles (keep categories)
DELETE FROM public.article_category_mappings;
DELETE FROM public.articles;

-- =====================================================
SELECT '✅ RLS policies fixed and seed articles cleaned!' AS status;
