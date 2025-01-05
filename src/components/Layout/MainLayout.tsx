import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from '../Dashboard/Header';
import ChatButton from '../chat/ChatButton';

import { Menu, X } from 'lucide-react';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity duration-300
        ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `} onClick={() => setIsSidebarOpen(false)} />
      
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-green-800 transform transition-transform duration-300 lg:relative lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)}
          showMenuButton={!isSidebarOpen} 
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <ChatButton />
      </div>
    </div>
  );
}