-- Banner Settings Table
-- Stores configuration for top banner and popup banner

CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_type VARCHAR(20) NOT NULL UNIQUE CHECK (banner_type IN ('top_banner', 'popup_banner')),
  
  -- Top Banner settings
  enabled BOOLEAN DEFAULT true,
  text TEXT,
  
  -- Popup Banner settings
  image_url TEXT,
  button_label VARCHAR(100),
  button_link TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default values
INSERT INTO public.banners (banner_type, enabled, text, image_url, button_label, button_link)
VALUES 
  ('top_banner', true, 'TELAH DIBUKA PMB TA 2026/2027', NULL, 'Daftar Sekarang', '/pmb'),
  ('popup_banner', true, NULL, '/assets/ppdb-banner.webp', 'Daftar Sekarang', '/pmb')
ON CONFLICT (banner_type) DO NOTHING;

-- RLS Policies
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "banners_public_select" ON public.banners
  FOR SELECT USING (true);

-- Allow staff/admin/teacher to update
CREATE POLICY "banners_staff_update" ON public.banners
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin', 'teacher')
    )
  );

-- Allow staff/admin/teacher to insert (for future banner types)
CREATE POLICY "banners_staff_insert" ON public.banners
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin', 'teacher')
    )
  );

-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read for banner images
CREATE POLICY "banners_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

-- Allow staff/admin/teacher to upload banner images
CREATE POLICY "banners_staff_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'banners' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin', 'teacher')
    )
  );

-- Allow staff/admin/teacher to update/delete banner images
CREATE POLICY "banners_staff_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'banners' AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin', 'teacher')
    )
  );
