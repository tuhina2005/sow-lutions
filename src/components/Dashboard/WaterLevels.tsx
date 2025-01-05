import React from 'react';
import { Droplets } from 'lucide-react';

export default function WaterLevels() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Water Levels</h2>
        <Droplets className="w-6 h-6 text-blue-600" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Soil Moisture</span>
          <span className="text-blue-600 font-semibold">75%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Last Irrigation</div>
            <div className="font-semibold">2 hours ago</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Next Scheduled</div>
            <div className="font-semibold">Tomorrow 6am</div>
          </div>
        </div>
      </div>
    </div>
  );
}