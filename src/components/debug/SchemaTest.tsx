import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function SchemaTest() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, success: boolean, message: string, data?: any, error?: any) => {
    setResults(prev => [...prev, { test, success, message, data, error, timestamp: new Date().toISOString() }]);
  };

  const testTableNames = async () => {
    setIsLoading(true);
    setResults([]);

    // Test different table name variations
    const tableVariations = [
      'Users',
      'users', 
      'public.Users',
      'public.users',
      'User_Farms',
      'user_farms',
      'public.User_Farms',
      'public.user_farms'
    ];

    for (const tableName of tableVariations) {
      try {
        console.log(`🔍 Testing table: ${tableName}`);
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          addResult(
            `Table: ${tableName}`,
            false,
            `Error: ${error.message}`,
            null,
            error
          );
        } else {
          addResult(
            `Table: ${tableName}`,
            true,
            `Success! Found ${data?.length || 0} records`,
            data
          );
        }
      } catch (error) {
        addResult(
          `Table: ${tableName}`,
          false,
          `Exception: ${error}`,
          null,
          error
        );
      }
    }

    // Test raw SQL query
    try {
      console.log('🔍 Testing raw SQL query...');
      const { data, error } = await supabase
        .rpc('get_table_names'); // This won't work, but let's see the error

      addResult(
        'Raw SQL Test',
        false,
        'Raw SQL not available (expected)',
        null,
        error
      );
    } catch (error) {
      addResult(
        'Raw SQL Test',
        false,
        'Raw SQL not available (expected)',
        null,
        error
      );
    }

    setIsLoading(false);
  };

  const testInsert = async () => {
    setIsLoading(true);

    try {
      // Test insert with different table names
      const testData = {
        name: 'Schema Test User',
        location: 'Test Location',
        preferred_language: 'en',
        farm_size: 1.0
      };

      console.log('🔍 Testing insert into Users...');
      const { data, error } = await supabase
        .from('Users')
        .insert(testData)
        .select('user_id')
        .single();

      if (error) {
        addResult(
          'Insert Test: Users',
          false,
          `Insert failed: ${error.message}`,
          null,
          error
        );
      } else {
        addResult(
          'Insert Test: Users',
          true,
          `Insert successful! User ID: ${data.user_id}`,
          data
        );

        // Clean up
        await supabase.from('Users').delete().eq('user_id', data.user_id);
        addResult(
          'Cleanup',
          true,
          'Test data cleaned up',
          null
        );
      }
    } catch (error) {
      addResult(
        'Insert Test: Users',
        false,
        `Insert exception: ${error}`,
        null,
        error
      );
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Schema & Table Name Test</h1>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={testTableNames}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Table Names'}
          </button>
          <button
            onClick={testInsert}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Insert'}
          </button>
          <button
            onClick={clearResults}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Clear Results
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Test Results</h2>
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  result.success 
                    ? 'text-green-800 bg-green-50 border-green-200' 
                    : 'text-red-800 bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{result.success ? '✅' : '❌'}</span>
                  <h3 className="font-semibold">{result.test}</h3>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">What This Test Does</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Table Name Test:</strong> Tests different variations of table names to find the correct one</p>
            <p><strong>Insert Test:</strong> Tests if we can actually insert data into the Users table</p>
            <p><strong>Expected Results:</strong> Should show which table name format works with your Supabase setup</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Common Table Name Issues</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>Case Sensitivity:</strong> PostgreSQL is case-sensitive, so 'Users' ≠ 'users'</p>
            <p><strong>Schema Prefix:</strong> Some setups need 'public.Users', others just 'Users'</p>
            <p><strong>Underscores:</strong> 'User_Farms' vs 'user_farms' - check your actual table names</p>
            <p><strong>Migration Issues:</strong> Tables might not exist if migration wasn't applied</p>
          </div>
        </div>
      </div>
    </div>
  );
}
