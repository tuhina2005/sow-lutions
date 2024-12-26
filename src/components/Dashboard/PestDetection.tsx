import React from 'react';
import { Bug, AlertTriangle } from 'lucide-react';

export default function PestDetection() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Pest & Disease Detection</h2>
        <Bug className="w-6 h-6 text-red-600" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center bg-yellow-50 p-3 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
          <div>
            <div className="text-sm font-semibold text-yellow-800">Potential Risk Detected</div>
            <div className="text-xs text-yellow-600">Aphids in Section B-3</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">2</div>
            <div className="text-sm text-gray-600">Active Threats</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="text-sm text-gray-600">Protected Area</div>
          </div>
        </div>
      </div>
    </div>
  );
}