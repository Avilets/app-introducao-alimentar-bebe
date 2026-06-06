import React, { useState } from 'react';
import { Milk, Apple, Utensils, Droplet, Trash2, Clock } from 'lucide-react';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';
import type { FeedingLog, FruitLog, MealLog } from '../types';
import { getTodaySummary, isToday } from '../services/summaryService';

interface AlimentacaoScreenProps {
  feedings: FeedingLog[];
  fruits: FruitLog[];
  meals: MealLog[];
  userRole?: 'admin' | 'cuidador' | 'leitura';
  onNavigate: (screen: string) => void;
  onAddWaterLog: (ml: number) => void;
  onDeleteLog: (id: string, logType: 'feeding' | 'fruit' | 'meal') => void;
}

export const AlimentacaoScreen: React.FC<AlimentacaoScreenProps> = ({
  feedings,
  fruits,
  meals,
  userRole = 'admin',
  onNavigate,
  onAddWaterLog,
  onDeleteLog
}) => {
  const [waterAmount, setWaterAmount] = useState(50);
  const [showWaterSuccess, setShowWaterSuccess] = useState(false);

  // Calculate today's summaries
  const summary = getTodaySummary(feedings, fruits, meals);

  // Calculate total water locally
  const totalWaterMl = feedings
    .filter(f => isToday(f.datetime) && f.type === 'water')
    .reduce((sum, f) => sum + (f.amountMl || 0), 0);

  // Filter today's items
  const todayFeedings = feedings.filter(f => isToday(f.datetime)).map(f => ({ ...f, logType: 'feeding' as const }));
  const todayFruits = fruits.filter(fr => isToday(fr.datetime)).map(fr => ({ ...fr, logType: 'fruit' as const }));
  const todayMeals = meals.filter(m => isToday(m.datetime)).map(m => ({ ...m, logType: 'meal' as const }));

  // Combine and sort today's logs by time decrescendo
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
    const timePart = datetimeStr.split('T')[1];
    return timePart || '';
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-4 space-y-5">
      {/* Header Info */}
      <div className="text-center py-2">
        <h2 className="text-xl font-black text-slate-800">Alimentação do Bebê</h2>
        <p className="text-xs text-slate-500 mt-0.5">Registre e acompanhe a rotina alimentar</p>
      </div>

      {/* Quick Access Buttons */}
      {userRole !== 'leitura' && (
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate('feed-breast')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-orange-100 hover:border-orange-200 rounded-3xl shadow-sm text-center transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center mb-2">
              <Milk className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-700">Mamar</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Leite / Fórmula</span>
          </button>

          <button
            onClick={() => onNavigate('feed-fruit')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-orange-100 hover:border-orange-200 rounded-3xl shadow-sm text-center transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center mb-2">
              <Apple className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-700">Frutinha</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Lanche / Sobremesa</span>
          </button>

          <button
            onClick={() => onNavigate('feed-meal')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-orange-100 hover:border-orange-200 rounded-3xl shadow-sm text-center transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center mb-2">
              <Utensils className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-700">Refeição</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Almoço / Jantar</span>
          </button>
        </div>
      )}

      {/* Water Intake Section */}
      {userRole !== 'leitura' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 leading-none">
              <Droplet className="w-4 h-4 text-blue-500" />
              Consumo de Água
            </h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
              {totalWaterMl} ml hoje
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 grid grid-cols-3 gap-1.5">
              {[50, 100, 150].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setWaterAmount(amount)}
                  className={`py-2 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                    waterAmount === amount
                      ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                      : 'bg-white border-slate-150 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {amount}ml
                </button>
              ))}
            </div>

            <button
              onClick={handleQuickWater}
              disabled={showWaterSuccess}
              className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 ${
                showWaterSuccess
                  ? 'bg-emerald-500 text-white shadow-emerald-100'
                  : 'bg-[#FF7A00] hover:bg-orange-600 text-white shadow-orange-100'
              }`}
            >
              {showWaterSuccess ? 'Registrado! ✓' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      {/* Today's Metas Summary Dashboard */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 leading-none">
          <span>🎯</span> Resumo de Acompanhamento
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-amber-50/50 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">TOTAL MAMADAS</span>
            <span className="text-lg font-black text-slate-800">{summary.totalBreastfeedings} vezes</span>
            {summary.totalFormulaMl > 0 && (
              <span className="text-[9px] text-amber-700 font-bold block">{summary.totalFormulaMl}ml fórmula</span>
            )}
          </div>
          
          <div className="p-3 bg-teal-50/50 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">REFEIÇÕES PAPINHAS</span>
            <span className="text-lg font-black text-slate-800">{summary.mealsCount} pratos</span>
            <span className="text-[9px] text-teal-700 font-bold block">Refeições sólidas</span>
          </div>
        </div>

        {summary.fruitsOffered.length > 0 && (
          <div className="p-3 bg-pink-50/50 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold block">FRUTAS OFERECIDAS HOJE</span>
            <span className="text-xs font-bold text-slate-700 mt-1 block">
              {summary.fruitsOffered.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Today's logs list */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-850 pl-1">Consumo Recente (Hoje)</h3>
        {todayLogs.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center space-y-1 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">Nenhum registro alimentar para hoje.</p>
            <p className="text-[10px] text-slate-450">Use os botões no topo para cadastrar mamadas, frutinhas e refeições.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayLogs.map((log) => {
              const formattedTime = getFormatTime(log.datetime);
              return (
                <div
                  key={log.id}
                  className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      log.logType === 'feeding' 
                        ? log.type === 'water' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-600'
                        : log.logType === 'fruit' ? 'bg-pink-50 text-pink-500' : 'bg-teal-50 text-teal-600'
                    }`}>
                      {log.logType === 'feeding' ? (
                        log.type === 'water' ? <Droplet className="w-5 h-5" /> : <Milk className="w-5 h-5" />
                      ) : log.logType === 'fruit' ? (
                        <Apple className="w-5 h-5" />
                      ) : (
                        <Utensils className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          {log.logType === 'feeding' ? (
                            log.type === 'breast' ? 'Amamentação (Seio)' : log.type === 'water' ? 'Água Consumida' : 'Fórmula/Misto'
                          ) : log.logType === 'fruit' ? (
                            `Fruta: ${(log as FruitLog).fruitName}`
                          ) : (
                            `Refeição: ${(log as MealLog).foodName}`
                          )}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {formattedTime}
                        </span>
                      </div>
                      
                      {/* Secondary description */}
                      <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                        {log.logType === 'feeding' && (
                          log.type === 'breast'
                            ? `Duração: ${log.durationMinutes || '--'} min`
                            : `${log.amountMl || '--'} ml`
                        )}
                        {log.logType === 'fruit' && (
                          `Quantidade: ${(log as FruitLog).quantity} | Aceitação: ${(log as FruitLog).reaction}`
                        )}
                        {log.logType === 'meal' && (
                          `Textura: ${(log as MealLog).texture} | Aceitação: ${(log as MealLog).reaction}`
                        )}
                      </p>

                      {log.notes && (
                        <p className="text-[9px] text-slate-450 italic mt-0.5 truncate max-w-[220px]">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {userRole !== 'leitura' && (
                    <button
                      onClick={() => onDeleteLog(log.id!, log.logType)}
                      className="p-1.5 hover:bg-slate-50 text-slate-350 hover:text-rose-500 rounded-lg transition-colors active:scale-90 cursor-pointer"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MedicalDisclaimer type="alimentacao" className="mt-4 shrink-0" />
    </div>
  );
};

export default AlimentacaoScreen;
