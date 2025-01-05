import React from 'react';
import CropHealth from '../components/Dashboard/CropHealth';
import WaterLevels from '../components/Dashboard/WaterLevels';
import NutrientLevels from '../components/Dashboard/NutrientLevels';
import PestDetection from '../components/Dashboard/PestDetection';
import FarmMap from '../components/Dashboard/FarmMap';
import ActionableInsights from '../components/Dashboard/ActionableInsights';
import Weather from '../components/Dashboard/Weather';

export default function Overview() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <CropHealth />
        </div>
        <WaterLevels />
        <NutrientLevels />
        <div className="sm:col-span-2 lg:col-span-1">
          <PestDetection />
        </div>
        {/* <div className="sm:col-span-2 lg:col-span-2">
          <FarmMap />
        </div> */}
        <ActionableInsights />
        <Weather />
      </div>
    </div>
  );
}