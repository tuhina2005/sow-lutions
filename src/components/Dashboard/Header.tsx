import React from 'react';
import { Bell, Settings, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

export default function Header({ onMenuClick, showMenuButton }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showMenuButton && (
            <button 
              onClick={onMenuClick}
              className="p-2 mr-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-semibold text-green-800">Farm Monitor</h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Settings className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <User className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}