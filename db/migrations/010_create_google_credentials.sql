-- Google OAuth Credentials Table
-- Store Google OAuth credentials securely for management via UI

CREATE TABLE IF NOT EXISTS public.google_credentials (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure single row
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000001')
);

COMMENT ON TABLE public.google_credentials IS 'Google OAuth credentials managed via staff UI';

-- RLS Policies
ALTER TABLE public.google_credentials ENABLE ROW LEVEL SECURITY;

-- Staff/admin can read
CREATE POLICY "google_creds_staff_select" ON public.google_credentials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin')
    )
  );

-- Staff/admin can update
CREATE POLICY "google_creds_staff_update" ON public.google_credentials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin')
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_google_credentials_updated_at
  BEFORE UPDATE ON public.google_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
