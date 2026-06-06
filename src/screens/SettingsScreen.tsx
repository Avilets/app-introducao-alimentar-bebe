import React, { useState } from 'react';
import { User, LogOut, Baby, Check, Bell, RefreshCw, Shield, FileText, Download, Trash2, Info, ChevronRight, Loader2, ShieldAlert, Users } from 'lucide-react';
import { exportUserData, deleteAllUserData, deleteUserAccount } from '../services/privacyService';
import { auth } from '../services/firebase';

interface SettingsScreenProps {
  userEmail: string;
  userProfile?: any;
  userRole?: 'admin' | 'cuidador' | 'leitura';
  onEditBaby: () => void;
  onLogout: () => void;
  onActivatePush: () => Promise<void>;
  onNavigate: (screen: string) => void;
  onMigrateData?: () => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userEmail,
  userProfile,
  userRole = 'admin',
  onEditBaby,
  onLogout,
  onActivatePush,
  onNavigate,
  onMigrateData,
  onDeleteAccount
}) => {
  // Push notifications states
  const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pushError, setPushError] = useState('');

  // Privacy and data states
  const [exporting, setExporting] = useState(false);
  const [migrating, setMigrating] = useState(false);
  
  // Deletion modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [deleteError, setDeleteError] = useState('');

  const handleMigrateData = async () => {
    if (!onMigrateData) return;
    if (!confirm('Deseja copiar todos os registros de bebê, alimentação, vacinas, etc., desta conta para a família compartilhada? Esta ação não duplica dados.')) return;
    
    setMigrating(true);
    try {
      await onMigrateData();
      alert('Dados migrados com sucesso para a família compartilhada!');
    } catch (err: any) {
      alert('Erro ao migrar dados: ' + (err.message || String(err)));
    } finally {
      setMigrating(false);
    }
  };

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

  const handleExport = async () => {
    setExporting(true);
    try {
      const isDemo = userEmail === 'pais.demo@rotinabebe.com.br';
      const userId = isDemo ? 'demo-uid' : auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('Identificação do usuário não encontrada.');
      }
      
      const payload = await exportUserData(userId, userProfile?.activeFamilyId);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `baby-grow-dados-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error(error);
      alert('Erro ao exportar dados: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (confirmInput !== 'EXCLUIR') return;
    setDeleteStatus('loading');
    setDeleteError('');
    try {
      const isDemo = userEmail === 'pais.demo@rotinabebe.com.br';
      if (isDemo) {
        // Wipe local storage data
        await deleteAllUserData('demo-uid');
        setDeleteStatus('success');
        setTimeout(() => {
          setShowDeleteModal(false);
          onLogout();
        }, 2000);
      } else {
        if (onDeleteAccount) {
          // Usa a função centralizada do App.tsx que desliga os listeners reativos
          await onDeleteAccount();
        } else {
          const currentUserUid = auth.currentUser?.uid;
          if (!currentUserUid) {
            throw new Error('Nenhum usuário ativo encontrado.');
          }
          // 1. Delete all Firestore database records
          await deleteAllUserData(currentUserUid, userProfile?.activeFamilyId);
          // 2. Delete Firebase Auth account
          await deleteUserAccount();
        }
        
        setDeleteStatus('success');
        setTimeout(() => {
          setShowDeleteModal(false);
          onLogout();
        }, 2000);
      }
    } catch (err: any) {
      setDeleteStatus('error');
      setDeleteError(err.message || 'Erro ao processar exclusão da conta.');
    }
  };

  const openDeleteModal = () => {
    setConfirmInput('');
    setDeleteStatus('idle');
    setDeleteError('');
    setShowDeleteModal(true);
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
        {userRole !== 'leitura' && (
          <button
            onClick={onEditBaby}
            className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Baby className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">Perfil do Bebê</h4>
              <p className="text-[10px] text-slate-400">Editar nome, data de nascimento e foto</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        )}

        {/* Family and Sharing */}
        {userEmail !== 'pais.demo@rotinabebe.com.br' && (
          <button
            onClick={() => onNavigate('family-sharing')}
            className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF7A00] flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">Família e compartilhamento</h4>
              <p className="text-[10px] text-slate-400">Compartilhar dados com pais, mães ou cuidadores</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        )}

        {/* Data Migration to Family */}
        {userEmail !== 'pais.demo@rotinabebe.com.br' && userRole === 'admin' && userProfile?.migrationToFamilyCompleted !== true && (
          <button
            onClick={handleMigrateData}
            disabled={migrating}
            className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-50 transition-colors text-left cursor-pointer disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              {migrating ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <RefreshCw className="w-4.5 h-4.5" />}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">Migrar meus dados para família</h4>
              <p className="text-[10px] text-slate-400">Migrar registros antigos desta conta individual para a família</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        )}

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
          <ChevronRight className="w-4 h-4 text-slate-300" />
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

      {/* Privacy and Data Control Area */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Privacidade e dados</h3>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* What is saved */}
          <button
            onClick={() => onNavigate('data-saved')}
            className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Info className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">Quais dados são salvos?</h4>
              <p className="text-[10px] text-slate-400">Lista clara do que guardamos e do que não coletamos</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* Privacy Policy */}
          <button
            onClick={() => onNavigate('privacy-policy')}
            className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">Política de Privacidade</h4>
              <p className="text-[10px] text-slate-400">Explicação simples do uso de dados e conformidade</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* Terms of Use */}
          <button
            onClick={() => onNavigate('terms-of-use')}
            className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFF8F0] text-orange-600 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">Termos de Uso</h4>
              <p className="text-[10px] text-slate-400">Responsabilidades e isenção médica legal</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* Important Info */}
          <button
            onClick={() => onNavigate('important-info')}
            className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">Informações Importantes</h4>
              <p className="text-[10px] text-slate-400">Limitações de saúde e termos médicos</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* Export data */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-50 transition-colors text-left cursor-pointer disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              {exporting ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Download className="w-4.5 h-4.5" />}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">Exportar meus dados</h4>
              <p className="text-[10px] text-slate-400">Baixar arquivo JSON completo de registros do bebê</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* Delete account and data */}
          <button
            onClick={openDeleteModal}
            className="w-full px-5 py-4 flex items-center gap-3 hover:bg-rose-50/50 active:bg-rose-100/50 transition-colors text-left cursor-pointer text-rose-600"
          >
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <Trash2 className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold">Excluir minha conta e todos os dados</h4>
              <p className="text-[10px] text-rose-400">Apagar dados permanentemente e encerrar conta</p>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-200" />
          </button>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="w-full py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-xs border border-rose-100 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        {userEmail === 'pais.demo@rotinabebe.com.br' ? 'Sair da Conta (Simulada)' : 'Sair da Conta'}
      </button>

      {/* Delete account confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1.5">
              <h4 className="text-sm font-black text-slate-800">Ação Permanente!</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Esta ação é definitiva e irreversível. Todos os registros do bebê na nuvem e no seu aparelho serão apagados definitivamente e a conta de usuário será desativada.
              </p>
            </div>

            {deleteStatus === 'error' && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-[11px] font-semibold leading-relaxed">
                ⚠️ {deleteError}
              </div>
            )}

            {deleteStatus === 'success' && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold text-center">
                🎉 Conta e dados excluídos com sucesso! Redirecionando...
              </div>
            )}

            {deleteStatus === 'loading' ? (
              <div className="flex flex-col items-center py-4 space-y-2">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                <span className="text-xs text-rose-500 font-bold">Apagando registros e conta...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Digite <strong className="text-rose-500">EXCLUIR</strong> para prosseguir:
                  </label>
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={e => setConfirmInput(e.target.value)}
                    placeholder="Digite EXCLUIR"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-rose-300 text-sm text-center font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs cursor-pointer active:scale-95 transition-all text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={confirmInput !== 'EXCLUIR'}
                    className="py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-100 text-white font-bold rounded-2xl text-xs cursor-pointer disabled:cursor-not-allowed active:scale-95 transition-all text-center"
                  >
                    Excluir Tudo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
