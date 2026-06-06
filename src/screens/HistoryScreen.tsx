import React, { useState } from 'react';
import type { 
  FeedingLog, FruitLog, MealLog, SleepRecord, DiaperRecord, MedicationLog 
} from '../types';
import { 
  Milk, Apple, Utensils, Droplet, Trash2, CalendarDays, Moon, Pill, Pencil 
} from 'lucide-react';

interface HistoryScreenProps {
  feedings: FeedingLog[];
  fruits: FruitLog[];
  meals: MealLog[];
  sleepRecords?: SleepRecord[];
  diaperRecords?: DiaperRecord[];
  medicationLogs?: MedicationLog[];
  userRole?: 'admin' | 'cuidador' | 'leitura';
  onDeleteLog: (id: string, logType: 'feeding' | 'fruit' | 'meal' | 'sleep' | 'diaper' | 'medication') => void;
  onEditFeeding?: (feeding: FeedingLog) => void;
}

type FilterType = 'all' | 'breast' | 'fruit' | 'meal' | 'water' | 'sleep' | 'diaper' | 'medication';

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  feedings,
  fruits,
  meals,
  sleepRecords = [],
  diaperRecords = [],
  medicationLogs = [],
  userRole = 'admin',
  onDeleteLog,
  onEditFeeding
}) => {
  const [filter, setFilter] = useState<FilterType>('all');

  // Convert separate arrays into a combined typed list
  const getCombinedLogs = () => {
    const combined: Array<
      (FeedingLog & { logType: 'feeding' }) | 
      (FruitLog & { logType: 'fruit' }) | 
      (MealLog & { logType: 'meal' }) |
      (SleepRecord & { logType: 'sleep'; datetime: string }) |
      (DiaperRecord & { logType: 'diaper' }) |
      (MedicationLog & { logType: 'medication' })
    > = [];

    feedings.forEach(f => combined.push({ ...f, logType: 'feeding' }));
    fruits.forEach(fr => combined.push({ ...fr, logType: 'fruit' }));
    meals.forEach(m => combined.push({ ...m, logType: 'meal' }));
    sleepRecords.forEach(s => combined.push({ ...s, logType: 'sleep', datetime: s.startDateTime }));
    diaperRecords.forEach(d => combined.push({ ...d, logType: 'diaper' }));
    medicationLogs.forEach(ml => combined.push({ ...ml, logType: 'medication' }));

    // Sort by datetime local string descending (most recent first)
    return combined.sort((a, b) => b.datetime.localeCompare(a.datetime));
  };

  const sortedLogs = getCombinedLogs();

  // Apply visual category filter
  const filteredLogs = sortedLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'breast') return log.logType === 'feeding' && log.type !== 'water';
    if (filter === 'water') return log.logType === 'feeding' && log.type === 'water';
    if (filter === 'fruit') return log.logType === 'fruit';
    if (filter === 'meal') return log.logType === 'meal';
    if (filter === 'sleep') return log.logType === 'sleep';
    if (filter === 'diaper') return log.logType === 'diaper';
    if (filter === 'medication') return log.logType === 'medication';
    return true;
  });

  // Group logs by YYYY-MM-DD date string
  const groupLogsByDate = (logsList: typeof filteredLogs) => {
    const groups: { [key: string]: typeof filteredLogs } = {};
    const todayStr = new Date().toLocaleDateString('pt-BR');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('pt-BR');

    logsList.forEach(log => {
      const datePart = log.datetime.split('T')[0];
      const [year, month, day] = datePart.split('-');
      
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const dateLocaleStr = dateObj.toLocaleDateString('pt-BR');
      
      let dateKey = '';
      if (dateLocaleStr === todayStr) {
        dateKey = 'Hoje';
      } else if (dateLocaleStr === yesterdayStr) {
        dateKey = 'Ontem';
      } else {
        dateKey = dateObj.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        dateKey = dateKey.charAt(0).toUpperCase() + dateKey.slice(1);
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    return groups;
  };

  const groupedLogs = groupLogsByDate(filteredLogs);

  const getReactionEmoji = (reaction: string) => {
    switch (reaction) {
      case 'aceitou': return '🤩';
      case 'recusou': return '🤢';
      case 'fez careta': return '😐';
      case 'gases': return '💨';
      case 'regurgitou': return '🤮';
      case 'irritação/manchas': return '🔴';
      case 'outro': return '❓';
      default: return '';
    }
  };

  const getFormatTime = (datetimeStr: string) => {
    if (!datetimeStr) return '';
    const timePart = datetimeStr.split('T')[1];
    return timePart ? timePart.substring(0, 5) : '';
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-4 space-y-4">
      {/* Category filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 sticky top-14 bg-[#fcfbfa] z-10 py-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-500'
          }`}
        >
          Tudo
        </button>

        <button
          onClick={() => setFilter('breast')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
            filter === 'breast'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-500'
          }`}
        >
          <Milk className="w-3.5 h-3.5" /> Mamadas
        </button>

        <button
          onClick={() => setFilter('fruit')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
            filter === 'fruit'
              ? 'bg-pink-500 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-500'
          }`}
        >
          <Apple className="w-3.5 h-3.5" /> Frutas
        </button>

        <button
          onClick={() => setFilter('meal')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
            filter === 'meal'
              ? 'bg-teal-650 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-500'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" /> Refeições
        </button>

        <button
          onClick={() => setFilter('water')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
            filter === 'water'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-500'
          }`}
        >
          <Droplet className="w-3.5 h-3.5" /> Água
        </button>

        <button
          onClick={() => setFilter('sleep')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
            filter === 'sleep'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-500'
          }`}
        >
          <Moon className="w-3.5 h-3.5" /> Sono
        </button>

        <button
          onClick={() => setFilter('diaper')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
            filter === 'diaper'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-500'
          }`}
        >
          <Droplet className="w-3.5 h-3.5" /> Fraldas
        </button>

        <button
          onClick={() => setFilter('medication')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
            filter === 'medication'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-500'
          }`}
        >
          <Pill className="w-3.5 h-3.5" /> Remédios
        </button>
      </div>

      {/* Timeline view */}
      <div className="flex-1 space-y-5 overflow-y-auto pb-6">
        {Object.keys(groupedLogs).length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-400">
            <CalendarDays className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">Nenhum registro encontrado.</p>
            <p className="text-xs mt-1">Experimente mudar o filtro de visualização ou adicione novos registros na aba Hoje.</p>
          </div>
        ) : (
          Object.keys(groupedLogs).map((dateGroup) => (
            <div key={dateGroup} className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-500 tracking-wider pl-1 uppercase">
                {dateGroup}
              </h4>
              
              <div className="space-y-2">
                {groupedLogs[dateGroup].map((log) => {
                  const logTime = getFormatTime(log.datetime);
                  
                  let icon = null;
                  let colorClass = '';
                  let title = '';
                  let detailsText = '';
                  let reactionEmoji = '';
                  let notes = log.notes;

                  switch (log.logType) {
                    case 'feeding':
                      const fLog = log as FeedingLog;
                      if (fLog.type === 'water') {
                        icon = <Droplet className="w-4 h-4" />;
                        colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
                        title = 'Água';
                        detailsText = `Volume: ${fLog.amountMl}ml`;
                      } else {
                        icon = <Milk className="w-4 h-4" />;
                        colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
                        title = fLog.type === 'breast' 
                          ? 'Mamada: Leite Materno' 
                          : `Mamada: ${fLog.type === 'formula' ? 'Fórmula' : 'Misto'}`;
                        
                        const parts: string[] = [];
                        if (fLog.type === 'breast' || fLog.type === 'mixed') {
                          if (fLog.durationMinutes) {
                            let splitText = '';
                            if (fLog.leftBreastDurationSeconds || fLog.rightBreastDurationSeconds) {
                              const leftMin = Math.floor((fLog.leftBreastDurationSeconds || 0) / 60);
                              const rightMin = Math.floor((fLog.rightBreastDurationSeconds || 0) / 60);
                              splitText = `: esquerdo ${leftMin} min, direito ${rightMin} min`;
                            }
                            parts.push(`${fLog.durationMinutes} min total${splitText}`);
                          }
                        }
                        if (fLog.amountMl) parts.push(`Qtd: ${fLog.amountMl}ml`);
                        detailsText = parts.length > 0 ? parts.join(' | ') : 'Amamentação livre';
                      }
                      break;

                    case 'fruit':
                      const frLog = log as FruitLog;
                      icon = <Apple className="w-4 h-4" />;
                      colorClass = 'bg-pink-100 text-pink-800 border-pink-200';
                      title = `Fruta: ${frLog.fruitName}${frLog.fruitType ? ` (${frLog.fruitType})` : ''}`;
                      detailsText = `Qtd: ${frLog.quantity}`;
                      reactionEmoji = getReactionEmoji(frLog.reaction);
                      break;

                    case 'meal':
                      const mLog = log as MealLog;
                      icon = <Utensils className="w-4 h-4" />;
                      colorClass = 'bg-teal-100 text-teal-800 border-teal-200';
                      title = `Refeição: ${mLog.foodName} (${mLog.category})`;
                      detailsText = `Textura: ${mLog.texture} | Qtd: ${mLog.quantity}`;
                      reactionEmoji = getReactionEmoji(mLog.reaction);
                      break;

                    case 'sleep':
                      const sLog = log as SleepRecord;
                      icon = <Moon className="w-4 h-4" />;
                      colorClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                      title = sLog.sleepType === 'soneca' ? 'Sono: Soneca' : 'Sono: Noturno';
                      detailsText = `Local: ${sLog.location} | Duração: ${sLog.durationMinutes ? `${sLog.durationMinutes} min` : 'Em andamento'}`;
                      break;

                    case 'diaper':
                      const dLog = log as DiaperRecord;
                      icon = <span className="text-sm">{dLog.diaperType === 'xixi' ? '💦' : dLog.diaperType === 'cocô' ? '💩' : dLog.diaperType === 'xixi e cocô' ? '✨' : '💨'}</span>;
                      colorClass = dLog.diaperType === 'xixi' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                   dLog.diaperType === 'cocô' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                   dLog.diaperType === 'xixi e cocô' ? 'bg-orange-100 text-orange-850 border-orange-200' :
                                   'bg-slate-100 text-slate-600 border-slate-200';
                      title = `Fralda: ${dLog.diaperType === 'xixi' ? 'Xixi' : dLog.diaperType === 'cocô' ? 'Cocô' : dLog.diaperType === 'xixi e cocô' ? 'Mista' : 'Seca'}`;
                      detailsText = dLog.diaperType === 'seca' ? 'Sem umidade' : 
                                    (dLog.diaperType === 'cocô' || dLog.diaperType === 'xixi e cocô')
                                      ? `Aspecto: ${dLog.stoolColor} (${dLog.stoolConsistency})`
                                      : 'Fralda molhada de xixi';
                      break;

                    case 'medication':
                      const medLog = log as MedicationLog;
                      icon = <Pill className="w-4 h-4" />;
                      colorClass = 'bg-orange-100 text-orange-800 border-orange-200';
                      title = `Dose: ${medLog.medicationName}`;
                      detailsText = `Dose dada: ${medLog.doseGiven} | Status: ${medLog.status}`;
                      break;
                  }

                  return (
                    <div
                      key={log.id}
                      className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-shadow"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}`}>
                          {icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <h5 className="text-sm font-bold text-slate-800 truncate flex items-center gap-1.5">
                              <span>{title}</span>
                              {reactionEmoji && (
                                <span className="text-sm" title="Reação">
                                  {reactionEmoji}
                                </span>
                              )}
                            </h5>
                            <span className="text-[10px] text-slate-400 font-bold shrink-0">{logTime}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {detailsText}
                          </p>
                          {notes && (
                            <p className="text-xs text-slate-400 italic mt-1.5 border-l-2 border-slate-100 pl-2 leading-tight">
                              "{notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {userRole !== 'leitura' && (
                        <div className="flex items-center gap-0.5 ml-2 shrink-0">
                          {log.logType === 'feeding' && log.type !== 'water' && (
                            <button
                              onClick={() => onEditFeeding?.(log as FeedingLog)}
                              className="p-2 text-slate-300 hover:text-orange-500 active:scale-90 transition-all rounded-full hover:bg-slate-50 cursor-pointer"
                              title="Editar Mamada"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteLog(log.id!, log.logType)}
                            className="p-2 text-slate-300 hover:text-rose-500 active:scale-90 transition-all rounded-full hover:bg-slate-50 cursor-pointer"
                            aria-label="Excluir Registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;

