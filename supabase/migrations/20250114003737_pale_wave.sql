/*
  # Fix schema relationships and data types

  1. Changes
    - Update likes table to use text for book_id instead of UUID
    - Add profiles relationship to comments table
    - Fix subscriptions query to handle no results properly

  2. Security
    - Maintain existing RLS policies
*/

-- Update likes table book_id type
ALTER TABLE likes ALTER COLUMN book_id TYPE text;

-- Add user profile relationship to comments
ALTER TABLE comments ADD COLUMN profile_id uuid REFERENCES profiles(id);

-- Update existing comments to set profile_id
UPDATE comments SET profile_id = user_id;

-- Make profile_id not null after update
ALTER TABLE comments ALTER COLUMN profile_id SET NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_profile_id ON comments(profile_id);

-- Update subscriptions query function
CREATE OR REPLACE FUNCTION get_subscription_status(user_uuid uuid)
RETURNS TABLE (
  status text,
  subscription_date timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.status, s.subscription_date
  FROM subscriptions s
  WHERE s.user_id = user_uuid
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;