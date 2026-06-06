import React, { useState } from 'react';
import { ShieldAlert, Plus, Trash2, Clock, X, Info } from 'lucide-react';
import type { DiaperRecord } from '../types';

interface DiaperScreenProps {
  diaperRecords: DiaperRecord[];
  userRole?: 'admin' | 'cuidador' | 'leitura';
  onSaveRecord: (record: Omit<DiaperRecord, 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
}

export const DiaperScreen: React.FC<DiaperScreenProps> = ({
  diaperRecords,
  userRole = 'admin',
  onSaveRecord,
  onDeleteRecord
}) => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DiaperRecord | null>(null);

  // Form States
  const [diaperType, setDiaperType] = useState<'xixi' | 'cocô' | 'xixi e cocô' | 'seca'>('xixi');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [stoolColor, setStoolColor] = useState('Amarelo ouro');
  const [stoolConsistency, setStoolConsistency] = useState<'líquida' | 'pastosa' | 'normal' | 'dura' | 'outro'>('normal');
  const [notes, setNotes] = useState('');

  // 1. Calculate stats of today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = diaperRecords.filter(r => r.datetime.startsWith(todayStr));
  
  const peeCount = todayRecords.filter(r => r.diaperType === 'xixi' || r.diaperType === 'xixi e cocô').length;
  const poopCount = todayRecords.filter(r => r.diaperType === 'cocô' || r.diaperType === 'xixi e cocô').length;
  const dryCount = todayRecords.filter(r => r.diaperType === 'seca').length;
  const totalCount = todayRecords.length;

  // 2. Dehydration alert: check if > 6 hours since last wet diaper (xixi or xixi e cocô)
  const getDehydrationAlert = (): boolean => {
    const wetRecords = diaperRecords
      .filter(r => r.diaperType === 'xixi' || r.diaperType === 'xixi e cocô')
      .sort((a, b) => b.datetime.localeCompare(a.datetime));

    if (wetRecords.length === 0) {
      // If no wet diapers have ever been recorded, don't flag yet if list is empty
      return false;
    }

    const lastWetTime = new Date(wetRecords[0].datetime).getTime();
    const sixHoursInMs = 6 * 60 * 60 * 1000;
    
    return (Date.now() - lastWetTime) > sixHoursInMs;
  };

  const showDehydrationWarning = getDehydrationAlert();

  // Open modal for new record
  const handleOpenNewForm = () => {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = now.toTimeString().slice(0, 5);

    setDiaperType('xixi');
    setDate(formattedDate);
    setTime(formattedTime);
    setStoolColor('Amarelo ouro');
    setStoolConsistency('normal');
    setNotes('');
    setEditingRecord(null);
    setShowFormModal(true);
  };

  // Open modal for editing existing record
  const handleOpenEditForm = (rec: DiaperRecord) => {
    setEditingRecord(rec);
    setDiaperType(rec.diaperType);
    
    const [rDate, rTime] = rec.datetime.split('T');
    setDate(rDate);
    setTime(rTime || '00:00');
    setStoolColor(rec.stoolColor || 'Amarelo ouro');
    setStoolConsistency(rec.stoolConsistency || 'normal');
    setNotes(rec.notes || '');
    setShowFormModal(true);
  };

  // Handle Submit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      alert('Data e hora são obrigatórias.');
      return;
    }

    const datetime = `${date}T${time}`;

    try {
      await onSaveRecord({
        id: editingRecord?.id,
        babyId: 'baby-1', // Fallback or baby ID
        diaperType,
        datetime,
        stoolColor: (diaperType === 'cocô' || diaperType === 'xixi e cocô') ? stoolColor : undefined,
        stoolConsistency: (diaperType === 'cocô' || diaperType === 'xixi e cocô') ? stoolConsistency : undefined,
        notes
      });
      setShowFormModal(false);
    } catch (error) {
      console.error('Erro ao salvar registro de fralda:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-4 space-y-5">
      {/* Title */}
      <div className="text-center py-1">
        <h2 className="text-xl font-black text-slate-800">Fraldas do Bebê</h2>
        <p className="text-xs text-slate-500 mt-0.5">Acompanhe as trocas de fralda e saúde intestinal</p>
      </div>

      {/* Dehydration Warning Alert Banner */}
      {showDehydrationWarning && (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-4 flex gap-3 text-rose-800 shadow-sm animate-pulse">
          <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 leading-none">Aviso de Registro de Fralda</h4>
            <p className="text-[10px] text-rose-700 leading-relaxed font-semibold">
              Não constam registros de urina nas últimas 6 horas. Este aviso serve como lembrete para registrar as trocas do bebê no aplicativo.
            </p>
          </div>
        </div>
      )}

      {/* Diaper Statistics Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 leading-none">
          <span>📊</span> Trocas de Fralda de Hoje
        </h3>
        
        <div className="grid grid-cols-4 gap-2.5">
          {/* Total */}
          <div className="bg-slate-50 rounded-2xl p-2.5 text-center flex flex-col justify-center">
            <span className="text-[8px] text-slate-400 font-bold uppercase block leading-none">Total</span>
            <span className="text-base font-black text-slate-850 mt-1 block leading-none">{totalCount}</span>
          </div>

          {/* Pee */}
          <div className="bg-blue-50/50 rounded-2xl p-2.5 text-center flex flex-col justify-center border border-blue-50">
            <span className="text-[8px] text-blue-500 font-bold uppercase block leading-none">Xixi</span>
            <span className="text-base font-black text-blue-750 mt-1 block leading-none">{peeCount}</span>
          </div>

          {/* Poop */}
          <div className="bg-amber-50/50 rounded-2xl p-2.5 text-center flex flex-col justify-center border border-amber-50">
            <span className="text-[8px] text-amber-600 font-bold uppercase block leading-none">Cocô</span>
            <span className="text-base font-black text-amber-750 mt-1 block leading-none">{poopCount}</span>
          </div>

          {/* Dry */}
          <div className="bg-rose-50/30 rounded-2xl p-2.5 text-center flex flex-col justify-center">
            <span className="text-[8px] text-rose-450 font-bold uppercase block leading-none">Seca</span>
            <span className="text-base font-black text-rose-700 mt-1 block leading-none">{dryCount}</span>
          </div>
        </div>
      </div>

      {/* Registros Recentes Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold text-slate-800">Trocas de Fralda</h3>
          {userRole !== 'leitura' && (
            <button
              onClick={handleOpenNewForm}
              className="text-xs text-[#FF7A00] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Registrar Troca
            </button>
          )}
        </div>

        {diaperRecords.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
            <p className="text-xs font-semibold text-slate-400">Nenhum registro de fralda ainda.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {[...diaperRecords].sort((a,b) => b.datetime.localeCompare(a.datetime)).map((rec) => {
              const [rDate, rTime] = rec.datetime.split('T');
              const formattedDate = rDate.split('-').reverse().join('/');
              const formattedTime = rTime || '00:00';

              const isPoop = rec.diaperType === 'cocô' || rec.diaperType === 'xixi e cocô';

              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    if (userRole === 'leitura') return;
                    handleOpenEditForm(rec);
                  }}
                  className={`bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 transition-colors ${
                    userRole === 'leitura' ? '' : 'hover:border-orange-100 cursor-pointer active:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Icon mapping */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      rec.diaperType === 'xixi' ? 'bg-blue-50 text-blue-500' :
                      rec.diaperType === 'cocô' ? 'bg-amber-50 text-amber-700' :
                      rec.diaperType === 'xixi e cocô' ? 'bg-orange-50 text-orange-600' :
                      'bg-slate-50 text-slate-450'
                    }`}>
                      <span className="text-base">
                        {rec.diaperType === 'xixi' ? '💦' :
                         rec.diaperType === 'cocô' ? '💩' :
                         rec.diaperType === 'xixi e cocô' ? '✨' : '💨'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          Fralda: {rec.diaperType === 'xixi' ? 'Xixi' :
                                   rec.diaperType === 'cocô' ? 'Cocô' :
                                   rec.diaperType === 'xixi e cocô' ? 'Mista (Xixi e Cocô)' : 'Seca'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {formattedTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-0.5 flex-wrap">
                        <span className="font-semibold">{formattedDate}</span>
                        {isPoop && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-amber-750">Fezes: {rec.stoolColor} ({rec.stoolConsistency})</span>
                          </>
                        )}
                      </div>

                      {rec.notes && (
                        <p className="text-[9px] text-slate-400 italic mt-1 truncate max-w-[200px]">
                          "{rec.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {rec.id && userRole !== 'leitura' && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm('Tem certeza que deseja remover este registro?')) {
                          await onDeleteRecord(rec.id!);
                        }
                      }}
                      className="p-1.5 hover:bg-slate-50 text-slate-350 hover:text-rose-500 rounded-lg transition-colors active:scale-90 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Required Education disclaimer warning */}
      <div className="p-4 border border-[#FF7E09]/10 bg-[#FFF8F0]/50 rounded-3xl flex items-start gap-3 mt-4 shrink-0">
        <Info className="w-4.5 h-4.5 text-[#FF7A00] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h5 className="text-[11px] font-black uppercase tracking-wider text-[#FF7A00]">
            Informativo de Rotina
          </h5>
          <p className="text-xs leading-relaxed font-medium text-slate-700 text-left">
            Os registros servem apenas para acompanhamento e organização. A cor, consistência e frequência das fezes registradas não são analisadas clinicamente pelo aplicativo.
          </p>
        </div>
      </div>

      {/* Diaper Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-800">
                {editingRecord ? 'Editar Registro' : 'Registrar Troca de Fralda'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 text-slate-450 hover:text-slate-650 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 overflow-y-auto">
              {/* Diaper Type Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Fralda</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['xixi', 'cocô', 'xixi e cocô', 'seca'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDiaperType(type)}
                      className={`py-2 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                        diaperType === type
                          ? 'bg-orange-500 border-orange-500 text-white shadow-xs'
                          : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type === 'xixi' ? '💦 Xixi' :
                       type === 'cocô' ? '💩 Cocô' :
                       type === 'xixi e cocô' ? '✨ Mista' : '💨 Seca'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hora</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Stool details (show only if poop or mixed) */}
              {(diaperType === 'cocô' || diaperType === 'xixi e cocô') && (
                <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 space-y-3">
                  <span className="text-[10px] font-black text-slate-450 uppercase block tracking-wider">Aspectos das Fezes</span>
                  
                  {/* Color */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Cor do Cocô</label>
                    <select
                      value={stoolColor}
                      onChange={(e) => setStoolColor(e.target.value)}
                      className="w-full text-xs font-semibold p-2 border border-slate-150 rounded-xl bg-white outline-none"
                    >
                      <option value="Amarelo ouro">Amarelo ouro (típico)</option>
                      <option value="Esverdeado">Esverdeado</option>
                      <option value="Marrom">Marrom</option>
                      <option value="Escuro/Preto">Escuro/Preto</option>
                      <option value="Com raios de sangue">Vermelho/Com raios de sangue (Atenção)</option>
                      <option value="Esbranquiçado">Esbranquiçado/Acolia (Atenção)</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  {/* Consistency */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Consistência</label>
                    <select
                      value={stoolConsistency}
                      onChange={(e) => setStoolConsistency(e.target.value as any)}
                      className="w-full text-xs font-semibold p-2 border border-slate-150 rounded-xl bg-white outline-none"
                    >
                      <option value="normal">Normal</option>
                      <option value="pastosa">Pastosa</option>
                      <option value="líquida">Líquida / Diarreia</option>
                      <option value="dura">Dura / Constipação</option>
                      <option value="outro">Outra</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Assadura leve, cheiro muito forte..."
                  className="w-full text-xs font-medium p-2.5 border border-slate-150 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 h-20 resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-3 border border-slate-150 text-slate-500 font-bold rounded-2xl text-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-2xl text-xs active:scale-95 transition-all shadow-md shadow-orange-100 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaperScreen;
