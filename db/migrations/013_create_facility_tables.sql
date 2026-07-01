-- =====================================================
-- FACILITY MANAGEMENT TABLES
-- Created: 2026-04-16
-- Description: Dynamic facilities & services categories with images
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for migration re-runs in dev)
DROP TABLE IF EXISTS public.facility_images CASCADE;
DROP TABLE IF EXISTS public.facility_categories CASCADE;

-- =====================================================
-- 1. FACILITY CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.facility_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50) NOT NULL DEFAULT 'IconBuilding',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name)
);

COMMENT ON TABLE public.facility_categories IS 'Facility categories (e.g., Asrama, Lab IPA, Lab Komputer)';

-- =====================================================
-- 2. FACILITY IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.facility_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_category_id UUID REFERENCES public.facility_categories(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(facility_category_id, image_url)
);

COMMENT ON TABLE public.facility_images IS 'Images for each facility category';

-- =====================================================
-- 3. INSERT DEFAULT DATA
-- =====================================================
-- Insert default categories (using name conflict)
INSERT INTO public.facility_categories (name, icon_name, display_order) VALUES
  ('Asrama', 'IconBuilding', 1),
  ('Lab IPA', 'IconFlask', 2),
  ('Lab Komputer', 'IconDeviceDesktop', 3)
ON CONFLICT (name) DO NOTHING;

-- Insert default images for existing static assets
-- Asrama images (5)
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/asrama-1.webp', 1 FROM public.facility_categories WHERE name = 'Asrama' ON CONFLICT (facility_category_id, image_url) DO NOTHING;
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/asrama-2.webp', 2 FROM public.facility_categories WHERE name = 'Asrama' ON CONFLICT (facility_category_id, image_url) DO NOTHING;
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/asrama-3.webp', 3 FROM public.facility_categories WHERE name = 'Asrama' ON CONFLICT (facility_category_id, image_url) DO NOTHING;
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/asrama-4.webp', 4 FROM public.facility_categories WHERE name = 'Asrama' ON CONFLICT (facility_category_id, image_url) DO NOTHING;
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/asrama-5.webp', 5 FROM public.facility_categories WHERE name = 'Asrama' ON CONFLICT (facility_category_id, image_url) DO NOTHING;

-- Lab IPA images (5)
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/lab-ipa-1.webp', 1 FROM public.facility_categories WHERE name = 'Lab IPA' ON CONFLICT (facility_category_id, image_url) DO NOTHING;
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/lab-ipa-2.webp', 2 FROM public.facility_categories WHERE name = 'Lab IPA' ON CONFLICT (facility_category_id, image_url) DO NOTHING;
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/lab-ipa-3.webp', 3 FROM public.facility_categories WHERE name = 'Lab IPA' ON CONFLICT (facility_category_id, image_url) DO NOTHING;
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/lab-ipa-4.webp', 4 FROM public.facility_categories WHERE name = 'Lab IPA' ON CONFLICT (facility_category_id, image_url) DO NOTHING;
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/lab-ipa-5.webp', 5 FROM public.facility_categories WHERE name = 'Lab IPA' ON CONFLICT (facility_category_id, image_url) DO NOTHING;

-- Lab Komputer images (5)
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/lab-komputer-1.webp', 1 FROM public.facility_categories WHERE name = 'Lab Komputer' ON CONFLICT (facility_category_id, image_url) DO NOTHING;
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/lab-komputer-2.webp', 2 FROM public.facility_categories WHERE name = 'Lab Komputer' ON CONFLICT (facility_category_id, image_url) DO NOTHING;
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/lab-komputer-3.webp', 3 FROM public.facility_categories WHERE name = 'Lab Komputer' ON CONFLICT (facility_category_id, image_url) DO NOTHING;
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/lab-komputer-4.webp', 4 FROM public.facility_categories WHERE name = 'Lab Komputer' ON CONFLICT (facility_category_id, image_url) DO NOTHING;
INSERT INTO public.facility_images (facility_category_id, image_url, display_order)
SELECT id, '/assets/lab-komputer-5.webp', 5 FROM public.facility_categories WHERE name = 'Lab Komputer' ON CONFLICT (facility_category_id, image_url) DO NOTHING;

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================
ALTER TABLE public.facility_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_images ENABLE ROW LEVEL SECURITY;

-- Public can view all active facilities
CREATE POLICY "facilities_public_select" ON public.facility_categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "facility_images_public_select" ON public.facility_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.facility_categories fc
      WHERE fc.id = facility_category_id AND fc.is_active = TRUE
    )
  );

-- Staff/admin/teacher can manage facilities
CREATE POLICY "facilities_staff_manage" ON public.facility_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin')
    )
  );

CREATE POLICY "facility_images_staff_manage" ON public.facility_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin')
    )
  );

-- =====================================================
-- 5. STORAGE BUCKET FOR FACILITY IMAGES
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('facilities', 'facilities', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read for facility images
CREATE POLICY "facilities_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'facilities');

-- Allow staff/admin to upload facility images
CREATE POLICY "facilities_staff_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'facilities' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin')
    )
  );

-- Allow staff/admin to update/delete facility images
CREATE POLICY "facilities_staff_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'facilities' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin')
    )
  );

-- =====================================================
-- 6. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_facility_categories_order ON public.facility_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_facility_images_category_order ON public.facility_images(facility_category_id, display_order);

-- =====================================================
-- 7. UPDATED_AT TRIGGER
-- =====================================================
CREATE TRIGGER update_facility_categories_updated_at
    BEFORE UPDATE ON public.facility_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- DONE
-- =====================================================
SELECT 'Facilities migration completed successfully!' AS status;
