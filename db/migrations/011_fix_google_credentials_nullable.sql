-- Fix google_credentials table: make redirect_uri nullable (now dynamic)

ALTER TABLE public.google_credentials
  ALTER COLUMN redirect_uri DROP NOT NULL;
