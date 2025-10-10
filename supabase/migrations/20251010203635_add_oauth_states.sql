-- Add oauth_states table and related policies

-- OAuth States Table
-- Temporarily stores state tokens during OAuth flow for CSRF protection
-- This table prevents OAuth account hijacking attacks
CREATE TABLE IF NOT EXISTS oauth_states (
  state_token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'instagram')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON oauth_states(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);

-- Enable RLS
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies for oauth_states
DROP POLICY IF EXISTS "Users can insert their own OAuth states" ON oauth_states;
CREATE POLICY "Users can insert their own OAuth states"
  ON oauth_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can select their own OAuth states" ON oauth_states;
CREATE POLICY "Users can select their own OAuth states"
  ON oauth_states FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own OAuth states" ON oauth_states;
CREATE POLICY "Users can delete their own OAuth states"
  ON oauth_states FOR DELETE
  USING (auth.uid() = user_id);

-- Grant DELETE permission
GRANT DELETE ON oauth_states TO authenticated;
