
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ToggleSidebarButton from './sidebar/ToggleSidebarButton';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Get sidebar state from localStorage or default to true
    const savedState = localStorage.getItem('sidebarState');
    return savedState ? savedState === 'open' : true;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 p-4 bg-background border-b flex items-center md:hidden">
          <ToggleSidebarButton 
            isSidebarOpen={isSidebarOpen} 
            toggleSidebar={toggleSidebar} 
          />
          <h1 className="text-xl font-playfair font-bold ml-2">HeyMegan</h1>
        </div>
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
