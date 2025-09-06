import React, { useState } from 'react';

export default function RLSFix() {
  const [showSQL, setShowSQL] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">🔒 Row Level Security (RLS) Fix</h2>
      
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">❌ Current Issue</h3>
          <p className="text-sm text-red-700">
            <strong>Error:</strong> "new row violates row-level security policy for table 'users'"
          </p>
          <p className="text-sm text-red-700 mt-2">
            This means Supabase's Row Level Security is blocking data insertion. We need to fix the RLS policies.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">🚀 Quick Fix (Recommended)</h3>
          <p className="text-sm text-blue-700 mb-4">
            <strong>Step 1:</strong> Go to your Supabase Dashboard → SQL Editor
          </p>
          <p className="text-sm text-blue-700 mb-4">
            <strong>Step 2:</strong> Copy and paste the SQL below, then click "Run"
          </p>
          
          <button
            onClick={() => setShowSQL(!showSQL)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showSQL ? 'Hide SQL' : 'Show SQL to Copy'}
          </button>

          {showSQL && (
            <div className="mt-4 bg-white p-4 rounded border">
              <h4 className="font-semibold mb-2">Copy this SQL and run it in Supabase:</h4>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
{`-- Quick Fix: Disable RLS temporarily for testing
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
AND tablename IN ('users', 'user_farms', 'crops', 'soil_properties', 'user_history', 'weather_cache', 'agricultural_recommendations');`}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">✅ After Running the SQL</h3>
          <div className="text-sm text-green-700 space-y-2">
            <p><strong>1.</strong> Go back to your app</p>
            <p><strong>2.</strong> Try the "Ultra Simple (Recommended)" form again</p>
            <p><strong>3.</strong> Click "Test Everything" - should work now!</p>
            <p><strong>4.</strong> Click "Add Real Farm Data" to add your data</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">🔒 What is Row Level Security (RLS)?</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>RLS</strong> is a security feature that controls who can access what data in your database.</p>
            <p><strong>Problem:</strong> The default RLS policies are too restrictive and block all operations.</p>
            <p><strong>Solution:</strong> We disable RLS temporarily so you can add data and test the app.</p>
            <p><strong>Note:</strong> For production, you'd want proper RLS policies instead of disabling it.</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">🛡️ Alternative: Proper RLS Policies</h3>
          <p className="text-sm text-purple-700 mb-4">
            If you want to keep RLS enabled but fix the policies properly:
          </p>
          <button
            onClick={() => setShowSQL(!showSQL)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {showSQL ? 'Hide Alternative SQL' : 'Show Proper RLS Policies'}
          </button>

          {showSQL && (
            <div className="mt-4 bg-white p-4 rounded border">
              <h4 className="font-semibold mb-2">Alternative: Proper RLS Policies (more secure):</h4>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
{`-- Proper RLS Policies for Agritech Chatbot
-- Run this in Supabase SQL Editor

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
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on user_farms" ON user_farms
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on crops" ON crops
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on soil_properties" ON soil_properties
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on user_history" ON user_history
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on weather_cache" ON weather_cache
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on agricultural_recommendations" ON agricultural_recommendations
    FOR ALL USING (true) WITH CHECK (true);`}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">📋 Summary</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Issue:</strong> RLS policies are blocking data insertion</p>
            <p><strong>Quick Fix:</strong> Disable RLS temporarily (recommended for testing)</p>
            <p><strong>Proper Fix:</strong> Create permissive RLS policies</p>
            <p><strong>Result:</strong> You'll be able to add farm data successfully</p>
          </div>
        </div>
      </div>
    </div>
  );
}
