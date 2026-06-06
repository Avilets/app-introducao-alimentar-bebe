import React, { useState } from 'react';
import { TrendingUp, Plus, Edit2, Trash2, Calendar, AlertTriangle, X } from 'lucide-react';
import type { Baby, GrowthRecord } from '../types';
import { calculatePercentile, getReferenceData } from '../data/growthPercentiles';
import { calculateGrowthVariation } from '../services/growthService';

interface GrowthScreenProps {
  baby: Baby;
  growthRecords: GrowthRecord[];
  onSaveRecord: (record: Omit<GrowthRecord, 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
}

// Helper: Calculate baby's age at a specific measurement date
const calculateAgeAtDate = (birthDateStr: string, targetDateStr: string) => {
  if (!birthDateStr || !targetDateStr) return { text: '', months: 0, days: 0, totalDays: 0 };

  const birth = birthDateStr.split('-').map(Number);
  const target = targetDateStr.split('-').map(Number);

  const birthDate = new Date(birth[0], birth[1] - 1, birth[2]);
  const targetDate = new Date(target[0], target[1] - 1, target[2]);

  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - birthDate.getMonth();
  let days = targetDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = years * 12 + months;
  const totalDays = Math.max(0, Math.floor((targetDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)));

  let text = '';
  if (totalMonths === 0) {
    text = `${days} ${days === 1 ? 'dia' : 'dias'}`;
  } else if (days === 0) {
    text = `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'}`;
  } else {
    text = `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'} e ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }

  return { text, months: totalMonths, days, totalDays };
};

// Reusable SVG Chart Component for WHO Growth Curves
const GrowthSVGChart: React.FC<{
  title: string;
  unit: string;
  babyGender: 'boy' | 'girl' | 'other';
  records: GrowthRecord[];
  type: 'weight' | 'length' | 'head';
}> = ({ title, unit, babyGender, records, type }) => {
  const width = 500;
  const height = 280;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const refData = getReferenceData(babyGender, type);

  // Filter records that have the measurement populated
  const validRecords = records
    .filter(r => (type === 'head' ? (r.headCircumferenceCm || 0) > 0 : true))
    .map(r => ({
      ageInMonths: r.ageInDays / 30.4375,
      value: type === 'weight' ? r.weightKg : type === 'length' ? r.lengthCm : (r.headCircumferenceCm || 0)
    }))
    .sort((a, b) => a.ageInMonths - b.ageInMonths);

  // Find range of X-axis (Age in Months: 0 to 24, or max record age)
  const maxRecordAge = validRecords.length > 0 ? Math.max(...validRecords.map(r => r.ageInMonths)) : 0;
  const maxX = Math.max(24, Math.ceil(maxRecordAge));

  // Gather all Y values (predefined limits and baby values) to determine Y-axis scale
  const allYValues: number[] = [];
  refData.forEach(d => {
    if (d.month <= maxX) {
      allYValues.push(d.p3, d.p50, d.p97);
    }
  });
  validRecords.forEach(r => allYValues.push(r.value));

  if (allYValues.length === 0) return null;

  const minYVal = Math.max(0, Math.floor(Math.min(...allYValues) - 1));
  const maxYVal = Math.ceil(Math.max(...allYValues) + 1);
  const yRange = maxYVal - minYVal;

  // Helper coordinate conversions
  const getX = (ageMonths: number) => paddingLeft + (ageMonths / maxX) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - minYVal) / yRange) * chartHeight;

  // Generate path string for a given percentile key
  const getRefPath = (key: 'p3' | 'p15' | 'p50' | 'p85' | 'p97') => {
    return refData
      .filter(d => d.month <= maxX)
      .map((d, index) => `${index === 0 ? 'M' : 'L'} ${getX(d.month)} ${getY(d[key])}`)
      .join(' ');
  };

  const babyPath = validRecords
    .map((r, index) => `${index === 0 ? 'M' : 'L'} ${getX(r.ageInMonths)} ${getY(r.value)}`)
    .join(' ');

  // X-axis ticks (months)
  const xTicks = [0, 3, 6, 9, 12, 15, 18, 21, 24];
  const yTicks: number[] = [];
  const yStep = yRange > 10 ? 2 : 1;
  for (let y = minYVal; y <= maxYVal; y += yStep) {
    yTicks.push(y);
  }

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-2">
      <div className="flex justify-between items-center px-1">
        <h4 className="text-xs font-bold text-slate-700">{title}</h4>
        <span className="text-[10px] text-slate-400 font-bold">Unidade: {unit}</span>
      </div>

      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
          {/* Y Axis Grid Lines */}
          {yTicks.map(y => (
            <g key={`y-grid-${y}`}>
              <line
                x1={paddingLeft}
                y1={getY(y)}
                x2={width - paddingRight}
                y2={getY(y)}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={getY(y) + 4}
                className="text-[9px] font-bold text-slate-400 fill-current text-right"
                textAnchor="end"
              >
                {y}
              </text>
            </g>
          ))}

          {/* X Axis Grid Lines */}
          {xTicks.map(x => (
            <g key={`x-grid-${x}`}>
              <line
                x1={getX(x)}
                y1={paddingTop}
                x2={getX(x)}
                y2={height - paddingBottom}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={getX(x)}
                y={height - paddingBottom + 16}
                className="text-[9px] font-bold text-slate-400 fill-current text-center"
                textAnchor="middle"
              >
                {x}m
              </text>
            </g>
          ))}

          {/* WHO curves */}
          {/* P3 */}
          <path
            d={getRefPath('p3')}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <text
            x={getX(maxX) - 5}
            y={getY(refData.find(d => d.month === maxX)?.p3 || minYVal) - 4}
            className="text-[8px] font-bold text-slate-400 fill-current"
          >
            P3
          </text>

          {/* P50 (Mediana) */}
          <path
            d={getRefPath('p50')}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          <text
            x={getX(maxX) - 5}
            y={getY(refData.find(d => d.month === maxX)?.p50 || minYVal) - 4}
            className="text-[8px] font-bold text-slate-400 fill-current"
          >
            P50
          </text>

          {/* P97 */}
          <path
            d={getRefPath('p97')}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <text
            x={getX(maxX) - 5}
            y={getY(refData.find(d => d.month === maxX)?.p97 || minYVal) - 4}
            className="text-[8px] font-bold text-slate-400 fill-current"
          >
            P97
          </text>

          {/* Baby actual growth line */}
          {validRecords.length > 0 && (
            <>
              <path
                d={babyPath}
                fill="none"
                stroke="#ff7a00"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {validRecords.map((r, i) => (
                <g key={`baby-point-${i}`}>
                  <circle
                    cx={getX(r.ageInMonths)}
                    cy={getY(r.value)}
                    r="4"
                    fill="#ff7a00"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {/* Label values above dot */}
                  <text
                    x={getX(r.ageInMonths)}
                    y={getY(r.value) - 8}
                    className="text-[8px] font-extrabold text-orange-600 fill-current text-center"
                    textAnchor="middle"
                  >
                    {r.value}
                  </text>
                </g>
              ))}
            </>
          )}
        </svg>
      </div>

      <div className="flex justify-center gap-4 text-[9px] font-bold text-slate-400 pt-1">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-orange-500 rounded-full inline-block"></span>
          <span>Evolução do Bebê</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 border-t border-slate-300 inline-block"></span>
          <span>P50 (Mediana OMS)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 border-t border-dashed border-slate-400 inline-block"></span>
          <span>P3 / P97 limites</span>
        </div>
      </div>
    </div>
  );
};

export const GrowthScreen: React.FC<GrowthScreenProps> = ({
  baby,
  growthRecords,
  onSaveRecord,
  onDeleteRecord
}) => {
  const [activeTab, setActiveTab] = useState<'charts' | 'history'>('charts');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [recordId, setRecordId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState<string>('');
  const [lengthCm, setLengthCm] = useState<string>('');
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Sorting records chronologically by date descending
  const sortedRecords = [...growthRecords].sort((a, b) => b.date.localeCompare(a.date));

  // Determine if we have head circumference records
  const hasHeadCircData = growthRecords.some(r => (r.headCircumferenceCm || 0) > 0);

  const handleOpenAddModal = () => {
    setRecordId(undefined);
    setDate(new Date().toISOString().split('T')[0]);
    setWeightKg('');
    setLengthCm('');
    setHeadCircumferenceCm('');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: GrowthRecord) => {
    setRecordId(record.id);
    setDate(record.date);
    setWeightKg(record.weightKg.toString());
    setLengthCm(record.lengthCm.toString());
    setHeadCircumferenceCm(record.headCircumferenceCm ? record.headCircumferenceCm.toString() : '');
    setNotes(record.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!date) {
      setError('A data da medição é obrigatória.');
      return;
    }
    
    // Date cannot be future
    const todayStr = new Date().toISOString().split('T')[0];
    if (date > todayStr) {
      setError('A data da medição não pode ser no futuro.');
      return;
    }

    const weightNum = parseFloat(weightKg);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 30) {
      setError('Por favor, informe um peso válido entre 0.1 e 30 kg.');
      return;
    }

    const lengthNum = parseFloat(lengthCm);
    if (isNaN(lengthNum) || lengthNum <= 20 || lengthNum > 120) {
      setError('Por favor, informe um comprimento válido entre 20 e 120 cm.');
      return;
    }

    let headNum: number | undefined = undefined;
    if (headCircumferenceCm.trim()) {
      headNum = parseFloat(headCircumferenceCm);
      if (isNaN(headNum) || headNum <= 10 || headNum > 60) {
        setError('Por favor, informe um perímetro cefálico válido entre 10 e 60 cm.');
        return;
      }
    }

    // Calculate age in days relative to target date
    const ageCalc = calculateAgeAtDate(baby.birthDate, date);
    if (ageCalc.totalDays < 0) {
      setError('A data da medição não pode ser anterior ao nascimento do bebê.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveRecord({
        id: recordId,
        babyId: baby.id || 'baby-1',
        date,
        ageInDays: ageCalc.totalDays,
        weightKg: weightNum,
        lengthCm: lengthNum,
        headCircumferenceCm: headNum,
        notes: notes.trim()
      });
      setIsModalOpen(false);
    } catch (err) {
      setError('Ocorreu um erro ao salvar o registro de crescimento.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este registro de crescimento?')) {
      try {
        await onDeleteRecord(id);
      } catch (err) {
        alert('Erro ao excluir registro de crescimento.');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto pb-20">
      <div className="space-y-5">
        {/* Header Title */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-7 h-7" />
          </div>
          <p className="text-xs text-slate-400">
            Acompanhe o desenvolvimento de {baby.name} comparado com a curva padrão da Organização Mundial da Saúde (OMS).
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl active:scale-98 transition-all ${
              activeTab === 'charts'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Gráficos
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl active:scale-98 transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Histórico
          </button>
        </div>

        {/* Charts View */}
        {activeTab === 'charts' && (
          <div className="space-y-4">
            {sortedRecords.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center space-y-3">
                <p className="text-xs text-slate-400 font-bold">Sem dados suficientes para exibir gráficos.</p>
                <p className="text-[10px] text-slate-400">Adicione a primeira medição do bebê no Histórico.</p>
                <button
                  onClick={handleOpenAddModal}
                  className="py-2 px-3 bg-orange-500 text-white rounded-xl text-[10px] font-bold"
                >
                  Registrar Primeira Medida
                </button>
              </div>
            ) : (
              <>
                <GrowthSVGChart
                  title="Evolução do Peso"
                  unit="kg"
                  babyGender={baby.gender}
                  records={sortedRecords}
                  type="weight"
                />
                <GrowthSVGChart
                  title="Evolução do Comprimento / Altura"
                  unit="cm"
                  babyGender={baby.gender}
                  records={sortedRecords}
                  type="length"
                />
                {hasHeadCircData && (
                  <GrowthSVGChart
                    title="Evolução do Perímetro Cefálico"
                    unit="cm"
                    babyGender={baby.gender}
                    records={sortedRecords}
                    type="head"
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* History View */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
                Medições ({sortedRecords.length})
              </span>
              <button
                onClick={handleOpenAddModal}
                className="py-2 px-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 active:scale-95 transition-all shadow-sm shadow-orange-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar Medidas
              </button>
            </div>

            {sortedRecords.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
                <p className="text-xs text-slate-400 font-bold">Nenhuma medição registrada ainda.</p>
                <p className="text-[10px] text-slate-400 mt-1">Registre o peso e comprimento do bebê para iniciar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedRecords.map((record, index) => {
                  const ageInfo = calculateAgeAtDate(baby.birthDate, record.date);
                  
                  // Compute variations relative to the next record in the list (index + 1)
                  const prevRecord = index < sortedRecords.length - 1 ? sortedRecords[index + 1] : undefined;
                  const diffs = calculateGrowthVariation(record, prevRecord);

                  // Compute WHO Percentiles
                  const pWeight = calculatePercentile(baby.gender, 'weight', record.ageInDays, record.weightKg);
                  const pLength = calculatePercentile(baby.gender, 'length', record.ageInDays, record.lengthCm);
                  const pHead = record.headCircumferenceCm
                    ? calculatePercentile(baby.gender, 'head', record.ageInDays, record.headCircumferenceCm)
                    : null;

                  return (
                    <div
                      key={record.id || `rec-${index}`}
                      className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3 relative group"
                    >
                      {/* Date & Age Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                          <Calendar className="w-3.5 h-3.5 text-orange-500" />
                          <span>{record.date.split('-').reverse().join('/')}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({ageInfo.text})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(record)}
                            className="p-1 text-slate-400 hover:text-orange-500 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id || '')}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Weight, Length and Head Measurements Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Weight */}
                        <div className="bg-slate-50 rounded-2xl p-2.5 text-center">
                          <span className="text-[9px] text-slate-400 font-bold block">Peso</span>
                          <span className="text-xs font-black text-slate-800 block mt-0.5">
                            {record.weightKg} kg
                          </span>
                          <span className="text-[8px] text-orange-600 font-extrabold block mt-0.5">
                            {pWeight.percentileText}
                          </span>
                          {prevRecord && (
                            <span className={`text-[8px] font-extrabold block mt-0.5 ${diffs.weightDiff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {diffs.weightDiff >= 0 ? `+${diffs.weightDiff.toFixed(2)}` : diffs.weightDiff.toFixed(2)} kg
                            </span>
                          )}
                        </div>

                        {/* Length */}
                        <div className="bg-slate-50 rounded-2xl p-2.5 text-center">
                          <span className="text-[9px] text-slate-400 font-bold block">Comprimento</span>
                          <span className="text-xs font-black text-slate-800 block mt-0.5">
                            {record.lengthCm} cm
                          </span>
                          <span className="text-[8px] text-blue-600 font-extrabold block mt-0.5">
                            {pLength.percentileText}
                          </span>
                          {prevRecord && (
                            <span className={`text-[8px] font-extrabold block mt-0.5 ${diffs.lengthDiff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {diffs.lengthDiff >= 0 ? `+${diffs.lengthDiff.toFixed(1)}` : diffs.lengthDiff.toFixed(1)} cm
                            </span>
                          )}
                        </div>

                        {/* Head Circumference */}
                        <div className="bg-slate-50 rounded-2xl p-2.5 text-center">
                          <span className="text-[9px] text-slate-400 font-bold block">Perím. Cefálico</span>
                          <span className="text-xs font-black text-slate-800 block mt-0.5">
                            {record.headCircumferenceCm ? `${record.headCircumferenceCm} cm` : '-'}
                          </span>
                          <span className="text-[8px] text-purple-600 font-extrabold block mt-0.5">
                            {pHead ? pHead.percentileText : 'N/A'}
                          </span>
                          {prevRecord && record.headCircumferenceCm && prevRecord.headCircumferenceCm && (
                            <span className={`text-[8px] font-extrabold block mt-0.5 ${diffs.headDiff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {diffs.headDiff >= 0 ? `+${diffs.headDiff.toFixed(1)}` : diffs.headDiff.toFixed(1)} cm
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Educational Percentile Feedback */}
                      <div className="bg-orange-50/30 border-l-2 border-orange-400 p-2 rounded-r-xl space-y-1">
                        <p className="text-[9px] text-slate-600 leading-normal">
                          <strong className="text-slate-700">Percentil aproximado OMS:</strong>
                          <br />
                          ⚖️ Peso: {pWeight.percentileText} ({pWeight.interpretation})
                          <br />
                          📏 Altura: {pLength.percentileText} ({pLength.interpretation})
                          {pHead && (
                            <>
                              <br />
                              🧠 Cefálico: {pHead.percentileText} ({pHead.interpretation})
                            </>
                          )}
                        </p>
                      </div>

                      {/* Notes */}
                      {record.notes && (
                        <p className="text-[10px] text-slate-500 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                          <span className="font-bold">Observações:</span> {record.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Medical disclaimer */}
        <div className="bg-amber-50/50 border border-amber-100/50 rounded-3xl p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-900 leading-relaxed font-semibold">
            Os percentis são estimativas educativas baseadas em curvas de referência e não substituem a avaliação do pediatra. Sempre converse com o pediatra sobre crescimento, ganho de peso ou qualquer preocupação.
          </p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-5 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800">
                {recordId ? 'Editar Medidas' : 'Registrar Medidas'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Data da medição */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Data da Medição
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-xs font-semibold text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Peso */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 7.2"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-xs font-semibold text-slate-700"
                    required
                  />
                </div>

                {/* Comprimento */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Altura / Comp. (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 65.5"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-xs font-semibold text-slate-700"
                    required
                  />
                </div>
              </div>

              {/* Perímetro Cefálico (Opcional) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Perímetro Cefálico (cm) - Opcional
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 42"
                  value={headCircumferenceCm}
                  onChange={(e) => setHeadCircumferenceCm(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-xs font-semibold text-slate-700"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Maya estava inquieta, medição na clínica..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-orange-300 text-xs text-slate-700"
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-xs active:scale-[0.98] transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs active:scale-[0.98] transition-all shadow-md shadow-orange-100 cursor-pointer text-center disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowthScreen;
