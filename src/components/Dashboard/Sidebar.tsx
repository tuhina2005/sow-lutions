import React from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  Droplets, 
  TestTube2, 
  Bug, 
  Map, 
  LineChart, 
  Bell, 
  Settings 
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview' },
  { icon: Sprout, label: 'Crop Health' },
  { icon: Droplets, label: 'Water Levels' },
  { icon: TestTube2, label: 'Nutrients' },
  { icon: Bug, label: 'Pest Detection' },
  { icon: Map, label: 'Farm Map' },
  { icon: LineChart, label: 'Analytics' },
  { icon: Bell, label: 'Alerts' },
  { icon: Settings, label: 'Settings' }
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-green-800 text-white">
      <div className="p-4">
        <h2 className="text-xl font-bold">AgriSmart</h2>
      </div>
      <nav className="mt-8">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className="flex items-center px-6 py-3 text-gray-100 hover:bg-green-700 transition-colors"
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}