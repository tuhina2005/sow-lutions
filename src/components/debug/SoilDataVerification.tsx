import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function SoilDataVerification() {
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const verifySoilDataTable = async () => {
    setIsLoading(true);
    setVerificationResult(null);

    try {
      console.log('🔍 Verifying soil_data table...');
      
      // Check if table exists and get data
      const { data, error } = await supabase
        .from('soil_data')
        .select('*')
        .limit(5);

      if (error) {
        console.error('❌ Error accessing soil_data table:', error);
        setVerificationResult({
          success: false,
          error: error.message,
          details: error
        });
        return;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ soil_data table exists but is empty');
        setVerificationResult({
          success: true,
          tableExists: true,
          hasData: false,
          recordCount: 0,
          message: 'Table exists but no data found'
        });
        return;
      }

      console.log('✅ soil_data table verified with data:', data);
      
      // Analyze the data
      const analysis = {
        success: true,
        tableExists: true,
        hasData: true,
        recordCount: data.length,
        locations: [...new Set(data.map(r => r.location).filter(Boolean))],
        soilTypes: [...new Set(data.map(r => r.soil_type).filter(Boolean))],
        states: [...new Set(data.map(r => r.state).filter(Boolean))],
        districts: [...new Set(data.map(r => r.district).filter(Boolean))],
        phRange: {
          min: Math.min(...data.map(r => r.ph_level || 0)),
          max: Math.max(...data.map(r => r.ph_level || 0))
        },
        sampleRecord: data[0]
      };

      setVerificationResult(analysis);
      console.log('📊 Soil data analysis:', analysis);

    } catch (error) {
      console.error('❌ Exception during verification:', error);
      setVerificationResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        exception: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleData = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔧 Creating sample soil data...');
      
      const sampleData = [
        {
          location: 'Punjab, India',
          state: 'Punjab',
          district: 'Ludhiana',
          soil_type: 'Sandy Loam',
          ph_level: 4.6,
          organic_carbon: 1.7,
          nitrogen_content: 120.5,
          phosphorus_content: 45.2,
          potassium_content: 180.3,
          soil_depth: 45.0,
          texture: 'Sandy Loam',
          drainage_type: 'Moderate',
          water_holding_capacity: 25.5,
          bulk_density: 1.35,
          cation_exchange_capacity: 15.2,
          electrical_conductivity: 0.8,
          temperature: 28.0,
          rainfall_annual: 650.0,
          humidity: 65.0,
          elevation: 250.0,
          latitude: 30.9,
          longitude: 75.8,
          suitable_crops: ['Cotton', 'Potato', 'Wheat', 'Maize'],
          recommended_fertilizers: ['NPK 20:20:20', 'Urea', 'DAP', 'Potash'],
          irrigation_requirements: 'Drip irrigation recommended',
          soil_health_score: 6.5,
          improvement_recommendations: ['Add lime to increase pH', 'Increase organic matter', 'Improve drainage']
        }
      ];

      const { data, error } = await supabase
        .from('soil_data')
        .insert(sampleData)
        .select();

      if (error) {
        console.error('❌ Error creating sample data:', error);
        setVerificationResult({
          success: false,
          error: error.message,
          details: error
        });
        return;
      }

      console.log('✅ Sample data created successfully:', data);
      setVerificationResult({
        success: true,
        message: 'Sample data created successfully',
        createdRecords: data.length
      });

    } catch (error) {
      console.error('❌ Exception creating sample data:', error);
      setVerificationResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        exception: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">🔍 Soil Data Table Verification</h2>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-4">Verify Database Table</h3>
          <p className="text-sm text-blue-700 mb-4">
            Check if the soil_data table exists and has data for the AI chatbot.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={verifySoilDataTable}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Soil Data Table'}
            </button>
            
            <button
              onClick={createSampleData}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 ml-4"
            >
              {isLoading ? 'Creating...' : 'Create Sample Data'}
            </button>
          </div>
        </div>

        {verificationResult && (
          <div className={`border rounded-lg p-4 ${
            verificationResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h3 className={`font-semibold mb-4 ${
              verificationResult.success 
                ? 'text-green-800' 
                : 'text-red-800'
            }`}>
              Verification Result
            </h3>
            
            {verificationResult.success ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><strong>Table Exists:</strong> {verificationResult.tableExists ? '✅ Yes' : '❌ No'}</div>
                  <div><strong>Has Data:</strong> {verificationResult.hasData ? '✅ Yes' : '❌ No'}</div>
                  <div><strong>Records:</strong> {verificationResult.recordCount || 0}</div>
                  <div><strong>Locations:</strong> {verificationResult.locations?.length || 0}</div>
                </div>
                
                {verificationResult.locations && verificationResult.locations.length > 0 && (
                  <div>
                    <strong>Locations:</strong> {verificationResult.locations.join(', ')}
                  </div>
                )}
                
                {verificationResult.soilTypes && verificationResult.soilTypes.length > 0 && (
                  <div>
                    <strong>Soil Types:</strong> {verificationResult.soilTypes.join(', ')}
                  </div>
                )}
                
                {verificationResult.phRange && (
                  <div>
                    <strong>pH Range:</strong> {verificationResult.phRange.min} - {verificationResult.phRange.max}
                  </div>
                )}
                
                {verificationResult.sampleRecord && (
                  <div>
                    <strong>Sample Record:</strong>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(verificationResult.sampleRecord, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-700">
                <p><strong>Error:</strong> {verificationResult.error}</p>
                {verificationResult.details && (
                  <pre className="text-xs bg-red-100 p-2 rounded mt-2 overflow-auto">
                    {JSON.stringify(verificationResult.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Steps</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>1. If table doesn't exist:</strong> Run the SOIL_DATA_TABLE_MIGRATION.sql in Supabase</p>
            <p><strong>2. If table is empty:</strong> Click "Create Sample Data" to add test records</p>
            <p><strong>3. If there are errors:</strong> Check Supabase connection and permissions</p>
            <p><strong>4. If data is null:</strong> Verify column names match the migration script</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">Next Steps</h3>
          <div className="text-sm text-purple-700 space-y-2">
            <p><strong>1. Verify table exists and has data</strong></p>
            <p><strong>2. Test the Soil Data Chatbot</strong></p>
            <p><strong>3. Check that AI responses mention specific soil data</strong></p>
            <p><strong>4. Verify locations and soil types are not null</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
