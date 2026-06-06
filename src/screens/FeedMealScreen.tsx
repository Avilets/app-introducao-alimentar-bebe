import React, { useState } from 'react';
import { Utensils, Save, X, Calendar } from 'lucide-react';
import type { MealCategory, MealTexture, QuantityScale, ReactionType } from '../types';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

interface FeedMealScreenProps {
  onSave: (details: {
    category: MealCategory;
    foodName: string;
    datetime: string;
    quantity: QuantityScale;
    texture: MealTexture;
    reaction: ReactionType;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export const FeedMealScreen: React.FC<FeedMealScreenProps> = ({
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

  const [category, setCategory] = useState<MealCategory>('legume');
  const [foodName, setFoodName] = useState<string>('');
  const [datetime, setDatetime] = useState(getCurrentLocalDatetime());
  const [quantity, setQuantity] = useState<QuantityScale>('bem');
  const [texture, setTexture] = useState<MealTexture>('amassado');
  const [reaction, setReaction] = useState<ReactionType>('aceitou');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      setError('Por favor, informe qual o alimento oferecido.');
      return;
    }
    if (!datetime) {
      setError('Por favor, preencha a data e o horário.');
      return;
    }

    setError('');
    onSave({
      category,
      foodName: foodName.trim(),
      datetime,
      quantity,
      texture,
      reaction,
      notes: notes.trim() || undefined
    });
  };

  const CATEGORIES: { value: MealCategory; label: string }[] = [
    { value: 'legume', label: 'Legume 🥕' },
    { value: 'verdura', label: 'Verdura 🥬' },
    { value: 'cereal/tubérculo', label: 'Cereal/Tubérculo 🍠' },
    { value: 'proteína', label: 'Proteína 🍗' },
    { value: 'refeição completa', label: 'Refeição Completa 🍛' },
    { value: 'outro', label: 'Outro 🍽️' }
  ];

  const TEXTURES: { value: MealTexture; label: string }[] = [
    { value: 'amassado', label: 'Amassado' },
    { value: 'purê', label: 'Purê' },
    { value: 'pedaços macios', label: 'Pedaços Macios' },
    { value: 'outro', label: 'Outro' }
  ];

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-2">
            <Utensils className="w-8 h-8" />
          </div>
          <p className="text-sm text-slate-400">Registre o preparo e a aceitação da refeição principal.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Categoria */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Categoria do Alimento
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`py-2 px-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  category === cat.value
                    ? 'border-teal-400 bg-teal-650 text-teal-850 font-black bg-teal-50 border-2'
                    : 'border-slate-100 bg-slate-50 text-slate-500'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nome do Alimento */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Alimento / Prato Oferecido
          </label>
          <input
            type="text"
            placeholder="Ex: Cenoura e abóbora amassadas, Purê de frango"
            value={foodName}
            onChange={(e) => { setFoodName(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-teal-300 text-sm font-medium"
            required
          />
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
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-teal-300 text-sm font-semibold text-slate-700"
              required
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Textura */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Textura do Preparo
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TEXTURES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTexture(t.value)}
                className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                  texture === t.value
                    ? 'border-teal-400 bg-teal-600 text-white shadow-sm'
                    : 'border-slate-100 bg-slate-50 text-slate-500'
                }`}
              >
                {t.label}
              </button>
            ))}
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
                    ? 'border-teal-400 bg-teal-600 text-white shadow-sm'
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
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                  reaction === r.value
                    ? 'border-teal-400 bg-teal-50 text-teal-700 font-bold'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <span className="text-base">{r.emoji}</span>
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
            placeholder="Ex: Começou comendo bem, mas depois perdeu o interesse..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-teal-300 text-sm"
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
            className="py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-teal-100 text-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>

        <MedicalDisclaimer type="alimentacao" className="mt-4" />
      </form>
    </div>
  );
};

export default FeedMealScreen;

