import React from 'react';
import { Info, Stethoscope, AlertTriangle, ShieldCheck, Heart } from 'lucide-react';

interface MedicalDisclaimerProps {
  type: 'geral' | 'crescimento' | 'vacinas' | 'medicamentos' | 'alimentacao';
  className?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ type, className = '' }) => {
  const getDisclaimerContent = () => {
    switch (type) {
      case 'crescimento':
        return {
          title: 'Referência de Crescimento',
          text: 'Os percentis são referências estatísticas aproximadas e não representam diagnóstico ou avaliação clínica. Converse com o pediatra para interpretar o crescimento do bebê.',
          icon: <Stethoscope className="w-4.5 h-4.5 text-orange-500 shrink-0 mt-0.5" />,
          colorBg: 'bg-orange-50/50',
          colorBorder: 'border-orange-100',
          colorText: 'text-orange-800',
          colorSubtext: 'text-orange-700'
        };
      case 'vacinas':
        return {
          title: 'Aviso sobre Vacinas',
          text: 'O calendário apresentado é uma referência educativa. Sempre confirme as vacinas com o cartão de vacinação oficial, posto de saúde e pediatra.',
          icon: <ShieldCheck className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />,
          colorBg: 'bg-blue-50/50',
          colorBorder: 'border-blue-100',
          colorText: 'text-blue-800',
          colorSubtext: 'text-blue-700'
        };
      case 'medicamentos':
        return {
          title: 'Uso de Medicamentos',
          text: 'Utilize medicamentos apenas conforme orientação médica. O Baby Grow não realiza prescrição médica.',
          icon: <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />,
          colorBg: 'bg-rose-50/50',
          colorBorder: 'border-rose-100',
          colorText: 'text-rose-800',
          colorSubtext: 'text-rose-700'
        };
      case 'alimentacao':
        return {
          title: 'Introdução Alimentar',
          text: 'As informações apresentadas possuem caráter educativo e não substituem orientação do pediatra.',
          icon: <Heart className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />,
          colorBg: 'bg-amber-50/50',
          colorBorder: 'border-amber-100',
          colorText: 'text-amber-800',
          colorSubtext: 'text-amber-700'
        };
      case 'geral':
      default:
        return {
          title: 'Informativo de Uso',
          text: 'O Baby Grow é um diário de rotina e acompanhamento familiar. O aplicativo não é um dispositivo médico e não fornece diagnóstico ou prescrições, não substituindo o atendimento profissional.',
          icon: <Info className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />,
          colorBg: 'bg-slate-50/80',
          colorBorder: 'border-slate-100',
          colorText: 'text-slate-800',
          colorSubtext: 'text-slate-600'
        };
    }
  };

  const content = getDisclaimerContent();

  return (
    <div className={`p-4 border rounded-3xl flex items-start gap-3 ${content.colorBg} ${content.colorBorder} ${className}`}>
      {content.icon}
      <div className="space-y-0.5">
        <h5 className={`text-[11px] font-black uppercase tracking-wider ${content.colorText}`}>
          {content.title}
        </h5>
        <p className={`text-xs leading-relaxed font-medium ${content.colorSubtext}`}>
          {content.text}
        </p>
      </div>
    </div>
  );
};

export default MedicalDisclaimer;
