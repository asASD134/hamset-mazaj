ALTER TABLE public.cafe_settings
  ADD COLUMN IF NOT EXISTS logo_url text NULL,
  ADD COLUMN IF NOT EXISTS phone text NULL,
  ADD COLUMN IF NOT EXISTS whatsapp text NULL,
  ADD COLUMN IF NOT EXISTS address text NULL,
  ADD COLUMN IF NOT EXISTS maps_url text NULL,
  ADD COLUMN IF NOT EXISTS instagram_handle text NULL,
  ADD COLUMN IF NOT EXISTS snapchat_handle text NULL,
  ADD COLUMN IF NOT EXISTS tiktok_handle text NULL,
  ADD COLUMN IF NOT EXISTS email text NULL,
  ADD COLUMN IF NOT EXISTS facebook_url text NULL,
  ADD COLUMN IF NOT EXISTS opening_hours text NULL,
  ADD COLUMN IF NOT EXISTS description text NULL;