import React, { useState, useEffect } from 'react';
import { Moon, Plus, Trash2, Play, Square, X, Info } from 'lucide-react';
import type { Baby, SleepRecord } from '../types';
import { getActiveSleepRecord, calculateHoursSleptToday } from '../services/sleepService';

interface SleepScreenProps {
  baby: Baby;
  sleepRecords: SleepRecord[];
  userRole?: 'admin' | 'cuidador' | 'leitura';
  onSaveRecord: (record: Omit<SleepRecord, 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
}

export const SleepScreen: React.FC<SleepScreenProps> = ({
  baby,
  sleepRecords,
  userRole = 'admin',
  onSaveRecord,
  onDeleteRecord
}) => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SleepRecord | null>(null);

  // Form states
  const [sleepType, setSleepType] = useState<'soneca' | 'sono noturno'>('soneca');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState<'berço' | 'colo' | 'carrinho' | 'cama compartilhada' | 'outro'>('berço');
  const [notes, setNotes] = useState('');

  // Active sleep state (if any record does not have endDateTime)
  const activeSleep = getActiveSleepRecord(sleepRecords);
  const [activeDurationText, setActiveDurationText] = useState('00:00:00');

  // Sync active sleep duration timer
  useEffect(() => {
    if (!activeSleep) return;

    const interval = setInterval(() => {
      const startMs = new Date(activeSleep.startDateTime).getTime();
      const nowMs = Date.now();
      const diffMs = Math.max(0, nowMs - startMs);

      const hours = Math.floor(diffMs / (3600 * 1000));
      const minutes = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diffMs % (60 * 1000)) / 1000);

      const pad = (n: number) => String(n).padStart(2, '0');
      setActiveDurationText(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSleep]);

  // Handle start timer
  const handleStartSleepTimer = async (type: 'soneca' | 'sono noturno') => {
    try {
      const now = new Date();
      // Format to YYYY-MM-DDTHH:MM:SS local
      const offset = now.getTimezoneOffset();
      const localTime = new Date(now.getTime() - offset * 60 * 1000);
      const isoLocal = localTime.toISOString().slice(0, 19);

      await onSaveRecord({
        babyId: baby.id || 'baby-1',
        sleepType: type,
        startDateTime: isoLocal,
        location: 'berço',
        notes: ''
      });
    } catch (error) {
      console.error('Erro ao iniciar sono:', error);
    }
  };

  // Handle stop timer
  const handleStopSleepTimer = async () => {
    if (!activeSleep) return;
    try {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const localTime = new Date(now.getTime() - offset * 60 * 1000);
      const isoLocal = localTime.toISOString().slice(0, 19);

      await onSaveRecord({
        ...activeSleep,
        endDateTime: isoLocal
      });
    } catch (error) {
      console.error('Erro ao parar sono:', error);
    }
  };

  // Open form modal for new record
  const handleOpenNewForm = () => {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = now.toTimeString().slice(0, 5);

    // Initial end times as well
    setSleepType('soneca');
    setStartDate(formattedDate);
    setStartTime(formattedTime);
    setEndDate(formattedDate);
    setEndTime(formattedTime);
    setLocation('berço');
    setNotes('');
    setEditingRecord(null);
    setShowFormModal(true);
  };

  // Open form modal to edit existing record
  const handleOpenEditForm = (rec: SleepRecord) => {
    setEditingRecord(rec);
    setSleepType(rec.sleepType);
    
    const [sDate, sTime] = rec.startDateTime.split('T');
    setStartDate(sDate);
    setStartTime(sTime ? sTime.slice(0, 5) : '00:00');

    if (rec.endDateTime) {
      const [eDate, eTime] = rec.endDateTime.split('T');
      setEndDate(eDate);
      setEndTime(eTime ? eTime.slice(0, 5) : '00:00');
    } else {
      setEndDate('');
      setEndTime('');
    }

    setLocation(rec.location);
    setNotes(rec.notes || '');
    setShowFormModal(true);
  };

  // Submit form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !startTime) {
      alert('Data e hora de início são obrigatórias.');
      return;
    }

    const startDateTime = `${startDate}T${startTime}`;
    const endDateTime = endDate && endTime ? `${endDate}T${endTime}` : undefined;

    if (endDateTime && new Date(endDateTime) < new Date(startDateTime)) {
      alert('A hora de término não pode ser anterior à hora de início.');
      return;
    }

    try {
      await onSaveRecord({
        id: editingRecord?.id,
        babyId: baby.id || 'baby-1',
        sleepType,
        startDateTime,
        endDateTime,
        location,
        notes
      });
      setShowFormModal(false);
    } catch (error) {
      console.error('Erro ao salvar registro de sono:', error);
    }
  };

  // Process sleep data for the last 7 days chart
  const getChartData = () => {
    const dataList = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 3600 * 1000);
      const dayStr = d.toISOString().split('T')[0];
      
      // Calculate sum of minutes slept starting on this day
      let totalMinutes = 0;
      sleepRecords.forEach(r => {
        if (r.durationMinutes && r.startDateTime.startsWith(dayStr)) {
          totalMinutes += r.durationMinutes;
        }
      });

      const hours = Number((totalMinutes / 60).toFixed(1));
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0, 3).toUpperCase();
      
      dataList.push({
        dayStr,
        weekday,
        hours
      });
    }

    return dataList;
  };

  const chartData = getChartData();
  const maxHoursInChart = Math.max(8, ...chartData.map(d => d.hours));

  // Today stats
  const totalHoursToday = calculateHoursSleptToday(sleepRecords);

  return (
    <div className="flex-1 flex flex-col px-4 py-4 space-y-5">
      {/* Title */}
      <div className="text-center py-1">
        <h2 className="text-xl font-black text-slate-800">Sono do Bebê</h2>
        <p className="text-xs text-slate-500 mt-0.5">Monitore sonecas e noites de descanso</p>
      </div>

      {/* Active sleep monitoring widget */}
      {activeSleep ? (
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col items-center text-center relative overflow-hidden animate-pulse border border-indigo-800">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl translate-x-4 -translate-y-4" />
          <Moon className="w-10 h-10 text-indigo-300 animate-bounce" />
          <span className="text-xs font-bold text-indigo-200 mt-3 uppercase tracking-widest leading-none">Maya Dormindo...</span>
          <span className="text-3xl font-black mt-2 font-mono tracking-tight">{activeDurationText}</span>
          <p className="text-[10px] text-indigo-300 mt-1">
            Tipo: {activeSleep.sleepType === 'soneca' ? 'Soneca' : 'Sono Noturno'} • Iniciou às {activeSleep.startDateTime.split('T')[1]?.slice(0, 5)}
          </p>

          {userRole !== 'leitura' && (
            <button
              onClick={handleStopSleepTimer}
              className="mt-5 py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-2xl text-xs active:scale-95 transition-all shadow-lg shadow-rose-900/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" /> Acordou!
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center py-6 space-y-4">
          <Moon className="w-10 h-10 text-orange-500" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-700">Dormindo agora?</h4>
            <p className="text-[10px] text-slate-400 max-w-[200px]">
              {userRole === 'leitura' ? 'Acompanhe o histórico do sono do bebê abaixo.' : 'Inicie o cronômetro para medir o sono do bebê em tempo real.'}
            </p>
          </div>
          {userRole !== 'leitura' && (
            <div className="flex gap-3">
              <button
                onClick={() => handleStartSleepTimer('soneca')}
                className="py-2.5 px-4 bg-orange-100 hover:bg-orange-200 text-orange-600 font-extrabold rounded-2xl text-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-orange-650" /> Iniciar Soneca
              </button>
              <button
                onClick={() => handleStartSleepTimer('sono noturno')}
                className="py-2.5 px-4 bg-indigo-550 hover:bg-indigo-650 text-white font-extrabold rounded-2xl text-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Iniciar Sono Noturno
              </button>
            </div>
          )}
        </div>
      )}

      {/* SVG Bar Chart for 7 Days Sleep Hours */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-none">Horas Dormidas</h3>
            <span className="text-[10px] text-slate-400 mt-1 block">Últimos 7 dias (horas totais/dia)</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-650 block leading-none">Hoje</span>
            <span className="text-lg font-black text-[#FF7A00]">{totalHoursToday}h</span>
          </div>
        </div>

        {/* Custom SVG Bar Graph */}
        <div className="relative">
          <svg viewBox="0 0 400 150" className="w-full h-auto overflow-visible select-none">
            {/* Horizontal lines */}
            {[0.25, 0.5, 0.75, 1.0].map((ratio, idx) => (
              <line
                key={idx}
                x1="25"
                y1={120 - ratio * 100}
                x2="385"
                y2={120 - ratio * 100}
                stroke="#f8fafc"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            ))}

            {/* Y axis labels */}
            {[0, Math.round(maxHoursInChart / 2), Math.round(maxHoursInChart)].map((val, idx) => (
              <text
                key={idx}
                x="15"
                y={124 - (idx * 50)}
                className="text-[9px] font-bold text-slate-400 fill-current text-right"
                textAnchor="end"
              >
                {val}h
              </text>
            ))}

            {/* Bars rendering */}
            {chartData.map((d, idx) => {
              const barWidth = 24;
              const spacing = (360 - barWidth * 7) / 6;
              const x = 30 + idx * (barWidth + spacing);
              const barHeight = (d.hours / maxHoursInChart) * 100;
              const y = 120 - barHeight;

              const isTodayBar = idx === 6;

              return (
                <g key={d.dayStr}>
                  {/* Hover background target */}
                  <rect
                    x={x - 4}
                    y="10"
                    width={barWidth + 8}
                    height="120"
                    fill="transparent"
                    className="hover:fill-slate-50/20 cursor-pointer"
                  />

                  {/* SVG Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(3, barHeight)}
                    rx="6"
                    className={isTodayBar ? 'fill-orange-500' : 'fill-slate-200 hover:fill-orange-400 transition-colors'}
                  />

                  {/* Value on top of bar if > 0 */}
                  {d.hours > 0 && (
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      textAnchor="middle"
                      className="text-[8px] font-black text-slate-700 fill-current"
                    >
                      {d.hours}
                    </text>
                  )}

                  {/* X Axis Date Label */}
                  <text
                    x={x + barWidth / 2}
                    y="136"
                    textAnchor="middle"
                    className={`text-[9px] font-bold fill-current ${isTodayBar ? 'text-orange-500 font-extrabold' : 'text-slate-400'}`}
                  >
                    {d.weekday}
                  </text>
                </g>
              );
            })}

            {/* Baseline */}
            <line x1="20" y1="120" x2="390" y2="120" stroke="#f1f5f9" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Sleep Log and Actions */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold text-slate-800">Registros Recentes</h3>
          {userRole !== 'leitura' && (
            <button
              onClick={handleOpenNewForm}
              className="text-xs text-[#FF7A00] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Registrar Manual
            </button>
          )}
        </div>

        {sleepRecords.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
            <p className="text-xs font-semibold text-slate-400">Nenhum registro de sono ainda.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sleepRecords.map((rec) => {
              const [sDate, sTime] = rec.startDateTime.split('T');
              const formattedDate = sDate.split('-').reverse().join('/');
              const formattedStart = sTime ? sTime.slice(0, 5) : '00:00';
              const formattedEnd = rec.endDateTime ? rec.endDateTime.split('T')[1]?.slice(0, 5) : null;

              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    if (userRole === 'leitura') return;
                    handleOpenEditForm(rec);
                  }}
                  className={`bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 transition-colors ${
                    userRole === 'leitura' ? '' : 'hover:border-orange-100 cursor-pointer active:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      rec.sleepType === 'soneca' ? 'bg-orange-50 text-orange-500' : 'bg-indigo-50 text-indigo-500'
                    }`}>
                      <Moon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          {rec.sleepType === 'soneca' ? 'Soneca' : 'Sono Noturno'}
                        </span>
                        <span className="text-[9px] text-slate-450 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md uppercase">
                          {rec.location}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 flex-wrap">
                        <span className="font-semibold">{formattedDate}</span>
                        <span>•</span>
                        <span>{formattedStart} às {formattedEnd || 'Dormindo...'}</span>
                        {rec.durationMinutes && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-orange-650">{rec.durationMinutes} min</span>
                          </>
                        )}
                      </div>

                      {rec.notes && (
                        <p className="text-[9px] text-slate-400 italic mt-1.5 truncate max-w-[200px]">
                          "{rec.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {rec.id && userRole !== 'leitura' && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm('Tem certeza que deseja remover este registro?')) {
                          await onDeleteRecord(rec.id!);
                        }
                      }}
                      className="p-1.5 hover:bg-slate-50 text-slate-350 hover:text-rose-500 rounded-lg transition-colors active:scale-90 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Aviso de Rotina de Sono */}
        <div className="p-4 border border-[#FF7E09]/10 bg-[#FFF8F0]/50 rounded-3xl flex items-start gap-3 mt-4 shrink-0">
          <Info className="w-4.5 h-4.5 text-[#FF7A00] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-[#FF7A00]">
              Informativo de Rotina
            </h5>
            <p className="text-xs leading-relaxed font-medium text-slate-750">
              Os registros servem apenas para acompanhamento da rotina. O aplicativo não avalia a suficiência ou a adequação do padrão de sono do bebê.
            </p>
          </div>
        </div>
      </div>

      {/* Manual Entry Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-800">
                {editingRecord ? 'Editar Registro' : 'Novo Registro de Sono'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 text-slate-450 hover:text-slate-650 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 overflow-y-auto">
              {/* Sleep Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Sono</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSleepType('soneca')}
                    className={`py-2 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                      sleepType === 'soneca'
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Soneca
                  </button>
                  <button
                    type="button"
                    onClick={() => setSleepType('sono noturno')}
                    className={`py-2 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                      sleepType === 'sono noturno'
                        ? 'bg-indigo-900 border-indigo-900 text-white'
                        : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Sono Noturno
                  </button>
                </div>
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Data Início</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hora Início</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Data Fim (opcional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hora Fim (opcional)</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Local do Sono</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as any)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl bg-white outline-none focus:border-orange-500"
                >
                  <option value="berço">Berço</option>
                  <option value="colo">Colo</option>
                  <option value="carrinho">Carrinho</option>
                  <option value="cama compartilhada">Cama compartilhada</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Demorou a pegar no sono, acordou assustado..."
                  className="w-full text-xs font-medium p-2.5 border border-slate-150 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 h-20 resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-3 border border-slate-150 text-slate-500 font-bold rounded-2xl text-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-2xl text-xs active:scale-95 transition-all shadow-md shadow-orange-100 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SleepScreen;
