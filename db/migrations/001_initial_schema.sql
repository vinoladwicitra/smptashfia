-- =====================================================
-- SMP TASHFIA DATABASE MIGRATION
-- Created: 2026-04-09
-- Description: RBAC, Profiles, Articles, and Auth Trigger
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. ROLES TABLE (RBAC)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.roles IS 'Available system roles for RBAC';

-- Insert default roles
INSERT INTO public.roles (name, display_name, description)
VALUES
    ('teacher', 'Guru', 'Akses untuk guru/pengajar'),
    ('student', 'Siswa', 'Akses untuk siswa'),
    ('staff', 'Staf', 'Akses untuk staf administrasi'),
    ('admin', 'Administrator', 'Akses penuh ke semua fitur')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    display_name VARCHAR(150),
    avatar_url TEXT,
    phone VARCHAR(20),
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Extended user profiles linked to auth.users';

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- 3. USER ROLES (Many-to-Many for RBAC)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(user_id, role_id)
);

COMMENT ON TABLE public.user_roles IS 'Maps users to their roles (supports multiple roles per user)';

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all user roles"
    ON public.user_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- =====================================================
-- 4. ARTICLE CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.article_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.article_categories IS 'Categories for blog articles';

-- Insert default categories
INSERT INTO public.article_categories (name, slug, description)
VALUES
    ('Kegiatan', 'kegiatan', 'Kegiatan sekolah dan acara'),
    ('Edukasi', 'edukasi', 'Materi pendidikan dan tips'),
    ('Literasi Digital', 'literasi-digital', 'Keamanan dan etika digital'),
    ('Akademik', 'akademik', 'Pengumuman akademik dan ujian'),
    ('Pengumuman', 'pengumuman', 'Pengumuman umum sekolah')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 5. ARTICLES (Blog)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.articles IS 'Blog articles and news posts';

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for articles
CREATE POLICY "Anyone can view published articles"
    ON public.articles FOR SELECT
    USING (status = 'published');

CREATE POLICY "Authenticated users can view all articles"
    ON public.articles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authors can create articles"
    ON public.articles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own articles"
    ON public.articles FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Admin can manage all articles"
    ON public.articles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- =====================================================
-- 6. ARTICLE CATEGORY MAPPINGS (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.article_category_mappings (
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.article_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, category_id)
);

COMMENT ON TABLE public.article_category_mappings IS 'Maps articles to categories (supports multiple categories per article)';

-- =====================================================
-- 7. ARTICLES TAGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.article_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.article_tags IS 'Tags for articles';

-- =====================================================
-- 8. ARTICLE TAG MAPPINGS (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.article_tag_mappings (
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.article_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

COMMENT ON TABLE public.article_tag_mappings IS 'Maps articles to tags';

-- =====================================================
-- ADDITIONAL RLS POLICIES (after all tables exist)
-- =====================================================
CREATE POLICY "Admin can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- =====================================================
-- 9. UPDATED_AT TRIGGER (Auto-update timestamps)
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_categories_updated_at
    BEFORE UPDATE ON public.article_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 10. AUTH USERS → PROFILES TRIGGER
-- Automatically creates a profile row when a new user registers
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;

-- Create trigger to fire on every new auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 11. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);

-- =====================================================
-- DONE
-- =====================================================
SELECT 'Migration completed successfully!' AS status;
