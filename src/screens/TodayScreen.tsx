import React, { useState } from 'react';
import type { Baby, FeedingLog, FruitLog, MealLog, Reminder } from '../types';
import { Milk, Apple, Utensils, Droplet, Check, Trash2, Clock, Power } from 'lucide-react';
import { getTodaySummary, isToday } from '../services/summaryService';

interface TodayScreenProps {
  baby: Baby;
  feedings: FeedingLog[];
  fruits: FruitLog[];
  meals: MealLog[];
  reminders: Reminder[];
  onNavigate: (screen: string) => void;
  onAddWaterLog: (ml: number) => void;
  onDeleteLog: (id: string) => void;
  onCompleteReminder: (reminder: Reminder) => void;
  onToggleReminder: (id: string) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  baby,
  feedings,
  fruits,
  meals,
  reminders,
  onNavigate,
  onAddWaterLog,
  onDeleteLog,
  onCompleteReminder,
  onToggleReminder
}) => {
  const [waterAmount, setWaterAmount] = useState(50);
  const [showWaterSuccess, setShowWaterSuccess] = useState(false);

  // Helper: Calculate baby's age in months and days
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

    if (totalMonths === 0) {
      return `${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
    
    if (days === 0) {
      return `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'}`;
    }
    
    return `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'} e ${days} ${days === 1 ? 'dia' : 'dias'}`;
  };

  // Calculate today's summary using the summary service
  const summary = getTodaySummary(feedings, fruits, meals);

  // Combine and filter today's logs for the timeline
  const todayFeedings = feedings.filter(f => isToday(f.datetime)).map(f => ({ ...f, logType: 'feeding' as const }));
  const todayFruits = fruits.filter(fr => isToday(fr.datetime)).map(fr => ({ ...fr, logType: 'fruit' as const }));
  const todayMeals = meals.filter(m => isToday(m.datetime)).map(m => ({ ...m, logType: 'meal' as const }));

  const todayLogs = [...todayFeedings, ...todayFruits, ...todayMeals].sort((a, b) => 
    b.datetime.localeCompare(a.datetime)
  );

  const handleQuickWater = () => {
    onAddWaterLog(waterAmount);
    setShowWaterSuccess(true);
    setTimeout(() => setShowWaterSuccess(false), 2000);
  };

  const getFormatTime = (datetimeStr: string) => {
    if (!datetimeStr) return '';
    const timePart = datetimeStr.split('T')[1]; // HH:MM
    return timePart || '';
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-4 space-y-5">
      {/* Baby Header Card */}
      <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl p-5 text-white shadow-md shadow-orange-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-100 font-bold">Meu Bebê</span>
          <h2 className="text-2xl font-black mt-0.5">{baby.name}</h2>
          <p className="text-xs text-orange-50 font-semibold mt-1">
            Idade: {calculateAge(baby.birthDate)}
          </p>
        </div>
        <div className="text-4xl">
          {baby.gender === 'girl' ? '👧' : baby.gender === 'boy' ? '👦' : '👶'}
        </div>
      </div>

      {/* Widget de Lembretes do Dia */}
      {(reminders.filter(r => r.active && r.nextTriggerAt > 0 && r.nextTriggerAt <= Date.now()).length > 0 ||
        reminders.filter(r => r.active && r.nextTriggerAt > Date.now()).length > 0 ||
        reminders.filter(r => {
          if (!r.lastCompletedAt) return false;
          const compDate = new Date(r.lastCompletedAt);
          const today = new Date();
          return compDate.getDate() === today.getDate() &&
                 compDate.getMonth() === today.getMonth() &&
                 compDate.getFullYear() === today.getFullYear();
        }).length > 0) && (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">⏰ Lembretes e Rotina</span>
            <button 
              onClick={() => onNavigate('reminders')}
              className="text-xs text-pink-500 font-bold hover:underline cursor-pointer"
            >
              Configurar
            </button>
          </h3>
          
          {/* Vencidos (Urgentes) */}
          {reminders.filter(r => r.active && r.nextTriggerAt > 0 && r.nextTriggerAt <= Date.now()).length > 0 ? (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-rose-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  {reminders.filter(r => r.active && r.nextTriggerAt > 0 && r.nextTriggerAt <= Date.now()).length} Lembrete(s) Pendente(s)!
                </span>
              </div>
              
              {reminders.filter(r => r.active && r.nextTriggerAt > 0 && r.nextTriggerAt <= Date.now()).slice(0, 2).map(r => (
                <div key={r.id} className="flex items-center justify-between gap-2 bg-white/70 border border-rose-200/50 p-2.5 rounded-xl">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-850 block truncate">{r.title}</span>
                    <span className="text-[10px] text-rose-600 font-bold">
                      Atrasado desde: {r.mode === 'fixed' ? r.fixedTime : new Date(r.nextTriggerAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onCompleteReminder(r)}
                      className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg active:scale-90 transition-transform cursor-pointer flex items-center justify-center"
                      title="Concluir Lembrete"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleReminder(r.id!)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-rose-600 rounded-lg active:scale-90 transition-transform cursor-pointer flex items-center justify-center"
                      title="Desativar Lembrete (Parar)"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {reminders.filter(r => r.active && r.nextTriggerAt > 0 && r.nextTriggerAt <= Date.now()).length > 2 && (
                <p className="text-[9px] text-rose-500 font-bold text-center">
                  E mais {reminders.filter(r => r.active && r.nextTriggerAt > 0 && r.nextTriggerAt <= Date.now()).length - 2} lembrete(s)...
                </p>
              )}
            </div>
          ) : (
            /* Próximo Lembrete */
            reminders.filter(r => r.active && r.nextTriggerAt > Date.now()).length > 0 && (
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-indigo-600 text-[9px] font-bold uppercase tracking-wider block">Próxima Atividade</span>
                  <h4 className="text-xs font-bold text-slate-800 mt-0.5">{reminders.filter(r => r.active && r.nextTriggerAt > Date.now())[0].title}</h4>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                    Agendado para: {new Date(reminders.filter(r => r.active && r.nextTriggerAt > Date.now())[0].nextTriggerAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            )
          )}
          
          {/* Concluídos do dia */}
          {reminders.filter(r => {
            if (!r.lastCompletedAt) return false;
            const compDate = new Date(r.lastCompletedAt);
            const today = new Date();
            return compDate.getDate() === today.getDate() &&
                   compDate.getMonth() === today.getMonth() &&
                   compDate.getFullYear() === today.getFullYear();
          }).length > 0 && (
            <div className="flex items-center gap-1 pl-1 text-[10px] text-emerald-600 font-bold">
              <span>✓</span>
              <span>{reminders.filter(r => {
                if (!r.lastCompletedAt) return false;
                const compDate = new Date(r.lastCompletedAt);
                const today = new Date();
                return compDate.getDate() === today.getDate() &&
                       compDate.getMonth() === today.getMonth() &&
                       compDate.getFullYear() === today.getFullYear();
              }).length} lembrete(s) concluído(s) hoje</span>
            </div>
          )}
        </div>
      )}

      {/* Today's Metas summary widgets */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
          <span>🎯</span> Resumo de Hoje
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Mamadas */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/50">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Milk className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block leading-none">Mamadas</span>
              <span className="text-base font-black text-slate-800 mt-1 block leading-none">{summary.totalBreastfeedings}</span>
              {summary.totalFormulaMl > 0 && (
                <span className="text-[9px] text-amber-700 font-bold mt-0.5 block">{summary.totalFormulaMl}ml fórmula</span>
              )}
            </div>
          </div>

          {/* Refeições prato */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50/50">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block leading-none">Refeições</span>
              <span className="text-base font-black text-slate-800 mt-1 block leading-none">{summary.mealsCount} pratos</span>
              <span className="text-[9px] text-teal-700 font-bold mt-0.5 block">meta: 2</span>
            </div>
          </div>
        </div>

        {/* Frutas de hoje */}
        <div className="mt-3 p-3 rounded-2xl bg-pink-50/50 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
            <Apple className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold block leading-none">Frutas Oferecidas</span>
            <p className="text-xs font-semibold text-slate-700 mt-1 truncate">
              {summary.fruitsOffered.length > 0 
                ? summary.fruitsOffered.join(', ')
                : 'Nenhuma fruta ainda'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Quick register buttons */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3">Registrar Alimentação</h3>
        <div className="grid grid-cols-3 gap-3">
          {/* Mamada */}
          <button
            onClick={() => onNavigate('feed-breast')}
            className="p-4 rounded-3xl bg-amber-50 border border-amber-100 text-amber-800 flex flex-col items-center justify-center gap-2 font-bold hover:bg-amber-100 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center">
              <Milk className="w-5 h-5" />
            </div>
            <span className="text-xs">Mamada</span>
          </button>

          {/* Fruta */}
          <button
            onClick={() => onNavigate('feed-fruit')}
            className="p-4 rounded-3xl bg-pink-50 border border-pink-100 text-pink-800 flex flex-col items-center justify-center gap-2 font-bold hover:bg-pink-100 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center">
              <Apple className="w-5 h-5" />
            </div>
            <span className="text-xs">Fruta</span>
          </button>

          {/* Refeição */}
          <button
            onClick={() => onNavigate('feed-meal')}
            className="p-4 rounded-3xl bg-teal-50 border border-teal-100 text-teal-800 flex flex-col items-center justify-center gap-2 font-bold hover:bg-teal-100 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-xs">Refeição</span>
          </button>
        </div>
      </div>

      {/* Water logger */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-3xl p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
            <Droplet className="w-4 h-4 fill-current" />
          </div>
          <h3 className="text-sm font-bold text-blue-900">Registrar Água Rápido</h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 grid grid-cols-3 gap-2">
            {[30, 50, 100].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setWaterAmount(amount)}
                className={`py-2 px-1 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  waterAmount === amount
                    ? 'border-blue-400 bg-blue-500 text-white shadow-sm'
                    : 'border-blue-200 bg-white text-blue-700'
                }`}
              >
                {amount}ml
              </button>
            ))}
          </div>

          <button
            onClick={handleQuickWater}
            className={`py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-1.5 text-xs text-white active:scale-95 transition-all min-w-[90px] cursor-pointer ${
              showWaterSuccess ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {showWaterSuccess ? <Check className="w-4 h-4" /> : <Droplet className="w-4 h-4" />}
            {showWaterSuccess ? 'Salvo!' : 'Adicionar'}
          </button>
        </div>
      </div>

      {/* Last Activities summary cards */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Últimas Atividades</h3>
        <div className="space-y-2 text-xs">
          {/* Last feeding */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
            <div className="flex items-center gap-2">
              <Milk className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-slate-700">Última Mamada:</span>
              <span className="text-slate-500">
                {summary.lastBreastfeeding 
                  ? (summary.lastBreastfeeding.type === 'breast' ? 'Leite Materno' : `Fórmula: ${summary.lastBreastfeeding.amountMl}ml`)
                  : 'Nenhum registro'
                }
              </span>
            </div>
            {summary.lastBreastfeeding && (
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> {getFormatTime(summary.lastBreastfeeding.datetime)}
              </span>
            )}
          </div>

          {/* Last fruit */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
            <div className="flex items-center gap-2">
              <Apple className="w-4 h-4 text-pink-500" />
              <span className="font-semibold text-slate-700">Última Fruta:</span>
              <span className="text-slate-500">
                {summary.lastFruit ? summary.lastFruit.fruitName : 'Nenhum registro'}
              </span>
            </div>
            {summary.lastFruit && (
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> {getFormatTime(summary.lastFruit.datetime)}
              </span>
            )}
          </div>

          {/* Last meal */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-teal-600" />
              <span className="font-semibold text-slate-700">Último Prato:</span>
              <span className="text-slate-500">
                {summary.lastMeal ? `${summary.lastMeal.foodName} (${summary.lastMeal.category})` : 'Nenhum registro'}
              </span>
            </div>
            {summary.lastMeal && (
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> {getFormatTime(summary.lastMeal.datetime)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Today's activities timeline */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
          <span>📋 Linha do Tempo de Hoje</span>
          <span className="text-xs text-slate-400 font-semibold">{todayLogs.length} itens</span>
        </h3>

        {todayLogs.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
            <p className="text-sm font-medium">Nenhum registro hoje.</p>
            <p className="text-xs mt-1">Toque nos botões acima para registrar!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayLogs.map((log) => {
              const timeStr = getFormatTime(log.datetime);
              let label = '';
              let desc = '';
              let color = '';
              let icon = null;

              switch (log.logType) {
                case 'feeding':
                  const fLog = log as FeedingLog;
                  label = fLog.type === 'water' ? 'Água' : 'Mamada';
                  color = fLog.type === 'water' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-amber-100 text-amber-800 border-amber-200';
                  icon = fLog.type === 'water' ? <Droplet className="w-3.5 h-3.5" /> : <Milk className="w-3.5 h-3.5" />;
                  desc = fLog.type === 'water' 
                    ? `Tomou ${fLog.amountMl}ml de água`
                    : fLog.type === 'breast'
                      ? `Leite Materno ${fLog.durationMinutes ? `(${fLog.durationMinutes} min)` : ''}`
                      : `${fLog.type === 'formula' ? 'Fórmula' : 'Misto'}: ${fLog.amountMl}ml`;
                  break;
                case 'fruit':
                  const frLog = log as FruitLog;
                  label = 'Fruta';
                  color = 'bg-pink-100 text-pink-800 border-pink-200';
                  icon = <Apple className="w-3.5 h-3.5" />;
                  desc = `${frLog.fruitName}${frLog.fruitType ? ` (${frLog.fruitType})` : ''} (${frLog.quantity})`;
                  break;
                case 'meal':
                  const mLog = log as MealLog;
                  label = 'Refeição';
                  color = 'bg-teal-100 text-teal-800 border-teal-200';
                  icon = <Utensils className="w-3.5 h-3.5" />;
                  desc = `${mLog.foodName} - ${mLog.texture}`;
                  break;
              }

              return (
                <div
                  key={log.id}
                  className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color.split(' ')[0]} ${color.split(' ')[1]}`}>
                      {icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">{label}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{timeStr}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-tight">{desc}</p>
                      {log.notes && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">"{log.notes}"</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteLog(log.id!)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 active:scale-90 transition-all rounded-full hover:bg-slate-50 cursor-pointer"
                    aria-label="Excluir Registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayScreen;
