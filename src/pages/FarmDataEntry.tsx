import React, { useState } from 'react';
import PageTransition from '../components/shared/PageTransition';

// Punjab state data with districts, tehsils, and villages
const state = 'Punjab';

const districts = {
  'Ludhiana': {
    tehsils: {
      'Ludhiana East': ['Sahnewal', 'Dhandari Kalan', 'Dhandari Khurd', 'Jodhan', 'Kot Mangal Singh'],
      'Ludhiana West': ['Machhiwara', 'Samrala', 'Payal', 'Raikot', 'Jagraon'],
      'Khanna': ['Khanna', 'Doraha', 'Sahnewal', 'Machhiwara', 'Payal'],
      'Jagraon': ['Jagraon', 'Raikot', 'Mullanpur Dakha', 'Sidhwan Bet', 'Sudhar']
    }
  },
  'Amritsar': {
    tehsils: {
      'Amritsar': ['Amritsar', 'Attari', 'Raja Sansi', 'Verka', 'Chheharta'],
      'Ajnala': ['Ajnala', 'Majitha', 'Ramdas', 'Tarn Taran', 'Patti'],
      'Baba Bakala': ['Baba Bakala', 'Beas', 'Mehta', 'Verowal', 'Chogawan']
    }
  },
  'Jalandhar': {
    tehsils: {
      'Jalandhar': ['Jalandhar', 'Nakodar', 'Shahkot', 'Nurmahal', 'Phillaur'],
      'Nakodar': ['Nakodar', 'Mehatpur', 'Rurka Kalan', 'Bhogpur', 'Adampur'],
      'Phillaur': ['Phillaur', 'Goraya', 'Bilga', 'Nurmahal', 'Shahkot']
    }
  },
  'Patiala': {
    tehsils: {
      'Patiala': ['Patiala', 'Samana', 'Nabha', 'Rajpura', 'Patran'],
      'Nabha': ['Nabha', 'Samana', 'Ghanaur', 'Dudhansadhan', 'Bhadson'],
      'Rajpura': ['Rajpura', 'Patran', 'Ghanaur', 'Dudhansadhan', 'Bhadson']
    }
  },
  'Bathinda': {
    tehsils: {
      'Bathinda': ['Bathinda', 'Rampura Phul', 'Talwandi Sabo', 'Maur', 'Sangat'],
      'Maur': ['Maur', 'Rampura Phul', 'Talwandi Sabo', 'Sangat', 'Bhucho Mandi'],
      'Talwandi Sabo': ['Talwandi Sabo', 'Maur', 'Rampura Phul', 'Sangat', 'Bhucho Mandi']
    }
  },
  'Mohali': {
    tehsils: {
      'Mohali': ['Mohali', 'Kharar', 'Derabassi', 'Dera Bassi', 'Zirakpur'],
      'Kharar': ['Kharar', 'Derabassi', 'Dera Bassi', 'Zirakpur', 'Banur'],
      'Derabassi': ['Derabassi', 'Dera Bassi', 'Zirakpur', 'Banur', 'Kharar']
    }
  }
};

export default function FarmDataEntry() {
  const [formData, setFormData] = useState({
    state: state, // Set Punjab as default
    district: '',
    tehsil: '',
    nitrogen: '',
    phosphorus: '',
    potassium: ''
  });

  const [availableDistricts] = useState<string[]>(Object.keys(districts));
  const [availableTehsils, setAvailableTehsils] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [soilDataResult, setSoilDataResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDistrictChange = (district: string) => {
    setFormData(prev => ({ ...prev, district, tehsil: '' }));
    setAvailableTehsils(Object.keys(districts[district as keyof typeof districts]?.tehsils || {}));
  };

  const handleTehsilChange = (tehsil: string) => {
    setFormData(prev => ({ ...prev, tehsil }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCoordinates = async (tehsil: string, district: string, state: string) => {
    try {
      // Use OpenStreetMap Nominatim API for geocoding
      const query = `${tehsil}, ${district}, ${state}, India`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=in`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      } else {
        // Fallback to district coordinates if tehsil not found
        const districtQuery = `${district}, ${state}, India`;
        const districtUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(districtQuery)}&limit=1&countrycodes=in`;
        
        const districtResponse = await fetch(districtUrl);
        const districtData = await districtResponse.json();
        
        if (districtData && districtData.length > 0) {
          return {
            lat: parseFloat(districtData[0].lat),
            lon: parseFloat(districtData[0].lon)
          };
        }
      }
      
      // Final fallback to Punjab center coordinates
      return { lat: 30.7333, lon: 76.7794 };
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      // Fallback coordinates for Punjab
      return { lat: 30.7333, lon: 76.7794 };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsProcessing(true);
    setError(null);
    setSoilDataResult(null);
    
    try {
      // Get real coordinates for the selected tehsil
      const coordinates = await getCoordinates(formData.tehsil, formData.district, formData.state);

      // Prepare data for backend API
      const requestData = {
        coordinates: {
          lat: coordinates.lat,
          lon: coordinates.lon
        },
        npk: {
          nitrogen: parseFloat(formData.nitrogen),
          phosphorus: parseFloat(formData.phosphorus),
          potassium: parseFloat(formData.potassium)
        },
        location: {
          state: formData.state,
          district: formData.district,
          tehsil: formData.tehsil
        }
      };

      console.log('Sending data to backend:', requestData);

      // Call backend API
      const response = await fetch('http://localhost:3000/api/soil-data/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.success) {
        setSoilDataResult(result.data);
        console.log('Soil data processed successfully:', result.data);
        alert(`Soil data processed successfully! Processing took ${result.processingTime}ms. Check the results below.`);
      } else {
        setError(result.error || 'Failed to process soil data');
        console.error('Backend error:', result.error);
        alert(`Error: ${result.error}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error submitting form:', error);
      alert(`Error submitting form: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageTransition>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Farm Data Entry</h1>
          <p className="text-gray-600">
            Enter your farm location and NPK values to get agricultural recommendations.
          </p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* State Display (Fixed to Punjab) */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                id="state"
                value={formData.state}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>

            {/* District Selection */}
            <div className="relative">
              <label htmlFor="district" className="block text-sm font-semibold text-gray-800 mb-3">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  District *
                </span>
              </label>
              <div className="relative">
                <select
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-10 text-gray-700 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer"
                >
                  <option value="" className="text-gray-500">Choose your district</option>
                  {availableDistricts.map(district => (
                    <option key={district} value={district} className="text-gray-700">{district}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tehsil Selection */}
            <div className="relative">
              <label htmlFor="tehsil" className="block text-sm font-semibold text-gray-800 mb-3">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Tehsil *
                </span>
              </label>
              <div className="relative">
                <select
                  id="tehsil"
                  value={formData.tehsil}
                  onChange={(e) => handleTehsilChange(e.target.value)}
                  required
                  disabled={!formData.district}
                  className={`w-full px-4 py-3 pr-10 text-gray-700 bg-white border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 appearance-none cursor-pointer ${
                    !formData.district 
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <option value="" className="text-gray-500">
                    {!formData.district ? 'Select district first' : 'Choose your tehsil'}
                  </option>
                  {availableTehsils.map(tehsil => (
                    <option key={tehsil} value={tehsil} className="text-gray-700">{tehsil}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className={`w-5 h-5 ${!formData.district ? 'text-gray-300' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>


            {/* NPK Values */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Soil Nutrient Levels (kg/hectare)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <label htmlFor="nitrogen" className="block text-sm font-semibold text-gray-800 mb-3">
                    <span className="flex items-center">
                      <div className="w-3 h-3 mr-2 bg-blue-500 rounded-full"></div>
                      Nitrogen (N) *
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="nitrogen"
                      value={formData.nitrogen}
                      onChange={(e) => handleInputChange('nitrogen', e.target.value)}
                      required
                      min="0"
                      step="0.1"
                      placeholder="e.g., 120"
                      className="w-full px-4 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-gray-400 font-medium">kg/ha</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="phosphorus" className="block text-sm font-semibold text-gray-800 mb-3">
                    <span className="flex items-center">
                      <div className="w-3 h-3 mr-2 bg-red-500 rounded-full"></div>
                      Phosphorus (P) *
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="phosphorus"
                      value={formData.phosphorus}
                      onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                      required
                      min="0"
                      step="0.1"
                      placeholder="e.g., 80"
                      className="w-full px-4 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 hover:border-gray-300"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-gray-400 font-medium">kg/ha</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="potassium" className="block text-sm font-semibold text-gray-800 mb-3">
                    <span className="flex items-center">
                      <div className="w-3 h-3 mr-2 bg-purple-500 rounded-full"></div>
                      Potassium (K) *
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="potassium"
                      value={formData.potassium}
                      onChange={(e) => handleInputChange('potassium', e.target.value)}
                      required
                      min="0"
                      step="0.1"
                      placeholder="e.g., 150"
                      className="w-full px-4 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-300"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-gray-400 font-medium">kg/ha</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full px-8 py-4 font-semibold rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center ${
                  isProcessing 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Soil Data...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit Farm Data
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• State is fixed to Punjab</p>
              <p>• Select district and tehsil from the dropdown menus</p>
              <p>• Enter NPK values in kg/hectare (typical range: N: 50-200, P: 20-100, K: 50-300)</p>
              <p>• Click submit to process soil data using Earth Engine</p>
              <p>• Results will be displayed below after processing</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {soilDataResult && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Soil Data Analysis Results
            </h3>
            
            <div className="space-y-4">
              {/* Location Info */}
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-gray-800 mb-2">Location Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Coordinates:</span> {soilDataResult.request.coordinates.lat.toFixed(4)}, {soilDataResult.request.coordinates.lon.toFixed(4)}</div>
                  <div><span className="font-medium">Location:</span> {soilDataResult.request.location.tehsil}, {soilDataResult.request.location.district}</div>
                  <div><span className="font-medium">NPK Values:</span> N: {soilDataResult.request.npk.nitrogen}, P: {soilDataResult.request.npk.phosphorus}, K: {soilDataResult.request.npk.potassium}</div>
                  <div><span className="font-medium">Processing Time:</span> {soilDataResult.metadata.processingTime}ms</div>
                </div>
              </div>

              {/* Static Soil Properties */}
              {soilDataResult.soilData.static && (
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-800 mb-2">Static Soil Properties</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries(soilDataResult.soilData.static).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {value !== null ? value.toFixed(2) : 'N/A'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Soil Data */}
              {soilDataResult.soilData.dynamic && (
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-800 mb-2">Dynamic Soil Data</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries(soilDataResult.soilData.dynamic).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {value !== null ? (typeof value === 'number' ? value.toFixed(2) : value) : 'N/A'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Data (Collapsible) */}
              <details className="bg-white rounded-lg p-4 border">
                <summary className="font-semibold text-gray-800 cursor-pointer">View Raw Data</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64">
                  {JSON.stringify(soilDataResult.soilData, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
