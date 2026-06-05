import React, { useState } from 'react';
import { User, LogOut, Baby, Check, Bell, RefreshCw } from 'lucide-react';

interface SettingsScreenProps {
  userEmail: string;
  onEditBaby: () => void;
  onLogout: () => void;
  onActivatePush: () => Promise<void>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userEmail,
  onEditBaby,
  onLogout,
  onActivatePush
}) => {
  // Push notifications states
  const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pushError, setPushError] = useState('');

  const handleActivatePush = async () => {
    setPushStatus('loading');
    setPushError('');
    try {
      await onActivatePush();
      setPushStatus('success');
    } catch (err) {
      setPushStatus('error');
      setPushError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-4 space-y-5">
      {/* Account Info */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <User className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Conta Conectada</p>
          <h4 className="text-sm font-bold text-slate-800 truncate mt-0.5">{userEmail}</h4>
          <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md mt-1 ${
            userEmail === 'pais.demo@rotinabebe.com.br' ? 'bg-teal-50 text-teal-700' : 'bg-indigo-50 text-indigo-700'
          }`}>
            {userEmail === 'pais.demo@rotinabebe.com.br' ? 'Modo Convidado Local' : 'Nuvem Conectada (Firebase)'}
          </span>
        </div>
      </div>

      {/* Settings Options list */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Baby profile */}
        <button
          onClick={onEditBaby}
          className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <Baby className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800">Perfil do Bebê</h4>
            <p className="text-[10px] text-slate-400">Editar nome, data de nascimento e peso</p>
          </div>
        </button>

        {/* Push notifications */}
        <button
          onClick={handleActivatePush}
          disabled={pushStatus === 'loading'}
          className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left cursor-pointer disabled:opacity-70"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            pushStatus === 'success' ? 'bg-emerald-100 text-emerald-600' :
            pushStatus === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-pink-100 text-pink-600'
          }`}>
            {pushStatus === 'loading' ? (
              <RefreshCw className="w-4.5 h-4.5 animate-spin" />
            ) : pushStatus === 'success' ? (
              <Check className="w-4.5 h-4.5" />
            ) : (
              <Bell className="w-4.5 h-4.5" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800">Notificações neste Celular</h4>
            <p className="text-[10px] text-slate-400">
              {pushStatus === 'loading' ? 'Ativando alertas por push...' :
               pushStatus === 'success' ? 'Notificações ativadas neste celular!' :
               pushStatus === 'error' ? 'Falha ao ativar notificações.' :
               'Ativar alertas de notificações locais no celular'}
            </p>
          </div>
        </button>
      </div>

      {/* Push notifications error feedback */}
      {pushStatus === 'error' && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs font-semibold leading-relaxed">
          ⚠️ {pushError || 'Não foi possível ativar as notificações neste aparelho. Verifique as permissões do sistema.'}
        </div>
      )}

      {pushStatus === 'success' && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold text-center">
          🎉 Notificações ativadas com sucesso!
        </div>
      )}

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="w-full py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-xs border border-rose-100 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        {userEmail === 'pais.demo@rotinabebe.com.br' ? 'Sair da Conta (Simulada)' : 'Sair da Conta'}
      </button>
    </div>
  );
};

export default SettingsScreen;
