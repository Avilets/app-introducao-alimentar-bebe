import React, { useState, useEffect } from 'react';
import { Milk, Clock, Save, X, Calendar, Play } from 'lucide-react';
import type { FeedingType, FeedingLog } from '../types';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import BreastfeedingTimer from '../components/BreastfeedingTimer';

interface FeedBreastScreenProps {
  onSave: (details: {
    id?: string;
    type: FeedingType;
    datetime: string;
    amountMl?: number;
    durationMinutes?: number;
    notes?: string;
    breastSide?: 'left' | 'right' | 'both' | null;
    leftBreastDurationSeconds?: number;
    rightBreastDurationSeconds?: number;
    totalBreastDurationSeconds?: number;
    startedAt?: number;
    endedAt?: number;
  }) => void;
  onCancel: () => void;
  initialFeeding?: FeedingLog | null;
}

export const FeedBreastScreen: React.FC<FeedBreastScreenProps> = ({
  onSave,
  onCancel,
  initialFeeding = null
}) => {
  // Helper to get current local date and time in YYYY-MM-DDTHH:MM
  const getCurrentLocalDatetime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [type, setType] = useState<FeedingType>(initialFeeding?.type || 'breast');
  const [datetime, setDatetime] = useState(initialFeeding?.datetime || getCurrentLocalDatetime());
  const [notes, setNotes] = useState<string>(initialFeeding?.notes || '');
  const [formulaMl, setFormulaMl] = useState<string>(initialFeeding?.amountMl ? String(initialFeeding.amountMl) : '');
  const [error, setError] = useState<string>('');
  
  // Timer and Duration states
  const [leftSeconds, setLeftSeconds] = useState<number>(initialFeeding?.leftBreastDurationSeconds || 0);
  const [rightSeconds, setRightSeconds] = useState<number>(initialFeeding?.rightBreastDurationSeconds || 0);
  const [totalSeconds, setTotalSeconds] = useState<number>(initialFeeding?.totalBreastDurationSeconds || 0);
  const [breastSide, setBreastSide] = useState<'left' | 'right' | 'both' | null>(initialFeeding?.breastSide || null);
  const [startedAt, setStartedAt] = useState<number | undefined>(initialFeeding?.startedAt);
  const [endedAt, setEndedAt] = useState<number | undefined>(initialFeeding?.endedAt);
  
  const [inputMode, setInputMode] = useState<'timer' | 'manual'>(initialFeeding ? 'manual' : 'timer');
  const [autoStartSide, setAutoStartSide] = useState<'left' | 'right' | null>(null);

  // Manual inputs (minutes and seconds)
  const [leftMinInput, setLeftMinInput] = useState<string>(
    initialFeeding?.leftBreastDurationSeconds ? String(Math.floor(initialFeeding.leftBreastDurationSeconds / 60)) : '0'
  );
  const [leftSecInput, setLeftSecInput] = useState<string>(
    initialFeeding?.leftBreastDurationSeconds ? String(initialFeeding.leftBreastDurationSeconds % 60) : '0'
  );
  const [rightMinInput, setRightMinInput] = useState<string>(
    initialFeeding?.rightBreastDurationSeconds ? String(Math.floor(initialFeeding.rightBreastDurationSeconds / 60)) : '0'
  );
  const [rightSecInput, setRightSecInput] = useState<string>(
    initialFeeding?.rightBreastDurationSeconds ? String(initialFeeding.rightBreastDurationSeconds % 60) : '0'
  );

  // Sync manual inputs to seconds states
  useEffect(() => {
    if (inputMode === 'manual') {
      const lMin = Math.max(0, parseInt(leftMinInput) || 0);
      const lSec = Math.max(0, parseInt(leftSecInput) || 0);
      const rMin = Math.max(0, parseInt(rightMinInput) || 0);
      const rSec = Math.max(0, parseInt(rightSecInput) || 0);

      const lTot = lMin * 60 + lSec;
      const rTot = rMin * 60 + rSec;

      setLeftSeconds(lTot);
      setRightSeconds(rTot);
      setTotalSeconds(lTot + rTot);

      let side: 'left' | 'right' | 'both' | null = null;
      if (lTot > 0 && rTot > 0) side = 'both';
      else if (lTot > 0) side = 'left';
      else if (rTot > 0) side = 'right';
      setBreastSide(side);
    }
  }, [leftMinInput, leftSecInput, rightMinInput, rightSecInput, inputMode]);

  const handleTimerChange = (data: {
    leftSeconds: number;
    rightSeconds: number;
    totalSeconds: number;
    breastSide: 'left' | 'right' | 'both' | null;
    startedAt?: number;
    endedAt?: number;
  }) => {
    if (inputMode === 'timer') {
      setLeftSeconds(data.leftSeconds);
      setRightSeconds(data.rightSeconds);
      setTotalSeconds(data.totalSeconds);
      setBreastSide(data.breastSide);
      if (data.startedAt) setStartedAt(data.startedAt);
      if (data.endedAt) setEndedAt(data.endedAt);
      
      // Keep manual inputs in sync
      setLeftMinInput(String(Math.floor(data.leftSeconds / 60)));
      setLeftSecInput(String(data.leftSeconds % 60));
      setRightMinInput(String(Math.floor(data.rightSeconds / 60)));
      setRightSecInput(String(data.rightSeconds % 60));
    }
  };

  const handleQuickStart = () => {
    setDatetime(getCurrentLocalDatetime());
    setInputMode('timer');
    setAutoStartSide('left');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!datetime) {
      setError('Por favor, preencha a data e o horário.');
      return;
    }

    const hasFormula = type === 'formula' || type === 'mixed';
    if (hasFormula && (!formulaMl || parseInt(formulaMl) <= 0)) {
      setError('Por favor, insira a quantidade de fórmula em ml.');
      return;
    }

    const isBreast = type === 'breast' || type === 'mixed';
    
    // Validations
    if (isBreast) {
      if (leftSeconds < 0 || rightSeconds < 0) {
        setError('Os tempos de amamentação não podem ser negativos.');
        return;
      }

      if (totalSeconds === 0 && !notes.trim()) {
        const confirmSave = window.confirm(
          'Você está salvando uma mamada no peito com duração 0 e sem observações. Deseja prosseguir?'
        );
        if (!confirmSave) return;
      }
    }

    setError('');

    // Preenche breastSide com base nos tempos finais
    let finalBreastSide = breastSide;
    if (isBreast) {
      if (leftSeconds > 0 && rightSeconds > 0) finalBreastSide = 'both';
      else if (leftSeconds > 0) finalBreastSide = 'left';
      else if (rightSeconds > 0) finalBreastSide = 'right';
      else finalBreastSide = null;
    } else {
      finalBreastSide = null;
    }

    onSave({
      id: initialFeeding?.id,
      type,
      datetime,
      amountMl: hasFormula && formulaMl ? parseInt(formulaMl) : undefined,
      durationMinutes: isBreast ? Number((totalSeconds / 60).toFixed(1)) : undefined,
      notes: notes.trim() || undefined,
      breastSide: finalBreastSide,
      leftBreastDurationSeconds: isBreast ? leftSeconds : undefined,
      rightBreastDurationSeconds: isBreast ? rightSeconds : undefined,
      totalBreastDurationSeconds: isBreast ? totalSeconds : undefined,
      startedAt: isBreast ? startedAt : undefined,
      endedAt: isBreast ? endedAt : undefined
    });
  };

  const hasFormula = type === 'formula' || type === 'mixed';
  const isBreast = type === 'breast' || type === 'mixed';

  return (
    <div className="flex-1 flex flex-col justify-between p-6">
      <form onSubmit={handleSave} className="space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-[#FF7A00] flex items-center justify-center mx-auto mb-2">
            <Milk className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800">
            {initialFeeding ? 'Editar Registro de Mamada' : 'Registrar Mamada'}
          </h3>
          <p className="text-xs text-slate-400">Registre os detalhes da mamada do bebê.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Registro Rápido */}
        {!initialFeeding && (
          <button
            type="button"
            onClick={handleQuickStart}
            className="w-full py-3 bg-orange-50 hover:bg-orange-100 text-[#FF7A00] font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs border border-orange-200 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Começar mamada agora ⏱️
          </button>
        )}

        {/* Tipo de Leite Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Tipo de Mamada
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { setType('breast'); setError(''); }}
              className={`py-3 px-1 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                type === 'breast'
                  ? 'border-[#FF7A00] bg-[#FF7A00] text-white shadow-sm'
                  : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              Leite Materno
            </button>
            <button
              type="button"
              onClick={() => { setType('formula'); setError(''); }}
              className={`py-3 px-1 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                type === 'formula'
                  ? 'border-[#FF7A00] bg-[#FF7A00] text-white shadow-sm'
                  : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              Fórmula
            </button>
            <button
              type="button"
              onClick={() => { setType('mixed'); setError(''); }}
              className={`py-3 px-1 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                type === 'mixed'
                  ? 'border-[#FF7A00] bg-[#FF7A00] text-white shadow-sm'
                  : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              Misto
            </button>
          </div>
        </div>

        {/* Datetime Input */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Data e Horário
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-350 text-sm font-semibold text-slate-700"
              required
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Seção Leite Materno (Duração com Timer / Manual) */}
        {isBreast && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Amamentação no Peito
              </label>
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setInputMode('timer')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    inputMode === 'timer' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-400'
                  }`}
                >
                  Cronômetro
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('manual')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    inputMode === 'manual' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-400'
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {inputMode === 'timer' ? (
              <BreastfeedingTimer
                onTimerChange={handleTimerChange}
                initialLeftSeconds={leftSeconds}
                initialRightSeconds={rightSeconds}
                autoStartSide={autoStartSide}
              />
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  {/* Manual Esquerdo */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Seio Esquerdo</span>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={leftMinInput === '0' ? '' : leftMinInput}
                        onChange={(e) => setLeftMinInput(e.target.value)}
                        className="w-16 px-2 py-1.5 border border-slate-200 rounded-xl text-center text-sm font-bold focus:outline-none focus:border-orange-350"
                      />
                      <span className="text-xs text-slate-400 font-bold">m</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="Seg"
                        value={leftSecInput === '0' ? '' : leftSecInput}
                        onChange={(e) => setLeftSecInput(e.target.value)}
                        className="w-16 px-2 py-1.5 border border-slate-200 rounded-xl text-center text-sm font-bold focus:outline-none focus:border-orange-350"
                      />
                      <span className="text-xs text-slate-400 font-bold">s</span>
                    </div>
                  </div>

                  {/* Manual Direito */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Seio Direito</span>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={rightMinInput === '0' ? '' : rightMinInput}
                        onChange={(e) => setRightMinInput(e.target.value)}
                        className="w-16 px-2 py-1.5 border border-slate-200 rounded-xl text-center text-sm font-bold focus:outline-none focus:border-orange-350"
                      />
                      <span className="text-xs text-slate-400 font-bold">m</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="Seg"
                        value={rightSecInput === '0' ? '' : rightSecInput}
                        onChange={(e) => setRightSecInput(e.target.value)}
                        className="w-16 px-2 py-1.5 border border-slate-200 rounded-xl text-center text-sm font-bold focus:outline-none focus:border-orange-350"
                      />
                      <span className="text-xs text-slate-400 font-bold">s</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-3 flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>Duração Total Calculada:</span>
                  <span className="font-mono text-sm text-slate-800">
                    {Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Fórmula (ML) */}
        {hasFormula && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Quantidade de Leite / Fórmula (ml)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="Ex: 60, 90, 120"
                value={formulaMl}
                onChange={(e) => { setFormulaMl(e.target.value); setError(''); }}
                className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-350 text-sm font-semibold"
                required
              />
              <Clock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Input Notas */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Observações
          </label>
          <textarea
            rows={3}
            placeholder="Ex: Sugou bem em ambos os lados, regurgitou um pouquinho..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-355 text-sm"
          />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          
          <button
            type="submit"
            className="py-3.5 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-orange-100 text-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {initialFeeding ? 'Atualizar' : 'Salvar'}
          </button>
        </div>

        <MedicalDisclaimer type="alimentacao" className="mt-4" />
      </form>
    </div>
  );
};

export default FeedBreastScreen;
