-- =====================================================
-- HeyMeg: Set up post-thumbnails storage bucket
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- Create the post-thumbnails bucket (public so images can be displayed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-thumbnails',
  'post-thumbnails',
  true,
  10485760,  -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- Allow authenticated users to upload post thumbnails
CREATE POLICY "Users can upload post thumbnails"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-thumbnails');

-- Allow authenticated users to update/replace post thumbnails
CREATE POLICY "Users can update post thumbnails"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'post-thumbnails');

-- Allow authenticated users to delete post thumbnails
CREATE POLICY "Users can delete post thumbnails"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'post-thumbnails');

-- Allow anyone to view post thumbnails (public bucket)
CREATE POLICY "Anyone can view post thumbnails"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'post-thumbnails');
