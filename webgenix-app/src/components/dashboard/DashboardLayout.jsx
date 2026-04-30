import { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 text-text-primary flex flex-col">
      <DashboardHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 pt-20">
        <DashboardSidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        <main className="flex-1 ml-0 md:ml-60 p-6 transition-all duration-300">
          <div className="container-webgenix max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
