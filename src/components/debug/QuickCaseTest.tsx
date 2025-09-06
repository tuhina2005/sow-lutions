import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function QuickCaseTest() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testCaseSensitivity = async () => {
    setIsLoading(true);
    setResult('');

    try {
      // Test lowercase table names
      console.log('🔍 Testing lowercase table names...');
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (usersError) {
        setResult(`❌ 'users' table error: ${usersError.message}`);
        return;
      }

      setResult(`✅ 'users' table works! Found ${usersData?.length || 0} records`);

      // Test user_farms
      const { data: farmsData, error: farmsError } = await supabase
        .from('user_farms')
        .select('*')
        .limit(1);

      if (farmsError) {
        setResult(prev => prev + `\n❌ 'user_farms' table error: ${farmsError.message}`);
        return;
      }

      setResult(prev => prev + `\n✅ 'user_farms' table works! Found ${farmsData?.length || 0} records`);

      // Test crops
      const { data: cropsData, error: cropsError } = await supabase
        .from('crops')
        .select('*')
        .limit(1);

      if (cropsError) {
        setResult(prev => prev + `\n❌ 'crops' table error: ${cropsError.message}`);
        return;
      }

      setResult(prev => prev + `\n✅ 'crops' table works! Found ${cropsData?.length || 0} records`);

      // Test soil_properties
      const { data: soilData, error: soilError } = await supabase
        .from('soil_properties')
        .select('*')
        .limit(1);

      if (soilError) {
        setResult(prev => prev + `\n❌ 'soil_properties' table error: ${soilError.message}`);
        return;
      }

      setResult(prev => prev + `\n✅ 'soil_properties' table works! Found ${soilData?.length || 0} records`);

      setResult(prev => prev + `\n\n🎉 ALL TABLES WORK! Case sensitivity issue is FIXED!`);

    } catch (error) {
      setResult(`❌ Test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testInsert = async () => {
    setIsLoading(true);
    setResult('');

    try {
      // Test insert with lowercase table names
      const userData = {
        name: 'Case Test User',
        location: 'Test Location',
        preferred_language: 'en',
        farm_size: 1.0
      };

      console.log('🔍 Testing insert into users table...');
      const { data: userResult, error: userError } = await supabase
        .from('users')
        .insert(userData)
        .select('user_id')
        .single();

      if (userError) {
        setResult(`❌ Insert into 'users' failed: ${userError.message}`);
        return;
      }

      const userId = userResult.user_id;
      setResult(`✅ Insert into 'users' successful! User ID: ${userId}`);

      // Test farm insert
      const farmData = {
        user_id: userId,
        farm_name: 'Case Test Farm',
        soil_type: 'Loamy Soil',
        ph: 6.5,
        organic_carbon: 1.2,
        irrigation_available: true,
        farm_area: 5.0,
        latitude: 31.583,
        longitude: 75.983
      };

      const { data: farmResult, error: farmError } = await supabase
        .from('user_farms')
        .insert(farmData)
        .select('farm_id')
        .single();

      if (farmError) {
        setResult(prev => prev + `\n❌ Insert into 'user_farms' failed: ${farmError.message}`);
        return;
      }

      setResult(prev => prev + `\n✅ Insert into 'user_farms' successful! Farm ID: ${farmResult.farm_id}`);

      // Clean up
      await supabase.from('user_farms').delete().eq('farm_id', farmResult.farm_id);
      await supabase.from('users').delete().eq('user_id', userId);

      setResult(prev => prev + `\n✅ Test data cleaned up!`);
      setResult(prev => prev + `\n\n🎉 INSERT TEST PASSED! Everything works now!`);

    } catch (error) {
      setResult(`❌ Insert test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Quick Case Sensitivity Test</h2>
      
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Test Table Access</h3>
          <p className="text-sm text-green-700 mb-4">
            Test if all tables are accessible with lowercase names.
          </p>
          <button
            onClick={testCaseSensitivity}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Table Access'}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Test Data Insertion</h3>
          <p className="text-sm text-blue-700 mb-4">
            Test if we can actually insert data into the tables.
          </p>
          <button
            onClick={testInsert}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Data Insertion'}
          </button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg whitespace-pre-line ${
            result.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-mono text-sm">{result}</p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">What Was Fixed</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>Before:</strong> Code used 'Users', 'User_Farms', 'Crops', etc. (uppercase)</p>
            <p><strong>After:</strong> Code now uses 'users', 'user_farms', 'crops', etc. (lowercase)</p>
            <p><strong>Issue:</strong> PostgreSQL is case-sensitive, so 'Users' ≠ 'users'</p>
            <p><strong>Solution:</strong> Updated all table references to use lowercase names</p>
          </div>
        </div>
      </div>
    </div>
  );
}
