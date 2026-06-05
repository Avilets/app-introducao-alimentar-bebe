import React, { useState } from 'react';
import type { Baby } from '../types';
import { Save, User, Calendar, Award } from 'lucide-react';

interface BabyProfileScreenProps {
  initialBaby: Baby | null;
  onSave: (baby: Baby) => void;
}

export const BabyProfileScreen: React.FC<BabyProfileScreenProps> = ({
  initialBaby,
  onSave
}) => {
  const [name, setName] = useState(initialBaby?.name || '');
  const [birthDate, setBirthDate] = useState(initialBaby?.birthDate || '');
  const [gender, setGender] = useState<'boy' | 'girl' | 'other'>(initialBaby?.gender || 'girl');
  const [targetWeight, setTargetWeight] = useState(initialBaby?.targetWeight?.toString() || '');
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) {
      setError('Por favor, preencha o nome e a data de nascimento.');
      return;
    }
    setError('');
    onSave({
      name,
      birthDate,
      gender,
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="text-center mb-2">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3 text-orange-600 border-2 border-orange-200 shadow-sm">
            <User className="w-10 h-10" />
          </div>
          <p className="text-sm text-slate-400">Insira os dados do bebê para personalizar as metas alimentares.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Input Name */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Nome do Bebê
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Digite o nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-sm font-medium"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Input BirthDate */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Data de Nascimento
          </label>
          <div className="relative">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-sm font-medium"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Gender Selection Cards */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Gênero
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setGender('girl')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer ${
                gender === 'girl'
                  ? 'border-pink-300 bg-pink-50 text-pink-600 font-bold'
                  : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${gender === 'girl' ? 'bg-pink-100' : 'bg-slate-200'}`}>👧</div>
              <span className="text-xs">Menina</span>
            </button>

            <button
              type="button"
              onClick={() => setGender('boy')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer ${
                gender === 'boy'
                  ? 'border-blue-300 bg-blue-50 text-blue-600 font-bold'
                  : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${gender === 'boy' ? 'bg-blue-100' : 'bg-slate-200'}`}>👦</div>
              <span className="text-xs">Menino</span>
            </button>

            <button
              type="button"
              onClick={() => setGender('other')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer ${
                gender === 'other'
                  ? 'border-amber-300 bg-amber-50 text-amber-600 font-bold'
                  : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${gender === 'other' ? 'bg-amber-100' : 'bg-slate-200'}`}>👶</div>
              <span className="text-xs">Outro</span>
            </button>
          </div>
        </div>

        {/* Input Target Weight */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Peso Meta (Opcional - kg)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              placeholder="Ex: 8.5"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-sm font-medium"
            />
            <Award className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-orange-100 text-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Salvar Dados do Bebê
        </button>
      </form>
    </div>
  );
};

export default BabyProfileScreen;
