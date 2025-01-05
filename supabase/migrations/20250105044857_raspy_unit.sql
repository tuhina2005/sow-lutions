/*
  # Fix Forum Schema Relationships

  1. Changes
    - Fix foreign key relationships to auth.users table
    - Add proper references for user_id columns
    - Update RLS policies to use auth.uid()

  2. Security
    - Maintain existing RLS policies
    - Ensure proper user authentication checks
*/

-- Fix forum_posts foreign key
ALTER TABLE forum_posts 
DROP CONSTRAINT IF EXISTS forum_posts_user_id_fkey,
ADD CONSTRAINT forum_posts_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);

-- Fix forum_comments foreign key
ALTER TABLE forum_comments
DROP CONSTRAINT IF EXISTS forum_comments_user_id_fkey,
ADD CONSTRAINT forum_comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);

-- Fix forum_likes foreign key
ALTER TABLE forum_likes
DROP CONSTRAINT IF EXISTS forum_likes_user_id_fkey,
ADD CONSTRAINT forum_likes_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);