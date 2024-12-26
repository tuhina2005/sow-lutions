import React from 'react';
import CropHealth from '../components/Dashboard/CropHealth';
import WaterLevels from '../components/Dashboard/WaterLevels';
import NutrientLevels from '../components/Dashboard/NutrientLevels';
import PestDetection from '../components/Dashboard/PestDetection';
import FarmMap from '../components/Dashboard/FarmMap';
import ActionableInsights from '../components/Dashboard/ActionableInsights';

export default function Overview() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CropHealth />
        <WaterLevels />
        <NutrientLevels />
        <PestDetection />
        <FarmMap />
        <ActionableInsights />
      </div>
    </div>
  );
}