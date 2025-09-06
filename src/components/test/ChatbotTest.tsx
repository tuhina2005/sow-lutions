import React, { useState } from 'react';
import { contextService } from '../../services/ai/context.service';

export default function ChatbotTest() {
  const [testQuery, setTestQuery] = useState('');
  const [contextResult, setContextResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testContext = async () => {
    if (!testQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await contextService.getRelevantContext(testQuery);
      setContextResult(result);
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chatbot Context Test</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Query
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Enter a test query (e.g., 'How to grow rice in Tamil Nadu?')"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={testContext}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Context'}
          </button>
        </div>
      </div>

      {contextResult && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Context Analysis</h3>
            <p><strong>Confidence Score:</strong> {(contextResult.confidenceScore * 100).toFixed(1)}%</p>
            <p><strong>Matched Categories:</strong> {contextResult.matchedCategories.length}</p>
          </div>

          {contextResult.knowledge.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Relevant Knowledge ({contextResult.knowledge.length})</h3>
              <div className="space-y-3">
                {contextResult.knowledge.map((item: any, index: number) => (
                  <div key={item.id} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.summary}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Region: {item.region || 'N/A'} | Crop: {item.crop_type || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contextResult.faqs.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Relevant FAQs ({contextResult.faqs.length})</h3>
              <div className="space-y-3">
                {contextResult.faqs.map((item: any, index: number) => (
                  <div key={item.id} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">Q: {item.question}</h4>
                    <p className="text-sm text-gray-600">A: {item.answer}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Region: {item.region || 'N/A'} | Crop: {item.crop_type || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contextResult.practices.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Relevant Practices ({contextResult.practices.length})</h3>
              <div className="space-y-3">
                {contextResult.practices.map((item: any, index: number) => (
                  <div key={item.id} className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium text-gray-900">{item.practice_name}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Region: {item.region || 'N/A'} | Crop: {item.crop_type || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contextResult.knowledge.length === 0 && contextResult.faqs.length === 0 && contextResult.practices.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">No relevant context found for this query. The chatbot will rely on general agricultural knowledge.</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Sample Test Queries</h3>
        <div className="space-y-2">
          <button
            onClick={() => setTestQuery('How to grow rice in Tamil Nadu?')}
            className="block text-left text-sm text-blue-600 hover:text-blue-800"
          >
            • How to grow rice in Tamil Nadu?
          </button>
          <button
            onClick={() => setTestQuery('What is drip irrigation?')}
            className="block text-left text-sm text-blue-600 hover:text-blue-800"
          >
            • What is drip irrigation?
          </button>
          <button
            onClick={() => setTestQuery('How to test soil health?')}
            className="block text-left text-sm text-blue-600 hover:text-blue-800"
          >
            • How to test soil health?
          </button>
          <button
            onClick={() => setTestQuery('What is integrated pest management?')}
            className="block text-left text-sm text-blue-600 hover:text-blue-800"
          >
            • What is integrated pest management?
          </button>
        </div>
      </div>
    </div>
  );
}
