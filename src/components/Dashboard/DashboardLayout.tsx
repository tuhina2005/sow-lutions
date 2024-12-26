import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import CropHealth from './CropHealth';
import WaterLevels from './WaterLevels';
import NutrientLevels from './NutrientLevels';
import PestDetection from './PestDetection';
import FarmMap from './FarmMap';
import ActionableInsights from './ActionableInsights';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CropHealth />
            <WaterLevels />
            <NutrientLevels />
            <PestDetection />
            <FarmMap />
            <ActionableInsights />
          </div>
        </main>
      </div>
    </div>
  );
}