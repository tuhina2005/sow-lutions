import React from 'react';
import CropHealth from '../components/Dashboard/CropHealth';

export default function CropHealthPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Crop Health Details</h1>
      <div className="grid gap-6">
        <CropHealth />
        {/* Additional crop health components will go here */}
      </div>
    </div>
  );
}