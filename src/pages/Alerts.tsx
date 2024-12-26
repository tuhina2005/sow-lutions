import React from 'react';
import ActionableInsights from '../components/Dashboard/ActionableInsights';

export default function Alerts() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Alerts & Notifications</h1>
      <div className="grid gap-6">
        <ActionableInsights />
        {/* Additional alert components will go here */}
      </div>
    </div>
  );
}