import React, { useState } from 'react';
import { LogIn, UserPlus, Sparkles, Loader2 } from 'lucide-react';
import { loginUser, registerUser } from '../services/authService';
import { saveBaby } from '../services/babyService';

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
        {/* Cute Icon container */}
        <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center shadow-inner mb-4 relative animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-14 h-14">
            <path d="M140 280h232c0 60-48 108-116 108s-116-48-116-108z" fill="#f97316"/>
            <rect x="120" y="260" width="272" height="20" rx="10" fill="#ea580c"/>
            <path d="M256 300c-3-5-10-5-13 0l-1 2c-3 3-2 8 1 11l13 11 13-11c3-3 4-8 1-11l-1-2z" fill="#ffffff"/>
            <circle cx="210" cy="325" r="6" fill="#ffffff"/>
            <circle cx="302" cy="325" r="6" fill="#ffffff"/>
          </svg>
          <div className="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-1.5 shadow">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight text-center">
          Rotina Alimentar Bebê
        </h2>
        <p className="text-sm text-slate-400 mt-2 text-center max-w-xs">
          Acompanhe mamadas, frutinhas e refeições do seu bebê com facilidade e amor.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex border-b border-slate-100 pb-4 mb-4">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 text-center py-2 font-bold text-sm transition-all ${
              isLogin ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-400'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
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
    </div>
  );
};

export default LoginScreen;
