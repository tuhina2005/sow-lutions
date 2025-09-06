-- Quick Fix: Disable RLS temporarily for testing
-- Run this in Supabase SQL Editor

-- Disable RLS on all tables temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE crops DISABLE ROW LEVEL SECURITY;
ALTER TABLE soil_properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE agricultural_recommendations DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_farms', 'crops', 'soil_properties', 'user_history', 'weather_cache', 'agricultural_recommendations');
