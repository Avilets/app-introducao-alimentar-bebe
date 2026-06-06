import React from 'react';
import { FileText, Stethoscope, AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';

export const TermsOfUseScreen: React.FC = () => {
  return (
    <div className="flex-1 bg-[#FFF8F0] min-h-screen px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-slate-800">Termos de Uso</h3>
        <p className="text-xs text-slate-400 mt-1">Regras e responsabilidades para o uso seguro do aplicativo Baby Grow.</p>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-6 text-slate-700 leading-relaxed text-sm">
        
        {/* Section 1 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
            1. Descrição Geral
          </h4>
          <p className="text-xs text-slate-500">
            O <strong>Baby Grow</strong> é uma ferramenta digital no formato de diário de rotina e lembrete pessoal, desenvolvido com o objetivo de apoiar a família e os cuidadores na organização do dia a dia do bebê.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
            2. Não é um Aplicativo Médico
          </h4>
          <p className="text-xs text-slate-500 flex items-start gap-1.5">
            <Stethoscope className="w-4.5 h-4.5 text-orange-500 shrink-0 mt-0.5" />
            <span>
              O aplicativo <strong>não é um dispositivo de saúde</strong> e todas as informações cadastrais e científicas sugeridas (como gráficos de crescimento baseados nos percentis da OMS, vacinas do calendário do SUS e reações) possuem caráter meramente informativo e educativo.
            </span>
          </p>
          <p className="text-xs text-slate-500 flex items-start gap-1.5">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <span>
              <strong>Nunca use</strong> o aplicativo para fins de autodiagnóstico. O aplicativo de forma alguma substitui as avaliações clínicas, consultas periódicas e diagnósticos feitos pelo pediatra ou outro profissional de saúde qualificado.
            </span>
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
            3. Registro de Medicamentos
          </h4>
          <p className="text-xs text-slate-500">
            A funcionalidade de medicamentos auxilia na organização e programação de lembretes. A dosagem, horários e tipos de medicamentos devem seguir rigorosamente a prescrição e receita dadas pelo médico pediatra do bebê. O desenvolvedor não se responsabiliza por erros de dosagem digitados incorretamente no sistema.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
            4. Limitações e Responsabilidades
          </h4>
          <p className="text-xs text-slate-500 flex items-start gap-1.5">
            <RefreshCw className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              <strong>Lembretes e Notificações:</strong> Os alertas temporizados dependem diretamente do sistema operacional do seu celular e de regras de otimização de economia de bateria. Não podemos garantir que os lembretes serão disparados com 100% de pontualidade. Recomendamos manter vigilância constante nas rotinas essenciais do bebê.
            </span>
          </p>
          <p className="text-xs text-slate-500 flex items-start gap-1.5">
            <AlertTriangle className="w-4.5 h-4.5 text-[#FF7A00] shrink-0 mt-0.5" />
            <span>
              <strong>Limitações do Aplicativo:</strong> O aplicativo serve estritamente para o registro e organização da rotina e diário do bebê. O Baby Grow não realiza qualquer análise clínica, diagnósticos de saúde, prescrição de medicamentos ou indicação de dosagens.
            </span>
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
            5. Exclusão e Modificações
          </h4>
          <p className="text-xs text-slate-500">
            Ao utilizar o app, você aceita que a aplicação é disponibilizada de forma gratuita "como está". O usuário é totalmente responsável pelos registros e pode, a qualquer momento e irreversivelmente, realizar a exclusão total de sua conta e de todos os dados do banco de dados na nuvem.
          </p>
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 pt-4 flex items-center gap-2 text-xs text-slate-400 font-bold justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Baby Grow - Uso Seguro e Consciente</span>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUseScreen;
