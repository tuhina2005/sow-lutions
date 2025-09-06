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
  Settings,
  Newspaper,
  MessageSquare,
  Bot,
  Database,
  X 
} from 'lucide-react';
import { Cloud } from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/' },
  { icon: Bot, label: 'AI Assistant', path: '/agritech-chatbot' },
  { icon: Database, label: 'Farm Data', path: '/farm-data' },
  { icon: Sprout, label: 'Crop Health', path: '/crop-health' },
  // { icon: Droplets, label: 'Water Levels', path: '/water-management' },
  // { icon: TestTube2, label: 'Nutrients', path: '/nutrient-management' },
  { icon: Bug, label: 'Pest Detection', path: '/pest-control' },
  // { icon: Map, label: 'Farm Map', path: '/farm-mapping' },
  { icon: LineChart, label: 'Price Predictions', path: '/analytics' },
  { icon: MessageSquare, label: 'Forum', path: '/forum' },
  { icon: Bell, label: 'Alerts', path: '/alerts' },
  { icon: Newspaper, label: 'News', path: '/news' },
  { icon: Cloud, label: 'Weather', path: '/weather' },
  { icon: Settings, label: 'Settings', path: '/settings' }
];

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="h-full flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">AgriSmart</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-green-700 rounded-lg lg:hidden"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
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