import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useAdminStore = create(
  devtools(
    (set) => ({
      // Dashboard Stats State
      stats: null,
      isStatsLoading: false,
      statsError: null,
      
      // Sidebar State
      isSidebarOpen: true,
      
      // Actions
      setStats: (stats) => set({ stats, isStatsLoading: false, statsError: null }, false, 'setStats'),
      setStatsLoading: (isLoading) => set({ isStatsLoading: isLoading }, false, 'setStatsLoading'),
      setStatsError: (error) => set({ statsError: error, isStatsLoading: false }, false, 'setStatsError'),
      
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'toggleSidebar'),
      
      // Global clear/reset
      reset: () => set({
        stats: null,
        isStatsLoading: false,
        statsError: null,
        isSidebarOpen: true,
      }, false, 'reset'),
    }),
    { name: 'AdminStore' }
  )
);
