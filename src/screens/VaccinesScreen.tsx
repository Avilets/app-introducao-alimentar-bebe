import React, { useState } from 'react';
import { 
  Check, Trash2, Calendar, 
  X, ChevronDown, ChevronUp, Bell, PlusCircle 
} from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import type { Baby, VaccineRecord, CustomVaccine, Reminder, Vaccine } from '../types';
import { VACCINE_SCHEDULE } from '../data/vaccineSchedule';
import { calculateRecommendedDate, getVaccineStatus } from '../services/vaccineService';

interface VaccinesScreenProps {
  baby: Baby;
  vaccineRecords: VaccineRecord[];
  customVaccines: CustomVaccine[];
  reminders: Reminder[];
  userRole?: 'admin' | 'cuidador' | 'leitura';
  onSaveRecord: (record: Omit<VaccineRecord, 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<string>;
  onDeleteRecord: (id: string) => Promise<void>;
  onSaveCustomVaccine: (custom: Omit<CustomVaccine, 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<string>;
  onDeleteCustomVaccine: (id: string) => Promise<void>;
  onSaveReminder: (reminder: any) => Promise<void>;
}

export const VaccinesScreen: React.FC<VaccinesScreenProps> = ({
  baby,
  vaccineRecords,
  customVaccines,
  reminders,
  userRole = 'admin',
  onSaveRecord,
  onDeleteRecord,
  onSaveCustomVaccine,
  onDeleteCustomVaccine,
  onSaveReminder
}) => {
  // Tabs & filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'applied' | 'delayed'>('all');
  const [expandedMilestones, setExpandedMilestones] = useState<Record<number, boolean>>({
    0: true, // Expand newborn by default
    2: true
  });

  // Modal states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Selected item context for modals
  const [selectedVaccine, setSelectedVaccine] = useState<{
    id: string;
    name: string;
    dose: string;
    recommendedAgeMonths: number;
    recommendedDate: string;
    source: string;
  } | null>(null);

  // Form states
  const [applyForm, setApplyForm] = useState({
    appliedDate: new Date().toISOString().split('T')[0],
    clinic: '',
    batchNumber: '',
    reaction: 'Nenhuma',
    notes: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    targetDate: new Date().toISOString().split('T')[0],
    time: '09:00',
    notes: ''
  });

  const [customForm, setCustomForm] = useState({
    vaccineName: '',
    dose: 'Dose Única',
    recommendedAgeMonths: 0,
    diseasesPrevented: '',
    notes: '',
    repeatDose: false,
    intervalValue: 2,
    intervalUnit: 'months' as 'days' | 'months',
    dosesCount: 3
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Combine scheduled vaccines and custom ones
  const getCombinedSchedule = (): (Vaccine & { isCustom?: boolean })[] => {
    const standard: (Vaccine & { isCustom?: boolean })[] = VACCINE_SCHEDULE.map(v => ({ ...v, isCustom: false }));
    const custom: (Vaccine & { isCustom?: boolean })[] = customVaccines.map(c => ({
      id: c.id || 'custom-ref',
      name: c.vaccineName,
      recommendedAgeMonths: c.recommendedAgeMonths,
      dose: c.dose,
      diseasesPrevented: c.diseasesPrevented || 'Personalizado',
      type: c.type === 'sus' ? 'sus' : c.type === 'particular' ? 'particular' : 'both',
      notes: c.notes || '',
      source: c.type === 'custom' ? 'Manual' : c.type.toUpperCase(),
      active: true,
      isCustom: true
    }));

    return [...standard, ...custom];
  };

  const combinedSchedule = getCombinedSchedule();

  // 2. Helper to find current state of a vaccine
  const getVaccineMeta = (vaccine: Vaccine) => {
    const birthDate = baby.birthDate || new Date().toISOString().split('T')[0];
    const recDate = calculateRecommendedDate(birthDate, vaccine.recommendedAgeMonths);
    const applied = vaccineRecords.find(r => r.vaccineId === vaccine.id);
    
    // Check if there is an active reminder for this vaccine
    const titleMatch = `${vaccine.name} (${vaccine.dose})`;
    const activeReminder = reminders.find(r => r.type === 'vacina' && r.title === titleMatch && r.active);

    const status = getVaccineStatus(recDate, applied, !!activeReminder);

    return {
      recDate,
      applied,
      activeReminder,
      status
    };
  };

  // 3. Group and Filter vaccine list
  const milestones = Array.from(new Set(combinedSchedule.map(v => v.recommendedAgeMonths))).sort((a, b) => a - b);

  // Group text resolver
  const getMilestoneLabel = (months: number) => {
    if (months === 0) return 'Ao Nascer';
    if (months === 1) return '1 Mês';
    if (months < 12) return `${months} Meses`;
    if (months === 12) return '12 Meses (1 Ano)';
    if (months === 15) return '15 Meses (1 Ano e 3 Meses)';
    if (months === 18) return '18 Meses (1 Ano e 6 Meses)';
    if (months >= 24 && months < 48) return `${months / 12} Anos`;
    if (months === 48) return '4 Anos';
    return `${months} Meses`;
  };

  // Calculate overall counts
  const totalApplied = vaccineRecords.filter(r => r.applied).length;
  const delayedList = combinedSchedule.filter(v => getVaccineMeta(v).status === 'delayed');
  const pendingList = combinedSchedule.filter(v => getVaccineMeta(v).status === 'pending');
  const scheduledList = reminders.filter(r => r.type === 'vacina' && r.active);

  // Next vaccine finder
  const getNextVaccineInfo = () => {
    const pendingAndDelayed = combinedSchedule
      .map(v => ({ vaccine: v, meta: getVaccineMeta(v) }))
      .filter(item => item.meta.status === 'delayed' || item.meta.status === 'pending')
      .sort((a, b) => a.meta.recDate.localeCompare(b.meta.recDate));

    if (pendingAndDelayed.length === 0) return null;
    return pendingAndDelayed[0];
  };

  const nextVaccine = getNextVaccineInfo();

  // Toggle accordion
  const toggleMilestone = (months: number) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [months]: !prev[months]
    }));
  };

  // Handle Marking Applied
  const handleOpenApplyModal = (vaccine: Vaccine) => {
    const meta = getVaccineMeta(vaccine);
    setSelectedVaccine({
      id: vaccine.id,
      name: vaccine.name,
      dose: vaccine.dose,
      recommendedAgeMonths: vaccine.recommendedAgeMonths,
      recommendedDate: meta.recDate,
      source: vaccine.source
    });
    setApplyForm({
      appliedDate: new Date().toISOString().split('T')[0],
      clinic: '',
      batchNumber: '',
      reaction: 'Nenhuma',
      notes: ''
    });
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVaccine) return;
    setLoading(true);
    setErrorMsg('');

    try {
      // Save record
      await onSaveRecord({
        babyId: baby.id || 'baby-1',
        vaccineId: selectedVaccine.id,
        vaccineName: selectedVaccine.name,
        dose: selectedVaccine.dose,
        recommendedAgeMonths: selectedVaccine.recommendedAgeMonths,
        recommendedDate: selectedVaccine.recommendedDate,
        applied: true,
        appliedDate: applyForm.appliedDate,
        location: applyForm.clinic,
        batchNumber: applyForm.batchNumber,
        clinic: applyForm.clinic,
        reaction: applyForm.reaction,
        notes: applyForm.notes,
        source: selectedVaccine.source
      });

      // If there was an active reminder, we toggle it off or complete it
      const titleMatch = `${selectedVaccine.name} (${selectedVaccine.dose})`;
      const activeReminder = reminders.find(r => r.type === 'vacina' && r.title === titleMatch && r.active);
      if (activeReminder) {
        // Simple cancellation
        await onSaveReminder({
          ...activeReminder,
          active: false
        });
      }

      setShowApplyModal(false);
      setSelectedVaccine(null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao registrar vacina. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Scheduling Reminder
  const handleOpenScheduleModal = (vaccine: Vaccine) => {
    const meta = getVaccineMeta(vaccine);
    setSelectedVaccine({
      id: vaccine.id,
      name: vaccine.name,
      dose: vaccine.dose,
      recommendedAgeMonths: vaccine.recommendedAgeMonths,
      recommendedDate: meta.recDate,
      source: vaccine.source
    });
    // Set default target date to recommended date if it is in the future, else today
    const todayStr = new Date().toISOString().split('T')[0];
    const initialDate = meta.recDate >= todayStr ? meta.recDate : todayStr;
    setScheduleForm({
      targetDate: initialDate,
      time: '09:00',
      notes: ''
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVaccine) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const [hours, minutes] = scheduleForm.time.split(':').map(Number);
      const targetDate = new Date(scheduleForm.targetDate + 'T00:00:00');
      targetDate.setHours(hours, minutes, 0, 0);

      const reminderTitle = `${selectedVaccine.name} (${selectedVaccine.dose})`;

      // Call onSaveReminder directly
      await onSaveReminder({
        babyId: baby.id || 'baby-1',
        type: 'vacina',
        title: reminderTitle,
        mode: 'fixed',
        fixedTime: scheduleForm.time,
        repeatDaily: false,
        active: true,
        notes: scheduleForm.notes || `Agendamento de dose: ${selectedVaccine.name}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        nextTriggerAt: targetDate.getTime(),
        nextDueAt: targetDate.getTime()
      });

      setShowScheduleModal(false);
      setSelectedVaccine(null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao agendar lembrete. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Handle custom vaccine creation
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.vaccineName) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const birthDate = baby.birthDate || new Date().toISOString().split('T')[0];
      const recDate = calculateRecommendedDate(birthDate, customForm.recommendedAgeMonths);

      // Create CustomVaccine config
      await onSaveCustomVaccine({
        babyId: baby.id || 'baby-1',
        vaccineName: customForm.vaccineName,
        dose: customForm.dose,
        recommendedAgeMonths: Number(customForm.recommendedAgeMonths),
        recommendedDate: recDate,
        type: 'custom',
        diseasesPrevented: customForm.diseasesPrevented,
        notes: customForm.notes,
        repeatDose: customForm.repeatDose,
        intervalValue: customForm.repeatDose ? Number(customForm.intervalValue) : undefined,
        intervalUnit: customForm.repeatDose ? customForm.intervalUnit : undefined,
        dosesCount: customForm.repeatDose ? Number(customForm.dosesCount) : undefined
      });

      // If repeating doses are requested, we automatically spawn the subsequent custom vaccines
      if (customForm.repeatDose && customForm.dosesCount > 1) {
        let currentMonths = Number(customForm.recommendedAgeMonths);
        
        for (let i = 2; i <= customForm.dosesCount; i++) {
          if (customForm.intervalUnit === 'months') {
            currentMonths += Number(customForm.intervalValue);
          } else {
            // Days translated roughly to months
            currentMonths += Math.ceil(Number(customForm.intervalValue) / 30);
          }

          const nextRecDate = calculateRecommendedDate(birthDate, currentMonths);
          await onSaveCustomVaccine({
            babyId: baby.id || 'baby-1',
            vaccineName: customForm.vaccineName,
            dose: `${i}ª Dose`,
            recommendedAgeMonths: currentMonths,
            recommendedDate: nextRecDate,
            type: 'custom',
            diseasesPrevented: customForm.diseasesPrevented,
            notes: customForm.notes,
            repeatDose: false
          });
        }
      }

      setShowCustomModal(false);
      setCustomForm({
        vaccineName: '',
        dose: 'Dose Única',
        recommendedAgeMonths: 0,
        diseasesPrevented: '',
        notes: '',
        repeatDose: false,
        intervalValue: 2,
        intervalUnit: 'months',
        dosesCount: 3
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao cadastrar vacina personalizada.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReminder = async (reminder: Reminder) => {
    if (!reminder.id) return;
    try {
      await onSaveReminder({
        ...reminder,
        active: false
      });
    } catch (err) {
      console.error('Erro ao cancelar lembrete:', err);
    }
  };

  const handleRemoveApplied = async (recordId: string) => {
    if (!window.confirm('Tem certeza que deseja desmarcar esta vacina como aplicada?')) return;
    try {
      await onDeleteRecord(recordId);
    } catch (err) {
      console.error('Erro ao desmarcar vacina:', err);
    }
  };

  const handleRemoveCustom = async (customId: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta vacina personalizada do calendário?')) return;
    try {
      await onDeleteCustomVaccine(customId);
    } catch (err) {
      console.error('Erro ao remover vacina personalizada:', err);
    }
  };

  // Helper date formatting
  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}/${mm}/${yyyy}`;
  };

  // Calculate days remaining or passed
  const getDaysDiffText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays > 1) return `Em ${diffDays} dias`;
    return `${Math.abs(diffDays)} dias atrás`;
  };

  return (
    <div className="px-4 pt-4 pb-12 space-y-6">
      {/* 1. Header & Quick Summary */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Vacinas do Bebê</h2>
          <p className="text-xs text-slate-500 font-medium">Histórico e calendário recomendado</p>
        </div>
        {userRole !== 'leitura' && (
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#FF7A00] rounded-2xl shadow-sm active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Vacina</span>
          </button>
        )}
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#FFF8F0] border border-[#FF7E09]/10 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider">Aplicadas</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-[#FF7A00]">{totalApplied}</span>
            <span className="text-[10px] text-slate-500 font-medium">doses</span>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Previstas</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-rose-500">{delayedList.length}</span>
            <span className="text-[10px] text-rose-400 font-medium">doses</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Agendadas</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-blue-600">{scheduledList.length}</span>
            <span className="text-[10px] text-blue-400 font-medium font-bold">alertas</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pendentes</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-600">{pendingList.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">restantes</span>
          </div>
        </div>
      </div>

      {/* 2. Next Vaccine Banner */}
      {nextVaccine && (
        <div className="bg-white border border-[#FF7E09]/10 rounded-3xl p-4 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-[#FFF8F0] rounded-2xl text-[#FF7A00] shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase bg-[#FFF8F0] text-[#FF7A00] px-2 py-0.5 rounded-full">
                Próxima Dose
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                nextVaccine.meta.status === 'delayed' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {getDaysDiffText(nextVaccine.meta.recDate)}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight truncate">
              {nextVaccine.vaccine.name} ({nextVaccine.vaccine.dose})
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Previne: {nextVaccine.vaccine.diseasesPrevented}
            </p>
            <p className="text-xs text-slate-400 font-semibold">
              Recomendado em: {formatDateBR(nextVaccine.meta.recDate)} ({getMilestoneLabel(nextVaccine.vaccine.recommendedAgeMonths)})
            </p>
          </div>
        </div>
      )}

      {/* 3. Filter Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex-1 text-center py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
            statusFilter === 'all' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setStatusFilter('delayed')}
          className={`flex-1 text-center py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
            statusFilter === 'delayed' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Previstas ({delayedList.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`flex-1 text-center py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
            statusFilter === 'pending' ? 'border-slate-500 text-slate-500' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Pendentes ({pendingList.length})
        </button>
        <button
          onClick={() => setStatusFilter('applied')}
          className={`flex-1 text-center py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
            statusFilter === 'applied' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Aplicadas ({totalApplied})
        </button>
      </div>

      {/* 4. Timeline Vaccine List grouped by Milestone */}
      <div className="space-y-4">
        {milestones.map(ageMonths => {
          const vaccinesInMilestone = combinedSchedule.filter(v => v.recommendedAgeMonths === ageMonths);
          
          // Apply filter
          const filteredVaccines = vaccinesInMilestone.filter(v => {
            const meta = getVaccineMeta(v);
            if (statusFilter === 'applied') return meta.status === 'applied';
            if (statusFilter === 'delayed') return meta.status === 'delayed';
            if (statusFilter === 'pending') return meta.status === 'pending' || meta.status === 'scheduled';
            return true;
          });

          if (filteredVaccines.length === 0) return null;

          const isExpanded = !!expandedMilestones[ageMonths];

          return (
            <div key={`milestone-${ageMonths}`} className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden transition-all">
              {/* Header Accordion */}
              <button
                onClick={() => toggleMilestone(ageMonths)}
                className="w-full px-5 py-4 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-[#FF7A00] rounded-full"></div>
                  <span className="text-sm font-black text-slate-700 tracking-tight">
                    {getMilestoneLabel(ageMonths)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 border border-slate-200/60 rounded-full">
                    {filteredVaccines.length} {filteredVaccines.length === 1 ? 'vacina' : 'vacinas'}
                  </span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {/* Vaccine cards list */}
              {isExpanded && (
                <div className="p-4 space-y-3 border-t border-slate-50">
                  {filteredVaccines.map(vaccine => {
                    const meta = getVaccineMeta(vaccine);
                    
                    return (
                      <div 
                        key={`vac-card-${vaccine.id}`}
                        className={`p-4 rounded-2xl border transition-all ${
                          meta.status === 'applied' 
                            ? 'bg-emerald-50/20 border-emerald-100' 
                            : meta.status === 'delayed'
                            ? 'bg-rose-50/15 border-rose-100'
                            : meta.status === 'scheduled'
                            ? 'bg-blue-50/20 border-blue-100'
                            : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-800">
                                {vaccine.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {vaccine.dose}
                              </span>
                              {vaccine.isCustom && (
                                <span className="text-[9px] text-[#FF7A00] font-black bg-[#FFF8F0] px-1.5 py-0.5 border border-[#FF7A00]/10 rounded-md">
                                  Personalizada
                                </span>
                              )}
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                vaccine.type === 'sus' 
                                  ? 'bg-[#FFF8F0] text-[#FF7A00]' 
                                  : vaccine.type === 'particular'
                                  ? 'bg-purple-50 text-purple-600'
                                  : 'bg-indigo-50 text-indigo-600'
                              }`}>
                                {vaccine.type === 'both' ? 'SUS + Particular' : vaccine.type.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                              Previne: {vaccine.diseasesPrevented}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                            meta.status === 'applied'
                              ? 'bg-emerald-100 text-emerald-700'
                              : meta.status === 'delayed'
                              ? 'bg-rose-100 text-rose-600'
                              : meta.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {meta.status === 'applied' && 'Aplicada'}
                            {meta.status === 'delayed' && 'Prevista'}
                            {meta.status === 'scheduled' && 'Agendada'}
                            {meta.status === 'pending' && 'Pendente'}
                          </span>
                        </div>

                        {/* Vaccine notes / info */}
                        {vaccine.notes && (
                          <p className="mt-2 text-[11px] text-slate-400 leading-normal bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                            {vaccine.notes}
                          </p>
                        )}

                        {/* Info of Applied Vaccine */}
                        {meta.applied && (
                          <div className="mt-3.5 pt-3.5 border-t border-slate-100/80 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold">Data da aplicação:</span>
                              {formatDateBR(meta.applied.appliedDate)}
                            </div>
                            {meta.applied.clinic && (
                              <div>
                                <span className="text-[10px] text-slate-400 block font-bold">Local/Posto:</span>
                                {meta.applied.clinic}
                              </div>
                            )}
                            {meta.applied.batchNumber && (
                              <div>
                                <span className="text-[10px] text-slate-400 block font-bold">Lote:</span>
                                {meta.applied.batchNumber}
                              </div>
                            )}
                            {meta.applied.reaction && meta.applied.reaction !== 'Nenhuma' && (
                              <div className="col-span-2 text-rose-600">
                                <span className="text-[10px] text-slate-400 block font-bold">Reação registrada:</span>
                                ⚠️ {meta.applied.reaction}
                              </div>
                            )}
                            {meta.applied.notes && (
                              <div className="col-span-2 text-[11px] text-slate-500 italic bg-amber-50/30 p-2 rounded-xl border border-amber-100/30">
                                Obs: "{meta.applied.notes}"
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action buttons */}
                        {userRole !== 'leitura' && (
                          <div className="mt-4 flex justify-between items-center gap-2">
                            <div>
                              {meta.status === 'applied' ? (
                                <button
                                  onClick={() => handleRemoveApplied(meta.applied!.id!)}
                                  className="flex items-center gap-1 py-1.5 px-3 text-[10px] font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Desmarcar dose</span>
                                </button>
                              ) : vaccine.isCustom ? (
                                <button
                                  onClick={() => handleRemoveCustom(vaccine.id)}
                                  className="flex items-center gap-1 py-1.5 px-3 text-[10px] font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Excluir personalizada</span>
                                </button>
                              ) : null}
                            </div>

                            <div className="flex gap-2">
                              {meta.status !== 'applied' && (
                                <>
                                  {meta.status === 'scheduled' ? (
                                    <button
                                      onClick={() => handleCancelReminder(meta.activeReminder!)}
                                      className="flex items-center gap-1.5 py-1.5 px-3 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                    >
                                      <Bell className="w-3.5 h-3.5" />
                                      <span>Cancelar Alerta</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenScheduleModal(vaccine)}
                                      className="flex items-center gap-1.5 py-1.5 px-3 text-[10px] font-bold text-[#FF7A00] bg-[#FFF8F0] hover:bg-[#FFF2E0] rounded-xl transition-all"
                                    >
                                      <Bell className="w-3.5 h-3.5" />
                                      <span>Agendar</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleOpenApplyModal(vaccine)}
                                    className="flex items-center gap-1.5 py-1.5 px-3 text-[10px] font-bold text-white bg-[#FF7A00] hover:bg-[#E06B00] rounded-xl transition-all shadow-sm"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Aplicar</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <MedicalDisclaimer type="vacinas" className="mt-4" />

      {/* MODAL 1: MARCAR COMO APLICADA */}
      {showApplyModal && selectedVaccine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-800">Registrar Vacinação</h3>
                <p className="text-[11px] text-slate-500 font-medium">{selectedVaccine.name} - {selectedVaccine.dose}</p>
              </div>
              <button 
                onClick={() => { setShowApplyModal(false); setSelectedVaccine(null); }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data da Aplicação</label>
                <input 
                  type="date"
                  required
                  value={applyForm.appliedDate}
                  onChange={(e) => setApplyForm({ ...applyForm, appliedDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Local / Posto de Saúde</label>
                <input 
                  type="text"
                  placeholder="Ex: UBS Centro, Maternidade, Clínica Particular"
                  value={applyForm.clinic}
                  onChange={(e) => setApplyForm({ ...applyForm, clinic: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Número do Lote</label>
                <input 
                  type="text"
                  placeholder="Ex: A109B (Opcional)"
                  value={applyForm.batchNumber}
                  onChange={(e) => setApplyForm({ ...applyForm, batchNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reações Registradas</label>
                <select
                  value={applyForm.reaction}
                  onChange={(e) => setApplyForm({ ...applyForm, reaction: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
                >
                  <option value="Nenhuma">Nenhuma reação</option>
                  <option value="Febre Baixa">Febre Baixa</option>
                  <option value="Febre Alta (&gt;38.5ºC)">Febre Alta (&gt;38.5ºC)</option>
                  <option value="Dor/Inchaço Local">Dor ou Inchaço no Local</option>
                  <option value="Vermelhidão Local">Vermelhidão no Local</option>
                  <option value="Irritabilidade/Choro">Irritabilidade / Choro</option>
                  <option value="Sonolência">Sonolência excessiva</option>
                  <option value="Vômitos/Diarreia">Vômitos ou Diarreia</option>
                  <option value="Outra Reação">Outra Reação (especificar nas observações)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observações Gerais</label>
                <textarea 
                  rows={2}
                  placeholder="Detalhes sobre a vacinação ou sintomas do bebê..."
                  value={applyForm.notes}
                  onChange={(e) => setApplyForm({ ...applyForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] resize-none"
                />
              </div>

              {errorMsg && <p className="text-xs text-rose-500 font-bold">{errorMsg}</p>}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowApplyModal(false); setSelectedVaccine(null); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-3 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-2xl transition-colors shadow-sm disabled:opacity-55"
                >
                  {loading ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AGENDAR LEMBRETE */}
      {showScheduleModal && selectedVaccine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-800">Agendar Dose</h3>
                <p className="text-[11px] text-slate-500 font-medium">{selectedVaccine.name} - {selectedVaccine.dose}</p>
              </div>
              <button 
                onClick={() => { setShowScheduleModal(false); setSelectedVaccine(null); }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Data Agendada</label>
                  <input 
                    type="date"
                    required
                    value={scheduleForm.targetDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, targetDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Horário do Alerta</label>
                  <input 
                    type="time"
                    required
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Observações / Instruções</label>
                <textarea 
                  rows={2}
                  placeholder="Ex: Levar caderneta de vacinas e documento do bebê."
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] resize-none"
                />
              </div>

              {errorMsg && <p className="text-xs text-rose-500 font-bold">{errorMsg}</p>}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowScheduleModal(false); setSelectedVaccine(null); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-3 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#FF7A00] hover:bg-[#E06B00] text-white font-bold text-xs py-3 rounded-2xl transition-colors shadow-sm disabled:opacity-55"
                >
                  {loading ? 'Agendando...' : 'Salvar Alerta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADICIONAR VACINA PERSONALIZADA */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-800">Nova Vacina Personalizada</h3>
                <p className="text-[11px] text-slate-500 font-medium">Configure uma dose ou calendário recorrente</p>
              </div>
              <button 
                onClick={() => setShowCustomModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nome da Vacina</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Influenza Particular, Meningo ACWY Extra"
                  value={customForm.vaccineName}
                  onChange={(e) => setCustomForm({ ...customForm, vaccineName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dose / Etapa</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: 1ª Dose, Dose Única, Reforço"
                    value={customForm.dose}
                    onChange={(e) => setCustomForm({ ...customForm, dose: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Idade Recomendada (meses)</label>
                  <input 
                    type="number"
                    min={0}
                    max={120}
                    required
                    value={customForm.recommendedAgeMonths}
                    onChange={(e) => setCustomForm({ ...customForm, recommendedAgeMonths: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Doenças Evitadas</label>
                <input 
                  type="text"
                  placeholder="Ex: Gripe H1N1, Complicações pulmonares (Opcional)"
                  value={customForm.diseasesPrevented}
                  onChange={(e) => setCustomForm({ ...customForm, diseasesPrevented: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notas / Orientações</label>
                <textarea 
                  rows={2}
                  placeholder="Instruções particulares da clínica ou contraindicações..."
                  value={customForm.notes}
                  onChange={(e) => setCustomForm({ ...customForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] resize-none"
                />
              </div>

              {/* Repeating Doses Checkbox */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={customForm.repeatDose}
                    onChange={(e) => setCustomForm({ ...customForm, repeatDose: e.target.checked })}
                    className="rounded text-[#FF7A00] focus:ring-[#FF7A00] w-4 h-4 cursor-pointer"
                  />
                  <span>Vacina com doses repetidas?</span>
                </label>

                {customForm.repeatDose && (
                  <div className="grid grid-cols-2 gap-3.5 pt-1 animate-fade-in">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Qtd total de doses</label>
                      <input 
                        type="number"
                        min={2}
                        max={6}
                        required
                        value={customForm.dosesCount}
                        onChange={(e) => setCustomForm({ ...customForm, dosesCount: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Intervalo</label>
                      <div className="flex gap-1">
                        <input 
                          type="number"
                          min={1}
                          required
                          value={customForm.intervalValue}
                          onChange={(e) => setCustomForm({ ...customForm, intervalValue: Number(e.target.value) })}
                          className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00] text-center"
                        />
                        <select
                          value={customForm.intervalUnit}
                          onChange={(e) => setCustomForm({ ...customForm, intervalUnit: e.target.value as 'days' | 'months' })}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#FF7A00]"
                        >
                          <option value="months">Meses</option>
                          <option value="days">Dias</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && <p className="text-xs text-rose-500 font-bold">{errorMsg}</p>}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-3 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#FF7A00] hover:bg-[#E06B00] text-white font-bold text-xs py-3 rounded-2xl transition-colors shadow-sm disabled:opacity-55"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Vacina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
