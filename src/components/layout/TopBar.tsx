import React from 'react';
import { ArrowLeft, User, Baby as BabyIcon } from 'lucide-react';

interface TopBarProps {
  title: string;
  babyName?: string;
  babyPhoto?: string;
  onBack?: () => void;
  onProfileClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  babyName,
  babyPhoto,
  onBack,
  onProfileClick
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between h-14">
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-100 active:scale-95 transition-transform text-slate-600"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 overflow-hidden">
            {babyPhoto ? (
              <img src={babyPhoto} alt="Bebê" className="w-full h-full object-cover" />
            ) : (
              <BabyIcon className="w-4 h-4" />
            )}
          </div>
        )}
        
        <div>
          {babyName && !onBack && (
            <p className="text-xs text-slate-400 font-medium leading-none">Bebê: {babyName}</p>
          )}
          <h1 className="text-base font-bold text-slate-800 leading-tight mt-0.5">
            {title}
          </h1>
        </div>
      </div>

      {onProfileClick && (
        <button
          onClick={onProfileClick}
          className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 hover:bg-amber-200 active:scale-95 transition-transform overflow-hidden shadow-sm"
          aria-label="Perfil do Bebê"
        >
          {babyPhoto ? (
            <img src={babyPhoto} alt="Bebê" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </button>
      )}
    </header>
  );
};

export default TopBar;
