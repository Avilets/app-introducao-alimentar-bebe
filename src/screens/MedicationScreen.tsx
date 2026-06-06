import React, { useState } from 'react';
import { Pill, Plus, Trash2, Clock, Check, X, User, Ban } from 'lucide-react';
import type { Medication, MedicationLog, Reminder } from '../types';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

interface MedicationScreenProps {
  medications: Medication[];
  medicationLogs: MedicationLog[];
  reminders: Reminder[];
  userRole?: 'admin' | 'cuidador' | 'leitura';
  onSaveMedication: (med: Omit<Medication, 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  onDeleteMedication: (id: string) => Promise<void>;
  onSaveMedicationLog: (log: Omit<MedicationLog, 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  onDeleteMedicationLog: (id: string) => Promise<void>;
}

export const MedicationScreen: React.FC<MedicationScreenProps> = ({
  medications,
  medicationLogs,
  reminders,
  userRole = 'admin',
  onSaveMedication,
  onDeleteMedication,
  onSaveMedicationLog,
  onDeleteMedicationLog
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  // Form states for new/editing medication
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medUnit, setMedUnit] = useState<'ml' | 'gotas' | 'comprimido' | 'sachê' | 'outro'>('gotas');
  const [frequencyType, setFrequencyType] = useState<Medication['frequencyType']>('dose única');
  const [intervalHours, setIntervalHours] = useState('8');
  const [timesPerDay, setTimesPerDay] = useState('3');
  const [fixedTimesInput, setFixedTimesInput] = useState('08:00, 20:00');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [editingMedicationId, setEditingMedicationId] = useState<string | undefined>(undefined);
  const [enableReminder, setEnableReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('08:00');

  // Form states for administration log
  const [logStatus, setLogStatus] = useState<'administrado' | 'pulado' | 'atrasado'>('administrado');
  const [logDate, setLogDate] = useState('');
  const [logTime, setLogTime] = useState('');
  const [logNotes, setLogNotes] = useState('');

  // Helper to open Add Medication modal
  const handleOpenAddModal = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setMedName('');
    setMedDose('');
    setMedUnit('gotas');
    setFrequencyType('dose única');
    setIntervalHours('8');
    setTimesPerDay('3');
    setFixedTimesInput('08:00, 20:00');
    setStartDate(todayStr);
    setEndDate('');
    setPrescribedBy('');
    setNotes('');
    setEditingMedicationId(undefined);
    setEnableReminder(true);
    setReminderTime('08:00');
    setShowAddModal(true);
  };

  // Helper to open Edit Medication modal
  const handleOpenEditModal = (med: Medication) => {
    setEditingMedicationId(med.id);
    setMedName(med.name);
    setMedDose(med.dose);
    setMedUnit(med.unit);
    setFrequencyType(med.frequencyType);
    setIntervalHours(String(med.intervalHours || '8'));
    setTimesPerDay(String(med.timesPerDay || '3'));
    setFixedTimesInput(med.fixedTimes ? med.fixedTimes.join(', ') : '08:00, 20:00');
    setStartDate(med.startDate);
    setEndDate(med.endDate || '');
    setPrescribedBy(med.prescribedBy || '');
    setNotes(med.notes || '');
    setEnableReminder(med.enableReminder !== undefined ? med.enableReminder : true);
    setReminderTime(med.reminderTime || '08:00');
    setShowAddModal(true);
  };

  // Helper to open log administration modal
  const handleOpenLogModal = (med: Medication) => {
    const now = new Date();
    setSelectedMedication(med);
    setLogStatus('administrado');
    setLogDate(now.toISOString().split('T')[0]);
    setLogTime(now.toTimeString().slice(0, 5));
    setLogNotes('');
    setShowLogModal(true);
  };

  // Save Medication handler
  const handleSaveMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDose || !startDate) {
      alert('Nome, Dose e Data de Início são obrigatórios.');
      return;
    }

    let parsedFixedTimes: string[] | undefined = undefined;
    if (frequencyType === 'horários fixos') {
      parsedFixedTimes = fixedTimesInput
        .split(',')
        .map(t => t.trim())
        .filter(t => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(t));
      
      if (parsedFixedTimes.length === 0) {
        alert('Por favor, insira horários válidos no formato HH:MM (ex: 08:00, 16:00).');
        return;
      }
    }

    try {
      await onSaveMedication({
        id: editingMedicationId,
        babyId: 'baby-1',
        name: medName,
        dose: medDose,
        unit: medUnit,
        frequencyType,
        intervalHours: frequencyType === 'a cada X horas' ? Number(intervalHours) : undefined,
        timesPerDay: frequencyType === 'X vezes ao dia' ? Number(timesPerDay) : undefined,
        fixedTimes: parsedFixedTimes,
        startDate,
        endDate: endDate || undefined,
        prescribedBy,
        notes,
        active: true,
        enableReminder,
        reminderTime: frequencyType !== 'horários fixos' ? reminderTime : undefined
      });
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Save Medication Log Submit
  const handleSaveLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedication) return;

    try {
      await onSaveMedicationLog({
        babyId: 'baby-1',
        medicationId: selectedMedication.id!,
        medicationName: selectedMedication.name,
        datetime: `${logDate}T${logTime}`,
        doseGiven: `${selectedMedication.dose} ${selectedMedication.unit}`,
        status: logStatus,
        notes: logNotes
      });
      setShowLogModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (med: Medication) => {
    try {
      await onSaveMedication({
        ...med,
        active: !med.active
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Find next reminder trigger time for next dose details
  const getNextDoseTime = (medId: string): string => {
    const medReminders = reminders
      .filter(r => r.medicationId === medId && r.active && r.nextTriggerAt > 0)
      .sort((a, b) => a.nextTriggerAt - b.nextTriggerAt);

    if (medReminders.length === 0) return 'Inativo / Sem dose programada';

    const nextTime = medReminders[0].nextTriggerAt;
    const dateObj = new Date(nextTime);
    const today = new Date();
    
    const isToday = dateObj.getDate() === today.getDate() &&
                    dateObj.getMonth() === today.getMonth() &&
                    dateObj.getFullYear() === today.getFullYear();

    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Hoje às ${timeStr}` : `${dateObj.toLocaleDateString([], {day:'2-digit', month:'2-digit'})} às ${timeStr}`;
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-4 space-y-5">
      {/* Title */}
      <div className="text-center py-1">
        <h2 className="text-xl font-black text-slate-800">Medicamentos</h2>
        <p className="text-xs text-slate-500 mt-0.5">Gerencie os remédios e horários de dosagem</p>
      </div>

      {/* Medications list */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold text-slate-800">Medicamentos Cadastrados</h3>
          {userRole !== 'leitura' && (
            <button
              onClick={handleOpenAddModal}
              className="text-xs text-[#FF7A00] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Remédio
            </button>
          )}
        </div>

        {medications.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
            <p className="text-xs font-semibold text-slate-400">Nenhum medicamento registrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => {
              const isMedActive = med.active;
              const nextDoseStr = getNextDoseTime(med.id!);

              return (
                <div
                  key={med.id}
                  className={`bg-white border rounded-3xl p-4 shadow-sm flex flex-col gap-3 transition-colors ${
                    isMedActive ? 'border-slate-100' : 'border-slate-100 opacity-60 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isMedActive ? 'bg-orange-50 text-orange-600' : 'bg-slate-200 text-slate-400'
                      }`}>
                        <Pill className="w-5 h-5" />
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                          <span>{med.name}</span>
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {med.dose} {med.unit}
                          </span>
                        </h4>
                        
                        <p className="text-[9px] text-slate-500 font-semibold mt-1">
                          Frequência: {med.frequencyType} 
                          {med.frequencyType === 'a cada X horas' && ` (a cada ${med.intervalHours}h)`}
                          {med.frequencyType === 'X vezes ao dia' && ` (${med.timesPerDay}x por dia)`}
                        </p>

                        {med.prescribedBy && (
                          <p className="text-[9px] text-slate-400 font-medium flex items-center gap-0.5 mt-0.5">
                            <User className="w-2.5 h-2.5" /> Prescrito por: {med.prescribedBy}
                          </p>
                        )}
                      </div>
                    </div>

                    {userRole !== 'leitura' && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleActive(med)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isMedActive 
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                          title={isMedActive ? 'Pausar Lembretes' : 'Ativar Lembretes'}
                        >
                          {isMedActive ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(med)}
                          className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-orange-500 rounded-lg cursor-pointer"
                          title="Editar"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={async () => {
                            if (confirm(`Tem certeza que deseja excluir ${med.name}?`)) {
                              await onDeleteMedication(med.id!);
                            }
                          }}
                          className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dose Tracker Widget */}
                  {isMedActive && (
                    <div className="bg-orange-50/50 border border-orange-100/30 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-orange-600 block leading-none">PRÓXIMA DOSE</span>
                        <span className="text-xs font-bold text-slate-800 mt-1 block leading-none">{nextDoseStr}</span>
                      </div>
                      
                      {userRole !== 'leitura' && (
                        <button
                          onClick={() => handleOpenLogModal(med)}
                          className="py-1.5 px-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl text-[10px] active:scale-95 transition-all shadow-sm shadow-orange-100 flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Check className="w-3 h-3" /> Registrar Dose
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Medication administration history */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-slate-800 pl-1">Administrações Recentes</h3>
        
        {medicationLogs.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
            <p className="text-xs font-semibold text-slate-400">Nenhuma dose registrada recentemente.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {medicationLogs.slice(0, 10).map((log) => {
              const [lDate, lTime] = log.datetime.split('T');
              const formattedDate = lDate.split('-').reverse().join('/');
              const formattedTime = lTime || '00:00';

              return (
                <div
                  key={log.id}
                  className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      log.status === 'administrado' ? 'bg-emerald-50 text-emerald-600' :
                      log.status === 'atrasado' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-500'
                    }`}>
                      <span className="text-xs font-black">
                        {log.status === 'administrado' ? '✓' :
                         log.status === 'atrasado' ? '⏰' : '✕'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-none">
                        {log.medicationName}
                      </h4>
                      <p className="text-[9px] text-slate-450 mt-1 font-semibold leading-none">
                        Dose de {log.doseGiven} • {formattedDate} às {formattedTime} 
                        <span className={`ml-1.5 uppercase font-bold text-[8px] rounded px-1 py-0.2 ${
                          log.status === 'administrado' ? 'bg-emerald-100 text-emerald-800' :
                          log.status === 'atrasado' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status}
                        </span>
                      </p>
                      {log.notes && (
                        <p className="text-[9px] text-slate-400 italic mt-1 truncate">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {log.id && userRole !== 'leitura' && (
                    <button
                      onClick={async () => {
                        if (confirm('Deseja excluir este registro de administração?')) {
                          await onDeleteMedicationLog(log.id!);
                        }
                      }}
                      className="p-1 hover:bg-slate-50 text-slate-350 hover:text-rose-500 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MedicalDisclaimer type="medicamentos" className="mt-4 shrink-0" />

      {/* Add/Edit Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-800">
                {editingMedicationId ? 'Editar Medicamento' : 'Adicionar Medicamento'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-450 hover:text-slate-650 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMedSubmit} className="p-5 space-y-4 overflow-y-auto">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Medicamento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vitamina D, Paracetamol..."
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none focus:border-orange-500"
                />
              </div>

              {/* Dose and Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Dose (Quantidade)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 5, 2, 0.5..."
                    value={medDose}
                    onChange={(e) => setMedDose(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Unidade</label>
                  <select
                    value={medUnit}
                    onChange={(e) => setMedUnit(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl bg-white outline-none focus:border-orange-500"
                  >
                    <option value="gotas">Gotas</option>
                    <option value="ml">mL</option>
                    <option value="comprimido">Comprimido</option>
                    <option value="sachê">Sachê</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              {/* Frequency rules */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Frequência</label>
                <select
                  value={frequencyType}
                  onChange={(e) => setFrequencyType(e.target.value as any)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl bg-white outline-none focus:border-orange-500"
                >
                  <option value="dose única">Dose Única</option>
                  <option value="a cada X horas">A cada X horas (ex: de 8h em 8h)</option>
                  <option value="X vezes ao dia">X vezes ao dia</option>
                  <option value="horários fixos">Horários Fixos</option>
                </select>
              </div>

              {/* Frequency inputs conditional */}
              {frequencyType === 'a cada X horas' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Intervalo (Horas)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none"
                  />
                </div>
              )}

              {frequencyType === 'X vezes ao dia' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Vezes por Dia</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={timesPerDay}
                    onChange={(e) => setTimesPerDay(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none"
                  />
                </div>
              )}

              {frequencyType === 'horários fixos' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Horários (separados por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Ex: 08:00, 14:00, 20:00"
                    value={fixedTimesInput}
                    onChange={(e) => setFixedTimesInput(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none"
                  />
                </div>
              )}

              {/* Reminders Toggle & Time Selection */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide cursor-pointer select-none" htmlFor="enableReminder">
                    Ativar lembretes para este medicamento
                  </label>
                  <input
                    type="checkbox"
                    id="enableReminder"
                    checked={enableReminder}
                    onChange={(e) => setEnableReminder(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />
                </div>

                {enableReminder && frequencyType !== 'horários fixos' && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="block text-[10px] font-bold text-slate-455 uppercase">
                      {frequencyType === 'dose única' ? 'Horário do Lembrete' : 'Horário da Primeira Dose / Lembrete'}
                    </label>
                    <input
                      type="time"
                      required
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl bg-white outline-none focus:border-orange-500"
                    />
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Data Início</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Data Fim (Opcional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none"
                  />
                </div>
              </div>

              {/* Prescribed by */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Médico Prescritor (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Dra. Viviane - Pediatra"
                  value={prescribedBy}
                  onChange={(e) => setPrescribedBy(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Dar com leite, guardar na geladeira..."
                  className="w-full text-xs font-medium p-2.5 border border-slate-150 rounded-2xl outline-none h-16 resize-none"
                />
              </div>

              {/* Submit buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-slate-150 text-slate-500 font-bold rounded-2xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-orange-100 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Administration Modal */}
      {showLogModal && selectedMedication && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-800">
                Registrar Dose: {selectedMedication.name}
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1 text-slate-450 hover:text-slate-650 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLogSubmit} className="p-5 space-y-4">
              {/* Status Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Status da Dose</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['administrado', 'atrasado', 'pulado'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setLogStatus(status)}
                      className={`py-2 text-[10px] font-black rounded-2xl border transition-all uppercase cursor-pointer ${
                        logStatus === status
                          ? status === 'administrado' ? 'bg-emerald-500 border-emerald-500 text-white' :
                            status === 'atrasado' ? 'bg-amber-500 border-amber-500 text-white' :
                            'bg-rose-500 border-rose-500 text-white'
                          : 'bg-white border-slate-150 text-slate-605'
                      }`}
                    >
                      {status === 'administrado' ? 'Dada ✓' :
                       status === 'atrasado' ? 'Atrasada ⏰' : 'Pulada ✕'}
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
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hora</label>
                  <input
                    type="time"
                    required
                    value={logTime}
                    onChange={(e) => setLogTime(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-150 rounded-2xl outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Observações da Dose (Opcional)</label>
                <textarea
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Ex: Cuspiu um pouco, tomou junto com suco..."
                  className="w-full text-xs font-medium p-2.5 border border-slate-150 rounded-2xl outline-none h-20 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-3 border border-slate-150 text-slate-500 font-bold rounded-2xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-orange-100 cursor-pointer"
                >
                  Confirmar Dose
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationScreen;
