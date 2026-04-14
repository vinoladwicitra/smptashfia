-- Google Sheets Integration Tables
-- Stores OAuth tokens, spreadsheet config, and field-column mappings

-- 1. Google Sheets Configuration Table
CREATE TABLE IF NOT EXISTS public.google_sheets_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- OAuth Tokens
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  user_email TEXT,
  
  -- Spreadsheet Settings
  spreadsheet_id TEXT,
  spreadsheet_title TEXT,
  sheet_name TEXT,
  
  -- Sync Settings
  auto_sync BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.google_sheets_config IS 'Google Sheets OAuth config and spreadsheet settings';

-- 2. Field-to-Column Mapping Table
CREATE TABLE IF NOT EXISTS public.google_sheets_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name VARCHAR(50) NOT NULL,
  column_letter VARCHAR(3) NOT NULL,
  column_label VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(field_name)
);

COMMENT ON TABLE public.google_sheets_mappings IS 'Maps PPDB form fields to Google Sheets columns';

-- Insert default mappings for PPDB form fields
INSERT INTO public.google_sheets_mappings (field_name, column_letter, column_label)
VALUES 
  ('email', 'A', 'Email'),
  ('pemilihan_sekolah', 'B', 'Sekolah Pilihan'),
  ('nama_lengkap', 'C', 'Nama Lengkap'),
  ('nama_panggilan', 'D', 'Nama Panggilan'),
  ('tempat_lahir', 'E', 'Tempat Lahir'),
  ('tanggal_lahir', 'F', 'Tanggal Lahir'),
  ('alamat', 'G', 'Alamat'),
  ('asal_sekolah', 'H', 'Asal Sekolah'),
  ('alamat_sekolah', 'I', 'Alamat Sekolah'),
  ('no_telp_ortu_1', 'J', 'No. Telp Ortu 1'),
  ('no_telp_ortu_2', 'K', 'No. Telp Ortu 2'),
  ('nama_bapak', 'L', 'Nama Bapak'),
  ('tempat_lahir_bapak', 'M', 'Tempat Lahir Bapak'),
  ('tanggal_lahir_bapak', 'N', 'Tanggal Lahir Bapak'),
  ('pendidikan_bapak', 'O', 'Pendidikan Bapak'),
  ('pekerjaan_bapak', 'P', 'Pekerjaan Bapak'),
  ('nama_ibu', 'Q', 'Nama Ibu'),
  ('tempat_lahir_ibu', 'R', 'Tempat Lahir Ibu'),
  ('tanggal_lahir_ibu', 'S', 'Tanggal Lahir Ibu'),
  ('pendidikan_ibu', 'T', 'Pendidikan Ibu'),
  ('pekerjaan_ibu', 'U', 'Pekerjaan Ibu'),
  ('sumber_info', 'V', 'Sumber Info'),
  ('sumber_info_lainnya', 'W', 'Sumber Info Lainnya'),
  ('bukti_transfer_url', 'X', 'Bukti Transfer'),
  ('status', 'Y', 'Status'),
  ('created_at', 'Z', 'Tanggal Daftar')
ON CONFLICT (field_name) DO NOTHING;

-- RLS Policies
ALTER TABLE public.google_sheets_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_sheets_mappings ENABLE ROW LEVEL SECURITY;

-- Config: staff/admin/teacher can read
CREATE POLICY "gsheets_config_staff_select" ON public.google_sheets_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin', 'teacher')
    )
  );

-- Config: staff/admin can update
CREATE POLICY "gsheets_config_staff_update" ON public.google_sheets_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin')
    )
  );

-- Mappings: public read
CREATE POLICY "gsheets_mappings_public_select" ON public.google_sheets_mappings
  FOR SELECT USING (true);

-- Mappings: staff/admin can update
CREATE POLICY "gsheets_mappings_staff_update" ON public.google_sheets_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin')
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_gsheets_config_updated_at
  BEFORE UPDATE ON public.google_sheets_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure single row config (always upsert)
CREATE UNIQUE INDEX idx_gsheets_config_single ON public.google_sheets_config ((true))
  WHERE (true);
