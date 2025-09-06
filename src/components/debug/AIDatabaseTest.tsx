import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { agritechChatbotFixedService } from '../../services/ai/agritech-chatbot-fixed.service';

export default function AIDatabaseTest() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, success: boolean, message: string, data?: any, error?: any) => {
    setResults(prev => [...prev, { test, success, message, data, error, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testDatabaseData = async () => {
    setIsLoading(true);
    clearResults();

    try {
      // Test 1: Check if we have user data
      setResults(prev => [...prev, { test: 'Database Data Check', success: true, message: '🔍 Checking database contents...', timestamp: new Date().toISOString() }]);

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      if (usersError) {
        addResult('Users Data', false, `Error fetching users: ${usersError.message}`, null, usersError);
      } else {
        addResult('Users Data', true, `Found ${users?.length || 0} users in database`, users);
      }

      // Test 2: Check farm data
      const { data: farms, error: farmsError } = await supabase
        .from('user_farms')
        .select('*')
        .limit(5);

      if (farmsError) {
        addResult('Farm Data', false, `Error fetching farms: ${farmsError.message}`, null, farmsError);
      } else {
        addResult('Farm Data', true, `Found ${farms?.length || 0} farms in database`, farms);
      }

      // Test 3: Check crops data
      const { data: crops, error: cropsError } = await supabase
        .from('crops')
        .select('*')
        .limit(5);

      if (cropsError) {
        addResult('Crops Data', false, `Error fetching crops: ${cropsError.message}`, null, cropsError);
      } else {
        addResult('Crops Data', true, `Found ${crops?.length || 0} crops in database`, crops);
      }

      // Test 4: Check soil data
      const { data: soil, error: soilError } = await supabase
        .from('soil_properties')
        .select('*')
        .limit(5);

      if (soilError) {
        addResult('Soil Data', false, `Error fetching soil: ${soilError.message}`, null, soilError);
      } else {
        addResult('Soil Data', true, `Found ${soil?.length || 0} soil types in database`, soil);
      }

    } catch (error) {
      addResult('Database Test', false, `Database test failed: ${error}`, null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testContextRetrieval = async () => {
    setIsLoading(true);

    try {
      // Test context retrieval for different queries
      const testQueries = [
        'What crops are suitable for my soil?',
        'Tell me about loamy soil',
        'What is the best crop for clay soil?',
        'How to improve soil fertility?'
      ];

      for (const query of testQueries) {
        try {
          addResult('Context Retrieval', true, `🔍 Testing query: "${query}"`, null);
          
          // Test context retrieval by calling the service directly
          const result = await agritechChatbotFixedService.generateResponse(query, 'en', 1, 'test-session');
          const context = result.contextUsed;
          
          if (context.crops.length > 0 || context.soilInfo.length > 0) {
            addResult(`Query: "${query}"`, true, `✅ Found ${context.crops.length} crops and ${context.soilInfo.length} soil info`, context);
          } else {
            addResult(`Query: "${query}"`, false, `❌ No relevant data found for this query`, context);
          }
        } catch (error) {
          addResult(`Query: "${query}"`, false, `❌ Context retrieval failed: ${error}`, null, error);
        }
      }

    } catch (error) {
      addResult('Context Retrieval Test', false, `Context retrieval test failed: ${error}`, null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testUserContext = async () => {
    setIsLoading(true);

    try {
      // Get the first user and their farm data
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (usersError || !users || users.length === 0) {
        addResult('User Context Test', false, 'No users found in database. Please add farm data first.', null, usersError);
        return;
      }

      const userId = users[0].user_id;
      addResult('User Context Test', true, `🔍 Testing with user ID: ${userId}`, users[0]);

      // Get user's farm data
      const { data: farms, error: farmsError } = await supabase
        .from('user_farms')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (farmsError || !farms || farms.length === 0) {
        addResult('User Context Test', false, 'No farm data found for this user. Please add farm data first.', null, farmsError);
        return;
      }

      const farm = farms[0];
      addResult('User Context Test', true, `✅ Found farm data: ${farm.soil_type} soil, pH ${farm.ph}`, farm);

      // Test personalized crop recommendations
      if (farm.soil_type && farm.ph) {
        try {
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
            addResult('Crop Recommendations', true, `✅ Found ${recommendations?.length || 0} suitable crops for your farm`, recommendations);
          }
        } catch (error) {
          addResult('Crop Recommendations', false, `Crop recommendation failed: ${error}`, null, error);
        }
      }

    } catch (error) {
      addResult('User Context Test', false, `User context test failed: ${error}`, null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testFullAIResponse = async () => {
    setIsLoading(true);

    try {
      addResult('Full AI Test', true, '🔍 Testing complete AI response with database context...', null);

      // Test a complete AI response
      const testQuery = 'What crops are suitable for my soil?';
      const response = await agritechChatbotFixedService.generateResponse(
        testQuery,
        'en',
        1, // Use first user
        'test-session'
      );

      if (response.success) {
        addResult('Full AI Test', true, `✅ AI response generated successfully!`, {
          query: testQuery,
          response: response.text,
          confidence: response.confidence
        });
      } else {
        addResult('Full AI Test', false, `❌ AI response failed: ${response.error}`, null, response.error);
      }

    } catch (error) {
      addResult('Full AI Test', false, `Full AI test failed: ${error}`, null, error);
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
      <h2 className="text-2xl font-bold mb-6">🤖 AI Database Integration Test</h2>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testDatabaseData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Database Data'}
          </button>
          <button
            onClick={testContextRetrieval}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Context Retrieval'}
          </button>
          <button
            onClick={testUserContext}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test User Context'}
          </button>
          <button
            onClick={testFullAIResponse}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Full AI Response'}
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
            <h3 className="text-xl font-semibold">Test Results</h3>
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">What These Tests Do</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Database Data:</strong> Checks if your farm data is in the database</p>
            <p><strong>Context Retrieval:</strong> Tests if AI can find relevant data for queries</p>
            <p><strong>User Context:</strong> Tests personalized recommendations using YOUR farm data</p>
            <p><strong>Full AI Response:</strong> Tests complete AI response with database context</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Expected Results</h3>
          <div className="text-sm text-green-700 space-y-2">
            <p><strong>✅ All tests should pass</strong> if your farm data is properly inserted</p>
            <p><strong>✅ Context retrieval</strong> should find relevant crops and soil info</p>
            <p><strong>✅ User context</strong> should show personalized recommendations</p>
            <p><strong>✅ Full AI response</strong> should use your farm data in recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
