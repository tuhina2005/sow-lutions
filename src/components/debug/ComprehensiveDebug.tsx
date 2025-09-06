import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface DebugResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export default function ComprehensiveDebug() {
  const [debugResults, setDebugResults] = useState<DebugResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (step: string, success: boolean, message: string, data?: any, error?: any) => {
    setDebugResults(prev => [...prev, { step, success, message, data, error }]);
  };

  const clearResults = () => {
    setDebugResults([]);
  };

  const runComprehensiveDebug = async () => {
    setIsLoading(true);
    clearResults();

    try {
      // Step 1: Check Environment Variables
      addResult(
        'Environment Variables',
        !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
        import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY 
          ? 'Environment variables are set' 
          : 'Missing environment variables',
        {
          url: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
          key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
        }
      );

      // Step 2: Test Supabase Connection
      try {
        const { data, error } = await supabase
          .from('Users')
          .select('count')
          .limit(1);
        
        addResult(
          'Database Connection',
          !error,
          error ? `Connection failed: ${error.message}` : 'Database connection successful',
          data,
          error
        );
      } catch (error) {
        addResult(
          'Database Connection',
          false,
          `Connection error: ${error}`,
          null,
          error
        );
      }

      // Step 3: Check if Tables Exist
      const tables = ['Users', 'User_Farms', 'Crops', 'Soil_Properties'];
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          addResult(
            `Table: ${table}`,
            !error,
            error ? `Table doesn't exist: ${error.message}` : `Table exists with ${data?.length || 0} records`,
            data,
            error
          );
        } catch (error) {
          addResult(
            `Table: ${table}`,
            false,
            `Table check failed: ${error}`,
            null,
            error
          );
        }
      }

      // Step 4: Test User Creation
      try {
        const testUser = {
          name: 'Debug Test User',
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
          addResult(
            'User Creation Test',
            false,
            `User creation failed: ${error.message}`,
            null,
            error
          );
        } else {
          addResult(
            'User Creation Test',
            true,
            `User created successfully with ID: ${data.user_id}`,
            data
          );

          // Step 5: Test Farm Creation
          try {
            const testFarm = {
              user_id: data.user_id,
              farm_name: 'Debug Test Farm',
              soil_type: 'Loamy Soil',
              ph: 6.5,
              organic_carbon: 1.2,
              irrigation_available: true,
              farm_area: 5.0,
              latitude: 31.583,
              longitude: 75.983
            };

            const { data: farmData, error: farmError } = await supabase
              .from('User_Farms')
              .insert(testFarm)
              .select('farm_id')
              .single();

            if (farmError) {
              addResult(
                'Farm Creation Test',
                false,
                `Farm creation failed: ${farmError.message}`,
                null,
                farmError
              );
            } else {
              addResult(
                'Farm Creation Test',
                true,
                `Farm created successfully with ID: ${farmData.farm_id}`,
                farmData
              );
            }

            // Clean up test data
            await supabase.from('User_Farms').delete().eq('farm_id', farmData.farm_id);
            await supabase.from('Users').delete().eq('user_id', data.user_id);
            addResult(
              'Cleanup',
              true,
              'Test data cleaned up successfully',
              null
            );

          } catch (error) {
            addResult(
              'Farm Creation Test',
              false,
              `Farm creation error: ${error}`,
              null,
              error
            );
          }
        }
      } catch (error) {
        addResult(
          'User Creation Test',
          false,
          `User creation error: ${error}`,
          null,
          error
        );
      }

      // Step 6: Check RLS Policies
      try {
        const { data, error } = await supabase
          .from('Users')
          .select('*')
          .limit(1);
        
        addResult(
          'RLS Policies',
          !error,
          error ? `RLS might be blocking: ${error.message}` : 'RLS policies seem fine',
          null,
          error
        );
      } catch (error) {
        addResult(
          'RLS Policies',
          false,
          `RLS check failed: ${error}`,
          null,
          error
        );
      }

    } catch (error) {
      addResult(
        'Overall Debug',
        false,
        `Debug process failed: ${error}`,
        null,
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-800 bg-green-50 border-green-200' : 'text-red-800 bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Comprehensive Farm Data Debug</h1>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={runComprehensiveDebug}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Running Debug...' : 'Run Comprehensive Debug'}
          </button>
          <button
            onClick={clearResults}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Clear Results
          </button>
        </div>

        {debugResults.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Debug Results</h2>
            {debugResults.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusColor(result.success)}`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getStatusIcon(result.success)}</span>
                  <h3 className="font-semibold">{result.step}</h3>
                </div>
                <p className="text-sm mb-2">{result.message}</p>
                
                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">View Data</summary>
                    <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
                
                {result.error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">View Error</summary>
                    <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Common Issues & Solutions</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <div>
              <strong>Environment Variables Missing:</strong>
              <p>Check your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</p>
            </div>
            <div>
              <strong>Tables Don't Exist:</strong>
              <p>Run the database migration in Supabase SQL Editor</p>
            </div>
            <div>
              <strong>RLS Policies Blocking:</strong>
              <p>Disable RLS temporarily or create proper policies</p>
            </div>
            <div>
              <strong>Network Issues:</strong>
              <p>Check internet connection and Supabase project status</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Fixes</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <div>
              <strong>1. Apply Database Migration:</strong>
              <p>Go to Supabase Dashboard → SQL Editor → Run the migration SQL</p>
            </div>
            <div>
              <strong>2. Disable RLS Temporarily:</strong>
              <p>ALTER TABLE Users DISABLE ROW LEVEL SECURITY;</p>
            </div>
            <div>
              <strong>3. Check Environment Variables:</strong>
              <p>Restart dev server after updating .env file</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
