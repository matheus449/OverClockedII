import React, { useEffect, useRef, useState } from 'react';
import {
  clearAllTouchDirections,
  computeAnalogStickState,
  setAnalogJoystickVector,
  triggerTouchInteract,
} from '../player/touchControls';
import {
  BedDouble,
  Coffee,
  Cpu,
  Hand,
  Laptop,
  MessageCircle,
  ShoppingBag,
  Sun,
} from 'lucide-react';
import { GameLocation } from '../home/homeSystem';

interface TouchControlsPadProps {
  currentLocation?: GameLocation;
  nearHomeBed?: boolean;
  nearHomeDoor?: boolean;
  hasSleptAtHome?: boolean;
  onSleepInHomeBed?: () => void;
  onOpenHomeShop?: () => void;
  onReturnToOffice?: () => void;
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
  currentLocation = 'office',
  nearHomeBed = false,
  nearHomeDoor = false,
  hasSleptAtHome = false,
  onSleepInHomeBed,
  onOpenHomeShop,
  onReturnToOffice,
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
          className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center touch-none cursor-grab active:cursor-grabbing lg-touch-pad ${
            isDragging ? 'lg-touch-pad-active' : ''
          }`}
        >
          {/* Inner 360° Guide Ring */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-dashed pointer-events-none transition-colors ${
              isDragging ? 'border-sky-400/50' : 'border-white/15'
            }`}
          />

          {/* Subtle Cardinal Compass Ticks on Outer Ring */}
          <span className="pointer-events-none absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-400/70" />
          <span className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-400/70" />
          <span className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-400/70" />
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-400/70" />

          {/* Movable Round Thumbstick Knob */}
          <div
            ref={knobRef}
            data-testid="analog-joystick-knob"
            className={`pointer-events-none absolute w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-xl border backdrop-blur-md ${
              isDragging
                ? 'bg-sky-400/25 border-sky-200/80 shadow-[0_0_20px_rgba(56,189,248,0.35),inset_0_1px_1px_rgba(255,255,255,0.65)]'
                : 'bg-white/15 border-white/35 shadow-[0_6px_16px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.45)]'
            }`}
          >
            {/* Tactile Center Grip Ring */}
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border ${
                isDragging
                  ? 'border-white/50 bg-sky-300/25'
                  : 'border-white/25 bg-white/10'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Right Thumb Zone: Sleek Contextual Action Buttons (Only shown when near an interactive target; NO auto-walk buttons!) */}
      <div className="pointer-events-auto flex flex-col items-end gap-1.5 pr-1 pb-0.5">
        {currentLocation === 'home' ? (
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {nearHomeBed && (
              <button
                type="button"
                onClick={onSleepInHomeBed}
                className="min-h-[44px] px-4 py-2 rounded-xl lg-btn-emerald text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <BedDouble className="w-4 h-4 shrink-0" />
                <span>Dormir na Cama (100%)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenHomeShop}
              className="min-h-[44px] px-3.5 py-2 rounded-xl lg-btn-amber text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Loja de Móveis</span>
            </button>
            {nearHomeDoor && hasSleptAtHome && (
              <button
                type="button"
                onClick={onReturnToOffice}
                className="min-h-[44px] px-3.5 py-2 rounded-xl lg-btn-primary text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Sun className="w-4 h-4 shrink-0" />
                <span>Ir Trabalhar</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {hasActiveProblem && isAtTargetSector && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenHardwareWorkbench}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl lg-btn-amber text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Cpu className="w-4 h-4 shrink-0" />
                  <span>Hardware</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenVirtualOS}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl lg-btn-primary text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Laptop className="w-4 h-4 shrink-0" />
                  <span>OverOS</span>
                </button>
              </div>
            )}

            {(nearCafeteria || Boolean(nearbyCafeteriaNpcFirstName)) && (
              <div className="flex items-center gap-1.5">
                {onTalkToCafeteriaNpc && (nearCafeteria || Boolean(nearbyCafeteriaNpcFirstName)) && (
                  <button
                    type="button"
                    onClick={onTalkToCafeteriaNpc}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl lg-btn-secondary border-sky-400/45 text-sky-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>
                      {nearbyCafeteriaNpcFirstName
                        ? `Falar com ${nearbyCafeteriaNpcFirstName}`
                        : 'Conversar'}
                    </span>
                  </button>
                )}
                {nearCafeteria && (
                  <button
                    type="button"
                    onClick={onOpenCafeteria}
                    className="min-h-[44px] px-4 py-2 rounded-xl lg-btn-amber text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Coffee className="w-4 h-4 shrink-0" />
                    <span>Cafeteria</span>
                  </button>
                )}
              </div>
            )}

            {!nearCafeteria && !nearbyCafeteriaNpcFirstName && hasNearbyNpc && (
              <button
                type="button"
                onClick={() => triggerTouchInteract()}
                className="min-h-[44px] px-4 py-2 rounded-xl lg-btn-emerald text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Hand className="w-4 h-4 shrink-0" />
                <span>Atender {nearbyNpcFirstName || 'Colega'}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
