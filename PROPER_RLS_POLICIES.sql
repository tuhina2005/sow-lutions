-- Proper RLS Policies for Agritech Chatbot
-- Run this in Supabase SQL Editor after disabling RLS

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE agricultural_recommendations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on user_farms" ON user_farms;
DROP POLICY IF EXISTS "Allow all operations on crops" ON crops;
DROP POLICY IF EXISTS "Allow all operations on soil_properties" ON soil_properties;
DROP POLICY IF EXISTS "Allow all operations on user_history" ON user_history;
DROP POLICY IF EXISTS "Allow all operations on weather_cache" ON weather_cache;
DROP POLICY IF EXISTS "Allow all operations on agricultural_recommendations" ON agricultural_recommendations;

-- Create permissive policies for development/testing
-- These allow all operations for now - you can make them more restrictive later

-- Users table policies
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- User farms table policies  
CREATE POLICY "Allow all operations on user_farms" ON user_farms
    FOR ALL USING (true) WITH CHECK (true);

-- Crops table policies (read-only for everyone)
CREATE POLICY "Allow all operations on crops" ON crops
    FOR ALL USING (true) WITH CHECK (true);

-- Soil properties table policies (read-only for everyone)
CREATE POLICY "Allow all operations on soil_properties" ON soil_properties
    FOR ALL USING (true) WITH CHECK (true);

-- User history table policies
CREATE POLICY "Allow all operations on user_history" ON user_history
    FOR ALL USING (true) WITH CHECK (true);

-- Weather cache table policies
CREATE POLICY "Allow all operations on weather_cache" ON weather_cache
    FOR ALL USING (true) WITH CHECK (true);

-- Agricultural recommendations table policies
CREATE POLICY "Allow all operations on agricultural_recommendations" ON agricultural_recommendations
    FOR ALL USING (true) WITH CHECK (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_farms', 'crops', 'soil_properties', 'user_history', 'weather_cache', 'agricultural_recommendations');
