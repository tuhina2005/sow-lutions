import React, { useState } from 'react';
import { agritechChatbotRobustService } from '../../services/ai/agritech-chatbot-robust.service';

export default function SimpleAITest() {
  const [query, setQuery] = useState('What crops are suitable for my soil?');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testAI = async () => {
    setIsLoading(true);
    setResponse('');
    setDebugInfo(null);

    try {
      console.log('🔍 Testing AI with query:', query);
      
      const result = await agritechChatbotRobustService.generateResponse(
        query,
        'en',
        undefined, // Let the service find any available user
        'test-session-' + Date.now()
      );

      if (result.success) {
        setResponse(result.text);
        setDebugInfo({
          success: true,
          confidence: result.confidence,
          processingTime: result.processingTime,
          contextUsed: result.contextUsed
        });
        console.log('✅ AI response:', result.text);
      } else {
        setResponse(`❌ Error: ${result.error}`);
        setDebugInfo({
          success: false,
          error: result.error
        });
        console.error('❌ AI error:', result.error);
      }

    } catch (error) {
      setResponse(`❌ Exception: ${error}`);
      setDebugInfo({
        success: false,
        error: error
      });
      console.error('❌ Exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testQueries = [
    'What crops are suitable for my soil?',
    'Tell me about my farm soil type',
    'What is the best crop for loamy soil?',
    'How to improve soil fertility?',
    'What fertilizers should I use?',
    'When should I plant crops?'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">🤖 Simple AI Agent Test</h2>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Test AI Agent</h3>
          <p className="text-sm text-blue-700 mb-4">
            This will test if the AI agent can read from your database and provide personalized recommendations.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Query</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ask the AI agent a question..."
              />
            </div>
            
            <button
              onClick={testAI}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Testing AI...' : 'Test AI Agent'}
            </button>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Quick Test Queries</h3>
          <p className="text-sm text-green-700 mb-4">
            Click any of these to test different aspects of the AI agent:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {testQueries.map((testQuery, index) => (
              <button
                key={index}
                onClick={() => setQuery(testQuery)}
                className="text-left p-2 bg-white border border-green-300 rounded hover:bg-green-50 text-sm"
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
              <p className="text-sm whitespace-pre-wrap">{response}</p>
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

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">What to Look For</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>✅ Good Response:</strong> AI mentions your specific soil type, pH, and gives personalized crop recommendations</p>
            <p><strong>✅ Database Integration:</strong> AI should reference data from your farm profile</p>
            <p><strong>✅ Context Usage:</strong> AI should use your farm's soil type, pH, and location</p>
            <p><strong>❌ Generic Response:</strong> If AI gives generic advice without mentioning your specific farm data</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">Next Steps</h3>
          <div className="text-sm text-purple-700 space-y-2">
            <p><strong>1.</strong> If AI responses are generic, check if your farm data is in the database</p>
            <p><strong>2.</strong> If AI responses are personalized, the integration is working!</p>
            <p><strong>3.</strong> Try the full AI Assistant in the main app</p>
            <p><strong>4.</strong> Ask questions about your specific farm conditions</p>
          </div>
          <a
            href="/agritech-chatbot"
            className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Full AI Assistant →
          </a>
        </div>
      </div>
    </div>
  );
}
