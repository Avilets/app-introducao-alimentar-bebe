import { Calendar, History, Bell, Settings, ClipboardList, TrendingUp } from 'lucide-react';

export type TabName = 'today' | 'history' | 'growth' | 'reminders' | 'pediatrician' | 'settings';

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
      activeColor: 'text-orange-500 bg-orange-50'
    },
    {
      id: 'history' as TabName,
      label: 'Histórico',
      icon: History,
      activeColor: 'text-teal-600 bg-teal-50'
    },
    {
      id: 'growth' as TabName,
      label: 'Crescimento',
      icon: TrendingUp,
      activeColor: 'text-amber-600 bg-amber-50'
    },
    {
      id: 'reminders' as TabName,
      label: 'Lembretes',
      icon: Bell,
      activeColor: 'text-pink-600 bg-pink-50'
    },
    {
      id: 'pediatrician' as TabName,
      label: 'Relatório',
      icon: ClipboardList,
      activeColor: 'text-indigo-600 bg-indigo-50'
    },
    {
      id: 'settings' as TabName,
      label: 'Ajustes',
      icon: Settings,
      activeColor: 'text-slate-600 bg-slate-100'
    }
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-4 z-40">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-2xl transition-all duration-200 active:scale-90 ${
              isActive 
                ? `${tab.activeColor} font-semibold text-xs` 
                : 'text-slate-400 font-medium text-xs hover:text-slate-600'
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
