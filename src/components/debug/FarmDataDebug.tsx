import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function FarmDataDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('Users')
        .select('count')
        .limit(1);

      if (error) {
        setTestResult(`❌ Database Error: ${error.message}`);
        setDebugInfo({ error: error.message, details: error });
      } else {
        setTestResult('✅ Database connection successful');
        setDebugInfo({ success: true, data });
      }
    } catch (error) {
      setTestResult(`❌ Connection Error: ${error}`);
      setDebugInfo({ error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  const testUserCreation = async () => {
    setIsLoading(true);
    try {
      const testUser = {
        name: 'Test User',
        location: 'Test Location',
        preferred_language: 'en',
        farm_size: 1.0
      };

      const { data, error } = await supabase
        .from('Users')
        .insert(testUser)
        .select('user_id')
        .single();

      if (error) {
        setTestResult(`❌ User Creation Error: ${error.message}`);
        setDebugInfo({ error: error.message, details: error });
      } else {
        setTestResult(`✅ User created successfully with ID: ${data.user_id}`);
        setDebugInfo({ success: true, userId: data.user_id });
      }
    } catch (error) {
      setTestResult(`❌ User Creation Error: ${error}`);
      setDebugInfo({ error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  const testFarmCreation = async () => {
    setIsLoading(true);
    try {
      const testFarm = {
        user_id: 1, // Assuming user ID 1 exists
        farm_name: 'Test Farm',
        soil_type: 'Loamy Soil',
        ph: 6.5,
        organic_carbon: 1.2,
        irrigation_available: true,
        farm_area: 5.0,
        latitude: 31.583,
        longitude: 75.983
      };

      const { data, error } = await supabase
        .from('User_Farms')
        .insert(testFarm)
        .select('farm_id')
        .single();

      if (error) {
        setTestResult(`❌ Farm Creation Error: ${error.message}`);
        setDebugInfo({ error: error.message, details: error });
      } else {
        setTestResult(`✅ Farm created successfully with ID: ${data.farm_id}`);
        setDebugInfo({ success: true, farmId: data.farm_id });
      }
    } catch (error) {
      setTestResult(`❌ Farm Creation Error: ${error}`);
      setDebugInfo({ error: error.toString() });
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnvironmentVariables = () => {
    const envVars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY
    };

    const missing = Object.entries(envVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      setTestResult(`❌ Missing Environment Variables: ${missing.join(', ')}`);
      setDebugInfo({ missing, envVars });
    } else {
      setTestResult('✅ All environment variables are set');
      setDebugInfo({ envVars });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Farm Data Debug Tool</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Debug Steps</h3>
          <div className="space-y-2">
            <button
              onClick={checkEnvironmentVariables}
              disabled={isLoading}
              className="w-full text-left p-2 bg-white border border-blue-300 rounded hover:bg-blue-50"
            >
              1. Check Environment Variables
            </button>
            <button
              onClick={testDatabaseConnection}
              disabled={isLoading}
              className="w-full text-left p-2 bg-white border border-blue-300 rounded hover:bg-blue-50"
            >
              2. Test Database Connection
            </button>
            <button
              onClick={testUserCreation}
              disabled={isLoading}
              className="w-full text-left p-2 bg-white border border-blue-300 rounded hover:bg-blue-50"
            >
              3. Test User Creation
            </button>
            <button
              onClick={testFarmCreation}
              disabled={isLoading}
              className="w-full text-left p-2 bg-white border border-blue-300 rounded hover:bg-blue-50"
            >
              4. Test Farm Creation
            </button>
          </div>
        </div>

        {testResult && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Test Result</h3>
            <p className="text-sm font-mono">{testResult}</p>
          </div>
        )}

        {debugInfo && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Debug Information</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Common Issues & Solutions</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>Environment Variables:</strong> Make sure .env file exists and has correct Supabase keys</p>
            <p><strong>Database Migration:</strong> Ensure the migration was applied successfully</p>
            <p><strong>RLS Policies:</strong> Check if Row Level Security is blocking inserts</p>
            <p><strong>Network Issues:</strong> Verify internet connection and Supabase project is active</p>
            <p><strong>Browser Console:</strong> Press F12 and check for JavaScript errors</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Manual Data Entry (Alternative)</h3>
          <p className="text-sm text-green-700 mb-2">
            If the form doesn't work, you can add data directly to the database:
          </p>
          <div className="bg-white p-3 rounded border text-xs font-mono">
            <div>-- Create user profile</div>
            <div>INSERT INTO Users (name, location, preferred_language, farm_size)</div>
            <div>VALUES ('Your Name', 'Punjab, India', 'en', 5.0);</div>
            <br />
            <div>-- Add farm data (replace 1 with your user_id)</div>
            <div>INSERT INTO User_Farms (user_id, farm_name, soil_type, ph, organic_carbon, irrigation_available, farm_area)</div>
            <div>VALUES (1, 'Main Farm', 'Loamy Soil', 6.5, 1.2, true, 5.0);</div>
          </div>
        </div>
      </div>
    </div>
  );
}
