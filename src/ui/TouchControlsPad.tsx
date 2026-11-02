import React, { useState } from 'react';
import {
  clearAllTouchDirections,
  setTouchDirectionHeld,
  TouchDirection,
  triggerTouchInteract,
} from '../player/touchControls';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Coffee,
  Cpu,
  Gamepad2,
  Hand,
  Laptop,
  Navigation,
} from 'lucide-react';

interface TouchControlsPadProps {
  hasNearbyNpc: boolean;
  nearbyNpcFirstName?: string;
  nearCafeteria: boolean;
  hasActiveProblem: boolean;
  isAtTargetSector: boolean;
  onWalkToActiveTicket: () => void;
  onOpenHardwareWorkbench: () => void;
  onOpenVirtualOS: () => void;
  onOpenCafeteria: () => void;
}

export const TouchControlsPad: React.FC<TouchControlsPadProps> = ({
  hasNearbyNpc,
  nearbyNpcFirstName,
  nearCafeteria,
  hasActiveProblem,
  isAtTargetSector,
  onWalkToActiveTicket,
  onOpenHardwareWorkbench,
  onOpenVirtualOS,
  onOpenCafeteria,
}) => {
  const [activeDirs, setActiveDirs] = useState<Record<TouchDirection, boolean>>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const handlePress = (dir: TouchDirection, pressed: boolean) => {
    setTouchDirectionHeld(dir, pressed);
    setActiveDirs((prev) => (prev[dir] === pressed ? prev : { ...prev, [dir]: pressed }));
  };

  const bindDirEvents = (dir: TouchDirection) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      handlePress(dir, true);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      handlePress(dir, false);
    },
    onPointerLeave: () => handlePress(dir, false),
    onPointerCancel: () => {
      clearAllTouchDirections();
      setActiveDirs({ up: false, down: false, left: false, right: false });
    },
  });

  const dirButtonClass = (dir: TouchDirection) =>
    `w-11 h-11 rounded-xl border flex items-center justify-center transition-transform select-none touch-none cursor-pointer shadow-lg ${
      activeDirs[dir]
        ? 'bg-sky-500 border-sky-300 text-slate-950 scale-95'
        : 'bg-[#0f172a]/95 border-slate-700 text-slate-100 active:scale-95'
    }`;

  return (
    <div
      aria-label="Controles Virtuais de Toque para Celular"
      className="w-full flex items-end justify-between gap-2 pointer-events-none select-none md:hidden mb-1"
    >
      {/* Left Thumb Zone: 4-Way Tactile D-Pad */}
      <div className="pointer-events-auto bg-[#090d16]/85 border border-slate-800 rounded-2xl p-2 shadow-2xl">
        <div className="grid grid-cols-3 gap-1.5 items-center justify-items-center">
          <div />
          <button
            type="button"
            aria-label="Andar para Cima"
            className={dirButtonClass('up')}
            {...bindDirEvents('up')}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            type="button"
            aria-label="Andar para a Esquerda"
            className={dirButtonClass('left')}
            {...bindDirEvents('left')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-center text-sky-400">
            <Gamepad2 className="w-4 h-4" />
          </div>

          <button
            type="button"
            aria-label="Andar para a Direita"
            className={dirButtonClass('right')}
            {...bindDirEvents('right')}
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div />
          <button
            type="button"
            aria-label="Andar para Baixo"
            className={dirButtonClass('down')}
            {...bindDirEvents('down')}
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div />
        </div>
      </div>

      {/* Right Thumb Zone: Contextual Action Buttons */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        {hasActiveProblem && isAtTargetSector && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenHardwareWorkbench}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-500 active:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-xl cursor-pointer"
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span>Hardware</span>
            </button>
            <button
              type="button"
              onClick={onOpenVirtualOS}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-[#0071e3] active:bg-[#0077ed] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xl cursor-pointer"
            >
              <Laptop className="w-4 h-4 shrink-0" />
              <span>OverOS</span>
            </button>
          </div>
        )}

        {nearCafeteria ? (
          <button
            type="button"
            onClick={onOpenCafeteria}
            className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-amber-500 active:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-2xl border border-amber-300 cursor-pointer"
          >
            <Coffee className="w-4 h-4 shrink-0" />
            <span>Abrir Cafeteria</span>
          </button>
        ) : hasNearbyNpc ? (
          <button
            type="button"
            onClick={() => triggerTouchInteract()}
            className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-emerald-500 active:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-2xl border border-emerald-300 cursor-pointer"
          >
            <Hand className="w-4 h-4 shrink-0" />
            <span>Falar com {nearbyNpcFirstName || 'Colega'}</span>
          </button>
        ) : hasActiveProblem ? (
          <button
            type="button"
            onClick={onWalkToActiveTicket}
            className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-[#0071e3] active:bg-[#0077ed] text-white text-xs font-extrabold flex items-center gap-2 shadow-2xl border border-sky-400/50 cursor-pointer"
          >
            <Navigation className="w-4 h-4 shrink-0" />
            <span>Ir ao Setor</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};
