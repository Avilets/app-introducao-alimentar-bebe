import React, { useState } from 'react';
import { LogIn, UserPlus, Sparkles, Loader2, X } from 'lucide-react';
import { loginUser, registerUser } from '../services/authService';
import { saveBaby } from '../services/babyService';
import TermsOfUseScreen from './TermsOfUseScreen';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [babyName, setBabyName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (!isLogin && !babyName.trim()) {
      setError('Por favor, digite o nome do bebê.');
      return;
    }
    if (!isLogin && !acceptTerms) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await loginUser(email, password);
        // O escutador em App.tsx cuidará de atualizar a sessão
      } else {
        const newUser = await registerUser(email, password);
        // Cria perfil do bebê padrão imediatamente
        await saveBaby(newUser.uid, {
          name: babyName.trim(),
          birthDate: new Date().toISOString().split('T')[0], // Padrão hoje
          gender: 'girl'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    onLoginSuccess('pais.demo@rotinabebe.com.br');
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-8">
      {/* Brand Header */}
      <div className="flex-1 flex flex-col items-center justify-center my-6">
        {/* Cute Logo container */}
        <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-md mb-4">
          <img src="/favicon.png" alt="Baby Grow Logo" className="w-full h-full object-cover" />
        </div>

        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight text-center">
          Baby Grow
        </h2>
        <p className="text-sm text-slate-400 mt-2 text-center max-w-xs">
          Acompanhe mamadas, frutinhas, refeições e o crescimento do seu bebê.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex border-b border-slate-100 pb-4 mb-4">
          <button
            onClick={() => { setIsLogin(true); setError(''); setAcceptTerms(false); }}
            className={`flex-1 text-center py-2 font-bold text-sm transition-all ${
              isLogin ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-400'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setAcceptTerms(false); }}
            className={`flex-1 text-center py-2 font-bold text-sm transition-all ${
              !isLogin ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-400'
            }`}
          >
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Nome do Bebê
              </label>
              <input
                type="text"
                placeholder="Ex: Maya, Benjamin"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Senha
            </label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-sm"
            />
          </div>

          {!isLogin && (
            <div className="flex items-start gap-2 py-1 select-none">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer shrink-0"
              />
              <label htmlFor="acceptTerms" className="text-xs text-slate-500 leading-normal cursor-pointer">
                Li e concordo com os{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-orange-500 hover:underline font-bold inline-block"
                >
                  Termos de Uso
                </button>{' '}
                e{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-orange-500 hover:underline font-bold inline-block"
                >
                  Política de Privacidade
                </button>
                .
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-orange-100 text-sm mt-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {isLoading ? 'Aguardando...' : isLogin ? 'Acessar Conta' : 'Cadastrar e Entrar'}
          </button>
        </form>
      </div>

      {/* Demo / Guest Bypass */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center w-full gap-2">
          <hr className="flex-1 border-slate-200" />
          <span className="text-xs text-slate-400 font-semibold">OU</span>
          <hr className="flex-1 border-slate-200" />
        </div>

        <button
          onClick={handleDemoAccess}
          className="w-full py-3.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-100 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-teal-600" />
          Entrar como Convidado (Modo Demo)
        </button>
        <p className="text-[10px] text-slate-400 text-center max-w-xs">
          O modo convidado armazena as informações localmente no celular e não requer chaves reais do Firebase.
        </p>
      </div>

      {/* Terms of Use Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-[#FFF8F0] rounded-3xl w-full max-w-sm shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-5 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-800">Termos de Uso</h3>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-650 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <TermsOfUseScreen />
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAcceptTerms(true);
                  setShowTermsModal(false);
                }}
                className="flex-1 py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-orange-100 cursor-pointer"
              >
                Aceitar e Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-[#FFF8F0] rounded-3xl w-full max-w-sm shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-5 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-800">Política de Privacidade</h3>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-650 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <PrivacyPolicyScreen />
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAcceptTerms(true);
                  setShowPrivacyModal(false);
                }}
                className="flex-1 py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-orange-100 cursor-pointer"
              >
                Aceitar e Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
