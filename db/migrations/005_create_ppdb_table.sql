-- =====================================================
-- PPDB/PMB Table and Storage Bucket
-- =====================================================

-- Create PPDB registrations table
CREATE TABLE IF NOT EXISTS public.ppdb_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    bukti_transfer_url TEXT,
    pemilihan_sekolah TEXT NOT NULL CHECK (pemilihan_sekolah IN ('Tashfia Boarding School', 'Tashfia Full Day School')),
    
    -- Calon Siswi
    nama_lengkap TEXT NOT NULL,
    nama_panggilan TEXT NOT NULL,
    tempat_lahir TEXT NOT NULL,
    tanggal_lahir DATE NOT NULL,
    alamat TEXT NOT NULL,
    asal_sekolah TEXT NOT NULL,
    alamat_sekolah TEXT NOT NULL,
    no_telp_ortu_1 TEXT NOT NULL,
    no_telp_ortu_2 TEXT NOT NULL,
    
    -- Data Bapak
    nama_bapak TEXT NOT NULL,
    tempat_lahir_bapak TEXT NOT NULL,
    tanggal_lahir_bapak DATE NOT NULL,
    pendidikan_bapak TEXT NOT NULL,
    pekerjaan_bapak TEXT NOT NULL,
    
    -- Data Ibu
    nama_ibu TEXT NOT NULL,
    tempat_lahir_ibu TEXT NOT NULL,
    tanggal_lahir_ibu DATE NOT NULL,
    pendidikan_ibu TEXT NOT NULL,
    pekerjaan_ibu TEXT,
    
    -- Info
    sumber_info TEXT NOT NULL,
    sumber_info_lainnya TEXT,
    
    -- Metadata
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ppdb_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can submit PPDB registration" ON public.ppdb_registrations;
DROP POLICY IF EXISTS "Staff can view all PPDB registrations" ON public.ppdb_registrations;
DROP POLICY IF EXISTS "Admin can manage all PPDB registrations" ON public.ppdb_registrations;

-- Anyone can INSERT (submit form)
CREATE POLICY "Anyone can submit PPDB registration"
    ON public.ppdb_registrations FOR INSERT
    WITH CHECK (true);

-- Staff/Admin can view all registrations
CREATE POLICY "Staff can view all PPDB registrations"
    ON public.ppdb_registrations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin', 'teacher')
        )
    );

-- Admin can update/delete registrations
CREATE POLICY "Admin can manage all PPDB registrations"
    ON public.ppdb_registrations FOR ALL
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

-- Create storage bucket for PPDB transfer proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ppdb-documents', 'ppdb-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can upload
CREATE POLICY "Anyone can upload PPDB documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'ppdb-documents');

-- Storage policy: anyone can view
CREATE POLICY "Anyone can view PPDB documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'ppdb-documents');

-- Storage policy: staff/admin can delete
CREATE POLICY "Staff can delete PPDB documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'ppdb-documents' AND
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name IN ('staff', 'admin')
        )
    );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ppdb_created_at ON public.ppdb_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ppdb_status ON public.ppdb_registrations(status);
CREATE INDEX IF NOT EXISTS idx_ppdb_pemilihan_sekolah ON public.ppdb_registrations(pemilihan_sekolah);

-- =====================================================
SELECT '✅ PPDB table, storage bucket, and RLS policies created!' AS status;
