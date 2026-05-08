-- Clean up only if necessary
-- Rename public.users to public.jp_users
ALTER TABLE public.users RENAME TO jp_users;

-- Add password_hash column to jp_users
ALTER TABLE public.jp_users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Remove the NOT NULL constraint from password_hash temporarily if existing users don't have passwords
-- You can handle existing users by assigning them a default password hash or requiring password reset

-- Drop any foreign key constraints on jp_users (which pointed to auth.users)
DO $$ 
DECLARE 
    fk_record RECORD;
BEGIN
    FOR fk_record IN 
        SELECT conname
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE t.relname = 'jp_users' 
          AND n.nspname = 'public' 
          AND contype = 'f'
    LOOP
        EXECUTE 'ALTER TABLE public.jp_users DROP CONSTRAINT ' || fk_record.conname;
    END LOOP;
END $$;

-- Drop the old trigger that syncs auth.users to public.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
