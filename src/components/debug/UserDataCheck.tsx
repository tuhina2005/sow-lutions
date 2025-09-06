import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function UserDataCheck() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, success: boolean, message: string, data?: any, error?: any) => {
    setResults(prev => [...prev, { test, success, message, data, error, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const checkAllUsers = async () => {
    setIsLoading(true);
    clearResults();

    try {
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('user_id', { ascending: true });

      if (usersError) {
        addResult('All Users', false, `Error: ${usersError.message}`, null, usersError);
      } else {
        addResult('All Users', true, `Found ${users?.length || 0} users in database`, users);
      }

      // Get all farms
      const { data: farms, error: farmsError } = await supabase
        .from('user_farms')
        .select('*')
        .order('farm_id', { ascending: true });

      if (farmsError) {
        addResult('All Farms', false, `Error: ${farmsError.message}`, null, farmsError);
      } else {
        addResult('All Farms', true, `Found ${farms?.length || 0} farms in database`, farms);
      }

      // Check if we have any data at all
      if (users && users.length > 0) {
        addResult('Data Status', true, `✅ Database has data - ${users.length} users, ${farms?.length || 0} farms`, {
          userCount: users.length,
          farmCount: farms?.length || 0,
          firstUserId: users[0].user_id,
          lastUserId: users[users.length - 1].user_id
        });
      } else {
        addResult('Data Status', false, `❌ Database is empty - no users found`, null, null);
      }

    } catch (error) {
      addResult('User Data Check', false, `Check failed: ${error}`, null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testSpecificUser = async (userId: number) => {
    setIsLoading(true);

    try {
      addResult('Specific User Test', true, `🔍 Testing user ID: ${userId}`, null);

      // Test user query
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError) {
        addResult(`User ${userId}`, false, `User not found: ${userError.message}`, null, userError);
      } else {
        addResult(`User ${userId}`, true, `Found user: ${user.name}`, user);
      }

      // Test farms for this user
      const { data: farms, error: farmsError } = await supabase
        .from('user_farms')
        .select('*')
        .eq('user_id', userId);

      if (farmsError) {
        addResult(`Farms for User ${userId}`, false, `Error: ${farmsError.message}`, null, farmsError);
      } else {
        addResult(`Farms for User ${userId}`, true, `Found ${farms?.length || 0} farms`, farms);
      }

    } catch (error) {
      addResult('Specific User Test', false, `Test failed: ${error}`, null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testFirstAvailableUser = async () => {
    setIsLoading(true);

    try {
      // Get the first user
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('user_id', { ascending: true })
        .limit(1);

      if (usersError || !users || users.length === 0) {
        addResult('First User Test', false, `No users found: ${usersError?.message || 'No data'}`, null, usersError);
        return;
      }

      const firstUser = users[0];
      addResult('First User Test', true, `Using first available user: ${firstUser.name} (ID: ${firstUser.user_id})`, firstUser);

      // Test with this user
      await testSpecificUser(firstUser.user_id);

    } catch (error) {
      addResult('First User Test', false, `Test failed: ${error}`, null, error);
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
      <h2 className="text-2xl font-bold mb-6">👥 User Data Check</h2>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={checkAllUsers}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Check All Users'}
          </button>
          <button
            onClick={() => testSpecificUser(1)}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test User ID 1'}
          </button>
          <button
            onClick={testFirstAvailableUser}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test First Available User'}
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
            <h3 className="text-xl font-semibold">Check Results</h3>
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
          <h3 className="font-semibold text-yellow-800 mb-2">What This Tool Does</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>Check All Users:</strong> Shows all users and farms in your database</p>
            <p><strong>Test User ID 1:</strong> Tests if user with ID 1 exists (what the AI service tries to use)</p>
            <p><strong>Test First Available User:</strong> Uses the first user that actually exists</p>
            <p><strong>Expected:</strong> Should show your user data and farm information</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Common Issues</h3>
          <div className="text-sm text-red-700 space-y-2">
            <p><strong>No Users Found:</strong> You need to add farm data first using the Farm Data Entry form</p>
            <p><strong>User ID 1 Not Found:</strong> The AI service is trying to use user ID 1, but your user might have a different ID</p>
            <p><strong>No Farm Data:</strong> Even if users exist, you need farm data for personalized recommendations</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Next Steps</h3>
          <div className="text-sm text-green-700 space-y-2">
            <p><strong>1.</strong> If no users found: Go to Farm Data Entry and add your data</p>
            <p><strong>2.</strong> If users exist but wrong ID: Note the correct user ID for testing</p>
            <p><strong>3.</strong> If everything looks good: The AI service should work with the correct user ID</p>
          </div>
        </div>
      </div>
    </div>
  );
}
