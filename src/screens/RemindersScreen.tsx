import React, { useState, useEffect } from 'react';
import type { Reminder, ReminderType, ReminderMode } from '../types';
import { Capacitor } from '@capacitor/core';
import { checkLocalNotificationPermission, requestLocalNotificationPermission } from '../services/localNotificationService';
import {
  Bell,
  Plus,
  Save,
  Trash2,
  X,
  Clock,
  Timer,
  AlertCircle,
  Check,
  Power,
  Edit2
} from 'lucide-react';

interface RemindersScreenProps {
  reminders: Reminder[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'nextTriggerAt'> & { id?: string }) => void;
  onDeleteReminder: (id: string) => void;
  onCompleteReminder: (reminder: Reminder) => void;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  reminders,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
  onCompleteReminder
}) => {
  // Notification status
  const [hasPermission, setHasPermission] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  
  const [type, setType] = useState<ReminderType>('feeding');
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<ReminderMode>('fixed');
  const [fixedTime, setFixedTime] = useState('08:00');
  const [intervalMinutes, setIntervalMinutes] = useState<number>(120);
  const [repeatDaily, setRepeatDaily] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Update permission state
  useEffect(() => {
    const checkPerm = async () => {
      if (Capacitor.isNativePlatform()) {
        const granted = await checkLocalNotificationPermission();
        setHasPermission(granted);
      } else {
        setHasPermission('Notification' in window ? Notification.permission === 'granted' : false);
      }
    };
    checkPerm();
  }, []);

  const requestNotificationPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      const granted = await requestLocalNotificationPermission();
      setHasPermission(granted);
    } else {
      if ('Notification' in window) {
        const resp = await Notification.requestPermission();
        setHasPermission(resp === 'granted');
      } else {
        alert('Seu navegador ou dispositivo não suporta a API de Notificações.');
      }
    }
  };

  const handleEditClick = (reminder: Reminder) => {
    setEditId(reminder.id);
    setType(reminder.type);
    setTitle(reminder.title);
    setMode(reminder.mode);
    if (reminder.fixedTime) setFixedTime(reminder.fixedTime);
    if (reminder.intervalMinutes) setIntervalMinutes(reminder.intervalMinutes);
    setRepeatDaily(reminder.repeatDaily);
    setNotes(reminder.notes || '');
    setError('');
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Por favor, informe o título do lembrete.');
      return;
    }

    if (mode === 'fixed' && !fixedTime) {
      setError('Por favor, selecione o horário fixo.');
      return;
    }

    if (mode === 'timer' && (!intervalMinutes || intervalMinutes <= 0)) {
      setError('Por favor, insira um intervalo de minutos válido.');
      return;
    }

    onAddReminder({
      id: editId,
      babyId: 'baby-1',
      type,
      title: title.trim(),
      mode,
      fixedTime: mode === 'fixed' ? fixedTime : undefined,
      intervalMinutes: mode === 'timer' ? Number(intervalMinutes) : undefined,
      repeatDaily: mode === 'fixed' ? repeatDaily : false,
      active: true,
      notes: notes.trim() || undefined
    });

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setEditId(undefined);
    setTitle('');
    setType('feeding');
    setMode('fixed');
    setFixedTime('08:00');
    setIntervalMinutes(120);
    setRepeatDaily(true);
    setNotes('');
    setError('');
    setShowForm(false);
  };

  const getReminderLabel = (t: ReminderType) => {
    switch (t) {
      case 'feeding': return 'Mamada / Leite';
      case 'fruit': return 'Hora da Fruta';
      case 'meal': return 'Refeição';
      default: return 'Outro Lembrete';
    }
  };

  const getTypeColor = (t: ReminderType) => {
    switch (t) {
      case 'feeding': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'fruit': return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'meal': return 'bg-teal-50 text-teal-700 border-teal-100';
      default: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
  };

  // Grouping reminders
  const now = Date.now();
  
  // Vencidos: ativos e nextTriggerAt <= agora
  const overdueReminders = reminders.filter(r => r.active && r.nextTriggerAt > 0 && r.nextTriggerAt <= now);
  
  // Próximos ativos: ativos e nextTriggerAt > agora
  const upcomingReminders = reminders.filter(r => r.active && r.nextTriggerAt > now);
  
  // Desativados: active === false
  const inactiveReminders = reminders.filter(r => !r.active);

  // Time shortcuts
  const fixedTimePresets = ['07:00', '10:00', '12:00', '15:00', '18:00', '21:00'];
  const timerPresets = [
    { label: '1 min (Teste)', value: 1 },
    { label: '5 min (Teste)', value: 5 },
    { label: '2h', value: 120 },
    { label: '3h', value: 180 },
    { label: '4h', value: 240 }
  ];

  return (
    <div className="flex-1 flex flex-col px-4 py-4 space-y-4">
      {/* Informative warning banner about PWA background limits */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 shadow-sm">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-bold text-amber-800">Aviso Importante sobre PWAs</h5>
          <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
            Os lembretes funcionam melhor com o app aberto ou em segundo plano. Para notificações totalmente confiáveis com o app fechado, será necessário futuramente gerar um app Android nativo.
          </p>
        </div>
      </div>

      {/* Request Notification Permission Button */}
      {!hasPermission ? (
        <button
          onClick={requestNotificationPermission}
          className="w-full py-3 px-4 rounded-2xl border border-dashed border-pink-300 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Bell className="w-4 h-4 text-pink-600 animate-bounce" />
          🔔 Ativar Notificações no Celular
        </button>
      ) : (
        <div className="py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-center text-[10px] font-bold">
          ✓ Notificações autorizadas no aparelho/navegador
        </div>
      )}

      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Configurar Lembretes</span>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-1 py-1.5 px-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full text-xs font-bold active:scale-95 transition-all shadow-sm shadow-pink-100 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Criar Lembrete
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-pink-500" /> 
              {editId ? 'Editar Lembrete' : 'Novo Lembrete'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-500 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Type and Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as ReminderType;
                  setType(newType);
                  if (!title) {
                    if (newType === 'feeding') setTitle('Hora do Leite');
                    if (newType === 'fruit') setTitle('Hora da Frutinha');
                    if (newType === 'meal') setTitle('Hora do Almoço/Jantar');
                    if (newType === 'other') setTitle('Lembrete Geral');
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-pink-300 text-xs font-bold text-slate-600"
              >
                <option value="feeding">Mamada / Leite</option>
                <option value="fruit">Fruta</option>
                <option value="meal">Refeição</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título</label>
              <input
                type="text"
                placeholder="Ex: Frutinha da Manhã"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-pink-300 text-xs font-semibold"
                required
              />
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Modo do Lembrete</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('fixed')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'fixed'
                    ? 'border-pink-400 bg-pink-500 text-white shadow-sm'
                    : 'border-slate-100 bg-slate-50 text-slate-500'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Horário Fixo
              </button>
              <button
                type="button"
                onClick={() => setMode('timer')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'timer'
                    ? 'border-pink-400 bg-pink-500 text-white shadow-sm'
                    : 'border-slate-100 bg-slate-50 text-slate-500'
                }`}
              >
                <Timer className="w-3.5 h-3.5" /> Intervalo (Timer)
              </button>
            </div>
          </div>

          {/* Mode Specific Inputs */}
          {mode === 'fixed' ? (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Selecione o Horário</label>
              <input
                type="time"
                value={fixedTime}
                onChange={(e) => setFixedTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-pink-300 text-sm font-bold text-slate-700"
                required
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {fixedTimePresets.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFixedTime(t)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                      fixedTime === t
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="repeatDaily"
                  checked={repeatDaily}
                  onChange={(e) => setRepeatDaily(e.target.checked)}
                  className="rounded border-slate-300 text-pink-500 focus:ring-pink-400"
                />
                <label htmlFor="repeatDaily" className="text-xs font-bold text-slate-600 cursor-pointer">
                  Repetir diariamente
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Intervalo em Minutos</label>
              <input
                type="number"
                placeholder="Ex: 120"
                value={intervalMinutes || ''}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-pink-300 text-sm font-bold text-slate-700"
                min="1"
                required
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {timerPresets.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setIntervalMinutes(p.value)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                      intervalMinutes === p.value
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description Notes */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Observações</label>
            <input
              type="text"
              placeholder="Ex: Oferecer água morna, dar fórmula de colherzinha..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-pink-300 text-xs font-semibold text-slate-700"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 active:scale-95 transition-all shadow-sm shadow-pink-100 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Salvar Lembrete
            </button>
          </div>
        </form>
      )}

      {/* Lists Container */}
      <div className="flex-1 space-y-6 overflow-y-auto pb-8">
        {reminders.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">Nenhum lembrete cadastrado</p>
            <p className="text-xs mt-1 text-slate-400 max-w-[240px] mx-auto leading-relaxed">
              Crie lembretes diários ou temporizadores para não esquecer os horários de alimentação do seu bebê!
            </p>
          </div>
        ) : (
          <>
            {/* 1. SEÇÃO VENCIDOS (URGENTES) */}
            {overdueReminders.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Lembretes Vencidos / Pendentes
                </span>
                
                {overdueReminders.map((reminder) => {
                  const typeColor = getTypeColor(reminder.type);
                  const label = getReminderLabel(reminder.type);
                  
                  return (
                    <div
                      key={reminder.id}
                      className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden"
                    >
                      <div className="flex items-center gap-3">
                        {/* Time or Interval indicator */}
                        <div className="bg-rose-600 text-white font-black text-xs px-2.5 py-1.5 rounded-xl shrink-0">
                          {reminder.mode === 'fixed' ? reminder.fixedTime : 'Expirou'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-rose-900">{reminder.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider ${typeColor}`}>
                              {label}
                            </span>
                            {reminder.mode === 'timer' && (
                              <span className="text-[9px] text-rose-600 font-bold">
                                (Timer: a cada {reminder.intervalMinutes} min)
                              </span>
                            )}
                          </div>
                          {reminder.notes && (
                            <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed">{reminder.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Action trigger: COMPLETE or edit/delete */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onCompleteReminder(reminder)}
                          className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md shadow-rose-200 active:scale-90 transition-transform cursor-pointer flex items-center justify-center"
                          title="Marcar como Concluído"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(reminder)}
                          className="p-2 bg-white text-slate-400 hover:text-slate-600 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. SEÇÃO PRÓXIMOS (ATIVOS) */}
            {upcomingReminders.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Próximos Lembretes Ativos
                </span>

                {upcomingReminders.map((reminder) => {
                  const typeColor = getTypeColor(reminder.type);
                  const label = getReminderLabel(reminder.type);
                  
                  // Format nextTriggerAt as local HH:MM
                  const triggerDate = new Date(reminder.nextTriggerAt);
                  const triggerTimeStr = `${String(triggerDate.getHours()).padStart(2, '0')}:${String(triggerDate.getMinutes()).padStart(2, '0')}`;
                  
                  return (
                    <div
                      key={reminder.id}
                      className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-800 text-white font-black text-xs px-2.5 py-1.5 rounded-xl shrink-0">
                          {triggerTimeStr}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{reminder.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider ${typeColor}`}>
                              {label}
                            </span>
                            {reminder.mode === 'timer' && (
                              <span className="text-[9px] text-slate-400 font-bold">
                                (Timer: a cada {reminder.intervalMinutes} min)
                              </span>
                            )}
                          </div>
                          {reminder.notes && (
                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{reminder.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Switch and Edit/Delete */}
                      <div className="flex items-center gap-2">
                        {/* Mark completed manually before expiration */}
                        <button
                          onClick={() => onCompleteReminder(reminder)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-100 cursor-pointer"
                          title="Marcar como Concluído"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleEditClick(reminder)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-100 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onToggleReminder(reminder.id!)}
                          className="p-1.5 bg-slate-50 text-emerald-500 hover:bg-slate-100 border border-slate-100 rounded-lg cursor-pointer"
                          title="Desativar Lembrete"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. SEÇÃO DESATIVADOS */}
            {inactiveReminders.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Lembretes Desativados
                </span>

                {inactiveReminders.map((reminder) => {
                  const typeColor = getTypeColor(reminder.type);
                  const label = getReminderLabel(reminder.type);
                  
                  return (
                    <div
                      key={reminder.id}
                      className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-400 text-white font-black text-xs px-2.5 py-1.5 rounded-xl shrink-0">
                          {reminder.mode === 'fixed' ? reminder.fixedTime : 'Desl.'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 line-through">{reminder.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider ${typeColor}`}>
                              {label}
                            </span>
                            {reminder.mode === 'timer' && (
                              <span className="text-[9px] text-slate-400 font-bold">
                                (Timer)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onToggleReminder(reminder.id!)}
                          className="p-1.5 bg-white text-slate-400 hover:text-emerald-500 border border-slate-100 rounded-lg cursor-pointer"
                          title="Ativar Lembrete"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleEditClick(reminder)}
                          className="p-1.5 bg-white text-slate-400 hover:text-slate-600 border border-slate-100 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteReminder(reminder.id!)}
                          className="p-1.5 bg-white text-slate-300 hover:text-rose-500 border border-slate-100 rounded-lg cursor-pointer"
                          title="Excluir Lembrete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RemindersScreen;
