import React from 'react';
import { NavLink } from 'react-router-dom';
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
  { icon: LayoutDashboard, label: 'Overview', path: '/' },
  { icon: Sprout, label: 'Crop Health', path: '/crop-health' },
  { icon: Droplets, label: 'Water Levels', path: '/water-management' },
  { icon: TestTube2, label: 'Nutrients', path: '/nutrient-management' },
  { icon: Bug, label: 'Pest Detection', path: '/pest-control' },
  { icon: Map, label: 'Farm Map', path: '/farm-mapping' },
  { icon: LineChart, label: 'Analytics', path: '/analytics' },
  { icon: Bell, label: 'Alerts', path: '/alerts' },
  { icon: Settings, label: 'Settings', path: '/settings' }
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-green-800 text-white">
      <div className="p-4">
        <h2 className="text-xl font-bold">AgriSmart</h2>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center px-6 py-3 text-gray-100 transition-colors ${
                isActive ? 'bg-green-700' : 'hover:bg-green-700'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}