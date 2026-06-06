import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RefreshCw, ArrowLeftRight } from 'lucide-react';

interface BreastfeedingTimerProps {
  onTimerChange: (data: {
    leftSeconds: number;
    rightSeconds: number;
    totalSeconds: number;
    breastSide: 'left' | 'right' | 'both' | null;
    startedAt?: number;
    endedAt?: number;
  }) => void;
  initialLeftSeconds?: number;
  initialRightSeconds?: number;
  autoStartSide?: 'left' | 'right' | null;
}

export const BreastfeedingTimer: React.FC<BreastfeedingTimerProps> = ({
  onTimerChange,
  initialLeftSeconds = 0,
  initialRightSeconds = 0,
  autoStartSide = null
}) => {
  const [leftSeconds, setLeftSeconds] = useState(initialLeftSeconds);
  const [rightSeconds, setRightSeconds] = useState(initialRightSeconds);
  const [activeSide, setActiveSide] = useState<'left' | 'right' | null>(autoStartSide);
  
  const startedAtRef = useRef<number | undefined>(undefined);
  const intervalRef = useRef<any>(null);
  const leftAccumulatedRef = useRef<number>(initialLeftSeconds);
  const rightAccumulatedRef = useRef<number>(initialRightSeconds);
  const activeSideStartTimeRef = useRef<number | null>(null);

  // Carrega estado do localStorage ao montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bg_breastfeeding_timer');
      if (saved) {
        const state = JSON.parse(saved);
        const now = Date.now();
        
        let loadedLeft = state.leftSeconds || 0;
        let loadedRight = state.rightSeconds || 0;
        let loadedActive = state.activeSide || null;
        startedAtRef.current = state.startedAt || now;

        if (loadedActive && state.lastTickTime) {
          // Calcula tempo decorrido em segundos enquanto estava em segundo plano
          const elapsed = Math.floor((now - state.lastTickTime) / 1000);
          if (elapsed > 0) {
            if (loadedActive === 'left') {
              loadedLeft += elapsed;
            } else if (loadedActive === 'right') {
              loadedRight += elapsed;
            }
          }
        }

        setLeftSeconds(loadedLeft);
        setRightSeconds(loadedRight);
        setActiveSide(loadedActive);

        leftAccumulatedRef.current = loadedLeft;
        rightAccumulatedRef.current = loadedRight;
        if (loadedActive) {
          activeSideStartTimeRef.current = Date.now();
        }
      } else {
        // Se não houver nada no localStorage, usa os valores iniciais passados por props
        setLeftSeconds(initialLeftSeconds);
        setRightSeconds(initialRightSeconds);
        leftAccumulatedRef.current = initialLeftSeconds;
        rightAccumulatedRef.current = initialRightSeconds;
      }
    } catch (e) {
      console.error('Erro ao restaurar timer de mamada:', e);
    }
  }, []);

  // Salva no localStorage quando o estado mudar
  useEffect(() => {
    if (leftSeconds === 0 && rightSeconds === 0 && activeSide === null) {
      localStorage.removeItem('bg_breastfeeding_timer');
      return;
    }

    try {
      const state = {
        leftSeconds,
        rightSeconds,
        activeSide,
        lastTickTime: Date.now(),
        startedAt: startedAtRef.current || Date.now()
      };
      localStorage.setItem('bg_breastfeeding_timer', JSON.stringify(state));
    } catch (e) {
      console.error('Erro ao salvar timer no localStorage:', e);
    }
  }, [leftSeconds, rightSeconds, activeSide]);

  // Loop de atualização do timer (tique-taque)
  useEffect(() => {
    if (activeSide) {
      if (!startedAtRef.current) {
        startedAtRef.current = Date.now();
      }
      if (!activeSideStartTimeRef.current) {
        activeSideStartTimeRef.current = Date.now();
      }

      intervalRef.current = setInterval(() => {
        if (!activeSideStartTimeRef.current) return;
        const elapsed = Math.floor((Date.now() - activeSideStartTimeRef.current) / 1000);
        
        if (activeSide === 'left') {
          setLeftSeconds(leftAccumulatedRef.current + elapsed);
        } else if (activeSide === 'right') {
          setRightSeconds(rightAccumulatedRef.current + elapsed);
        }
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeSide]);

  // Comunica alterações de volta para a tela principal
  useEffect(() => {
    const total = leftSeconds + rightSeconds;
    let side: 'left' | 'right' | 'both' | null = null;
    if (leftSeconds > 0 && rightSeconds > 0) side = 'both';
    else if (leftSeconds > 0) side = 'left';
    else if (rightSeconds > 0) side = 'right';

    onTimerChange({
      leftSeconds,
      rightSeconds,
      totalSeconds: total,
      breastSide: side,
      startedAt: startedAtRef.current,
      endedAt: total > 0 ? Date.now() : undefined
    });
  }, [leftSeconds, rightSeconds]);

  // Pausa o lado ativo acumulando o tempo decorrido
  const pauseActiveSide = () => {
    if (activeSide && activeSideStartTimeRef.current) {
      const elapsed = Math.floor((Date.now() - activeSideStartTimeRef.current) / 1000);
      if (activeSide === 'left') {
        leftAccumulatedRef.current += elapsed;
        setLeftSeconds(leftAccumulatedRef.current);
      } else if (activeSide === 'right') {
        rightAccumulatedRef.current += elapsed;
        setRightSeconds(rightAccumulatedRef.current);
      }
    }
    activeSideStartTimeRef.current = null;
  };

  // Controles
  const startLeft = () => {
    pauseActiveSide();
    leftAccumulatedRef.current = leftSeconds;
    activeSideStartTimeRef.current = Date.now();
    setActiveSide('left');
    if (!startedAtRef.current) startedAtRef.current = Date.now();
  };

  const pauseLeft = () => {
    if (activeSide === 'left') {
      pauseActiveSide();
      setActiveSide(null);
    }
  };

  const finishLeft = () => {
    if (activeSide === 'left') {
      pauseActiveSide();
      setActiveSide(null);
    }
  };

  const startRight = () => {
    pauseActiveSide();
    rightAccumulatedRef.current = rightSeconds;
    activeSideStartTimeRef.current = Date.now();
    setActiveSide('right');
    if (!startedAtRef.current) startedAtRef.current = Date.now();
  };

  const pauseRight = () => {
    if (activeSide === 'right') {
      pauseActiveSide();
      setActiveSide(null);
    }
  };

  const finishRight = () => {
    if (activeSide === 'right') {
      pauseActiveSide();
      setActiveSide(null);
    }
  };

  const swapSide = () => {
    if (activeSide === 'left') {
      pauseActiveSide();
      rightAccumulatedRef.current = rightSeconds;
      activeSideStartTimeRef.current = Date.now();
      setActiveSide('right');
    } else if (activeSide === 'right') {
      pauseActiveSide();
      leftAccumulatedRef.current = leftSeconds;
      activeSideStartTimeRef.current = Date.now();
      setActiveSide('left');
    } else {
      // Se estiver pausado, começa pelo lado que tiver menos tempo
      if (leftSeconds <= rightSeconds) {
        startLeft();
      } else {
        startRight();
      }
    }
  };

  const resetTimers = () => {
    if (window.confirm('Deseja zerar os contadores de mamada?')) {
      leftAccumulatedRef.current = 0;
      rightAccumulatedRef.current = 0;
      activeSideStartTimeRef.current = null;
      setLeftSeconds(0);
      setRightSeconds(0);
      setActiveSide(null);
      startedAtRef.current = undefined;
      localStorage.removeItem('bg_breastfeeding_timer');
    }
  };

  // Auxiliar de formato mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalTime = leftSeconds + rightSeconds;

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm">
      <div className="text-center">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cronômetro de Mamada</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Lado Esquerdo */}
        <div className={`p-4 rounded-2xl border text-center transition-all ${
          activeSide === 'left' 
            ? 'bg-amber-50 border-amber-300 shadow-sm shadow-amber-50' 
            : 'bg-white border-slate-100'
        }`}>
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Seio Esquerdo</span>
          <div className={`text-3xl font-black mt-2 font-mono ${activeSide === 'left' ? 'text-amber-600' : 'text-slate-800'}`}>
            {formatTime(leftSeconds)}
          </div>
          
          <div className="flex flex-col gap-1.5 mt-3">
            {activeSide !== 'left' ? (
              <button
                type="button"
                onClick={startLeft}
                className="py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Iniciar
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseLeft}
                className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" /> Pausar
              </button>
            )}
            
            <button
              type="button"
              onClick={finishLeft}
              disabled={leftSeconds === 0}
              className={`py-1.5 px-3 border font-bold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all ${
                leftSeconds > 0 
                  ? 'border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer' 
                  : 'border-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Square className="w-3 h-3 fill-current" /> Finalizar
            </button>
          </div>
        </div>

        {/* Lado Direito */}
        <div className={`p-4 rounded-2xl border text-center transition-all ${
          activeSide === 'right' 
            ? 'bg-amber-50 border-amber-300 shadow-sm shadow-amber-50' 
            : 'bg-white border-slate-100'
        }`}>
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Seio Direito</span>
          <div className={`text-3xl font-black mt-2 font-mono ${activeSide === 'right' ? 'text-amber-600' : 'text-slate-800'}`}>
            {formatTime(rightSeconds)}
          </div>
          
          <div className="flex flex-col gap-1.5 mt-3">
            {activeSide !== 'right' ? (
              <button
                type="button"
                onClick={startRight}
                className="py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Iniciar
              </button>
            ) : (
              <button
                type="button"
                onClick={pauseRight}
                className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" /> Pausar
              </button>
            )}
            
            <button
              type="button"
              onClick={finishRight}
              disabled={rightSeconds === 0}
              className={`py-1.5 px-3 border font-bold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all ${
                rightSeconds > 0 
                  ? 'border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer' 
                  : 'border-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Square className="w-3 h-3 fill-current" /> Finalizar
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={swapSide}
          className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs cursor-pointer shadow-md shadow-amber-100"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Trocar Lado
        </button>

        <button
          type="button"
          onClick={resetTimers}
          disabled={totalTime === 0 && !activeSide}
          className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all border text-xs ${
            totalTime > 0 || activeSide
              ? 'border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer'
              : 'border-slate-100 text-slate-300 cursor-not-allowed'
          }`}
          title="Zerar Cronômetros"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-3 flex justify-between items-center text-xs font-bold text-slate-600">
        <span>Duração Total:</span>
        <span className="font-mono text-sm text-slate-800">{formatTime(totalTime)}</span>
      </div>
    </div>
  );
};

export default BreastfeedingTimer;
