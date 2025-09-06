import React, { useState } from 'react';
import { 
  Droplets, 
  Thermometer, 
  Leaf, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Lightbulb,
  Database,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { agriculturalInsightsService } from '../../services/ai/agricultural-insights.service';

interface AgriculturalInsightsProps {
  data?: {
    location: [number, number];
    buffer: number;
    date: string;
    soilMoisture: {
      volumetricSoilWater: number;
      surfaceMoisture: number;
    };
    temperature: {
      skinTemperature: number;
    };
    soilProperties: {
      bulkDensity: Record<string, number>;
      cationExchangeCapacity: Record<string, number>;
      clayContent: Record<string, number>;
    };
  };
}

export default function AgriculturalInsights({ data }: AgriculturalInsightsProps) {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMissingData, setShowMissingData] = useState(false);

  // Sample data based on your input
  const sampleData = {
    location: [75.983, 31.583] as [number, number],
    buffer: 2000,
    date: '2025-08-30',
    soilMoisture: {
      volumetricSoilWater: 0.25, // Estimated from your data
      surfaceMoisture: 0.22
    },
    temperature: {
      skinTemperature: 32.5 // Estimated from your data
    },
    soilProperties: {
      bulkDensity: {
        '0to5cm': 143.16,
        '5to15cm': 143.53,
        '15to30cm': 147.60,
        '30to60cm': 147.16,
        '60to100cm': 148.07,
        '100to200cm': 147.69
      },
      cationExchangeCapacity: {
        '0to5cm': 159.85,
        '5to15cm': 153.28,
        '15to30cm': 159.59,
        '30to60cm': 160.73,
        '60to100cm': 159.46,
        '100to200cm': 155.30
      },
      clayContent: {
        '0to5cm': 196.89,
        '15to30cm': 257.04,
        '100to200cm': 285.32
      }
    }
  };

  const analyzeData = async () => {
    setIsLoading(true);
    try {
      const result = await agriculturalInsightsService.analyzeCurrentData(
        data || sampleData
      );
      setInsights(result);
    } catch (error) {
      console.error('Error analyzing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Agricultural AI Insights</h1>
        <button
          onClick={analyzeData}
          disabled={isLoading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Database className="w-5 h-5 mr-2" />
              Analyze Data
            </>
          )}
        </button>
      </div>

      {/* Data Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Current Data Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Location:</span> Punjab/Haryana, India
          </div>
          <div>
            <span className="font-medium">Buffer:</span> 2000m radius
          </div>
          <div>
            <span className="font-medium">Date:</span> Aug-Sep 2025
          </div>
          <div>
            <span className="font-medium">Data Points:</span> 15 soil parameters
          </div>
        </div>
      </div>

      {insights && (
        <div className="space-y-6">
          {/* Soil Health */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Leaf className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-xl font-semibold">Soil Health Assessment</h3>
              <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(insights.insights.soilHealth.score)}`}>
                Score: {insights.insights.soilHealth.score}/100
              </div>
            </div>
            
            {insights.insights.soilHealth.issues.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-red-600 mb-2">Issues Identified:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {insights.insights.soilHealth.issues.map((issue: string, index: number) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-medium text-green-600 mb-2">Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {insights.insights.soilHealth.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Crop Suitability */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-xl font-semibold">Crop Suitability Analysis</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-600 mb-2">Suitable Crops:</h4>
                <div className="space-y-1">
                  {insights.insights.cropSuitability.suitableCrops.map((crop: string, index: number) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {crop}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-red-600 mb-2">Unsuitable Crops:</h4>
                <div className="space-y-1">
                  {insights.insights.cropSuitability.unsuitableCrops.map((crop: string, index: number) => (
                    <div key={index} className="flex items-center text-sm">
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      {crop}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Irrigation Advice */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Droplets className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-xl font-semibold">Irrigation Recommendations</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Amount:</span> {insights.insights.irrigationAdvice.recommendedAmount}mm
                </div>
                <div>
                  <span className="font-medium">Frequency:</span> {insights.insights.irrigationAdvice.frequency} times/week
                </div>
                <div>
                  <span className="font-medium">Timing:</span> {insights.insights.irrigationAdvice.timing}
                </div>
                <div>
                  <span className="font-medium">Method:</span> {insights.insights.irrigationAdvice.method}
                </div>
              </div>
            </div>
          </div>

          {/* Fertilization Plan */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="text-xl font-semibold">Fertilization Plan</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{insights.insights.fertilizationPlan.nitrogen}</div>
                <div className="text-sm text-gray-600">Nitrogen (kg/ha)</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{insights.insights.fertilizationPlan.phosphorus}</div>
                <div className="text-sm text-gray-600">Phosphorus (kg/ha)</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{insights.insights.fertilizationPlan.potassium}</div>
                <div className="text-sm text-gray-600">Potassium (kg/ha)</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <strong>Timing:</strong> {insights.insights.fertilizationPlan.timing}
            </div>
          </div>

          {/* Pest Risk */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="text-xl font-semibold">Pest Risk Assessment</h3>
              <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(insights.insights.pestRisk.riskLevel)}`}>
                Risk: {insights.insights.pestRisk.riskLevel.toUpperCase()}
              </div>
            </div>
            
            {insights.insights.pestRisk.potentialPests.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-orange-600 mb-2">Potential Pests:</h4>
                <div className="flex flex-wrap gap-2">
                  {insights.insights.pestRisk.potentialPests.map((pest: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                      {pest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-green-600 mb-2">Prevention Measures:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {insights.insights.pestRisk.preventionMeasures.map((measure: string, index: number) => (
                  <li key={index}>{measure}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Priority Actions */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-xl font-semibold">Priority Actions</h3>
            </div>
            
            <div className="space-y-2">
              {insights.priorityActions.map((action: string, index: number) => (
                <div key={index} className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-800">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Data */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Database className="w-6 h-6 text-gray-600 mr-2" />
                <h3 className="text-xl font-semibold">Missing Critical Data</h3>
              </div>
              <button
                onClick={() => setShowMissingData(!showMissingData)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {showMissingData ? 'Hide' : 'Show'} Details
              </button>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              To provide more accurate recommendations, collect the following data:
            </div>
            
            {showMissingData && (
              <div className="space-y-2">
                {insights.missingData.map((item: string, index: number) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">How to Use This Analysis</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• <strong>Soil Health Score:</strong> Overall assessment of your soil condition (0-100)</p>
          <p>• <strong>Crop Suitability:</strong> Based on your soil properties and climate</p>
          <p>• <strong>Irrigation:</strong> Optimized watering schedule based on soil moisture</p>
          <p>• <strong>Fertilization:</strong> Basic NPK recommendations (needs soil test for accuracy)</p>
          <p>• <strong>Pest Risk:</strong> Assessment based on current soil and weather conditions</p>
          <p>• <strong>Priority Actions:</strong> Immediate steps you should take</p>
        </div>
      </div>
    </div>
  );
}
