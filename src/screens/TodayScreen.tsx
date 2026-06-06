import React, { useState } from 'react';
import type { 
  Baby, FeedingLog, FruitLog, MealLog, Reminder, GrowthRecord,
  SleepRecord, DiaperRecord, MedicationLog 
} from '../types';
import { 
  Milk, Apple, Utensils, Droplet, Check, Trash2, Clock, 
  TrendingUp, Moon, Pill, Pencil 
} from 'lucide-react';
import { getTodaySummary, isToday } from '../services/summaryService';
import { getActiveSleepRecord, calculateHoursSleptToday } from '../services/sleepService';

interface TodayScreenProps {
  baby: Baby;
  feedings: FeedingLog[];
  fruits: FruitLog[];
  meals: MealLog[];
  growthRecords: GrowthRecord[];
  reminders: Reminder[];
  sleepRecords?: SleepRecord[];
  diaperRecords?: DiaperRecord[];
  medicationLogs?: MedicationLog[];
  userRole?: 'admin' | 'cuidador' | 'leitura';
  onNavigate: (screen: string) => void;
  onAddWaterLog: (ml: number) => void;
  onDeleteLog: (id: string, logType: 'feeding' | 'fruit' | 'meal' | 'sleep' | 'diaper' | 'medication') => void;
  onCompleteReminder: (reminder: Reminder) => void;
  onEditFeeding?: (feeding: FeedingLog) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  baby,
  feedings,
  fruits,
  meals,
  growthRecords,
  reminders,
  sleepRecords = [],
  diaperRecords = [],
  medicationLogs = [],
  userRole = 'admin',
  onNavigate,
  onAddWaterLog,
  onDeleteLog,
  onCompleteReminder,
  onEditFeeding
}) => {
  const [waterAmount, setWaterAmount] = useState(50);
  const [showWaterSuccess, setShowWaterSuccess] = useState(false);

  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return '';
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalMonths = years * 12 + months;
    if (totalMonths === 0) return `${days} ${days === 1 ? 'dia' : 'dias'}`;
    if (days === 0) return `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'}`;
    return `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'} e ${days} ${days === 1 ? 'dia' : 'dias'}`;
  };

  const summary = getTodaySummary(feedings, fruits, meals);

  const getLastFeedingSummary = () => {
    const lf = feedings.find(f => f.type !== 'water');
    if (!lf) return 'Nenhuma mamada';
    
    const typeLabel = lf.type === 'breast' ? 'leite materno' : lf.type === 'formula' ? 'fórmula' : 'misto';
    const parts: string[] = [typeLabel];
    
    if (lf.type === 'breast' || lf.type === 'mixed') {
      if (lf.durationMinutes) {
        parts.push(`${Math.floor(lf.durationMinutes)} min`);
      }
      if (lf.breastSide) {
        const sideLabel = lf.breastSide === 'left' 
          ? 'esquerdo' 
          : lf.breastSide === 'right' 
            ? 'direito' 
            : 'esquerdo e direito';
        parts.push(sideLabel);
      }
    }
    
    if (lf.type === 'formula' || lf.type === 'mixed') {
      if (lf.amountMl) {
        parts.push(`${lf.amountMl} ml`);
      }
    }
    
    return `Última: ${parts.join(', ')}`;
  };
  const activeSleep = getActiveSleepRecord(sleepRecords);
  const hoursSleptToday = calculateHoursSleptToday(sleepRecords);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDiapers = diaperRecords.filter(r => r.datetime.startsWith(todayStr));
  const diapersCountToday = todayDiapers.length;

  const nextMedReminder = reminders
    .filter(r => r.type === 'medicamento' && r.active && r.nextTriggerAt > 0)
    .sort((a, b) => a.nextTriggerAt - b.nextTriggerAt)[0];

  const todayFeedings = feedings.filter(f => isToday(f.datetime)).map(f => ({ ...f, logType: 'feeding' as const }));
  const todayFruits = fruits.filter(fr => isToday(fr.datetime)).map(fr => ({ ...fr, logType: 'fruit' as const }));
  const todayMeals = meals.filter(m => isToday(m.datetime)).map(m => ({ ...m, logType: 'meal' as const }));
  const todaySleep = sleepRecords.filter(s => isToday(s.startDateTime)).map(s => ({ ...s, logType: 'sleep' as const, datetime: s.startDateTime }));
  const todayDiapersList = diaperRecords.filter(d => isToday(d.datetime)).map(d => ({ ...d, logType: 'diaper' as const }));
  const todayMeds = medicationLogs.filter(ml => isToday(ml.datetime)).map(ml => ({ ...ml, logType: 'medication' as const }));

  const todayLogs = [...todayFeedings, ...todayFruits, ...todayMeals, ...todaySleep, ...todayDiapersList, ...todayMeds].sort((a, b) => 
    b.datetime.localeCompare(a.datetime)
  );

  const handleQuickWater = () => {
    onAddWaterLog(waterAmount);
    setShowWaterSuccess(true);
    setTimeout(() => setShowWaterSuccess(false), 2000);
  };

  const getFormatTime = (datetimeStr: string) => {
    if (!datetimeStr) return '';
    const timePart = datetimeStr.split('T')[1];
    return timePart ? timePart.substring(0, 5) : '';
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-4 space-y-5">
      <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl p-5 text-white shadow-md shadow-orange-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-100">Meu Bebê</span>
          <h2 className="text-2xl font-black mt-0.5">{baby.name}</h2>
          <p className="text-xs text-orange-50 font-semibold mt-1">Idade: {calculateAge(baby.birthDate)}</p>
        </div>
        <div className="text-4xl">{baby.gender === 'girl' ? '👧' : baby.gender === 'boy' ? '👦' : '👶'}</div>
      </div>

      {activeSleep && (
        <div 
          onClick={() => onNavigate('sleep')}
          className="bg-indigo-900 border border-indigo-850 hover:bg-indigo-950 text-white rounded-3xl p-4 flex items-center justify-between shadow-md cursor-pointer animate-pulse"
        >
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-indigo-350 fill-indigo-350" />
            <div>
              <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider block">Em andamento</span>
              <span className="text-xs font-black block mt-0.5">{baby.name} está dormindo</span>
            </div>
          </div>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-lg font-bold">
            Iniciou às {activeSleep.startDateTime.split('T')[1].substring(0, 5)}
          </span>
        </div>
      )}

      {(reminders.filter(r => r.active && r.nextTriggerAt > 0 && r.nextTriggerAt <= Date.now()).length > 0 ||
        reminders.filter(r => r.active && r.nextTriggerAt > Date.now()).length > 0) && (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">⏰ Lembretes</span>
            {userRole !== 'leitura' && (
              <button onClick={() => onNavigate('reminders')} className="text-xs text-pink-500 font-bold hover:underline">Configurar</button>
            )}
          </h3>
          {reminders.filter(r => r.active && r.nextTriggerAt > 0 && r.nextTriggerAt <= Date.now()).length > 0 ? (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
              <span className="text-rose-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Pendente!
              </span>
              {reminders.filter(r => r.active && r.nextTriggerAt > 0 && r.nextTriggerAt <= Date.now()).slice(0, 1).map(r => (
                <div key={r.id} className="mt-2 flex items-center justify-between gap-2 bg-white/70 border border-rose-200/50 p-2.5 rounded-xl">
                  <span className="text-xs font-bold truncate">{r.title}</span>
                  <button
                    onClick={() => {
                      if (userRole === 'leitura') return;
                      onCompleteReminder(r);
                    }}
                    disabled={userRole === 'leitura'}
                    className={`p-1.5 rounded-lg active:scale-90 ${userRole === 'leitura' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-rose-500 text-white'}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            reminders.filter(r => r.active && r.nextTriggerAt > Date.now()).length > 0 && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-indigo-600 text-[9px] font-bold uppercase tracking-wider">Próxima Atividade</span>
                  <h4 className="text-xs font-bold text-slate-800">{reminders.filter(r => r.active && r.nextTriggerAt > Date.now())[0].title}</h4>
                </div>
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
            )
          )}
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><span>🎯</span> Resumo de Hoje</h3>
        <div className="grid grid-cols-2 gap-3">
          <div onClick={() => onNavigate('feedings')} className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/50 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><Milk className="w-5 h-5" /></div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 font-bold block leading-none">Mamadas</span>
              <span className="text-base font-black">{summary.totalBreastfeedings}</span>
              <span className="text-[9px] text-slate-500 font-medium block truncate mt-0.5" title={getLastFeedingSummary()}>
                {getLastFeedingSummary()}
              </span>
            </div>
          </div>
          <div onClick={() => onNavigate('feedings')} className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50/50 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center"><Utensils className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block leading-none">Refeições</span>
              <span className="text-base font-black">{summary.mealsCount}</span>
            </div>
          </div>
          <div onClick={() => onNavigate('sleep')} className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/50 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center"><Moon className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block leading-none">Sono</span>
              <span className="text-base font-black">{hoursSleptToday}h</span>
            </div>
          </div>
          <div onClick={() => onNavigate('diapers')} className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center"><Droplet className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block leading-none">Fraldas</span>
              <span className="text-base font-black">{diapersCountToday}</span>
            </div>
          </div>
        </div>
        {summary.fruitsOffered.length > 0 && (
          <div className="p-3 bg-pink-50/50 rounded-2xl flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center"><Apple className="w-5 h-5" /></div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold block leading-none">Frutas Oferecidas</span>
              <p className="text-xs font-semibold text-slate-700 mt-1 truncate">{summary.fruitsOffered.join(', ')}</p>
            </div>
          </div>
        )}
        {nextMedReminder && (
          <div onClick={() => onNavigate('medications')} className="p-3 bg-orange-50/50 cursor-pointer rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><Pill className="w-5 h-5" /></div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold block leading-none">PRÓXIMO MEDICAMENTO</span>
              <p className="text-xs font-bold text-slate-800 mt-1 truncate">{nextMedReminder.title}</p>
            </div>
          </div>
        )}
      </div>

      {(() => {
        const sortedGrowth = growthRecords && growthRecords.length > 0 ? [...growthRecords].sort((a, b) => b.date.localeCompare(a.date)) : [];
        const latestGrowthRecord = sortedGrowth[0];

        if (latestGrowthRecord) {
          return (
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-[#FF7A00]" /> Crescimento</h3>
                <button onClick={() => onNavigate('growth')} className="text-[10px] text-[#FF7A00] font-extrabold hover:underline">Ver Gráficos</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3"><span className="text-[9px] text-slate-400 font-bold">Peso</span><p className="text-sm font-black">{latestGrowthRecord.weightKg} kg</p></div>
                <div className="bg-slate-50 rounded-2xl p-3"><span className="text-[9px] text-slate-400 font-bold">Comprimento</span><p className="text-sm font-black">{latestGrowthRecord.lengthCm} cm</p></div>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center">
            <h3 className="text-sm font-bold text-slate-800">Crescimento do Bebê</h3>
            <button onClick={() => onNavigate('growth')} className="mt-3 py-2 px-4 bg-[#FF7A00] text-white font-bold rounded-2xl text-xs">Registrar Medida</button>
          </div>
        );
      })()}

      {userRole !== 'leitura' && (
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3">Registrar Atividades</h3>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => onNavigate('feed-breast')} className="p-4 rounded-3xl bg-amber-50 flex flex-col items-center gap-2 font-bold"><Milk className="text-amber-500" /><span className="text-xs">Mamada</span></button>
            <button onClick={() => onNavigate('sleep')} className="p-4 rounded-3xl bg-indigo-50 flex flex-col items-center gap-2 font-bold"><Moon className="text-indigo-900" /><span className="text-xs">Sono</span></button>
            <button onClick={() => onNavigate('diapers')} className="p-4 rounded-3xl bg-blue-50 flex flex-col items-center gap-2 font-bold"><Droplet className="text-blue-500" /><span className="text-xs">Fralda</span></button>
          </div>
        </div>
      )}

      {userRole !== 'leitura' && (
        <div className="bg-blue-50/70 border border-blue-100 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3"><Droplet className="w-4 h-4" /><h3 className="text-sm font-bold">Registrar Água</h3></div>
          <div className="flex items-center gap-3">
            <div className="flex-1 grid grid-cols-3 gap-2">{[30, 50, 100].map(amt => <button key={amt} onClick={() => setWaterAmount(amt)} className={`py-2 rounded-xl text-xs font-bold ${waterAmount === amt ? 'bg-blue-500 text-white' : 'bg-white'}`}>{amt}ml</button>)}</div>
            <button onClick={handleQuickWater} className={`py-3 px-4 rounded-2xl text-xs text-white ${showWaterSuccess ? 'bg-emerald-500' : 'bg-blue-600'}`}>{showWaterSuccess ? 'Salvo!' : 'Adicionar'}</button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3">Linha do Tempo</h3>
        <div className="space-y-3">
          {todayLogs.map(log => {
            let label = '', desc = '', icon = null, color = '';
            switch (log.logType) {
              case 'feeding': {
                const f = log as any;
                label = f.type === 'breast' ? 'Amamentação' : f.type === 'formula' ? 'Fórmula' : f.type === 'mixed' ? 'Misto' : 'Água';
                if (f.type === 'water') {
                  desc = f.amountMl ? `${f.amountMl} ml` : '';
                } else {
                  const parts: string[] = [];
                  if (f.durationMinutes) {
                    let split = '';
                    if (f.leftBreastDurationSeconds || f.rightBreastDurationSeconds) {
                      const leftMin = Math.floor((f.leftBreastDurationSeconds || 0) / 60);
                      const rightMin = Math.floor((f.rightBreastDurationSeconds || 0) / 60);
                      split = ` (esq ${leftMin}m, dir ${rightMin}m)`;
                    }
                    parts.push(`${f.durationMinutes} min${split}`);
                  }
                  if (f.amountMl) {
                    parts.push(`${f.amountMl} ml`);
                  }
                  desc = parts.join(' | ') || 'Amamentação livre';
                }
                icon = <Milk className="w-3.5 h-3.5" />;
                color = 'bg-amber-100';
                break;
              }
              case 'fruit': {
                const fr = log as any;
                label = 'Frutinha';
                desc = fr.fruitName + (fr.fruitType ? ` (${fr.fruitType})` : '');
                icon = <Apple className="w-3.5 h-3.5 text-pink-600" />;
                color = 'bg-pink-100';
                break;
              }
              case 'meal': {
                const m = log as any;
                label = 'Refeição';
                desc = m.foodName;
                icon = <Utensils className="w-3.5 h-3.5 text-teal-600" />;
                color = 'bg-teal-100';
                break;
              }
              case 'sleep': {
                const s = log as any;
                label = s.sleepType === 'soneca' ? 'Soneca' : 'Sono Noturno';
                desc = s.durationMinutes ? `${s.durationMinutes} min` : s.endDateTime ? 'Dormindo' : 'Em andamento';
                icon = <Moon className="w-3.5 h-3.5 text-indigo-900" />;
                color = 'bg-indigo-100';
                break;
              }
              case 'diaper': {
                const d = log as any;
                label = 'Fralda';
                desc = `${d.diaperType.charAt(0).toUpperCase() + d.diaperType.slice(1)}`;
                if (d.stoolConsistency) {
                  desc += ` (${d.stoolConsistency})`;
                }
                icon = <Droplet className="w-3.5 h-3.5 text-blue-500" />;
                color = 'bg-blue-100';
                break;
              }
              case 'medication': {
                const ml = log as any;
                label = 'Medicação';
                desc = `${ml.medicationName} - ${ml.doseGiven}`;
                icon = <Pill className="w-3.5 h-3.5 text-orange-600" />;
                color = 'bg-orange-100';
                break;
              }
              default:
                label = 'Log';
                desc = '';
                icon = <Check className="w-3.5 h-3.5" />;
                color = 'bg-slate-100';
            }
            return (
              <div key={log.id} className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
                  <div>
                    <span className="text-xs font-bold block">{label}</span>
                    {desc && <span className="text-[10px] text-slate-500 block">{desc}</span>}
                    <span className="text-[10px] text-slate-400 block">{getFormatTime(log.datetime)}</span>
                  </div>
                </div>
                {userRole !== 'leitura' && (
                  <div className="flex items-center gap-1">
                    {log.logType === 'feeding' && log.type !== 'water' && (
                      <button
                        onClick={() => onEditFeeding?.(log as FeedingLog)}
                        className="p-1.5 text-slate-350 hover:text-orange-505 active:scale-90 transition-all rounded-full hover:bg-slate-50 cursor-pointer"
                        title="Editar Mamada"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => onDeleteLog(log.id!, log.logType as any)} className="text-slate-355 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodayScreen;
