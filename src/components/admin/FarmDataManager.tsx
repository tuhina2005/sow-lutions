import React, { useState } from 'react';
import { Plus, Save, MapPin, Droplets, TestTube2, Leaf } from 'lucide-react';
import { agritechChatbotService } from '../../services/ai/agritech-chatbot.service';

interface FarmDataManagerProps {
  userId: number;
  onDataAdded: () => void;
}

export default function FarmDataManager({ userId, onDataAdded }: FarmDataManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    farm_name: '',
    soil_type: '',
    ph: '',
    organic_carbon: '',
    irrigation_available: false,
    irrigation_type: '',
    farm_area: '',
    latitude: '',
    longitude: '',
    elevation: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const soilTypes = [
    'Clay Soil',
    'Sandy Soil', 
    'Loamy Soil',
    'Sandy Loam',
    'Clay Loam'
  ];

  const irrigationTypes = [
    'Drip Irrigation',
    'Sprinkler Irrigation',
    'Flood Irrigation',
    'Manual Irrigation',
    'No Irrigation'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const farmData = {
        farm_name: formData.farm_name,
        soil_type: formData.soil_type,
        ph: formData.ph ? parseFloat(formData.ph) : undefined,
        organic_carbon: formData.organic_carbon ? parseFloat(formData.organic_carbon) : undefined,
        irrigation_available: formData.irrigation_available,
        irrigation_type: formData.irrigation_type,
        farm_area: formData.farm_area ? parseFloat(formData.farm_area) : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        elevation: formData.elevation ? parseFloat(formData.elevation) : undefined
      };

      const farmId = await agritechChatbotService.addFarmToUser(userId, farmData);
      
      if (farmId) {
        alert('Farm data added successfully!');
        setFormData({
          farm_name: '',
          soil_type: '',
          ph: '',
          organic_carbon: '',
          irrigation_available: false,
          irrigation_type: '',
          farm_area: '',
          latitude: '',
          longitude: '',
          elevation: ''
        });
        setShowForm(false);
        onDataAdded();
      } else {
        alert('Failed to add farm data. Please try again.');
      }
    } catch (error) {
      console.error('Error adding farm data:', error);
      alert('Error adding farm data. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Farm Data Management</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Farm Data</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Farm Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm Name
              </label>
              <input
                type="text"
                name="farm_name"
                value={formData.farm_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Main Farm"
              />
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soil Type
              </label>
              <select
                name="soil_type"
                value={formData.soil_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Soil Type</option>
                {soilTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* pH Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soil pH Level
              </label>
              <input
                type="number"
                name="ph"
                value={formData.ph}
                onChange={handleInputChange}
                min="4"
                max="9"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 6.5"
              />
            </div>

            {/* Organic Carbon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organic Carbon (%)
              </label>
              <input
                type="number"
                name="organic_carbon"
                value={formData.organic_carbon}
                onChange={handleInputChange}
                min="0"
                max="10"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 1.2"
              />
            </div>

            {/* Farm Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farm Area (acres)
              </label>
              <input
                type="number"
                name="farm_area"
                value={formData.farm_area}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 5.0"
              />
            </div>

            {/* Irrigation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Irrigation Type
              </label>
              <select
                name="irrigation_type"
                value={formData.irrigation_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Irrigation Type</option>
                {irrigationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                min="-90"
                max="90"
                step="0.000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 31.583"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                min="-180"
                max="180"
                step="0.000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 75.983"
              />
            </div>
          </div>

          {/* Irrigation Available */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="irrigation_available"
              checked={formData.irrigation_available}
              onChange={handleInputChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Irrigation Available
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Farm Data</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Quick Data Entry Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Quick Data Entry Tips:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Soil Type:</strong> Check with local agricultural office or do a simple texture test</li>
          <li>• <strong>pH Level:</strong> Get tested at soil testing lab (₹500-2000 per sample)</li>
          <li>• <strong>Coordinates:</strong> Use Google Maps to get exact latitude/longitude</li>
          <li>• <strong>Organic Carbon:</strong> Usually 0.5-4% in Indian soils</li>
          <li>• <strong>Farm Area:</strong> Measure or estimate your land size</li>
        </ul>
      </div>
    </div>
  );
}
