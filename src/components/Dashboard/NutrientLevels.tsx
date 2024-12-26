import React from 'react';
import { TestTube2 } from 'lucide-react';

export default function NutrientLevels() {
  const nutrients = [
    { name: 'Nitrogen', level: 80, color: 'bg-blue-500' },
    { name: 'Phosphorus', level: 65, color: 'bg-yellow-500' },
    { name: 'Potassium', level: 90, color: 'bg-green-500' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Nutrient Levels</h2>
        <TestTube2 className="w-6 h-6 text-purple-600" />
      </div>
      <div className="space-y-4">
        {nutrients.map((nutrient, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{nutrient.name}</span>
              <span className="text-gray-800 font-semibold">{nutrient.level}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 ${nutrient.color} rounded-full`}
                style={{ width: `${nutrient.level}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}