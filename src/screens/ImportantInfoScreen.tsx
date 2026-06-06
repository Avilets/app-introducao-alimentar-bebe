import React, { useState, useEffect } from 'react';
import { Info, Check, ShieldAlert, Heart, Calendar, Stethoscope, AlertTriangle } from 'lucide-react';

interface ImportantInfoScreenProps {
  onBack: () => void;
}

export const ImportantInfoScreen: React.FC<ImportantInfoScreenProps> = ({ onBack }) => {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const isAccepted = localStorage.getItem('rt_medical_disclaimer_accepted') === 'true';
    setAccepted(isAccepted);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('rt_medical_disclaimer_accepted', 'true');
    setAccepted(true);
    // Wait a brief moment for visual feedback before heading back
    setTimeout(() => {
      onBack();
    }, 1200);
  };

  return (
    <div className="flex-1 bg-[#FFF8F0] min-h-screen px-4 py-6 space-y-6">
      {/* Intro */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-slate-800">Informações Importantes</h3>
        <p className="text-xs text-slate-400 mt-1">
          Termo de esclarecimento de segurança sobre o uso e limites do Baby Grow.
        </p>
      </div>

      {/* Main points list */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-5">
        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
          Termo de Esclarecimento Médico
        </h4>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          {/* Point 1 */}
          <div className="flex gap-3">
            <Heart className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p>
              <strong>Diário de rotina e organização familiar</strong>: O Baby Grow serve apenas como um bloco de notas digital para ajudar a acompanhar mamadas, sonecas, vacinas e trocas de fralda.
            </p>
          </div>

          {/* Point 2 */}
          <div className="flex gap-3">
            <Stethoscope className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p>
              <strong>Não é um dispositivo médico</strong>: O aplicativo não realiza diagnósticos de patologias, não sugere tratamentos, nem estima a gravidade de sintomas do bebê.
            </p>
          </div>

          {/* Point 3 */}
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p>
              <strong>Não substitui consultas médicas</strong>: As curvas de crescimento e percentis são estatísticas matemáticas aproximadas baseadas na tabela padrão da OMS. Elas não representam avaliações clínicas e devem ser analisadas diretamente com o pediatra.
            </p>
          </div>

          {/* Point 4 */}
          <div className="flex gap-3">
            <Calendar className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p>
              <strong>Não substitui o cartão de vacina oficial</strong>: A lista de imunizantes sugerida baseia-se nas diretrizes oficiais de 2026. Porém, o cronograma definitivo deve ser validado no posto de saúde ou clínica junto com o cartão oficial do bebê.
            </p>
          </div>

          {/* Point 5 */}
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p>
              <strong>Não prescreve medicamentos</strong>: O controle de medicamentos serve somente para você registrar as doses que administrou voluntariamente. O Baby Grow nunca indicará dosagens, tipos de remédio ou frequência de uso.
            </p>
          </div>
        </div>
      </div>

      {/* Accept/Li e Entendi Trigger */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleAccept}
          className={`w-full py-4 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-xs cursor-pointer shadow-md ${
            accepted 
              ? 'bg-emerald-500 text-white shadow-emerald-100' 
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100'
          }`}
        >
          {accepted ? (
            <>
              <Check className="w-4 h-4" />
              Aviso Lido e Compreendido!
            </>
          ) : (
            'Li e entendi'
          )}
        </button>
        <p className="text-[10px] text-slate-400 text-center">
          Ao concordar, você declara estar ciente de que as informações deste aplicativo possuem caráter exclusivamente educativo e organizativo.
        </p>
      </div>
    </div>
  );
};

export default ImportantInfoScreen;
