import React, { useState } from 'react';
import { supabase, testConnection, testAllTables, safeInsert } from '../../lib/supabase-fixed';

export default function UltraSimpleFarmEntry() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testEverything = async () => {
    setIsLoading(true);
    setResult('');
    setDebugInfo(null);

    try {
      // Step 1: Test connection
      setResult('🔍 Testing database connection...');
      const connectionResult = await testConnection();
      
      if (!connectionResult.success) {
        setResult(`❌ Connection failed: ${connectionResult.error?.message}`);
        setDebugInfo({ step: 'Connection', error: connectionResult.error });
        return;
      }
      
      setResult('✅ Connection successful! Testing tables...');
      
      // Step 2: Test all tables
      const tableResults = await testAllTables();
      const missingTables = tableResults.filter(r => !r.exists);
      
      if (missingTables.length > 0) {
        setResult(`❌ Missing tables: ${missingTables.map(t => t.table).join(', ')}`);
        setDebugInfo({ step: 'Tables', missing: missingTables, all: tableResults });
        return;
      }
      
      setResult('✅ All tables exist! Testing data insertion...');
      
      // Step 3: Test user creation
      const userData = {
        name: 'Test User',
        location: 'Test Location',
        preferred_language: 'en',
        farm_size: 1.0
      };
      
      const userResult = await safeInsert('users', userData);
      
      if (!userResult.success) {
        setResult(`❌ User creation failed: ${userResult.error?.message}`);
        setDebugInfo({ step: 'User Creation', error: userResult.error, data: userData });
        return;
      }
      
      const userId = userResult.data.user_id;
      setResult(`✅ User created! ID: ${userId}. Testing farm creation...`);
      
      // Step 4: Test farm creation
      const farmData = {
        user_id: userId,
        farm_name: 'Test Farm',
        soil_type: 'Loamy Soil',
        ph: 6.5,
        organic_carbon: 1.2,
        irrigation_available: true,
        farm_area: 5.0,
        latitude: 31.583,
        longitude: 75.983
      };
      
      const farmResult = await safeInsert('user_farms', farmData);
      
      if (!farmResult.success) {
        setResult(`❌ Farm creation failed: ${farmResult.error?.message}`);
        setDebugInfo({ step: 'Farm Creation', error: farmResult.error, data: farmData, userId });
        return;
      }
      
      setResult(`✅ SUCCESS! User ID: ${userId}, Farm ID: ${farmResult.data.farm_id}`);
      setDebugInfo({ 
        step: 'Complete Success', 
        userId, 
        farmId: farmResult.data.farm_id,
        userData,
        farmData
      });
      
      // Clean up test data
      await supabase.from('user_farms').delete().eq('farm_id', farmResult.data.farm_id);
      await supabase.from('users').delete().eq('user_id', userId);
      setResult(`✅ SUCCESS! Test data cleaned up. Everything works!`);
      
    } catch (error) {
      setResult(`❌ Unexpected error: ${error}`);
      setDebugInfo({ step: 'Unexpected Error', error });
    } finally {
      setIsLoading(false);
    }
  };

  const addRealData = async () => {
    setIsLoading(true);
    setResult('');
    setDebugInfo(null);

    try {
      // Create real user data
      const userData = {
        name: 'Demo User',
        location: 'Punjab, India',
        preferred_language: 'en',
        farm_size: 5.0
      };
      
      setResult('🔍 Creating user profile...');
      const userResult = await safeInsert('users', userData);
      
      if (!userResult.success) {
        setResult(`❌ User creation failed: ${userResult.error?.message}`);
        setDebugInfo({ step: 'User Creation', error: userResult.error, data: userData });
        return;
      }
      
      const userId = userResult.data.user_id;
      setResult(`✅ User created! ID: ${userId}. Creating farm...`);
      
      // Create real farm data
      const farmData = {
        user_id: userId,
        farm_name: 'Main Farm',
        soil_type: 'Loamy Soil',
        ph: 6.5,
        organic_carbon: 1.2,
        irrigation_available: true,
        irrigation_type: 'Drip Irrigation',
        farm_area: 5.0,
        latitude: 31.583,
        longitude: 75.983
      };
      
      const farmResult = await safeInsert('user_farms', farmData);
      
      if (!farmResult.success) {
        setResult(`❌ Farm creation failed: ${farmResult.error?.message}`);
        setDebugInfo({ step: 'Farm Creation', error: farmResult.error, data: farmData, userId });
        return;
      }
      
      setResult(`✅ SUCCESS! Your farm data has been added!`);
      setResult(`User ID: ${userId}, Farm ID: ${farmResult.data.farm_id}`);
      setDebugInfo({ 
        step: 'Real Data Added', 
        userId, 
        farmId: farmResult.data.farm_id,
        userData,
        farmData
      });
      
    } catch (error) {
      setResult(`❌ Unexpected error: ${error}`);
      setDebugInfo({ step: 'Unexpected Error', error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Ultra Simple Farm Data Entry</h2>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Step 1: Test Everything</h3>
          <p className="text-sm text-blue-700 mb-4">
            This will test your database connection, check if all tables exist, and verify that data insertion works.
          </p>
          <button
            onClick={testEverything}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Everything'}
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Step 2: Add Real Data</h3>
          <p className="text-sm text-green-700 mb-4">
            Once the test passes, click this to add your actual farm data to the database.
          </p>
          <button
            onClick={addRealData}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Adding Data...' : 'Add Real Farm Data'}
          </button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-mono text-sm whitespace-pre-line">{result}</p>
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
          <h3 className="font-semibold text-yellow-800 mb-2">What This Does</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>Test Everything:</strong> Checks connection, tables, and data insertion</p>
            <p><strong>Add Real Data:</strong> Adds your farm data to the database</p>
            <p><strong>Debug Info:</strong> Shows detailed information about any errors</p>
            <p><strong>Console Logs:</strong> Check browser console (F12) for detailed logs</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">Next Steps</h3>
          <p className="text-sm text-purple-700 mb-2">
            After successfully adding your farm data:
          </p>
          <ol className="text-sm text-purple-700 list-decimal list-inside space-y-1">
            <li>Go to the AI Assistant</li>
            <li>Ask: "What crops are suitable for my soil?"</li>
            <li>Get personalized recommendations based on YOUR data!</li>
          </ol>
          <a
            href="/agritech-chatbot"
            className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to AI Assistant →
          </a>
        </div>
      </div>
    </div>
  );
}
