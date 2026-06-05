import React, { useState } from 'react';
import { Apple, Save, X, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { FRUITS_DATABASE } from '../config/fruitsData';
import type { QuantityScale, ReactionType } from '../types';

interface FeedFruitScreenProps {
  onSave: (details: {
    fruitName: string;
    fruitType?: string;
    datetime: string;
    quantity: QuantityScale;
    reaction: ReactionType;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export const FeedFruitScreen: React.FC<FeedFruitScreenProps> = ({
  onSave,
  onCancel
}) => {
  const getCurrentLocalDatetime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [fruitName, setFruitName] = useState<string>('');
  const [fruitType, setFruitType] = useState<string>('');
  const [datetime, setDatetime] = useState(getCurrentLocalDatetime());
  const [quantity, setQuantity] = useState<QuantityScale>('bem');
  const [reaction, setReaction] = useState<ReactionType>('aceitou');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Find info about the currently selected fruit
  const selectedFruitInfo = FRUITS_DATABASE.find(f => f.name === fruitName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fruitName) {
      setError('Por favor, selecione uma fruta.');
      return;
    }
    if (!datetime) {
      setError('Por favor, preencha a data e o horário.');
      return;
    }

    setError('');
    onSave({
      fruitName,
      fruitType: fruitType.trim() || undefined,
      datetime,
      quantity,
      reaction,
      notes: notes.trim() || undefined
    });
  };

  const QUANTITIES: { value: QuantityScale; label: string }[] = [
    { value: 'nada', label: 'Nada ❌' },
    { value: 'muito pouco', label: 'Muito Pouco 🤏' },
    { value: 'pouco', label: 'Pouco 🥄' },
    { value: 'bem', label: 'Bem 👍' },
    { value: 'muito', label: 'Muito 😋' }
  ];

  const REACTIONS: { value: ReactionType; label: string; emoji: string }[] = [
    { value: 'aceitou', label: 'Aceitou', emoji: '🙂' },
    { value: 'recusou', label: 'Recusou', emoji: '🤢' },
    { value: 'fez careta', label: 'Fez careta', emoji: '😐' },
    { value: 'gases', label: 'Gases', emoji: '💨' },
    { value: 'regurgitou', label: 'Regurgitou', emoji: '🤮' },
    { value: 'irritação/manchas', label: 'Pele vermelha', emoji: '🔴' },
    { value: 'outro', label: 'Outro', emoji: '❓' }
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-2">
            <Apple className="w-8 h-8" />
          </div>
          <p className="text-sm text-slate-400">Registre a fruta oferecida e veja os benefícios educativos.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Selecionar Fruta (Dropdown com lista fixa) */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Selecione a Fruta
          </label>
          <select
            value={fruitName}
            onChange={(e) => { setFruitName(e.target.value); setError(''); }}
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-pink-300 text-sm font-semibold text-slate-700"
          >
            <option value="">-- Escolha uma Fruta --</option>
            {FRUITS_DATABASE.map(f => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* Tipo / Variedade da Fruta (Opcional) */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Tipo / Variedade (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Lima, Nanica, Gala, Manteiga..."
            value={fruitType}
            onChange={(e) => setFruitType(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-pink-300 text-sm font-semibold text-slate-700"
          />
        </div>

        {/* Informações Educativas da Fruta Selecionada */}
        {selectedFruitInfo && (
          <div className="bg-gradient-to-r from-pink-50 to-amber-50 rounded-3xl p-4 border border-pink-100/50 space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-pink-700">
              <BookOpen className="w-4 h-4" />
              <h4 className="text-xs font-black uppercase tracking-wider">Benefícios da {selectedFruitInfo.name}</h4>
            </div>
            
            <div className="space-y-2 text-xs">
              <p className="text-slate-600 leading-relaxed"><span className="font-bold text-slate-700">Benefício:</span> {selectedFruitInfo.benefits}</p>
              <p className="text-slate-600 leading-relaxed"><span className="font-bold text-slate-700">Textura recomendada:</span> {selectedFruitInfo.texture}</p>
              <div className="p-2 bg-amber-100/50 border-l-4 border-amber-500 text-amber-900 rounded-r-lg flex gap-1.5 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed"><span className="font-bold">Segurança:</span> {selectedFruitInfo.safety}</p>
              </div>
            </div>
            
            <p className="text-[9px] text-slate-400 font-medium italic text-center mt-1">
              "Informações educativas. Em caso de dúvidas ou reações, converse com o pediatra."
            </p>
          </div>
        )}

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
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-pink-300 text-sm font-semibold text-slate-700"
              required
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Quantidade Consumida */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Quantidade Consumida
          </label>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {QUANTITIES.map((q) => (
              <button
                key={q.value}
                type="button"
                onClick={() => setQuantity(q.value)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  quantity === q.value
                    ? 'border-pink-400 bg-pink-500 text-white shadow-sm'
                    : 'border-slate-100 bg-slate-50 text-slate-500'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reação / Sintomas */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Reação / Aceitação
          </label>
          <div className="grid grid-cols-4 gap-2">
            {REACTIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setReaction(r.value)}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                  reaction === r.value
                    ? 'border-pink-400 bg-pink-50 text-pink-700 font-bold'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <span className="text-lg">{r.emoji}</span>
                <span className="text-[9px] text-center leading-none truncate w-full">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Notas */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Observações
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Pegou a fruta com a mão, comeu a maior parte..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-pink-300 text-sm"
          />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
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
            className="py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-pink-100 text-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedFruitScreen;
