import React, { useState } from 'react';
import { Milk, Clock, Save, X, Calendar } from 'lucide-react';
import type { FeedingType } from '../types';

interface FeedBreastScreenProps {
  onSave: (details: {
    type: FeedingType;
    datetime: string;
    amountMl?: number;
    durationMinutes?: number;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export const FeedBreastScreen: React.FC<FeedBreastScreenProps> = ({
  onSave,
  onCancel
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

  const [type, setType] = useState<FeedingType>('breast');
  const [datetime, setDatetime] = useState(getCurrentLocalDatetime());
  const [leftMinutes, setLeftMinutes] = useState<number>(0);
  const [rightMinutes, setRightMinutes] = useState<number>(0);
  const [formulaMl, setFormulaMl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

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

    setError('');
    
    // Calculate total duration if specified
    const totalDuration = leftMinutes + rightMinutes;

    onSave({
      type,
      datetime,
      amountMl: hasFormula && formulaMl ? parseInt(formulaMl) : undefined,
      durationMinutes: totalDuration > 0 ? totalDuration : undefined,
      notes: notes.trim() || undefined
    });
  };

  const adjustMinutes = (side: 'left' | 'right', delta: number) => {
    if (side === 'left') {
      setLeftMinutes(prev => Math.max(0, prev + delta));
    } else {
      setRightMinutes(prev => Math.max(0, prev + delta));
    }
  };

  const hasFormula = type === 'formula' || type === 'mixed';

  return (
    <div className="flex-1 flex flex-col justify-between p-6">
      <form onSubmit={handleSave} className="space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Milk className="w-8 h-8" />
          </div>
          <p className="text-sm text-slate-400">Registre os detalhes da mamada do bebê.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl text-xs font-semibold">
            {error}
          </div>
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
                  ? 'border-amber-400 bg-amber-500 text-white shadow-sm'
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
                  ? 'border-amber-400 bg-amber-500 text-white shadow-sm'
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
                  ? 'border-amber-400 bg-amber-500 text-white shadow-sm'
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
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-amber-300 text-sm font-semibold text-slate-700"
              required
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Seção Leite Materno (Duração) */}
        {type !== 'formula' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Duração da Amamentação
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Esquerdo */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Seio Esq. (min)</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => adjustMinutes('left', -1)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-100 font-bold text-slate-600 flex items-center justify-center active:scale-90 transition-all"
                  >
                    -
                  </button>
                  <span className="text-base font-black text-slate-800 w-6 text-center">{leftMinutes}</span>
                  <button
                    type="button"
                    onClick={() => adjustMinutes('left', 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-100 font-bold text-slate-600 flex items-center justify-center active:scale-90 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Direito */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Seio Dir. (min)</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => adjustMinutes('right', -1)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-100 font-bold text-slate-600 flex items-center justify-center active:scale-90 transition-all"
                  >
                    -
                  </button>
                  <span className="text-base font-black text-slate-800 w-6 text-center">{rightMinutes}</span>
                  <button
                    type="button"
                    onClick={() => adjustMinutes('right', 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-100 font-bold text-slate-600 flex items-center justify-center active:scale-90 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
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
                className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-amber-300 text-sm font-semibold"
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
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-amber-300 text-sm"
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
            className="py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-amber-100 text-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedBreastScreen;
