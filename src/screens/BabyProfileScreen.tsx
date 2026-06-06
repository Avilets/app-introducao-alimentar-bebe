import React, { useState } from 'react';
import type { Baby } from '../types';
import { Save, User, Calendar, Camera } from 'lucide-react';

interface BabyProfileScreenProps {
  initialBaby: Baby | null;
  userRole?: 'admin' | 'cuidador' | 'leitura';
  onSave: (baby: Baby) => void;
}

export const BabyProfileScreen: React.FC<BabyProfileScreenProps> = ({
  initialBaby,
  userRole = 'admin',
  onSave
}) => {
  const [name, setName] = useState(initialBaby?.name || '');
  const [birthDate, setBirthDate] = useState(initialBaby?.birthDate || '');
  const [gender, setGender] = useState<'boy' | 'girl'>(initialBaby?.gender === 'boy' ? 'boy' : 'girl');
  const [photoBase64, setPhotoBase64] = useState(initialBaby?.photoBase64 || '');
  const [error, setError] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 150; // Keep base64 lightweight (around 5-10 KB)
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setPhotoBase64(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
      photoBase64: photoBase64 || undefined
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="text-center mb-2">
          {/* Circular Photo Picker */}
          <div className="relative w-24 h-24 mx-auto mb-3">
            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border-2 border-orange-200 shadow-sm overflow-hidden">
              {photoBase64 ? (
                <img src={photoBase64} alt="Foto do bebê" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-orange-400" />
              )}
            </div>
            
            {userRole !== 'leitura' && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="baby-photo-upload"
                  onChange={handlePhotoChange}
                />
                <label
                  htmlFor="baby-photo-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FF7A00] border-2 border-white flex items-center justify-center text-white cursor-pointer hover:bg-orange-600 active:scale-95 transition-all shadow-md"
                  title="Adicionar foto"
                >
                  <Camera className="w-4 h-4" />
                </label>
              </>
            )}
          </div>
          
          <p className="text-sm text-slate-400">Selecione uma foto e preencha os dados do bebê para personalizar a rotina.</p>
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
              disabled={userRole === 'leitura'}
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-sm font-medium disabled:opacity-75 disabled:text-slate-400"
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
              disabled={userRole === 'leitura'}
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-sm font-medium disabled:opacity-75 disabled:text-slate-400"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Gender Selection Cards */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Gênero
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                if (userRole === 'leitura') return;
                setGender('girl');
              }}
              disabled={userRole === 'leitura'}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all ${
                userRole === 'leitura' ? '' : 'cursor-pointer'
              } ${
                gender === 'girl'
                  ? 'border-pink-300 bg-pink-50 text-pink-600 font-bold'
                  : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${gender === 'girl' ? 'bg-pink-100' : 'bg-slate-200'}`}>👧</div>
              <span className="text-xs">Menina</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (userRole === 'leitura') return;
                setGender('boy');
              }}
              disabled={userRole === 'leitura'}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all ${
                userRole === 'leitura' ? '' : 'cursor-pointer'
              } ${
                gender === 'boy'
                  ? 'border-blue-300 bg-blue-50 text-blue-600 font-bold'
                  : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${gender === 'boy' ? 'bg-blue-100' : 'bg-slate-200'}`}>👦</div>
              <span className="text-xs">Menino</span>
            </button>
          </div>
        </div>

        {/* Save button */}
        {userRole !== 'leitura' && (
          <button
            type="submit"
            className="w-full py-4 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-orange-100 text-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar Dados do Bebê
          </button>
        )}
      </form>
    </div>
  );
};

export default BabyProfileScreen;
