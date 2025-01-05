/*
  # Forum System Schema

  1. New Tables
    - `forum_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `slug` (text)
      - `created_at` (timestamp)
    
    - `forum_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `user_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `forum_comments`
      - `id` (uuid, primary key)
      - `content` (text)
      - `user_id` (uuid, foreign key)
      - `post_id` (uuid, foreign key)
      - `parent_id` (uuid, self-reference for nested comments)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `forum_likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `post_id` (uuid, foreign key, nullable)
      - `comment_id` (uuid, foreign key, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Categories
CREATE TABLE forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON forum_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Posts
CREATE TABLE forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  category_id uuid REFERENCES forum_categories NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create posts"
  ON forum_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view posts"
  ON forum_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own posts"
  ON forum_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comments
CREATE TABLE forum_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  post_id uuid REFERENCES forum_posts NOT NULL,
  parent_id uuid REFERENCES forum_comments,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create comments"
  ON forum_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments"
  ON forum_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own comments"
  ON forum_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Likes
CREATE TABLE forum_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  post_id uuid REFERENCES forum_posts,
  comment_id uuid REFERENCES forum_comments,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT one_target_only CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id, comment_id)
);

ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create likes"
  ON forum_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON forum_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes"
  ON forum_likes
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default categories
INSERT INTO forum_categories (name, description, slug) VALUES
  ('Crop Management', 'Discuss crop cultivation, rotation, and management techniques', 'crop-management'),
  ('Pest Control', 'Share experiences and solutions for pest control', 'pest-control'),
  ('Irrigation', 'Water management and irrigation systems discussion', 'irrigation'),
  ('Soil Health', 'Topics about soil quality, fertilization, and improvement', 'soil-health'),
  ('Equipment', 'Farming equipment and technology discussions', 'equipment'),
  ('Market & Trade', 'Agricultural market trends and trading discussions', 'market-trade');