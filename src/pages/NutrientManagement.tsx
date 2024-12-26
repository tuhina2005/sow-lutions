import React from 'react';
import NutrientLevels from '../components/Dashboard/NutrientLevels';

export default function NutrientManagement() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Nutrient Management</h1>
      <div className="grid gap-6">
        <NutrientLevels />
        {/* Additional nutrient management components will go here */}
      </div>
    </div>
  );
}