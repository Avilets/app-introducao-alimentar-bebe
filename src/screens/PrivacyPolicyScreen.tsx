import React from 'react';
import { Shield, Lock, Mail, Info } from 'lucide-react';

export const PrivacyPolicyScreen: React.FC = () => {
  return (
    <div className="flex-1 bg-[#FFF8F0] min-h-screen px-4 py-6 space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-slate-800">Política de Privacidade</h3>
        <p className="text-xs text-slate-400 mt-1">Sua privacidade e a segurança dos dados do seu bebê são nossas maiores prioridades.</p>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-6 text-slate-700 leading-relaxed text-sm">
        
        {/* Section 1 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
            1. Quais dados coletamos?
          </h4>
          <p className="text-xs text-slate-500">
            Coletamos apenas as informações que você insere voluntariamente no diário:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-500 pl-2 space-y-1">
            <li>Endereço de e-mail de login para autenticação.</li>
            <li>Dados do bebê: Nome, nascimento, gênero e foto opcional.</li>
            <li>Registros de alimentação, mamadas, frutas, refeições e reações.</li>
            <li>Dados de rotina: Horários de sono, trocas de fralda e medicamentos.</li>
            <li>Dados de saúde: Peso, comprimento, perímetro cefálico e vacinas aplicadas.</li>
            <li>Tokens técnicos de notificação para entrega dos alertas de lembretes.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
            2. Por que os dados são salvos?
          </h4>
          <p className="text-xs text-slate-500">
            Armazenamos estes registros para permitir que você consulte o histórico do bebê, veja estatísticas diárias de sono e fraldas, gere relatórios estruturados para o pediatra e visualize a evolução do peso e comprimento em gráficos de percentil da OMS.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
            3. Armazenamento e Criptografia
          </h4>
          <p className="text-xs text-slate-500 flex items-start gap-1.5">
            <Lock className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <span>
              <strong>Nuvem (Firebase)</strong>: Os dados são salvos nos servidores seguros do Google Firebase (Firestore Database) com regras de segurança rígidas ativas que bloqueiam o acesso a qualquer pessoa que não seja você.
            </span>
          </p>
          <p className="text-xs text-slate-500 flex items-start gap-1.5">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              <strong>Local (Convidado)</strong>: No modo de simulação/demonstração, os dados são salvos exclusivamente no armazenamento local do seu próprio aparelho (LocalStorage) e não são enviados para a internet.
            </span>
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
            4. Sem Analytics e Sem Rastreadores
          </h4>
          <p className="text-xs text-slate-500">
            O <strong>Baby Grow</strong> não utiliza Firebase Analytics, Google Analytics, cookies ou qualquer ferramenta terceirizada de rastreamento de comportamento ou anúncios. Seus dados de uso continuam exclusivamente privados.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
            5. Controle e Exclusão de Dados
          </h4>
          <p className="text-xs text-slate-500">
            Você tem o direito de exportar todos os dados do bebê no formato JSON ou de excluir definitivamente a sua conta e todos os dados registrados nas Configurações, na aba "Privacidade e dados".
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-2 bg-amber-50 border border-amber-100 rounded-2xl p-3.5 flex items-start gap-2.5">
          <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold text-amber-800 text-xs">Aviso Importante e Limitações do Aplicativo</h5>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              O Baby Grow é um aplicativo de apoio de rotina diária e organização familiar. Ele não é um dispositivo médico e de forma alguma substitui as consultas, orientações e acompanhamento do pediatra do bebê.
            </p>
            <p className="text-[11px] text-amber-700 leading-relaxed mt-1">
              <strong>Limitações do Aplicativo:</strong> O aplicativo serve estritamente para o registro e organização da rotina e diário do bebê. O Baby Grow não realiza qualquer análise clínica, diagnósticos de saúde, prescrição de medicamentos ou indicação de dosagens.
            </p>
          </div>
        </div>

        {/* Support email placeholder */}
        <div className="border-t border-slate-100 pt-4 flex items-center gap-3 text-xs text-slate-400">
          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Suporte: [INSERIR E-MAIL DE SUPORTE]</span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;
