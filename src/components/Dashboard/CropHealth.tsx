import React from 'react';
import { Sprout, TrendingUp } from 'lucide-react';

export default function CropHealth() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Crop Health</h2>
        <Sprout className="w-6 h-6 text-green-600" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Overall Health</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            Excellent
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-green-500 rounded-full" style={{ width: '85%' }}></div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Growth Rate</span>
          <div className="flex items-center text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12%</span>
          </div>
        </div>
      </div>
    </div>
  );
}