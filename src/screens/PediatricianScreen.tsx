import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Milk, 
  Apple, 
  Utensils, 
  Save, 
  Sparkles,
  Heart
} from 'lucide-react';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import type { FeedingLog, FruitLog, MealLog, Baby, ReactionType } from '../types';

interface PediatricianScreenProps {
  baby: Baby;
  feedings: FeedingLog[];
  fruits: FruitLog[];
  meals: MealLog[];
  initialNotes: string;
  userRole?: 'admin' | 'cuidador' | 'leitura';
  onSaveNotes: (notes: string) => Promise<void>;
}

export const PediatricianScreen: React.FC<PediatricianScreenProps> = ({
  baby,
  feedings,
  fruits,
  meals,
  initialNotes,
  userRole = 'admin',
  onSaveNotes
}) => {
  const [period, setPeriod] = useState<7 | 30>(7);
  const [notes, setNotes] = useState(initialNotes);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Filtros de seleção de informações
  const [includeFeedings, setIncludeFeedings] = useState(true);
  const [includeFruits, setIncludeFruits] = useState(true);
  const [includeMeals, setIncludeMeals] = useState(true);
  const [includeReactions, setIncludeReactions] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);

  // Atualiza as observações se as iniciais mudarem (por exemplo, ao carregar do banco)
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Função para salvar observações com feedback visual
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setSaveSuccess(false);
    try {
      await onSaveNotes(notes);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert('Erro ao salvar as observações.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Helper para calcular a idade do bebê
  const getBabyAge = () => {
    if (!baby.birthDate) return '';
    const birth = new Date(baby.birthDate + 'T12:00:00');
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    const birthDay = birth.getDate();
    const todayDay = today.getDate();
    if (todayDay < birthDay) {
      months--;
    }
    if (months <= 0) {
      const diffTime = Math.abs(today.getTime() - birth.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} dias`;
    }
    return `${months} meses`;
  };

  // Helper para filtrar registros com base no período de dias
  const filterLogsByPeriod = <T extends { datetime: string }>(logs: T[], days: number): T[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    cutoffDate.setHours(0, 0, 0, 0);
    
    return logs.filter(log => {
      const logDate = new Date(log.datetime);
      return logDate >= cutoffDate;
    });
  };

  const periodFeedings = filterLogsByPeriod(feedings, period);
  const periodFruits = filterLogsByPeriod(fruits, period);
  const periodMeals = filterLogsByPeriod(meals, period);

  // --- 1. Estatísticas de Mamadas e Fórmulas ---
  const getFeedingStats = () => {
    let totalBreastCount = 0;
    let totalFormulaMl = 0;
    
    // Agrupa por data YYYY-MM-DD para contar mamadas por dia
    const dailyBreastCount: { [date: string]: number } = {};
    const dailyFormulaMl: { [date: string]: number } = {};
    
    // Inicializa o objeto com os dias do período para garantir médias corretas
    for (let i = 0; i < period; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dailyBreastCount[dateKey] = 0;
      dailyFormulaMl[dateKey] = 0;
    }

    periodFeedings.forEach(f => {
      const dateKey = f.datetime.split('T')[0];
      
      if (f.type === 'breast' || f.type === 'mixed') {
        dailyBreastCount[dateKey] = (dailyBreastCount[dateKey] || 0) + 1;
        totalBreastCount += 1;
      }
      if ((f.type === 'formula' || f.type === 'mixed') && f.amountMl) {
        dailyFormulaMl[dateKey] = (dailyFormulaMl[dateKey] || 0) + f.amountMl;
        totalFormulaMl += f.amountMl;
      }
    });

    const avgBreastPerDay = totalBreastCount / period;
    const avgFormulaMlPerDay = totalFormulaMl / period;

    return {
      totalBreastCount,
      totalFormulaMl,
      avgBreastPerDay: Number(avgBreastPerDay.toFixed(1)),
      avgFormulaMlPerDay: Math.round(avgFormulaMlPerDay)
    };
  };

  const feedingStats = getFeedingStats();

  // --- 2. Aceitação de Alimentos (Frutas e Refeições) ---
  const getFoodAcceptanceStats = () => {
    const fruitAcceptance: { [name: string]: { total: number; accepted: number } } = {};
    const mealAcceptance: { [name: string]: { total: number; accepted: number } } = {};

    periodFruits.forEach(f => {
      const key = f.fruitName + (f.fruitType ? ` (${f.fruitType})` : '');
      if (!fruitAcceptance[key]) fruitAcceptance[key] = { total: 0, accepted: 0 };
      fruitAcceptance[key].total += 1;
      if (f.reaction === 'aceitou' || f.reaction === 'fez careta' || f.reaction === 'outro') {
        fruitAcceptance[key].accepted += 1;
      }
    });

    periodMeals.forEach(m => {
      const key = `${m.foodName} (${m.category})`;
      if (!mealAcceptance[key]) mealAcceptance[key] = { total: 0, accepted: 0 };
      mealAcceptance[key].total += 1;
      if (m.reaction === 'aceitou' || m.reaction === 'fez careta' || m.reaction === 'outro') {
        mealAcceptance[key].accepted += 1;
      }
    });

    return { fruitAcceptance, mealAcceptance };
  };

  const { fruitAcceptance, mealAcceptance } = getFoodAcceptanceStats();

  // --- 3. Lista de Todos os Alimentos já Testados (Histórico Completo) ---
  const getTestedFoodsList = () => {
    const testedFruits = new Set<string>();
    const testedMeals = new Set<string>();

    fruits.forEach(f => {
      testedFruits.add(f.fruitName + (f.fruitType ? ` (${f.fruitType})` : ''));
    });

    meals.forEach(m => {
      testedMeals.add(m.foodName);
    });

    return {
      fruitsList: Array.from(testedFruits).sort(),
      mealsList: Array.from(testedMeals).sort()
    };
  };

  const testedFoods = getTestedFoodsList();

  // --- 4. Histórico de Possíveis Reações Registradas (Histórico Completo) ---
  const getReactionsList = () => {
    const list: Array<{
      id: string;
      date: string;
      food: string;
      type: 'fruit' | 'meal';
      reaction: ReactionType;
      notes?: string;
    }> = [];

    // Filtra reações que podem ser adversas (recusou, gases, regurgitou, manchas/irritação)
    const badReactions: ReactionType[] = ['recusou', 'gases', 'regurgitou', 'irritação/manchas', 'fez careta'];

    fruits.forEach(f => {
      if (f.id && badReactions.includes(f.reaction)) {
        list.push({
          id: f.id,
          date: f.datetime.split('T')[0],
          food: f.fruitName + (f.fruitType ? ` (${f.fruitType})` : ''),
          type: 'fruit',
          reaction: f.reaction,
          notes: f.notes
        });
      }
    });

    meals.forEach(m => {
      if (m.id && badReactions.includes(m.reaction)) {
        list.push({
          id: m.id,
          date: m.datetime.split('T')[0],
          food: `${m.foodName} (${m.category})`,
          type: 'meal',
          reaction: m.reaction,
          notes: m.notes
        });
      }
    });

    // Ordena do mais recente para o mais antigo
    return list.sort((a, b) => b.date.localeCompare(a.date));
  };

  const reactionsList = getReactionsList();

  const getReactionBadgeColor = (reaction: ReactionType) => {
    switch (reaction) {
      case 'recusou': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'fez careta': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'gases': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'regurgitou': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'irritação/manchas': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-150';
    }
  };

  const getReactionLabel = (reaction: ReactionType) => {
    switch (reaction) {
      case 'recusou': return 'Recusou';
      case 'fez careta': return 'Fez careta';
      case 'gases': return 'Gases/Cólica';
      case 'regurgitou': return 'Regurgitou';
      case 'irritação/manchas': return 'Pele vermelha';
      default: return reaction;
    }
  };

  // --- 5. Exportar Relatório em CSV ---
  const handleExportCSV = () => {
    const csvRows: string[] = [];
    
    // Adiciona cabeçalhos gerais do relatório
    csvRows.push(`Relatório Clínico de Rotina - Baby Grow`);
    csvRows.push(`Bebê:;${baby.name}`);
    csvRows.push(`Idade Atual:;${getBabyAge()}`);
    csvRows.push(`Período analisado:;Últimos ${period} dias`);
    csvRows.push(`Gerado em:;${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`);
    csvRows.push(``); // Linha em branco

    // Cabeçalho dos registros
    csvRows.push('Data;Hora;Categoria;Registro/Alimento;Volume/Quantidade;Reação/Aceitação;Observações');

    const combinedLogs: Array<{
      date: string;
      time: string;
      category: string;
      detail: string;
      amount: string;
      reaction: string;
      notes: string;
      timestamp: string;
    }> = [];

    if (includeFeedings) {
      periodFeedings.forEach(f => {
        const [date, time] = f.datetime.split('T');
        combinedLogs.push({
          date: new Date(date + 'T12:00').toLocaleDateString('pt-BR'),
          time: time || '',
          category: f.type === 'water' ? 'Água' : 'Mamada',
          detail: f.type === 'breast' ? 'Leite Materno' : f.type === 'formula' ? 'Fórmula Infantil' : f.type === 'mixed' ? 'Misto' : 'Água',
          amount: f.amountMl ? `${f.amountMl}ml` : f.durationMinutes ? `${f.durationMinutes} min` : '-',
          reaction: '-',
          notes: f.notes || '',
          timestamp: f.datetime
        });
      });
    }

    if (includeFruits) {
      periodFruits.forEach(fr => {
        const [date, time] = fr.datetime.split('T');
        combinedLogs.push({
          date: new Date(date + 'T12:00').toLocaleDateString('pt-BR'),
          time: time || '',
          category: 'Fruta',
          detail: fr.fruitName + (fr.fruitType ? ` (${fr.fruitType})` : ''),
          amount: fr.quantity,
          reaction: getReactionLabel(fr.reaction),
          notes: fr.notes || '',
          timestamp: fr.datetime
        });
      });
    }

    if (includeMeals) {
      periodMeals.forEach(m => {
        const [date, time] = m.datetime.split('T');
        combinedLogs.push({
          date: new Date(date + 'T12:00').toLocaleDateString('pt-BR'),
          time: time || '',
          category: `Refeição (${m.category})`,
          detail: m.foodName,
          amount: `${m.quantity} (${m.texture})`,
          reaction: getReactionLabel(m.reaction),
          notes: m.notes || '',
          timestamp: m.datetime
        });
      });
    }

    // Ordena de forma CRONOLÓGICA (do mais antigo ao mais novo para ver a evolução da rotina)
    combinedLogs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    // Converte para linhas CSV
    combinedLogs.forEach(row => {
      const values = [
        row.date,
        row.time,
        row.category,
        row.detail.replace(/;/g, ','),
        row.amount,
        row.reaction,
        row.notes.replace(/;/g, ',').replace(/\n/g, ' ')
      ];
      csvRows.push(values.join(';'));
    });

    if (includeNotes && notes) {
      csvRows.push(``);
      csvRows.push(`Anotações Clínicas / Dúvidas para a Consulta:`);
      csvRows.push(notes.replace(/;/g, ',').replace(/\n/g, ' '));
    }

    const csvContent = '\ufeff' + csvRows.join('\n'); // Adiciona BOM para acentuação correta no Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_pediatra_${baby.name.toLowerCase()}_${period}dias.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 6. Compartilhar Resumo Nativo / Web ---
  const handleShareSummary = async () => {
    setShareStatus('idle');

    // Constrói a mensagem em texto formatado
    let summaryText = `📊 *Relatório Alimentar - Baby Grow*
Bebê: *${baby.name}*
Idade: *${getBabyAge()}*
Período: Últimos *${period} dias*\n`;

    if (includeFeedings) {
      summaryText += `
🍼 *Mamadas, Fórmulas e Água:*
- Média de Mamadas/dia: *${feedingStats.avgBreastPerDay}*
- Média de Fórmula/dia: *${feedingStats.avgFormulaMlPerDay} ml*
- Volume total consumido no período: *${feedingStats.totalFormulaMl} ml*\n`;
    }

    if (includeFruits && Object.keys(fruitAcceptance).length > 0) {
      summaryText += `
🍎 *Frutas Oferecidas (Aceitação):*
${Object.entries(fruitAcceptance).map(([name, stats]) => `- ${name}: ${stats.total}x (Aceitou: ${stats.accepted}x)`).join('\n')}\n`;
    }

    if (includeMeals && Object.keys(mealAcceptance).length > 0) {
      summaryText += `
🍛 *Refeições Oferecidas (Aceitação):*
${Object.entries(mealAcceptance).map(([name, stats]) => `- ${name}: ${stats.total}x (Aceitou: ${stats.accepted}x)`).join('\n')}\n`;
    }

    if (includeReactions && reactionsList.length > 0) {
      summaryText += `
⚠️ *Sintomas e Reações adversas:*
${reactionsList.slice(0, 5).map(r => `- ${new Date(r.date + 'T12:00').toLocaleDateString('pt-BR')}: ${r.food} -> ${getReactionLabel(r.reaction)}`).join('\n')}\n`;
    }

    // Linha do tempo dia a dia detalhada
    const logsByDate: { [dateStr: string]: string[] } = {};

    if (includeFeedings) {
      periodFeedings.forEach(f => {
        const [date, time] = f.datetime.split('T');
        if (!logsByDate[date]) logsByDate[date] = [];
        const desc = f.type === 'water' ? '💧 Água' : `Leite (${f.type === 'breast' ? 'Materno' : f.type === 'formula' ? 'Fórmula' : 'Misto'})`;
        const vol = f.amountMl ? `${f.amountMl}ml` : f.durationMinutes ? `${f.durationMinutes} min` : '';
        logsByDate[date].push(`  - ${time || '00:00'} | 🍼 ${desc} ${vol ? `(${vol})` : ''}${f.notes ? ` [Nota: ${f.notes}]` : ''}`);
      });
    }

    if (includeFruits) {
      periodFruits.forEach(fr => {
        const [date, time] = fr.datetime.split('T');
        if (!logsByDate[date]) logsByDate[date] = [];
        const reactionEmoji = fr.reaction === 'aceitou' ? '🟢' : fr.reaction === 'recusou' ? '🔴' : '🟡';
        logsByDate[date].push(`  - ${time || '00:00'} | 🍎 Fruta: ${fr.fruitName}${fr.fruitType ? ` (${fr.fruitType})` : ''} - Qtd: ${fr.quantity} ${reactionEmoji} (${getReactionLabel(fr.reaction)})${fr.notes ? ` [Nota: ${fr.notes}]` : ''}`);
      });
    }

    if (includeMeals) {
      periodMeals.forEach(m => {
        const [date, time] = m.datetime.split('T');
        if (!logsByDate[date]) logsByDate[date] = [];
        const reactionEmoji = m.reaction === 'aceitou' ? '🟢' : m.reaction === 'recusou' ? '🔴' : '🟡';
        logsByDate[date].push(`  - ${time || '00:00'} | 🍛 Refeição (${m.category}): ${m.foodName} - Textura: ${m.texture} - Qtd: ${m.quantity} ${reactionEmoji} (${getReactionLabel(m.reaction)})${m.notes ? ` [Nota: ${m.notes}]` : ''}`);
      });
    }

    const sortedDates = Object.keys(logsByDate).sort((a, b) => b.localeCompare(a)); // Datas do mais novo ao mais antigo
    if (sortedDates.length > 0) {
      summaryText += `\n📅 *Diário de Rotina Detalhado:*`;
      sortedDates.forEach(date => {
        const formattedDate = new Date(date + 'T12:00').toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short'
        });
        summaryText += `\n\n*${formattedDate}*\n`;
        const entries = logsByDate[date].sort();
        entries.forEach(entry => {
          summaryText += `${entry}\n`;
        });
      });
    }

    if (includeNotes && notes) {
      summaryText += `
📝 *Anotações para Consulta:*
${notes}\n`;
    }

    summaryText += `\n_Gerado via aplicativo Baby Grow_`;

    try {
      if (Capacitor.isNativePlatform()) {
        const canShareResult = await Share.canShare();
        if (canShareResult.value) {
          await Share.share({
            title: `Relatório do Bebê - ${baby.name}`,
            text: summaryText,
            dialogTitle: 'Enviar resumo para o pediatra'
          });
          setShareStatus('success');
          return;
        }
      }

      // Fallback para Web Share API
      if (navigator.share) {
        await navigator.share({
          title: `Relatório do Bebê - ${baby.name}`,
          text: summaryText
        });
        setShareStatus('success');
      } else {
        // Fallback de cópia em área de transferência
        await navigator.clipboard.writeText(summaryText);
        setShareStatus('success');
        alert('Resumo copiado para a Área de Transferência! Agora você pode colá-lo no WhatsApp do pediatra.');
        setTimeout(() => setShareStatus('idle'), 3000);
      }
    } catch (err) {
      console.warn('Erro ao compartilhar resumo:', err);
      setShareStatus('error');
      setTimeout(() => setShareStatus('idle'), 3500);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-4 space-y-5">
      {/* Pediatrician Top Card Dashboard */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 text-white shadow-md shadow-indigo-150 flex items-center justify-between">
        <div className="min-w-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Painel Clínico</span>
          <h2 className="text-xl font-black mt-0.5 truncate">Relatório para o Pediatra</h2>
          <p className="text-xs text-indigo-50 font-semibold mt-1">Consolidação de dados de {baby.name} ({getBabyAge()}).</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-4xl shrink-0">
          🩺
        </div>
      </div>

      {/* Period selector tabs */}
      <div className="bg-slate-100/70 p-1.5 rounded-2xl flex border border-slate-100">
        <button
          onClick={() => setPeriod(7)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer ${
            period === 7
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Últimos 7 dias
        </button>
        <button
          onClick={() => setPeriod(30)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer ${
            period === 30
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Últimos 30 dias
        </button>
      </div>

      {/* Seleção de Informações / Filtros */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="border-b border-slate-50 pb-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Configurar Relatório
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Escolha as categorias para compor o CSV, compartilhamento e visualização:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeFeedings}
              onChange={(e) => setIncludeFeedings(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-400 border-slate-300"
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-700">Mamadas</span>
              <span className="text-[9px] text-slate-400 font-medium">Fórmula, peito, água</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeFruits}
              onChange={(e) => setIncludeFruits(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-400 border-slate-300"
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-700">Frutas</span>
              <span className="text-[9px] text-slate-400 font-medium">Variedades e aceitação</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeMeals}
              onChange={(e) => setIncludeMeals(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-400 border-slate-300"
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-700">Refeições</span>
              <span className="text-[9px] text-slate-400 font-medium">Almoço, papinha, etc</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeReactions}
              onChange={(e) => setIncludeReactions(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-400 border-slate-300"
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-700">Reações</span>
              <span className="text-[9px] text-slate-400 font-medium">Alergias e recusas</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none col-span-2">
            <input
              type="checkbox"
              checked={includeNotes}
              onChange={(e) => setIncludeNotes(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-slate-700 focus:ring-slate-500 border-slate-300"
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-700">Anotações</span>
              <span className="text-[9px] text-slate-400 font-medium">Notas importantes para o consultório</span>
            </div>
          </label>
        </div>
      </div>

      {/* Actions: CSV and Share */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleExportCSV}
          className="py-3 px-4 bg-white border border-slate-150 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-indigo-600" /> Exportar CSV
        </button>
        <button
          onClick={handleShareSummary}
          className={`py-3 px-4 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer ${
            shareStatus === 'success' ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <Share2 className="w-4 h-4" /> 
          {shareStatus === 'success' ? 'Copiado/Enviado!' : 'Compartilhar'}
        </button>
      </div>

      {/* Stats Cards: Milk and Formula */}
      {includeFeedings && (
        <div className="grid grid-cols-2 gap-3">
          {/* Milk Breast */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Milk className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Média de Mamadas</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-800">{feedingStats.avgBreastPerDay}</span>
              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">vezes ao dia</span>
            </div>
          </div>

          {/* Formula ml */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Milk className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Média de Fórmula</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-800">{feedingStats.avgFormulaMlPerDay} ml</span>
              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">volume diário</span>
            </div>
          </div>
        </div>
      )}

      {/* Introdução Alimentar: frutas e pratos aceitos */}
      {(includeFruits || includeMeals) && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Consumo no Período ({period} dias)
          </h3>

          <div className="space-y-4">
            {/* Fruits list */}
            {includeFruits && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Apple className="w-3.5 h-3.5 text-pink-500" /> Frutas oferecidas:
                </h4>
                {Object.keys(fruitAcceptance).length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-medium pl-4">Nenhuma fruta oferecida neste período.</p>
                ) : (
                  <div className="space-y-1.5 pl-2">
                    {Object.entries(fruitAcceptance).map(([name, stats]) => {
                      const rate = Math.round((stats.accepted / stats.total) * 100);
                      return (
                        <div key={name} className="flex items-center justify-between text-xs border-b border-slate-50 pb-1">
                          <span className="font-semibold text-slate-700">{name}</span>
                          <span className="text-slate-400 font-medium">
                            Oferecido <b className="text-slate-650">{stats.total}x</b> ➔ Aceitou <b className="text-emerald-600">{rate}%</b>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Meals list */}
            {includeMeals && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-teal-600" /> Refeições e papinhas:
                </h4>
                {Object.keys(mealAcceptance).length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-medium pl-4">Nenhuma refeição registrada no período.</p>
                ) : (
                  <div className="space-y-1.5 pl-2">
                    {Object.entries(mealAcceptance).map(([name, stats]) => {
                      const rate = Math.round((stats.accepted / stats.total) * 100);
                      return (
                        <div key={name} className="flex items-center justify-between text-xs border-b border-slate-50 pb-1">
                          <span className="font-semibold text-slate-700 truncate max-w-[170px]">{name}</span>
                          <span className="text-slate-400 font-medium">
                            Oferecido <b className="text-slate-650">{stats.total}x</b> ➔ Aceitou <b className="text-emerald-600">{rate}%</b>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alimentos já Testados (Histórico Completo) */}
      {(includeFruits || includeMeals) && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Alimentos já Testados (Histórico)
          </h3>

          <div className="space-y-3 text-xs">
            {includeFruits && (
              <div>
                <h4 className="font-bold text-slate-650 mb-1">Frutas:</h4>
                {testedFoods.fruitsList.length === 0 ? (
                  <p className="text-[11px] text-slate-400">Nenhuma fruta testada ainda.</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {testedFoods.fruitsList.map(item => (
                      <span key={item} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg font-medium text-slate-600">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {includeMeals && (
              <div>
                <h4 className="font-bold text-slate-650 mb-1">Ingredientes em Pratos:</h4>
                {testedFoods.mealsList.length === 0 ? (
                  <p className="text-[11px] text-slate-400">Nenhum prato/ingrediente testado ainda.</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {testedFoods.mealsList.map(item => (
                      <span key={item} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg font-medium text-slate-600">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Histórico de Possíveis Reações (Histórico Completo) */}
      {includeReactions && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Possíveis Reações / Recusas
          </h3>

          {reactionsList.length === 0 ? (
            <p className="text-[11px] text-slate-400 font-medium py-2 text-center">Nenhuma reação adversa ou recusa registrada!</p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {reactionsList.map((item) => (
                <div key={item.id} className="border border-slate-100 p-2.5 rounded-2xl bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold">{new Date(item.date + 'T12:00').toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
                    <span className={`px-2 py-0.5 border rounded-md text-[8px] font-black uppercase tracking-wider ${getReactionBadgeColor(item.reaction)}`}>
                      {getReactionLabel(item.reaction)}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{item.food}</p>
                  {item.notes && (
                    <p className="text-[10px] text-slate-500 italic pl-1.5 border-l-2 border-slate-200">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notas do Pediatra */}
      {includeNotes && (
        <div className="bg-indigo-50/40 border border-indigo-100 rounded-3xl p-5 space-y-3 shadow-inner">
          <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-indigo-600 fill-indigo-100" />
            Anotações para a Consulta
          </h3>
          <p className="text-[10px] text-indigo-700 leading-relaxed font-semibold">
            Escreva abaixo dúvidas, orientações médicas ou observações importantes que queira lembrar de conversar na próxima consulta.
          </p>

          <textarea
            rows={3}
            placeholder={userRole === 'leitura' ? 'Modo de leitura apenas.' : 'Ex: Maya tem tomado pouca água. Perguntar se posso oferecer suco natural ou água de coco...'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={userRole === 'leitura'}
            className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl focus:outline-none focus:border-indigo-400 text-xs font-medium text-slate-800 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
          />

          {userRole !== 'leitura' && (
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs text-white active:scale-95 transition-all cursor-pointer ${
                saveSuccess ? 'bg-emerald-500' : 'bg-slate-800 hover:bg-slate-900'
              }`}
            >
              {saveSuccess ? <CheckCircle2 className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
              {isSavingNotes ? 'Salvando...' : saveSuccess ? 'Anotações Salvas!' : 'Salvar relatório'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PediatricianScreen;

