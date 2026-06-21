import React from 'react';
import { Calendar, Pill, ShieldCheck, TrendingUp, Menu } from 'lucide-react';

export type TabName = 'today' | 'medications' | 'vaccines' | 'growth' | 'more';

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
      id: 'medications' as TabName,
      label: 'Remédios',
      icon: Pill,
      activeColor: 'text-orange-600 bg-orange-50'
    },
    {
      id: 'vaccines' as TabName,
      label: 'Vacinas',
      icon: ShieldCheck,
      activeColor: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 'growth' as TabName,
      label: 'Crescimento',
      icon: TrendingUp,
      activeColor: 'text-blue-600 bg-blue-50'
    },
    {
      id: 'more' as TabName,
      label: 'Mais',
      icon: Menu,
      activeColor: 'text-slate-700 bg-slate-100'
    }
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-between px-2 z-45">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1.5 mx-0.5 rounded-2xl transition-all duration-200 active:scale-90 cursor-pointer ${
              isActive 
                ? `${tab.activeColor} font-bold text-[9px] sm:text-[10px]` 
                : 'text-slate-400 font-semibold text-[9px] sm:text-[10px] hover:text-slate-650'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className="truncate w-full text-center px-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;

