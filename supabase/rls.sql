-- PostWave RLS Policies, Triggers, and Functions
-- Run this AFTER schema.sql to set up security and automation

-- ============================================
-- RLS POLICIES FOR TABLES
-- ============================================

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id OR
    current_setting('role') = 'postgres' OR
    current_setting('role') = 'service_role'
  );

-- RLS Policies for social_connections
DROP POLICY IF EXISTS "Users can view their own connections" ON social_connections;
CREATE POLICY "Users can view their own connections"
  ON social_connections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own connections" ON social_connections;
CREATE POLICY "Users can insert their own connections"
  ON social_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own connections" ON social_connections;
CREATE POLICY "Users can update their own connections"
  ON social_connections FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own connections" ON social_connections;
CREATE POLICY "Users can delete their own connections"
  ON social_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for videos
DROP POLICY IF EXISTS "Users can view their own videos" ON videos;
CREATE POLICY "Users can view their own videos"
  ON videos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own videos" ON videos;
CREATE POLICY "Users can insert their own videos"
  ON videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
CREATE POLICY "Users can update their own videos"
  ON videos FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;
CREATE POLICY "Users can delete their own videos"
  ON videos FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for posts
DROP POLICY IF EXISTS "Users can view their own posts" ON posts;
CREATE POLICY "Users can view their own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
CREATE POLICY "Users can insert their own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

-- Policy for uploading videos
-- Users can upload files to their own folder (user_id/filename)
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for reading/downloading videos
-- Users can read files from their own folder
CREATE POLICY "Users can read their own videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for updating video metadata
-- Users can update their own files
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting videos
-- Users can delete their own files
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- STORAGE POLICIES FOR AVATARS BUCKET
-- ============================================

-- Drop existing avatar policies if any
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Policy for uploading avatars
-- Users can upload files to their own folder (user_id/filename)
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for reading avatars (public access)
-- Anyone can view avatars (they're profile pictures)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy for updating avatar metadata
-- Users can update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting avatars
-- Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Video file deletion is handled in the API endpoint
-- Database triggers cannot reliably call Supabase storage functions
-- See app/api/videos/[id]/route.ts DELETE handler

-- Function to clean up user data when user is deleted
CREATE OR REPLACE FUNCTION cleanup_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Note: Foreign key CASCADE will handle deleting records from:
  -- - user_profiles
  -- - social_connections
  -- - videos
  -- - posts

  -- Note: Storage cleanup should be handled by the application layer
  -- before deleting the user account

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke OAuth tokens when social connection is deleted
CREATE OR REPLACE FUNCTION revoke_oauth_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the deletion for audit purposes
  RAISE NOTICE 'Social connection deleted: user_id=%, platform=%', OLD.user_id, OLD.platform;

  -- Note: Actual OAuth token revocation should be handled in application code
  -- via the disconnect API endpoints, as it requires HTTP calls to OAuth providers

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users
  -- This will cascade to all related tables via foreign keys
  -- and trigger cleanup functions
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Triggers to update updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_connections_updated_at ON social_connections;
CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON social_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Note: Video file deletion trigger removed - handled in API endpoint instead
DROP TRIGGER IF EXISTS on_video_deleted ON videos;

-- Trigger to clean up user data when auth.users record is deleted
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_user_data();

-- Trigger for social connection deletion logging
DROP TRIGGER IF EXISTS on_social_connection_deleted ON social_connections;
CREATE TRIGGER on_social_connection_deleted
  BEFORE DELETE ON social_connections
  FOR EACH ROW
  EXECUTE FUNCTION revoke_oauth_token();

-- ============================================
-- VIEWS
-- ============================================

-- Create a view to check user data summary
CREATE OR REPLACE VIEW user_data_summary AS
SELECT
  u.id as user_id,
  u.email,
  COUNT(DISTINCT v.id) as video_count,
  COUNT(DISTINCT sc.id) as connection_count,
  COUNT(DISTINCT p.id) as post_count,
  SUM(v.file_size) as total_storage_bytes
FROM auth.users u
LEFT JOIN videos v ON v.user_id = u.id
LEFT JOIN social_connections sc ON sc.user_id = u.id
LEFT JOIN posts p ON p.user_id = u.id
GROUP BY u.id, u.email;

-- ============================================
-- PERMISSIONS
-- ============================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO anon;

-- Grant DELETE permissions (needed for cascade and user deletion)
GRANT DELETE ON user_profiles TO authenticated;
GRANT DELETE ON social_connections TO authenticated;
GRANT DELETE ON videos TO authenticated;
GRANT DELETE ON posts TO authenticated;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function execute permissions
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- Grant view access
GRANT SELECT ON user_data_summary TO authenticated;

-- Grant permissions for trigger functions
GRANT INSERT ON user_profiles TO postgres;
GRANT INSERT ON user_profiles TO service_role;
