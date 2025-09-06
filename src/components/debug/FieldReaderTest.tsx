import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function FieldReaderTest() {
  const [tableName, setTableName] = useState('users');
  const [fields, setFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testFields = async () => {
    setIsLoading(true);
    setError('');
    setFields([]);

    try {
      console.log(`🔍 Testing field reading for table: ${tableName}`);
      
      // Get all fields from the table
      const { data, error: queryError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (queryError) {
        throw new Error(queryError.message);
      }

      if (!data || data.length === 0) {
        setError('No data found in table');
        return;
      }

      // Extract field names and values
      const record = data[0];
      const fieldList = Object.keys(record).map(key => ({
        name: key,
        value: record[key],
        type: typeof record[key],
        isNull: record[key] === null,
        isUndefined: record[key] === undefined
      }));

      setFields(fieldList);
      console.log('✅ Fields read successfully:', fieldList);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('❌ Error reading fields:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const tables = ['users', 'user_farms', 'crops', 'soil_properties', 'user_history'];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">🔍 Database Field Reader Test</h2>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-4">Test Field Reading</h3>
          <p className="text-sm text-blue-700 mb-4">
            This tool shows all fields (columns) in your database tables. 
            When you add new fields, they will automatically appear here.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Table</label>
              <select
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={testFields}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Reading Fields...' : 'Read All Fields'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {fields.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              Fields in {tableName} table ({fields.length} fields)
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fields.map((field, index) => (
                    <tr key={index} className={field.isNull ? 'bg-yellow-50' : 'bg-white'}>
                      <td className="px-4 py-2 text-sm font-mono text-gray-900">{field.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {field.isNull ? (
                          <span className="text-yellow-600 font-semibold">NULL</span>
                        ) : field.isUndefined ? (
                          <span className="text-red-600 font-semibold">undefined</span>
                        ) : (
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {String(field.value)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">{field.type}</td>
                      <td className="px-4 py-2 text-sm">
                        {field.isNull ? (
                          <span className="text-yellow-600 font-semibold">Empty</span>
                        ) : field.isUndefined ? (
                          <span className="text-red-600 font-semibold">Missing</span>
                        ) : (
                          <span className="text-green-600 font-semibold">Has Data</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">How to Add New Fields</h3>
          <div className="text-sm text-green-700 space-y-2">
            <p><strong>1. Add to Database:</strong> Use SQL ALTER TABLE commands</p>
            <p><strong>2. Add Test Data:</strong> Insert some sample values</p>
            <p><strong>3. Test Here:</strong> Run this tool to see new fields</p>
            <p><strong>4. Test AI Agent:</strong> Ask questions that should use new fields</p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">Example: Adding New Fields</h3>
          <div className="text-sm text-purple-700 space-y-2">
            <p><strong>SQL Example:</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`-- Add new fields to users table
ALTER TABLE users ADD COLUMN farming_experience_years INTEGER;
ALTER TABLE users ADD COLUMN preferred_crop_types TEXT[];

-- Add new fields to user_farms table  
ALTER TABLE user_farms ADD COLUMN soil_depth FLOAT;
ALTER TABLE user_farms ADD COLUMN drainage_type TEXT;

-- Test with this tool to see new fields`}
            </pre>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">What to Look For</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>✅ Good:</strong> New fields appear in the table with data</p>
            <p><strong>⚠️ Warning:</strong> Fields appear but show NULL (need to add data)</p>
            <p><strong>❌ Error:</strong> Fields don't appear (check table name or permissions)</p>
            <p><strong>🎯 Success:</strong> AI agent mentions new fields in responses</p>
          </div>
        </div>
      </div>
    </div>
  );
}
