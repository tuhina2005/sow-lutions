import React from 'react';
import PestDetection from '../components/Dashboard/PestDetection';

export default function PestControl() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Pest Control</h1>
      <div className="grid gap-6">
        <PestDetection />
        {/* Additional pest control components will go here */}
      </div>
    </div>
  );
}