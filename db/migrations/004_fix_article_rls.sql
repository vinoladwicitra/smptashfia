-- =====================================================
-- FIX: RLS policies for article_category_mappings
-- =====================================================

-- Enable RLS on article_category_mappings
ALTER TABLE public.article_category_mappings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view category mappings" ON public.article_category_mappings;
DROP POLICY IF EXISTS "Authors can manage mappings for own articles" ON public.article_category_mappings;
DROP POLICY IF EXISTS "Admin can manage all category mappings" ON public.article_category_mappings;

-- Anyone can view category mappings
CREATE POLICY "Anyone can view category mappings"
    ON public.article_category_mappings FOR SELECT
    USING (true);

-- Authors can manage mappings for their own articles
CREATE POLICY "Authors can manage mappings for own articles"
    ON public.article_category_mappings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.articles a 
            WHERE a.id = article_category_mappings.article_id 
            AND a.author_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.articles a 
            WHERE a.id = article_category_mappings.article_id 
            AND a.author_id = auth.uid()
        )
    );

-- Admin can manage all category mappings
CREATE POLICY "Admin can manage all category mappings"
    ON public.article_category_mappings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- =====================================================
-- FIX: Add DELETE policy for articles (authors only)
-- =====================================================
DROP POLICY IF EXISTS "Authors can delete own articles" ON public.articles;

CREATE POLICY "Authors can delete own articles"
    ON public.articles FOR DELETE
    USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- =====================================================
SELECT '✅ RLS policies for article_category_mappings and article deletion added!' AS status;
