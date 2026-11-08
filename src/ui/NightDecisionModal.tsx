import React from 'react';
import { Award, BedDouble, Coffee, Home, Moon, Sparkles, Zap } from 'lucide-react';

interface NightDecisionModalProps {
  playerName: string;
  energy: number;
  points: number;
  ownedFurnitureCount: number;
  onChooseNightShift: () => void;
  onChooseGoHome: () => void;
}

export const NightDecisionModal: React.FC<NightDecisionModalProps> = ({
  playerName,
  energy,
  points,
  ownedFurnitureCount,
  onChooseNightShift,
  onChooseGoHome,
}) => {
  const displayName = playerName.trim() || 'Analista';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Fim do Expediente Diurno — Escolha da Noite"
      data-testid="night-decision-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 lg-modal-backdrop pointer-events-auto"
    >
      <div className="w-full max-w-2xl rounded-2xl lg-modal-floating border-indigo-500/45 p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider">
                Anoiteceu · Fim do Turno Diurno
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                O que você deseja fazer agora, {displayName}?
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-2.5 py-1.5 rounded-xl lg-hud-pill text-xs font-bold flex items-center gap-1.5 text-emerald-300">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{energy}%</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl lg-hud-pill text-xs font-bold flex items-center gap-1.5 text-amber-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{points} pts</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          O expediente comercial terminou e a noite chegou na cidade. Você pode continuar no escritório para o{' '}
          <strong className="text-indigo-300">Plantão Noturno</strong> ou{' '}
          <strong className="text-emerald-300">Ir para Casa Descansar</strong>, recuperar 100% da sua energia e mobiliar o seu lar.
        </p>

        {/* Two Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Plantão Noturno */}
          <div className="rounded-2xl lg-choice-card border-indigo-500/40 p-4 flex flex-col justify-between gap-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">
                  Hora Extra · 2 Minutos
                </span>
                <Moon className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Fazer Plantão Noturno
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  +50% de Pontos em cada chamado
                </li>
                <li className="flex items-center gap-1.5 text-amber-300">
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  Maior gasto de energia por ação
                </li>
                <li className="flex items-center gap-1.5 text-rose-300">
                  <Coffee className="w-3.5 h-3.5 shrink-0" />
                  Cafés custam +50% durante a noite
                </li>
              </ul>
            </div>

            <button
              type="button"
              data-testid="choose-night-shift-btn"
              onClick={onChooseNightShift}
              className="w-full py-2.5 px-4 rounded-xl lg-btn-primary text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Moon className="w-4 h-4" />
              Fazer Plantão Noturno
            </button>
          </div>

          {/* Option 2: Ir para Casa Descansar */}
          <div className="rounded-2xl lg-choice-card lg-choice-card-emerald p-4 flex flex-col justify-between gap-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">
                  3 Minutos em Casa · Lar 3D
                </span>
                <Home className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Ir para Casa Descansar
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <BedDouble className="w-3.5 h-3.5 shrink-0" />
                  Vá até a sua cama e clique para dormir (100% Energia)
                </li>
                <li className="flex items-center gap-1.5 text-sky-300">
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  3 min para explorar sua Casa ({ownedFurnitureCount}/36 versões)
                </li>
                <li className="flex items-center gap-1.5 text-amber-300">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  Compre móveis realistas (3 versões de cada item)
                </li>
              </ul>
            </div>

            <button
              type="button"
              data-testid="choose-go-home-btn"
              onClick={onChooseGoHome}
              className="w-full py-2.5 px-4 rounded-xl lg-btn-emerald text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Ir para Casa Descansar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
