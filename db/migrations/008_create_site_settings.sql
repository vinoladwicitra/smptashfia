-- Site Settings Table
-- Stores configurable site-wide settings (contact info, social media, maps, etc.)

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(50) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_group VARCHAR(30) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.site_settings IS 'Configurable site-wide settings managed by staff';

-- Insert default settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_group, description)
VALUES 
  -- Contact
  ('contact_phone', '(021) 84978071', 'contact', 'Phone number display format'),
  ('contact_phone_intl', '+622184978071', 'contact', 'Phone number international format for tel: links'),
  ('contact_hours', 'Sen - Jum : 07.30 - 15.10 WIB', 'contact', 'Working hours display text'),
  ('contact_address_short', 'Jl. Dr. Ratna No.82, Bekasi - 17421', 'contact', 'Short address for header'),
  ('contact_address_full', 'Jl. Dr. Ratna No.82, RT.02/RW.08, Kel. Jatikramat, Kec. Jatiasih, Kota Bekasi, Jawa Barat 17421', 'contact', 'Full address for footer'),
  
  -- Location/Maps
  ('maps_embed_url', 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15863.614022201797!2d106.9516837!3d-6.2764164!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698d730bca8f7f%3A0xa7c63c7cbe29afe3!2sSMP%20Tashfia!5e0!3m2!1sid!2sid!4v1775721806664!5m2!1sid!2sid', 'location', 'Google Maps embed iframe src URL'),
  ('maps_link', 'https://maps.app.goo.gl/ju7qW5xSXENTzcU89', 'location', 'Google Maps direct link for mobile'),
  
  -- Social Media
  ('social_instagram', 'https://www.instagram.com/smptashfia', 'social', 'Instagram profile URL'),
  ('social_instagram_label', '@smptashfia', 'social', 'Instagram display label'),
  ('social_facebook', 'https://web.facebook.com/smp.tashfia', 'social', 'Facebook page URL'),
  ('social_facebook_label', 'SMP Tashfia', 'social', 'Facebook display label'),
  ('social_youtube', 'https://www.youtube.com/channel/UCjZZ5GwNF4bi0d7iPCZIMGA', 'social', 'YouTube channel URL'),
  ('social_youtube_label', 'Ma''had Putri Tashfia', 'social', 'YouTube display label')
ON CONFLICT (setting_key) DO NOTHING;

-- RLS Policies
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "site_settings_public_select" ON public.site_settings
  FOR SELECT USING (true);

-- Allow staff/admin/teacher to update
CREATE POLICY "site_settings_staff_update" ON public.site_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin', 'teacher')
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
