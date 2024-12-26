import React from 'react';
import WaterLevels from '../components/Dashboard/WaterLevels';

export default function WaterManagement() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Water Management</h1>
      <div className="grid gap-6">
        <WaterLevels />
        {/* Additional water management components will go here */}
      </div>
    </div>
  );
}