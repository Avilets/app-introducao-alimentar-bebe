import React, { useState } from 'react';
import { 
  Users, UserPlus, Trash2, Shield, Info, Copy, Check, X, Mail, ShieldAlert, KeyRound, AlertTriangle, LogOut
} from 'lucide-react';
import type { FamilyMember, FamilyInvite } from '../types';
import { 
  createInvite, revokeInvite, acceptInvite, removeFamilyMember, updateFamilyMemberRole 
} from '../services/familyService';

interface FamilyScreenProps {
  userId: string;
  userEmail: string;
  familyId?: string;
  familyName?: string;
  userRole?: 'admin' | 'cuidador' | 'leitura';
  members: FamilyMember[];
  invites: FamilyInvite[];
  onBack: () => void;
  onRefreshSession: () => Promise<void>;
}

export const FamilyScreen: React.FC<FamilyScreenProps> = ({
  userId,
  userEmail,
  familyId,
  familyName,
  userRole = 'leitura',
  members,
  invites,
  onBack,
  onRefreshSession
}) => {
  const isDemo = userId === 'demo-uid';
  const isAdmin = userRole === 'admin';

  // State hooks
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'cuidador' | 'leitura'>('cuidador');
  const [restrictedEmail, setRestrictedEmail] = useState(true);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Accept code state
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [acceptStatus, setAcceptStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [acceptMessage, setAcceptMessage] = useState('');

  // Local feedback errors
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Mock members/invites for demo mode
  const displayMembers = isDemo ? [
    { userId: 'demo-uid', email: 'pais.demo@rotinabebe.com.br', displayName: 'Pais Demo (Você)', role: 'admin' as const, status: 'active' as const, createdAt: Date.now(), updatedAt: Date.now() },
    { userId: 'user-2', email: 'mamae@exemplo.com', displayName: 'Maria (Mãe)', role: 'admin' as const, status: 'active' as const, createdAt: Date.now() - 86400000, updatedAt: Date.now() },
    { userId: 'user-3', email: 'vovo@exemplo.com', displayName: 'Ana (Avó)', role: 'cuidador' as const, status: 'active' as const, createdAt: Date.now() - 40000000, updatedAt: Date.now() },
    { userId: 'user-4', email: 'pediatra.consulta@exemplo.com', displayName: 'Dra. Luiza', role: 'leitura' as const, status: 'active' as const, createdAt: Date.now() - 10000000, updatedAt: Date.now() }
  ] : members;

  const displayInvites = isDemo ? [
    { id: 'inv-1', email: 'baba.maria@exemplo.com', role: 'cuidador' as const, status: 'pending' as const, invitedByUserId: 'demo-uid', invitedByEmail: 'pais.demo@rotinabebe.com.br', invitedAt: Date.now() - 3600000, expiresAt: Date.now() + 86400000 * 6, createdAt: Date.now(), updatedAt: Date.now(), inviteCode: 'BG-MOCK88', restrictedToEmail: true }
  ] : invites;

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (isDemo) {
      setGeneratedCode(`BG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
      return;
    }

    if (!familyId) {
      setActionError('Erro: Nenhuma família associada a esta conta.');
      return;
    }

    try {
      const code = await createInvite(
        familyId,
        inviteEmail,
        inviteRole,
        userId,
        userEmail,
        restrictedEmail
      );
      setGeneratedCode(code);
      setInviteEmail('');
    } catch (err: any) {
      setActionError(err.message || 'Falha ao gerar o código de convite.');
    }
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(
      `Olá! Convido você para fazer parte do Baby Grow do meu bebê. Instale o app e digite o código de convite: *${generatedCode}*`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAcceptInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    setAcceptStatus('loading');
    setAcceptMessage('');
    setActionError('');
    setActionSuccess('');

    if (isDemo) {
      setTimeout(() => {
        setAcceptStatus('error');
        setAcceptMessage('O compartilhamento de convites está disponível apenas no modo Nuvem.');
      }, 1000);
      return;
    }

    try {
      const res = await acceptInvite(userId, userEmail, userEmail.split('@')[0], inviteCodeInput);
      if (res.success) {
        setAcceptStatus('success');
        setAcceptMessage(res.message);
        setInviteCodeInput('');
        await onRefreshSession(); // Atualiza a família ativa da sessão
      } else {
        setAcceptStatus('error');
        setAcceptMessage(res.message);
      }
    } catch (err: any) {
      setAcceptStatus('error');
      setAcceptMessage(err.message || 'Erro ao processar o convite.');
    }
  };

  const handleRemoveMember = async (memberUid: string, email: string) => {
    if (memberUid === userId) {
      handleLeaveFamily();
      return;
    }

    if (isDemo) {
      alert('Operação simulada com sucesso!');
      return;
    }

    if (!familyId) return;

    if (confirm(`Deseja remover o membro ${email} da família?`)) {
      try {
        await removeFamilyMember(familyId, memberUid);
        setActionSuccess(`Membro ${email} removido da família.`);
      } catch (err: any) {
        setActionError(err.message || 'Falha ao remover membro.');
      }
    }
  };

  const handleLeaveFamily = async () => {
    if (isDemo) {
      alert('Operação de teste simulada com sucesso!');
      return;
    }

    if (!familyId) return;

    // Busca todos os membros
    const currentMember = displayMembers.find(m => m.userId === userId);
    const otherAdmins = displayMembers.filter(m => m.userId !== userId && m.role === 'admin');

    // Se for o único admin e houver outros membros
    if (currentMember?.role === 'admin' && displayMembers.length > 1 && otherAdmins.length === 0) {
      alert('Você é o único administrador desta família. Promova outro membro a administrador antes de sair, ou remova os outros membros primeiro.');
      return;
    }

    const confirmMsg = displayMembers.length === 1
      ? 'Você é o único membro desta família. Ao sair, a família e todos os seus registros serão excluídos permanentemente. Deseja continuar?'
      : 'Tem certeza de que deseja sair desta família? Você perderá acesso a todos os registros compartilhados.';

    if (confirm(confirmMsg)) {
      setActionError('');
      setActionSuccess('');
      try {
        if (displayMembers.length === 1 && currentMember?.role === 'admin') {
          // Exclui a família inteira se for o único membro e for admin
          const { deleteFamily } = await import('../services/familyService');
          await deleteFamily(familyId);
        } else {
          // Apenas sai da família
          await removeFamilyMember(familyId, userId);
        }
        setActionSuccess('Você saiu da família com sucesso!');
        await onRefreshSession(); // Atualiza a sessão (voltará a auto-criar ou recarregar perfil)
      } catch (err: any) {
        setActionError(err.message || 'Falha ao sair da família.');
      }
    }
  };

  const handleChangeRole = async (memberUid: string, currentRole: 'admin' | 'cuidador' | 'leitura') => {
    if (memberUid === userId) {
      alert('Você não pode alterar seu próprio papel.');
      return;
    }

    const rolesList: ('admin' | 'cuidador' | 'leitura')[] = ['admin', 'cuidador', 'leitura'];
    const nextRoleIndex = (rolesList.indexOf(currentRole) + 1) % rolesList.length;
    const nextRole = rolesList[nextRoleIndex];

    const roleLabelMap = { admin: 'Administrador', cuidador: 'Cuidador', leitura: 'Leitura' };

    if (isDemo) {
      alert(`Papel alterado simuladamente para: ${roleLabelMap[nextRole]}`);
      return;
    }

    if (!familyId) return;

    if (confirm(`Deseja alterar o papel deste membro para ${roleLabelMap[nextRole]}?`)) {
      try {
        await updateFamilyMemberRole(familyId, memberUid, nextRole);
        setActionSuccess(`Papel do membro atualizado para ${roleLabelMap[nextRole]}.`);
      } catch (err: any) {
        setActionError(err.message || 'Falha ao atualizar papel.');
      }
    }
  };

  const handleRevokeInvite = async (inviteId: string, inviteCode: string, email: string) => {
    if (isDemo) {
      alert('Convite revogado simuladamente!');
      return;
    }

    if (!familyId) return;

    if (confirm(`Deseja revogar o convite pendente para ${email}?`)) {
      try {
        await revokeInvite(familyId, inviteId, inviteCode);
        setActionSuccess(`Convite para ${email} revogado.`);
      } catch (err: any) {
        setActionError(err.message || 'Falha ao revogar convite.');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FFF8F0] min-h-screen px-4 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <Users className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">Compartilhamento Familiar</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {familyName || 'Minha Família'}
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-extrabold text-[#FF7A00] hover:underline cursor-pointer"
        >
          Voltar
        </button>
      </div>

      {/* Demo Mode Notice */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-4 flex gap-3 text-slate-700">
          <Info className="w-5 h-5 text-[#FF7A00] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-amber-800">Modo de Simulação Local</h5>
            <p className="text-[11px] text-amber-700 leading-normal">
              O compartilhamento de convites e sincronização exige conexão com o Firebase (Nuvem). 
              Abaixo mostramos dados fictícios de teste para demonstração da interface.
            </p>
          </div>
        </div>
      )}

      {/* Alerts */}
      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs font-semibold leading-relaxed">
          ⚠️ {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold text-center">
          🎉 {actionSuccess}
        </div>
      )}

      {/* Only for readers warning */}
      {userRole === 'leitura' && (
        <div className="bg-rose-50 border border-rose-150 rounded-2xl p-3 flex gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-rose-700 font-semibold leading-normal">
            Você possui acesso <strong>somente leitura</strong>. Não poderá cadastrar convites ou alterar a configuração dos membros.
          </p>
        </div>
      )}

      {/* Invite Code Redemption Form */}
      {userRole !== 'leitura' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-[#FF7A00]" />
            Entrar em uma Família (Resgatar Código)
          </h4>
          <p className="text-[10px] text-slate-400">
            Tem um código de convite enviado por outro administrador? Digite-o abaixo para acessar os dados compartilhados.
          </p>

          <form onSubmit={handleAcceptInviteSubmit} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Ex: BG-ABC123"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
              disabled={acceptStatus === 'loading'}
              className="flex-1 text-xs font-bold uppercase p-3 border border-slate-150 rounded-2xl outline-none focus:border-orange-500 text-center tracking-wider"
            />
            <button
              type="submit"
              disabled={acceptStatus === 'loading'}
              className="px-5 bg-[#FF7A00] hover:bg-orange-600 disabled:bg-orange-300 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-orange-100 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {acceptStatus === 'loading' ? 'Verificando...' : 'Resgatar'}
            </button>
          </form>

          {acceptStatus === 'error' && (
            <div className="text-[10px] font-bold text-rose-500 mt-1 pl-1">
              ❌ {acceptMessage}
            </div>
          )}
          {acceptStatus === 'success' && (
            <div className="text-[10px] font-bold text-emerald-500 mt-1 pl-1">
              ✓ {acceptMessage}
            </div>
          )}
        </div>
      )}

      {/* Members Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#FF7A00]" />
            Membros da Família ({displayMembers.length})
          </h4>
          {userRole === 'admin' && (
            <button
              onClick={() => {
                setGeneratedCode('');
                setShowInviteModal(true);
              }}
              className="text-[11px] text-[#FF7A00] font-black hover:underline flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" /> Convidar Membro
            </button>
          )}
        </div>

        <div className="space-y-3">
          {displayMembers.map((member) => {
            const roleLabel = member.role === 'admin' ? 'Admin' : member.role === 'cuidador' ? 'Cuidador' : 'Leitura';
            const isSelf = member.userId === userId;

            return (
              <div 
                key={member.userId} 
                className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                    <span>{member.displayName || member.email.split('@')[0]}</span>
                    {isSelf && (
                      <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.2 rounded-md">
                        Você
                      </span>
                    )}
                  </h5>
                  <p className="text-[9px] text-slate-400 truncate mt-0.5">{member.email}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Role Badge */}
                  <span className={`text-[9px] font-black uppercase px-2 py-0.8 rounded-lg ${
                    member.role === 'admin' ? 'bg-indigo-50 text-indigo-700' :
                    member.role === 'cuidador' ? 'bg-orange-50 text-[#FF7A00]' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {roleLabel}
                  </span>

                  {/* Actions for Admin on other users */}
                  {isAdmin && !isSelf && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleChangeRole(member.userId, member.role)}
                        className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-orange-500 rounded-lg cursor-pointer"
                        title="Alternar Papel"
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.userId, member.email)}
                        className="p-1.5 hover:bg-slate-50 text-slate-450 hover:text-rose-500 rounded-lg cursor-pointer"
                        title="Remover Membro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Actions for current user (leave family) */}
                  {isSelf && (
                    <button
                      onClick={handleLeaveFamily}
                      className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg cursor-pointer flex items-center gap-1"
                      title="Sair da Família"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">Sair</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Invites Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 px-1">
          <Mail className="w-4 h-4 text-[#FF7A00]" />
          Convites Pendentes ({displayInvites.length})
        </h4>

        {displayInvites.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
            <p className="text-xs font-semibold text-slate-400">Nenhum convite pendente no momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayInvites.map((invite) => {
              const isExpired = invite.expiresAt < Date.now();
              const inviteRoleLabel = invite.role === 'cuidador' ? 'Cuidador' : 'Leitura';

              return (
                <div 
                  key={invite.id} 
                  className={`bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-3 ${
                    isExpired ? 'opacity-50' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-slate-800 truncate flex items-center gap-2">
                      <span>{invite.email}</span>
                      {invite.restrictedToEmail && (
                        <span className="text-[8px] bg-amber-50 text-amber-700 font-extrabold px-1 rounded">
                          Restrito
                        </span>
                      )}
                    </h5>
                    <p className="text-[10px] font-bold text-orange-500 mt-1 select-all">
                      Código: {invite.inviteCode}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Expira em: {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.8 rounded-lg">
                      {inviteRoleLabel}
                    </span>
                    
                    {isAdmin && (
                      <button
                        onClick={() => handleRevokeInvite(invite.id!, invite.inviteCode, invite.email)}
                        className="p-1.5 hover:bg-slate-50 text-slate-450 hover:text-rose-500 rounded-lg cursor-pointer"
                        title="Revogar Convite"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Instructions Card */}
      <div className="bg-orange-50/50 border border-orange-100/50 rounded-3xl p-5 space-y-2">
        <h4 className="text-xs font-bold text-orange-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#FF7A00]" />
          Como compartilhar o acesso?
        </h4>
        <ol className="list-decimal list-inside text-[11px] text-orange-700/95 space-y-1.5 leading-relaxed pl-1">
          <li>Clique em <strong>"Convidar Membro"</strong> e preencha o e-mail do cuidador.</li>
          <li>Copie o código gerado (ex: <code>BG-XXXXXX</code>) e envie pelo WhatsApp.</li>
          <li>O convidado deve instalar o app, criar uma conta e digitar o código na caixa de resgate acima.</li>
          <li>Pronto! Ele terá acesso imediato aos dados compartilhados do bebê.</li>
        </ol>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl flex flex-col overflow-hidden">
            
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-800">Convidar Membro</h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-1 text-slate-450 hover:text-slate-650 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!generatedCode ? (
              <form onSubmit={handleGenerateInvite} className="p-5 space-y-4">
                
                {/* Email input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail do Convidado</label>
                  <input
                    type="email"
                    required
                    placeholder="cuidador@exemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none focus:border-[#FF7A00]"
                  />
                </div>

                {/* Role select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Papel/Permissão</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl bg-white outline-none focus:border-[#FF7A00]"
                  >
                    <option value="cuidador">Cuidador (Registrar atividades e lembretes)</option>
                    <option value="leitura">Apenas Leitura (Visualizar atividades)</option>
                  </select>
                </div>

                {/* Restriction toggle */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Restringir ao e-mail</label>
                    <p className="text-[9px] text-slate-400">Apenas o e-mail convidado poderá resgatar.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={restrictedEmail}
                    onChange={(e) => setRestrictedEmail(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />
                </div>

                {/* Submit button */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-3 border border-slate-150 text-slate-500 font-bold rounded-2xl text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-orange-100 cursor-pointer"
                  >
                    Gerar Código
                  </button>
                </div>

              </form>
            ) : (
              <div className="p-5 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">Código Criado com Sucesso!</h4>
                  <p className="text-[10px] text-slate-400">
                    Copie a mensagem de convite abaixo e compartilhe com o cuidador pelo WhatsApp ou e-mail.
                  </p>
                </div>

                {/* Code display */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-orange-600 block leading-none">CÓDIGO DO CONVITE</span>
                    <span className="text-lg font-black text-slate-800 tracking-wider mt-1 block select-all">{generatedCode}</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={`py-2 px-3.5 rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition-all cursor-pointer ${
                      copied 
                        ? 'bg-emerald-500 text-white shadow-emerald-100' 
                        : 'bg-white border border-slate-150 text-slate-650 hover:bg-slate-50 shadow-sm'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 flex gap-2.5 text-left">
                  <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-700 leading-relaxed">
                    <strong>Importante:</strong> Os convites expiram em 7 dias por motivos de segurança. Caso expire, você deverá criar um novo código.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="w-full py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-orange-100 cursor-pointer"
                >
                  Concluir e Fechar
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default FamilyScreen;
