-- Supabase Setup Script for AI Display Banner Builder

-- This script creates the necessary 'projects' table and sets up
-- Row Level Security (RLS) policies to ensure that users can only
-- access and manage their own data.

-- Instructions:
-- 1. Go to your Supabase project dashboard.
-- 2. In the left sidebar, click on the 'SQL Editor' icon.
-- 3. Click on '+ New query'.
-- 4. Copy the entire content of this file and paste it into the SQL editor.
-- 5. Click the 'RUN' button.

-- 1. Create the projects table
-- This table will store the projects created by users.
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NULL,
  user_id UUID NULL,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Enable Row Level Security (RLS) for the table
-- This is a crucial security step to ensure data privacy.
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies to protect your data

-- Policy: Allow users to view their own projects
CREATE POLICY "Allow individual read access"
ON public.projects
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow users to create new projects for themselves
CREATE POLICY "Allow individual insert access"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own projects
CREATE POLICY "Allow individual update access"
ON public.projects
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to delete their own projects
CREATE POLICY "Allow individual delete access"
ON public.projects
FOR DELETE
USING (auth.uid() = user_id);

-- Note: You also need to set up Supabase Storage policies.
-- The application requires two buckets: 'assets' and 'banners'.
-- You can create these in the Supabase dashboard under Storage.
-- The following are example policies, you may need to adjust them.

-- Policies for 'assets' bucket:
-- SELECT: (bucket_id = 'assets' AND auth.uid() = ((storage.foldername(name))[1])::uuid)
-- INSERT: (bucket_id = 'assets' AND auth.uid() = ((storage.foldername(name))[1])::uuid)
-- UPDATE: (bucket_id = 'assets' AND auth.uid() = ((storage.foldername(name))[1])::uuid)
-- DELETE: (bucket_id = 'assets' AND auth.uid() = ((storage.foldername(name))[1])::uuid)

-- Policies for 'banners' bucket:
-- SELECT: (bucket_id = 'banners' AND auth.uid() = ((storage.foldername(name))[1])::uuid)
-- INSERT: (bucket_id = 'banners' AND auth.uid() = ((storage.foldername(name))[1])::uuid)
-- UPDATE: (bucket_id = 'banners' AND auth.uid() = ((storage.foldername(name))[1])::uuid)
-- DELETE: (bucket_id = 'banners' AND auth.uid() = ((storage.foldername(name))[1])::uuid)
