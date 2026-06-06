import React from 'react';
import { Pill, ShieldCheck, TrendingUp, History, ClipboardList, Settings, Bell, ChevronRight } from 'lucide-react';

interface MoreScreenProps {
  onNavigate: (screen: string) => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({ onNavigate }) => {
  const menuItems = [
    {
      id: 'medications',
      label: 'Medicamentos e Remédios',
      description: 'Agenda e registros de dosagem',
      icon: Pill,
      color: 'bg-orange-50 text-[#FF7A00]'
    },
    {
      id: 'vaccines',
      label: 'Vacinas do Bebê',
      description: 'Calendário SUS/Particular e aplicadas',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'growth',
      label: 'Crescimento e Percentil',
      description: 'Acompanhar peso, comprimento e curvas da OMS',
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'reminders',
      label: 'Lembretes e Alarmes',
      description: 'Alertas de alimentação, sono e vacinas',
      icon: Bell,
      color: 'bg-pink-50 text-pink-600'
    },
    {
      id: 'pediatrician',
      label: 'Relatório do Pediatra',
      description: 'Compilado e anotações para consultas',
      icon: ClipboardList,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      id: 'history',
      label: 'Histórico Completo',
      description: 'Linha do tempo de todas as atividades',
      icon: History,
      color: 'bg-slate-105 bg-slate-50 text-slate-650'
    },
    {
      id: 'settings',
      label: 'Configurações do Perfil',
      description: 'Editar bebê, ativar push e conta',
      icon: Settings,
      color: 'bg-slate-100 text-slate-600'
    }
  ];

  return (
    <div className="flex-1 flex flex-col px-4 py-4 space-y-4">
      {/* Title */}
      <div className="text-center py-2 shrink-0">
        <h2 className="text-xl font-black text-slate-800">Mais Recursos</h2>
        <p className="text-xs text-slate-500 mt-0.5">Explore as ferramentas adicionais do Baby Grow</p>
      </div>

      {/* Menu List */}
      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full bg-white border border-slate-100 hover:border-orange-100 rounded-3xl p-4 shadow-sm flex items-center justify-between transition-all duration-200 active:scale-[0.98] text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 leading-none group-hover:text-[#FF7A00] transition-colors">
                    {item.label}
                  </h4>
                  <p className="text-[10px] text-slate-450 mt-1.5 font-medium leading-none">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-350 group-hover:text-orange-500 transition-colors" />
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-center py-4 shrink-0">
        <p className="text-[9px] text-slate-400 font-bold">Baby Grow • Versão 2.1.0 (PWA)</p>
      </div>
    </div>
  );
};

export default MoreScreen;
