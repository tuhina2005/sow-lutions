import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function GeminiTest() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testGeminiAPI = async () => {
    setIsLoading(true);
    setResult('');
    setDebugInfo(null);

    try {
      // Check if API key is available
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        setResult('❌ VITE_GEMINI_API_KEY is not defined in environment variables');
        setDebugInfo({ error: 'Missing API key', apiKey: 'undefined' });
        return;
      }

      setResult('🔍 API key found, testing Gemini connection...');
      setDebugInfo({ apiKey: apiKey.substring(0, 10) + '...' });

      // Test Gemini API
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = 'Hello, this is a test. Please respond with "AI is working correctly".';
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      setResult(`✅ Gemini API is working! Response: ${responseText}`);
      setDebugInfo({
        success: true,
        apiKey: apiKey.substring(0, 10) + '...',
        model: 'gemini-1.5-flash',
        response: responseText
      });

    } catch (error) {
      setResult(`❌ Gemini API test failed: ${error}`);
      setDebugInfo({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        apiKey: import.meta.env.VITE_GEMINI_API_KEY ? 'Present' : 'Missing'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSimpleQuery = async () => {
    setIsLoading(true);
    setResult('');
    setDebugInfo(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        setResult('❌ VITE_GEMINI_API_KEY is not defined');
        return;
      }

      setResult('🔍 Testing simple agricultural query...');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an agricultural expert. Answer this question briefly: "What crops grow well in loamy soil?"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      setResult(`✅ Agricultural query successful! Response: ${responseText}`);
      setDebugInfo({
        success: true,
        query: 'What crops grow well in loamy soil?',
        response: responseText
      });

    } catch (error) {
      setResult(`❌ Agricultural query failed: ${error}`);
      setDebugInfo({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">🔑 Gemini API Test</h2>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Test Gemini API Connection</h3>
          <p className="text-sm text-blue-700 mb-4">
            This will test if your Gemini API key is working correctly.
          </p>
          <button
            onClick={testGeminiAPI}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Gemini API'}
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Test Agricultural Query</h3>
          <p className="text-sm text-green-700 mb-4">
            This will test if Gemini can handle agricultural questions.
          </p>
          <button
            onClick={testSimpleQuery}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Agricultural Query'}
          </button>
        </div>

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

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Environment Variables</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>VITE_GEMINI_API_KEY:</strong> {import.meta.env.VITE_GEMINI_API_KEY ? 'Set' : 'Missing'}</p>
            <p><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}</p>
            <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">Next Steps</h3>
          <div className="text-sm text-purple-700 space-y-2">
            <p><strong>1.</strong> If Gemini API test fails, check your API key in .env file</p>
            <p><strong>2.</strong> If Gemini API works, the issue is in the AI service integration</p>
            <p><strong>3.</strong> Make sure to restart your dev server after updating .env</p>
            <p><strong>4.</strong> Check browser console (F12) for detailed error messages</p>
          </div>
        </div>
      </div>
    </div>
  );
}
