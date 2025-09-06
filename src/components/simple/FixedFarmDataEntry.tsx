import React, { useState } from 'react';
import { supabase, safeInsert, testConnection } from '../../lib/supabase-debug';

export default function FixedFarmDataEntry() {
  const [formData, setFormData] = useState({
    name: 'Demo User',
    location: 'Punjab, India',
    farm_name: 'Main Farm',
    soil_type: 'Loamy Soil',
    ph: '6.5',
    organic_carbon: '1.2',
    farm_area: '5.0',
    irrigation_available: true,
    irrigation_type: 'Drip Irrigation',
    latitude: '31.583',
    longitude: '75.983'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const testConnectionFirst = async () => {
    setResult('🔍 Testing database connection...');
    const connectionResult = await testConnection();
    
    if (!connectionResult.success) {
      setResult(`❌ Database connection failed: ${connectionResult.error?.message || 'Unknown error'}`);
      setDebugInfo(connectionResult.error);
      return false;
    }
    
    setResult('✅ Database connection successful');
    return true;
  };

  const addDataWithDebug = async () => {
    setIsLoading(true);
    setResult('');
    setDebugInfo(null);

    try {
      // Step 1: Test connection
      const connectionOk = await testConnectionFirst();
      if (!connectionOk) {
        return;
      }

      // Step 2: Create user with debug
      setResult('🔍 Creating user profile...');
      const userData = {
        name: formData.name,
        location: formData.location,
        preferred_language: 'en',
        farm_size: parseFloat(formData.farm_area)
      };

      const userResult = await safeInsert('Users', userData);
      
      if (!userResult.success) {
        setResult(`❌ User creation failed: ${userResult.error?.message || 'Unknown error'}`);
        setDebugInfo({
          step: 'User Creation',
          error: userResult.error,
          data: userData
        });
        return;
      }

      const userId = userResult.data.user_id;
      setResult(`✅ User created with ID: ${userId}`);

      // Step 3: Create farm with debug
      setResult('🔍 Creating farm data...');
      const farmData = {
        user_id: userId,
        farm_name: formData.farm_name,
        soil_type: formData.soil_type,
        ph: parseFloat(formData.ph),
        organic_carbon: parseFloat(formData.organic_carbon),
        irrigation_available: formData.irrigation_available,
        irrigation_type: formData.irrigation_type,
        farm_area: parseFloat(formData.farm_area),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      const farmResult = await safeInsert('User_Farms', farmData);
      
      if (!farmResult.success) {
        setResult(`❌ Farm creation failed: ${farmResult.error?.message || 'Unknown error'}`);
        setDebugInfo({
          step: 'Farm Creation',
          error: farmResult.error,
          data: farmData,
          userId: userId
        });
        return;
      }

      setResult(`✅ Success! User ID: ${userId}, Farm ID: ${farmResult.data.farm_id}`);
      setDebugInfo({
        step: 'Complete Success',
        userId: userId,
        farmId: farmResult.data.farm_id,
        userData: userData,
        farmData: farmData
      });
      
      // Clear form
      setFormData({
        name: 'Demo User',
        location: 'Punjab, India',
        farm_name: 'Main Farm',
        soil_type: 'Loamy Soil',
        ph: '6.5',
        organic_carbon: '1.2',
        farm_area: '5.0',
        irrigation_available: true,
        irrigation_type: 'Drip Irrigation',
        latitude: '31.583',
        longitude: '75.983'
      });

    } catch (error) {
      setResult(`❌ Unexpected error: ${error}`);
      setDebugInfo({
        step: 'Unexpected Error',
        error: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Fixed Farm Data Entry (With Debug)</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
          <input
            type="text"
            name="farm_name"
            value={formData.farm_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
          <select
            name="soil_type"
            value={formData.soil_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Clay Soil">Clay Soil</option>
            <option value="Sandy Soil">Sandy Soil</option>
            <option value="Loamy Soil">Loamy Soil</option>
            <option value="Sandy Loam">Sandy Loam</option>
            <option value="Clay Loam">Clay Loam</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH</label>
            <input
              type="number"
              name="ph"
              value={formData.ph}
              onChange={handleInputChange}
              step="0.1"
              min="4"
              max="9"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organic Carbon (%)</label>
            <input
              type="number"
              name="organic_carbon"
              value={formData.organic_carbon}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Farm Area (acres)</label>
          <input
            type="number"
            name="farm_area"
            value={formData.farm_area}
            onChange={handleInputChange}
            step="0.1"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Type</label>
          <select
            name="irrigation_type"
            value={formData.irrigation_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Drip Irrigation">Drip Irrigation</option>
            <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
            <option value="Flood Irrigation">Flood Irrigation</option>
            <option value="Manual Irrigation">Manual Irrigation</option>
            <option value="No Irrigation">No Irrigation</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="irrigation_available"
            checked={formData.irrigation_available}
            onChange={handleInputChange}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label className="text-sm font-medium text-gray-700">Irrigation Available</label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              step="0.000001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              step="0.000001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <button
          onClick={addDataWithDebug}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Adding Data with Debug...' : 'Add Farm Data (Debug Mode)'}
        </button>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-mono text-sm">{result}</p>
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Next Steps</h3>
          <p className="text-sm text-blue-700">
            After successfully adding your farm data, go to the AI Assistant and ask:
            <br />
            <strong>"What crops are suitable for my soil?"</strong>
            <br />
            The chatbot will now use YOUR specific farm data to give personalized recommendations!
          </p>
          <a
            href="/agritech-chatbot"
            className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to AI Assistant →
          </a>
        </div>
      </div>
    </div>
  );
}
