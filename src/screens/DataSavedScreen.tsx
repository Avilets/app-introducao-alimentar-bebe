import React from 'react';
import { Info, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export const DataSavedScreen: React.FC = () => {
  return (
    <div className="flex-1 bg-[#FFF8F0] min-h-screen px-4 py-6 space-y-6">
      {/* Intro */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
          <Info className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-slate-800">Quais dados são salvos?</h3>
        <p className="text-xs text-slate-400 mt-1">Transparência em primeiro lugar. Veja exatamente o que guardamos para o app funcionar e o que nós nunca coletamos.</p>
      </div>

      {/* Grid of Saved vs Not Saved */}
      <div className="space-y-4">
        {/* What IS Saved */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            O que é coletado e salvo
          </h4>
          <p className="text-[11px] text-slate-400 leading-normal mb-2">
            Estas informações são necessárias para fornecer o diário de rotina e as estatísticas de saúde do seu bebê:
          </p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span><strong>E-mail de cadastro</strong>: Para criar sua conta e permitir o login de forma segura.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span><strong>Dados do bebê</strong>: Nome, data de nascimento, gênero e foto opcional (comprimida localmente).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span><strong>Histórico de alimentação</strong>: Mamadas, consumo de fórmula, água, frutinhas, refeições e reações alérgicas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span><strong>Registros diários</strong>: Trocas de fralda, horas de sono e logs de medicamentos dados.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span><strong>Medidas de saúde</strong>: Peso, altura, perímetro cefálico, anotações de pediatria e vacinas aplicadas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span><strong>Dados de notificação</strong>: Token de notificação push vinculados ao dispositivo para disparar seus lembretes programados.</span>
            </li>
          </ul>
        </div>

        {/* What IS NOT Saved */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 text-rose-600">
            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
            O que NUNCA coletamos ou salvamos
          </h4>
          <p className="text-[11px] text-slate-400 leading-normal mb-2">
            Garantimos total privacidade não solicitando ou armazenando dados desnecessários:
          </p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">•</span>
              <span><strong>Documentos oficiais</strong>: Nunca pedimos CPF, RG ou dados de certidão de nascimento.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">•</span>
              <span><strong>Dados financeiros</strong>: Não há cobrança, dados bancários ou cartões de crédito salvos no app.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">•</span>
              <span><strong>Senha em texto aberto</strong>: Suas senhas são criptografadas diretamente pelo Firebase Auth e são inacessíveis para nós.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">•</span>
              <span><strong>Localização precisa</strong>: Não usamos o GPS do seu aparelho para rastrear sua localização.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">•</span>
              <span><strong>Fotos pessoais extras</strong>: Apenas salvamos a foto de perfil do bebê se você escolher enviar. Nenhuma outra foto é armazenada.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Safety Badge */}
      <div className="bg-orange-50 border border-orange-100 rounded-3xl p-4 flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-orange-500 shrink-0" />
        <div>
          <h5 className="font-bold text-orange-950 text-xs">Conformidade e Controle</h5>
          <p className="text-[10px] text-orange-700 leading-normal mt-0.5">
            Você é dono das suas informações. Exporte ou delete seus dados a qualquer momento pelo menu de privacidade.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataSavedScreen;
