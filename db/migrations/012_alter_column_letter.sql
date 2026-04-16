-- Widen column_letter to accept arbitrary headers
ALTER TABLE google_sheets_mappings ALTER COLUMN column_letter TYPE TEXT;
