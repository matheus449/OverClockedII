import React, { useEffect, useRef, useState } from 'react';
import {
  clearAllTouchDirections,
  computeAnalogStickState,
  setAnalogJoystickVector,
  triggerTouchInteract,
} from '../player/touchControls';
import {
  Coffee,
  Cpu,
  Hand,
  Laptop,
  MessageCircle,
} from 'lucide-react';

interface TouchControlsPadProps {
  hasNearbyNpc: boolean;
  nearbyNpcFirstName?: string;
  nearCafeteria: boolean;
  nearbyCafeteriaNpcFirstName?: string;
  hasActiveProblem: boolean;
  isAtTargetSector: boolean;
  onOpenHardwareWorkbench: () => void;
  onOpenVirtualOS: () => void;
  onOpenCafeteria: () => void;
  onTalkToCafeteriaNpc?: () => void;
}

const ANALOG_MAX_RADIUS_PX = 36;

export const TouchControlsPad: React.FC<TouchControlsPadProps> = ({
  hasNearbyNpc,
  nearbyNpcFirstName,
  nearCafeteria,
  nearbyCafeteriaNpcFirstName,
  hasActiveProblem,
  isAtTargetSector,
  onOpenHardwareWorkbench,
  onOpenVirtualOS,
  onOpenCafeteria,
  onTalkToCafeteriaNpc,
}) => {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const applyKnobTransform = (x: number, y: number, active: boolean) => {
    const knob = knobRef.current;
    if (!knob) return;
    knob.style.transition = active ? 'none' : 'transform 140ms cubic-bezier(0.22, 1, 0.36, 1)';
    knob.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const resetStick = () => {
    activePointerIdRef.current = null;
    clearAllTouchDirections();
    applyKnobTransform(0, 0, false);
    setIsDragging(false);
  };

  useEffect(() => {
    const onBlur = () => resetStick();
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('blur', onBlur);
      clearAllTouchDirections();
    };
  }, []);

  const updateStickFromClientPoint = (clientX: number, clientY: number) => {
    const deltaX = clientX - centerRef.current.x;
    const deltaY = clientY - centerRef.current.y;
    const state = computeAnalogStickState(deltaX, deltaY, ANALOG_MAX_RADIUS_PX);
    setAnalogJoystickVector(state.normX, state.normZ);
    applyKnobTransform(state.knobX, state.knobY, true);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const base = baseRef.current;
    if (!base) return;

    const rect = base.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    activePointerIdRef.current = e.pointerId;
    try {
      base.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if synthetic event does not support pointer capture
    }
    setIsDragging(true);
    updateStickFromClientPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    updateStickFromClientPoint(e.clientX, e.clientY);
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      baseRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    resetStick();
  };

  return (
    <div
      aria-label="Controles Virtuais Analógicos para Celular e Tablet"
      className="w-full flex items-end justify-between gap-2 pointer-events-none select-none"
    >
      {/* Left Thumb Zone: Round 360° Analog Thumbstick */}
      <div className="pointer-events-auto pl-1 pb-0.5">
        <div
          ref={baseRef}
          role="slider"
          aria-label="Joystick Analógico 360 Graus"
          aria-valuemin={-100}
          aria-valuemax={100}
          aria-valuenow={isDragging ? 100 : 0}
          data-testid="analog-joystick-base"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          onLostPointerCapture={() => resetStick()}
          className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center touch-none cursor-grab active:cursor-grabbing shadow-2xl transition-colors ${
            isDragging
              ? 'bg-[#090d16]/90 border-2 border-sky-400/85 shadow-sky-500/25'
              : 'bg-[#090d16]/75 border-2 border-slate-700/80'
          }`}
        >
          {/* Inner 360° Guide Ring */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-dashed pointer-events-none transition-colors ${
              isDragging ? 'border-sky-400/45' : 'border-slate-700/60'
            }`}
          />

          {/* Subtle Cardinal Compass Ticks on Outer Ring */}
          <span className="pointer-events-none absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-500/70" />
          <span className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-500/70" />
          <span className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-500/70" />
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-500/70" />

          {/* Movable Round Thumbstick Knob */}
          <div
            ref={knobRef}
            data-testid="analog-joystick-knob"
            className={`pointer-events-none absolute w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-xl border-2 ${
              isDragging
                ? 'bg-sky-500 border-sky-200 shadow-sky-500/40'
                : 'bg-slate-800/95 border-slate-500/90'
            }`}
          >
            {/* Tactile Center Grip Ring */}
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border ${
                isDragging
                  ? 'border-slate-950/40 bg-sky-300/40'
                  : 'border-slate-600 bg-slate-900/70'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Right Thumb Zone: Sleek Contextual Action Buttons (Only shown when near an interactive target; NO auto-walk buttons!) */}
      <div className="pointer-events-auto flex flex-col items-end gap-1.5 pr-1 pb-0.5">
        {hasActiveProblem && isAtTargetSector && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenHardwareWorkbench}
              className="min-h-[42px] px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg transition cursor-pointer"
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span>Hardware</span>
            </button>
            <button
              type="button"
              onClick={onOpenVirtualOS}
              className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg transition cursor-pointer"
            >
              <Laptop className="w-4 h-4 shrink-0" />
              <span>OverOS</span>
            </button>
          </div>
        )}

        {nearCafeteria && (
          <div className="flex items-center gap-1.5">
            {onTalkToCafeteriaNpc && (
              <button
                type="button"
                onClick={onTalkToCafeteriaNpc}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-sky-400/50 text-sky-300 text-xs font-bold flex items-center gap-1.5 shadow-lg transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>
                  {nearbyCafeteriaNpcFirstName
                    ? `Falar com ${nearbyCafeteriaNpcFirstName}`
                    : 'Conversar'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenCafeteria}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-xl border border-amber-300 transition cursor-pointer"
            >
              <Coffee className="w-4 h-4 shrink-0" />
              <span>Cafeteria</span>
            </button>
          </div>
        )}

        {!nearCafeteria && hasNearbyNpc && (
          <button
            type="button"
            onClick={() => triggerTouchInteract()}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-xl border border-emerald-300 transition cursor-pointer"
          >
            <Hand className="w-4 h-4 shrink-0" />
            <span>Atender {nearbyNpcFirstName || 'Colega'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
