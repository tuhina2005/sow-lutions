import React from 'react';
import { Map } from 'lucide-react';

export default function FarmMap() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Farm Map</h2>
        <Map className="w-6 h-6 text-gray-600" />
      </div>
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Interactive Map View</div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="text-sm font-semibold text-green-800">Healthy</div>
          <div className="text-xs text-green-600">75%</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded-lg">
          <div className="text-sm font-semibold text-yellow-800">Monitor</div>
          <div className="text-xs text-yellow-600">20%</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded-lg">
          <div className="text-sm font-semibold text-red-800">Alert</div>
          <div className="text-xs text-red-600">5%</div>
        </div>
      </div>
    </div>
  );
}