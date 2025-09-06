import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function DatabaseContextDebug() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, success: boolean, message: string, data?: any, error?: any) => {
    setResults(prev => [...prev, { test, success, message, data, error, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const checkDatabaseContents = async () => {
    setIsLoading(true);
    clearResults();

    try {
      // Check users table
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) {
        addResult('Users Table', false, `Error: ${usersError.message}`, null, usersError);
      } else {
        addResult('Users Table', true, `Found ${users?.length || 0} users`, users);
      }

      // Check user_farms table
      const { data: farms, error: farmsError } = await supabase
        .from('user_farms')
        .select('*');

      if (farmsError) {
        addResult('User Farms Table', false, `Error: ${farmsError.message}`, null, farmsError);
      } else {
        addResult('User Farms Table', true, `Found ${farms?.length || 0} farms`, farms);
      }

      // Check crops table
      const { data: crops, error: cropsError } = await supabase
        .from('crops')
        .select('*')
        .limit(5);

      if (cropsError) {
        addResult('Crops Table', false, `Error: ${cropsError.message}`, null, cropsError);
      } else {
        addResult('Crops Table', true, `Found ${crops?.length || 0} crops`, crops);
      }

      // Check soil_properties table
      const { data: soil, error: soilError } = await supabase
        .from('soil_properties')
        .select('*')
        .limit(5);

      if (soilError) {
        addResult('Soil Properties Table', false, `Error: ${soilError.message}`, null, soilError);
      } else {
        addResult('Soil Properties Table', true, `Found ${soil?.length || 0} soil types`, soil);
      }

    } catch (error) {
      addResult('Database Check', false, `Database check failed: ${error}`, null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testContextRetrieval = async () => {
    setIsLoading(true);

    try {
      // Test getting user context (like the AI service does)
      const userId = 1; // Test with first user
      
      addResult('Context Retrieval', true, `🔍 Testing context retrieval for user ID: ${userId}`, null);

      // Get user data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError) {
        addResult('User Context', false, `No user found with ID ${userId}: ${userError.message}`, null, userError);
      } else {
        addResult('User Context', true, `Found user: ${user.name} from ${user.location}`, user);
      }

      // Get farm data
      const { data: farms, error: farmsError } = await supabase
        .from('user_farms')
        .select('*')
        .eq('user_id', userId);

      if (farmsError) {
        addResult('Farm Context', false, `Error getting farms: ${farmsError.message}`, null, farmsError);
      } else if (!farms || farms.length === 0) {
        addResult('Farm Context', false, `No farms found for user ${userId}`, null, null);
      } else {
        addResult('Farm Context', true, `Found ${farms.length} farms for user`, farms);
      }

      // Test crop recommendations based on farm data
      if (farms && farms.length > 0) {
        const farm = farms[0];
        if (farm.soil_type && farm.ph) {
          addResult('Crop Recommendations', true, `🔍 Testing crop recommendations for soil: ${farm.soil_type}, pH: ${farm.ph}`, null);

          // Test the RPC function
          const { data: recommendations, error: recError } = await supabase
            .rpc('get_crops_by_soil_and_climate', {
              p_soil_type: farm.soil_type,
              p_ph: farm.ph,
              p_rainfall: 1000,
              p_temp_min: 20,
              p_temp_max: 35
            });

          if (recError) {
            addResult('Crop Recommendations', false, `RPC function failed: ${recError.message}`, null, recError);
          } else {
            addResult('Crop Recommendations', true, `Found ${recommendations?.length || 0} suitable crops`, recommendations);
          }
        } else {
          addResult('Crop Recommendations', false, `Farm data incomplete - missing soil_type or pH`, farm, null);
        }
      }

      // Test soil information retrieval
      const { data: soilInfo, error: soilError } = await supabase
        .from('soil_properties')
        .select('*')
        .limit(3);

      if (soilError) {
        addResult('Soil Information', false, `Error getting soil info: ${soilError.message}`, null, soilError);
      } else {
        addResult('Soil Information', true, `Found ${soilInfo?.length || 0} soil types`, soilInfo);
      }

    } catch (error) {
      addResult('Context Retrieval', false, `Context retrieval failed: ${error}`, null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testPersonalizedQuery = async () => {
    setIsLoading(true);

    try {
      // Simulate what the AI service should do
      const userId = 1;
      const query = 'What crops are suitable for my soil?';

      addResult('Personalized Query', true, `🔍 Testing personalized query: "${query}"`, null);

      // Step 1: Get user context
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError) {
        addResult('Personalized Query', false, `Cannot get user context: ${userError.message}`, null, userError);
        return;
      }

      // Step 2: Get farm data
      const { data: farms, error: farmsError } = await supabase
        .from('user_farms')
        .select('*')
        .eq('user_id', userId);

      if (farmsError || !farms || farms.length === 0) {
        addResult('Personalized Query', false, `Cannot get farm data: ${farmsError?.message || 'No farms found'}`, null, farmsError);
        return;
      }

      const farm = farms[0];

      // Step 3: Get relevant crops
      let relevantCrops = [];
      if (farm.soil_type && farm.ph) {
        const { data: crops, error: cropsError } = await supabase
          .rpc('get_crops_by_soil_and_climate', {
            p_soil_type: farm.soil_type,
            p_ph: farm.ph,
            p_rainfall: 1000,
            p_temp_min: 20,
            p_temp_max: 35
          });

        if (!cropsError && crops) {
          relevantCrops = crops;
        }
      }

      // Step 4: Get soil information
      const { data: soilInfo, error: soilError } = await supabase
        .from('soil_properties')
        .select('*')
        .ilike('soil_name', `%${farm.soil_type}%`)
        .limit(3);

      // Step 5: Build context
      const context = {
        user: user,
        farm: farm,
        relevantCrops: relevantCrops,
        soilInfo: soilInfo || [],
        query: query
      };

      addResult('Personalized Query', true, `✅ Context built successfully!`, context);

      // Step 6: Show what the AI should receive
      const contextString = `
User: ${user.name} from ${user.location}
Farm: ${farm.farm_name || 'Unnamed'} - ${farm.soil_type} soil, pH ${farm.ph}
Relevant Crops: ${relevantCrops.length} crops found
Soil Info: ${soilInfo?.length || 0} soil types found
Query: ${query}
      `.trim();

      addResult('AI Context String', true, `Context that should be sent to AI:`, { contextString });

    } catch (error) {
      addResult('Personalized Query', false, `Personalized query test failed: ${error}`, null, error);
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
      <h2 className="text-2xl font-bold mb-6">🔍 Database Context Debug</h2>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={checkDatabaseContents}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Check Database Contents'}
          </button>
          <button
            onClick={testContextRetrieval}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Context Retrieval'}
          </button>
          <button
            onClick={testPersonalizedQuery}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Personalized Query'}
          </button>
          <button
            onClick={clearResults}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Clear Results
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Debug Results</h3>
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusColor(result.success)}`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getStatusIcon(result.success)}</span>
                  <h4 className="font-semibold">{result.test}</h4>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>
                <p className="text-sm mb-2">{result.message}</p>
                
                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">View Data</summary>
                    <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
                
                {result.error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">View Error</summary>
                    <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">What This Debug Tool Does</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>Check Database Contents:</strong> Shows what data is actually in your database</p>
            <p><strong>Test Context Retrieval:</strong> Tests if the AI service can get user and farm data</p>
            <p><strong>Test Personalized Query:</strong> Simulates what the AI should do with your data</p>
            <p><strong>Expected:</strong> Should show your user, farm, and relevant crop data</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Common Issues</h3>
          <div className="text-sm text-red-700 space-y-2">
            <p><strong>No User Data:</strong> If no users found, add farm data first</p>
            <p><strong>No Farm Data:</strong> If no farms found, add farm data first</p>
            <p><strong>RPC Function Missing:</strong> If crop recommendations fail, the function might not exist</p>
            <p><strong>Empty Tables:</strong> If crops/soil tables are empty, run the migration</p>
          </div>
        </div>
      </div>
    </div>
  );
}
