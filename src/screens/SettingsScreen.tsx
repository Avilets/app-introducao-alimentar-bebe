import React, { useState } from 'react';
import { User, LogOut, Database, Key, Baby, RefreshCw, Check, Bell } from 'lucide-react';

interface SettingsScreenProps {
  userEmail: string;
  onEditBaby: () => void;
  onLogout: () => void;
  onResetData: () => void;
  onActivatePush: () => Promise<void>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userEmail,
  onEditBaby,
  onLogout,
  onResetData,
  onActivatePush
}) => {
  const [showFirebaseConfig, setShowFirebaseConfig] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('rt_fb_api_key') || '');
  const [projectId, setProjectId] = useState(localStorage.getItem('rt_fb_project_id') || '');
  const [isSaved, setIsSaved] = useState(false);

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

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('rt_fb_api_key', apiKey);
    localStorage.setItem('rt_fb_project_id', projectId);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja redefinir todos os registros para os dados de simulação de exemplo?')) {
      onResetData();
      alert('Dados redefinidos com sucesso!');
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

        {/* Reset database */}
        <button
          onClick={handleReset}
          className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <RefreshCw className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800">Recarregar Dados Demo</h4>
            <p className="text-[10px] text-slate-400">Restaurar atividades e lembretes fictícios</p>
          </div>
        </button>

        {/* Push notifications */}
        <button
          onClick={handleActivatePush}
          disabled={pushStatus === 'loading'}
          className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-50 transition-colors text-left cursor-pointer disabled:opacity-70"
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
               'Ativar alertas por push de segundo plano (FCM)'}
            </p>
          </div>
        </button>

        {/* Firebase Config toggle */}
        <button
          onClick={() => setShowFirebaseConfig(!showFirebaseConfig)}
          className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Key className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800">Credenciais Firebase</h4>
            <p className="text-[10px] text-slate-400">Configurar seu banco de dados na nuvem futuramente</p>
          </div>
        </button>
      </div>

      {/* Firebase configuration section */}
      {showFirebaseConfig && (
        <form onSubmit={handleSaveFirebase} className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 border-b border-slate-200 pb-2">
            <Database className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Configuração da Nuvem</h4>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal">
            Quando você estiver pronto para habilitar o Firebase Auth e Firestore Database em produção, salve suas credenciais abaixo:
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                API Key (Chave)
              </label>
              <input
                type="text"
                placeholder="Ex: AIzaSyA1..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Project ID (ID do Projeto)
              </label>
              <input
                type="text"
                placeholder="Ex: rotina-bebe-abc12"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 text-xs font-semibold"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs text-white active:scale-95 transition-all cursor-pointer ${
                isSaved ? 'bg-emerald-500' : 'bg-slate-800 hover:bg-slate-900'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
              {isSaved ? 'Credenciais Salvas!' : 'Salvar Credenciais'}
            </button>
          </div>
        </form>
      )}

      {/* Push notifications error feedback */}
      {pushStatus === 'error' && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs font-semibold leading-relaxed">
          ⚠️ {pushError || 'Não foi possível ativar as notificações por push neste aparelho. Verifique se o Brave bloqueou os pop-ups ou permissões.'}
        </div>
      )}

      {pushStatus === 'success' && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold text-center">
          🎉 Notificações ativadas neste celular com sucesso!
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
