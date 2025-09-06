import React, { useState } from 'react';
import { soilDataChatbotService } from '../../services/ai/soil-data-chatbot.service';

export default function SoilDataChatbotTest() {
  const [query, setQuery] = useState('What crops are suitable for my soil?');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [soilStats, setSoilStats] = useState<any>(null);

  const testSoilDataChatbot = async () => {
    setIsLoading(true);
    setResponse('');
    setDebugInfo(null);

    try {
      console.log('🌱 Testing soil data chatbot with query:', query);
      
      const result = await soilDataChatbotService.generateResponse(
        query,
        'en',
        'test-session-' + Date.now()
      );

      if (result.success) {
        setResponse(result.text || 'No response text');
        setDebugInfo({
          success: true,
          confidence: result.confidence,
          processingTime: result.processingTime,
          contextUsed: result.contextUsed
        });
        console.log('✅ Soil data chatbot test successful:', result.text);
      } else {
        setResponse(`❌ Error: ${result.error}`);
        setDebugInfo({
          success: false,
          error: result.error
        });
        console.error('❌ Soil data chatbot test failed:', result.error);
      }

    } catch (error) {
      setResponse(`❌ Exception: ${error}`);
      setDebugInfo({
        success: false,
        error: error
      });
      console.error('❌ Soil data chatbot test exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSoilStats = async () => {
    try {
      const stats = await soilDataChatbotService.getSoilDataStats();
      setSoilStats(stats);
      console.log('📊 Soil data stats loaded:', stats);
    } catch (error) {
      console.error('❌ Error loading soil stats:', error);
    }
  };

  const testQueries = [
    'What crops are suitable for my soil?',
    'Tell me about soil pH levels in my data',
    'What fertilizers should I use?',
    'How to improve soil health?',
    'What is the soil health score?',
    'Which locations have the best soil?',
    'What irrigation methods are recommended?',
    'How to increase organic carbon?'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">🌱 Soil Data Chatbot Test</h2>
      
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-4">Soil Data Statistics</h3>
          <p className="text-sm text-green-700 mb-4">
            Check what soil data is available in the database.
          </p>
          
          <button
            onClick={loadSoilStats}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Load Soil Data Stats
          </button>

          {soilStats && (
            <div className="mt-4 bg-white p-4 rounded border">
              <h4 className="font-semibold mb-2">Database Statistics:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Total Records:</strong> {soilStats.totalRecords}</div>
                <div><strong>Locations:</strong> {soilStats.locations?.length || 0}</div>
                <div><strong>Soil Types:</strong> {soilStats.soilTypes?.length || 0}</div>
                <div><strong>pH Range:</strong> {soilStats.phRange?.min} - {soilStats.phRange?.max}</div>
                <div><strong>Avg Health Score:</strong> {soilStats.avgSoilHealth?.toFixed(1) || 'N/A'}</div>
                <div><strong>States:</strong> {soilStats.states?.length || 0}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-4">Test Soil Data Chatbot</h3>
          <p className="text-sm text-blue-700 mb-4">
            This chatbot uses ONLY the soil_data table for context. No user farms or other data.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Query</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ask about soil data..."
              />
            </div>
            
            <button
              onClick={testSoilDataChatbot}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Testing Soil Data Chatbot...' : 'Test Soil Data Chatbot'}
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Quick Test Queries</h3>
          <p className="text-sm text-yellow-700 mb-4">
            Click any of these to test different aspects of the soil data chatbot:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {testQueries.map((testQuery, index) => (
              <button
                key={index}
                onClick={() => setQuery(testQuery)}
                className="text-left p-2 bg-white border border-yellow-300 rounded hover:bg-yellow-50 text-sm"
              >
                {testQuery}
              </button>
            ))}
          </div>
        </div>

        {response && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">AI Response</h3>
            <div className="bg-gray-50 p-3 rounded border">
              <div 
                className="text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                                .replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
                                .replace(/^- (.*)/gm, '<li class="ml-4">$1</li>')
                                .replace(/• (.*)/gm, '<li class="ml-4">$1</li>')
                                .replace(/\n/g, '<br>')
                }}
              />
            </div>
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

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">What to Look For</h3>
          <div className="text-sm text-purple-700 space-y-2">
            <p><strong>✅ Good Response:</strong> AI mentions specific soil data (pH, nutrients, crops, locations)</p>
            <p><strong>✅ Soil Data Integration:</strong> AI should reference data from soil_data table</p>
            <p><strong>✅ Scientific Accuracy:</strong> AI should provide science-based recommendations</p>
            <p><strong>❌ Generic Response:</strong> If AI gives generic advice without mentioning specific soil data</p>
            <p><strong>🎯 Context Usage:</strong> Check debug info to see how many soil records were used</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Important Notes</h3>
          <div className="text-sm text-red-700 space-y-2">
            <p><strong>1.</strong> This chatbot uses ONLY soil_data table - no user farms or other data</p>
            <p><strong>2.</strong> Make sure to run the SOIL_DATA_TABLE_MIGRATION.sql first</p>
            <p><strong>3.</strong> The AI will only have access to soil parameters and recommendations</p>
            <p><strong>4.</strong> All responses are based on scientific soil data analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
}
