import React from 'react';
import { Calendar, Milk, Moon, Droplet, Menu } from 'lucide-react';

export type TabName = 'today' | 'feedings' | 'sleep' | 'diapers' | 'more';

interface BottomNavProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'today' as TabName,
      label: 'Hoje',
      icon: Calendar,
      activeColor: 'text-[#FF7A00] bg-orange-50'
    },
    {
      id: 'feedings' as TabName,
      label: 'Alimentar',
      icon: Milk,
      activeColor: 'text-amber-600 bg-amber-50'
    },
    {
      id: 'sleep' as TabName,
      label: 'Sono',
      icon: Moon,
      activeColor: 'text-indigo-600 bg-indigo-50'
    },
    {
      id: 'diapers' as TabName,
      label: 'Fraldas',
      icon: Droplet,
      activeColor: 'text-blue-500 bg-blue-50'
    },
    {
      id: 'more' as TabName,
      label: 'Mais',
      icon: Menu,
      activeColor: 'text-slate-700 bg-slate-100'
    }
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-4 z-45">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-2xl transition-all duration-200 active:scale-90 cursor-pointer ${
              isActive 
                ? `${tab.activeColor} font-bold text-[10px]` 
                : 'text-slate-400 font-semibold text-[10px] hover:text-slate-650'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;

