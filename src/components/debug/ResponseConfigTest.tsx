import React, { useState } from 'react';
import { agritechChatbotRobustService } from '../../services/ai/agritech-chatbot-robust.service';
import { responseCustomizerService, ResponseConfig } from '../../services/ai/response-customizer.service';

export default function ResponseConfigTest() {
  const [query, setQuery] = useState('What crops are suitable for my soil?');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ResponseConfig>({
    maxWords: 200,
    useMarkdown: true,
    includeEmojis: true,
    responseStyle: 'conversational',
    language: 'en'
  });
  const [stats, setStats] = useState<any>(null);

  const testResponseConfig = async () => {
    setIsLoading(true);
    setResponse('');
    setStats(null);

    try {
      console.log('🔍 Testing response configuration:', config);
      
      // Get AI response
      const result = await agritechChatbotRobustService.generateResponse(
        query,
        config.language,
        undefined, // Let service find any available user
        'test-session-' + Date.now()
      );

      if (result.success) {
        // Apply custom configuration
        const customized = responseCustomizerService.customizeResponse(
          result.text || '', 
          config
        );
        
        setResponse(customized.text);
        setStats({
          wordCount: customized.wordCount,
          originalLength: customized.originalLength,
          formatted: customized.formatted,
          config: config
        });
        
        console.log('✅ Response customized successfully:', customized);
      } else {
        setResponse(`❌ Error: ${result.error}`);
      }

    } catch (error) {
      setResponse(`❌ Exception: ${error}`);
      console.error('❌ Response config test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testQueries = [
    'What crops are suitable for my soil?',
    'Tell me about irrigation methods',
    'How to improve soil fertility?',
    'What fertilizers should I use?',
    'When should I plant crops?',
    'What are the best farming practices?'
  ];

  const responseStyles = [
    { value: 'concise', label: 'Concise (short and direct)' },
    { value: 'detailed', label: 'Detailed (comprehensive)' },
    { value: 'conversational', label: 'Conversational (friendly)' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">⚙️ Response Configuration Test</h2>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-4">Response Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Words: {config.maxWords}
              </label>
              <input
                type="range"
                min="50"
                max="500"
                value={config.maxWords}
                onChange={(e) => setConfig({...config, maxWords: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>50</span>
                <span>500</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Response Style</label>
              <select
                value={config.responseStyle}
                onChange={(e) => setConfig({...config, responseStyle: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {responseStyles.map(style => (
                  <option key={style.value} value={style.value}>{style.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={config.language}
                onChange={(e) => setConfig({...config, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.useMarkdown}
                  onChange={(e) => setConfig({...config, useMarkdown: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Use Markdown</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.includeEmojis}
                  onChange={(e) => setConfig({...config, includeEmojis: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Include Emojis</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-4">Test Query</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Query</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ask the AI agent a question..."
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
            
            <button
              onClick={testResponseConfig}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Response Configuration'}
            </button>
          </div>
        </div>

        {response && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Customized Response</h3>
            <div className="bg-gray-50 p-4 rounded border">
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

        {stats && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Response Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Words:</span> {stats.wordCount}
              </div>
              <div>
                <span className="font-medium">Characters:</span> {stats.originalLength} → {response.length}
              </div>
              <div>
                <span className="font-medium">Markdown:</span> {stats.formatted ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Style:</span> {stats.config.responseStyle}
              </div>
            </div>
          </div>
        )}

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">How to Customize Responses</h3>
          <div className="text-sm text-purple-700 space-y-2">
            <p><strong>1. Word Limit:</strong> Adjust max words (50-500) to control response length</p>
            <p><strong>2. Markdown:</strong> Enable for formatted text with headers, lists, and emphasis</p>
            <p><strong>3. Emojis:</strong> Add visual elements to make responses more engaging</p>
            <p><strong>4. Style:</strong> Choose between concise, detailed, or conversational tone</p>
            <p><strong>5. Language:</strong> Test responses in different languages</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Code Customization</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>To change default settings:</strong> Edit the <code>customizeResponse</code> method in <code>agritech-chatbot-robust.service.ts</code></p>
            <p><strong>To add new formatting:</strong> Extend the <code>ResponseCustomizerService</code> class</p>
            <p><strong>To change prompt guidelines:</strong> Modify the <code>createResponsePrompt</code> method</p>
          </div>
        </div>
      </div>
    </div>
  );
}
