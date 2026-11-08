import React, { useEffect, useState } from 'react';
import {
  detectMobileOrTabletClient,
  getEffectiveViewportSize,
  InputControlMode,
  requestLandscapeOrientationLock,
  shouldEnforceLandscapeLock,
} from '../player/touchControls';
import {
  CheckCircle2,
  Gamepad2,
  Keyboard,
  Maximize2,
  MousePointerClick,
  Play,
  RotateCw,
  Smartphone,
  X,
} from 'lucide-react';
import { OVERCLOCKED_ICON_URL } from './CreditsModal';

interface InputModeSelectModalProps {
  initialMode: InputControlMode;
  onConfirmModeAndStart: (selectedMode: InputControlMode) => void;
  onClose: () => void;
}

export const InputModeSelectModal: React.FC<InputModeSelectModalProps> = ({
  initialMode,
  onConfirmModeAndStart,
  onClose,
}) => {
  const [selected, setSelected] = useState<InputControlMode>(initialMode);

  const handleConfirm = (modeToUse: InputControlMode) => {
    setSelected(modeToUse);
    void requestLandscapeOrientationLock();
    onConfirmModeAndStart(modeToUse);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Escolha como você joga: Teclado e Mouse ou Tela Touch"
      data-testid="input-mode-select-modal"
      className="lg-modal-backdrop fixed inset-0 z-50 flex flex-col items-center p-2 sm:p-4 pointer-events-auto overflow-y-auto"
    >
      <div className="lg-modal-floating my-auto w-full max-w-2xl rounded-2xl p-3.5 sm:p-5 space-y-2.5 sm:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/12 pb-2.5 sm:pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white p-1 border border-white/40 flex items-center justify-center shrink-0 shadow-md">
              <img
                src={OVERCLOCKED_ICON_URL}
                alt="OVERCLOCKED"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-sky-300 text-[10px] sm:text-[11px] font-bold tracking-wide block">
                Escolha Seu Controle Antes de Iniciar
              </span>
              <h2 className="text-xs sm:text-lg font-extrabold text-white leading-tight mt-0.5">
                Como você vai jogar o OVERCLOCKED?
              </h2>
            </div>
          </div>

          <button
            type="button"
            aria-label="Voltar para a tela inicial"
            onClick={onClose}
            className="lg-btn-secondary p-1.5 rounded-xl text-slate-300 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two Choice Cards: Teclado e Mouse vs Tela Touch */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
          {/* Option 1: Teclado e Mouse */}
          <button
            type="button"
            data-testid="select-input-keyboard-mouse"
            aria-pressed={selected === 'keyboard_mouse'}
            onClick={() => setSelected('keyboard_mouse')}
            onDoubleClick={() => handleConfirm('keyboard_mouse')}
            className={`lg-choice-card p-3 sm:p-3.5 rounded-xl text-left cursor-pointer flex flex-col justify-between gap-2 ${
              selected === 'keyboard_mouse' ? 'lg-choice-card-sky' : ''
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 border border-sky-300/40 flex items-center justify-center text-sky-300 shrink-0">
                  <Keyboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                {selected === 'keyboard_mouse' && (
                  <span className="px-2 py-0.5 rounded-md bg-sky-400/20 border border-sky-300/55 text-sky-100 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 text-sky-300" />
                    Selecionado
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white">
                  Teclado e Mouse
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-200 mt-0.5 leading-snug">
                  Ande com <strong className="text-sky-300">WASD / Setas</strong> ou clique no chão e <strong className="text-sky-300">[E]</strong> para interagir (sem joystick na tela).
                </p>
              </div>
            </div>

            <div className="pt-1.5 border-t border-white/10 flex items-center gap-1 text-[10px] font-semibold text-sky-300">
              <MousePointerClick className="w-3 h-3 shrink-0" />
              <span className="truncate">Computador, Notebook ou Teclado</span>
            </div>
          </button>

          {/* Option 2: Tela Touch */}
          <button
            type="button"
            data-testid="select-input-touch"
            aria-pressed={selected === 'touch'}
            onClick={() => setSelected('touch')}
            onDoubleClick={() => handleConfirm('touch')}
            className={`lg-choice-card p-3 sm:p-3.5 rounded-xl text-left cursor-pointer flex flex-col justify-between gap-2 ${
              selected === 'touch' ? 'lg-choice-card-emerald' : ''
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 border border-emerald-300/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                {selected === 'touch' && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-400/20 border border-emerald-300/55 text-emerald-100 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    Selecionado
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white">
                  Tela Touch (Toque)
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-200 mt-0.5 leading-snug">
                  Ativa o <strong className="text-emerald-300">Joystick Analógico Redondo 360°</strong> na tela, botões de ação e zoom de pinça.
                </p>
              </div>
            </div>

            <div className="pt-1.5 border-t border-white/10 flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
              <Smartphone className="w-3 h-3 shrink-0" />
              <span className="truncate">Celulares e Tablets</span>
            </div>
          </button>
        </div>

        {/* Footer: Mandatory Landscape Notice + Action Buttons in one compact row */}
        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="lg-inner-well px-3 py-1.5 sm:py-2 rounded-xl border-amber-500/35 flex items-center gap-2 text-[10px] sm:text-[11px] text-amber-200 flex-1 min-w-0">
            <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="leading-tight">
              <strong>Modo Horizontal (Paisagem):</strong> Celulares e tablets operam na horizontal.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="lg-btn-secondary px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Voltar
            </button>

            <button
              type="button"
              data-testid="confirm-input-mode-start"
              onClick={() => handleConfirm(selected)}
              className="lg-btn-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                Confirmar ({selected === 'touch' ? 'Tela Touch' : 'Teclado e Mouse'})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MandatoryLandscapeOverlayProps {
  inputMode: InputControlMode;
}

/**
 * Full-screen mandatory orientation gate for smartphones and tablets.
 * Prompts the player to rotate horizontally (landscape) when held vertically,
 * accurately detects physical rotation across iOS/Android browsers, and allows
 * forcing/unlocking horizontal play even inside iframes or rotation-locked browsers.
 */
export const MandatoryLandscapeOverlay: React.FC<MandatoryLandscapeOverlayProps> = ({
  inputMode,
}) => {
  const [mustRotate, setMustRotate] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const { width, height } = getEffectiveViewportSize();
    return shouldEnforceLandscapeLock(
      width,
      height,
      detectMobileOrTabletClient()
    );
  });
  const [manualBypass, setManualBypass] = useState<boolean>(false);

  useEffect(() => {
    let timers: number[] = [];

    const checkOrientation = () => {
      const { width, height } = getEffectiveViewportSize();
      const enforce = shouldEnforceLandscapeLock(
        width,
        height,
        detectMobileOrTabletClient()
      );
      setMustRotate(enforce);
      if (!enforce) {
        setManualBypass(false);
      }
    };

    const onOrientationOrResize = () => {
      checkOrientation();
      timers.forEach((t) => window.clearTimeout(t));
      timers = [
        window.setTimeout(checkOrientation, 80),
        window.setTimeout(checkOrientation, 220),
        window.setTimeout(checkOrientation, 450),
      ];
    };

    checkOrientation();
    window.addEventListener('resize', onOrientationOrResize);
    window.addEventListener('orientationchange', onOrientationOrResize);
    window.visualViewport?.addEventListener('resize', onOrientationOrResize);
    const screenOrient = (window.screen as Screen & {
      orientation?: EventTarget;
    })?.orientation;
    screenOrient?.addEventListener?.('change', onOrientationOrResize);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('resize', onOrientationOrResize);
      window.removeEventListener('orientationchange', onOrientationOrResize);
      window.visualViewport?.removeEventListener('resize', onOrientationOrResize);
      screenOrient?.removeEventListener?.('change', onOrientationOrResize);
    };
  }, []);

  if (!mustRotate || manualBypass) return null;

  const handleForceHorizontal = async () => {
    const locked = await requestLandscapeOrientationLock();
    // Re-check after attempting native fullscreen + landscape lock
    const { width, height } = getEffectiveViewportSize();
    const stillPortrait = shouldEnforceLandscapeLock(
      width,
      height,
      detectMobileOrTabletClient()
    );
    if (!locked && stillPortrait) {
      // If the mobile browser/iframe blocks programmatic orientation lock,
      // allow the user to proceed instead of trapping them on the overlay.
      setManualBypass(true);
    } else {
      setMustRotate(stillPortrait);
    }
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Modo Paisagem Obrigatório — Gire seu celular ou tablet"
      data-testid="mandatory-landscape-overlay"
      className="fixed inset-0 z-[250] flex flex-col items-center p-4 text-center select-none pointer-events-auto overflow-y-auto bg-[#060a14]/96 backdrop-blur-xl"
    >
      <div className="my-auto w-full max-w-sm rounded-2xl bg-[#0f172a] border border-amber-400/50 shadow-2xl p-5 space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/45 flex items-center justify-center text-amber-400 shadow-inner">
          <RotateCw className="w-7 h-7 animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        <div className="space-y-1.5">
          <span className="text-amber-300 text-[11px] font-extrabold uppercase tracking-wider block">
            Visualização Horizontal (Paisagem)
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug">
            Vire o Celular para a Horizontal
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Para visualizar todo o escritório 3D e os controles sem cortes, gire o aparelho para a{' '}
            <strong className="text-amber-300">horizontal (Modo Paisagem)</strong> ou toque no botão abaixo.
          </p>
        </div>

        {/* Visual Horizontal Phone Diagram */}
        <div className="bg-[#090d16] border border-white/10 py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1 opacity-60">
            <div className="w-6 h-10 rounded-md border-2 border-rose-400/75 flex items-center justify-center text-[8px] font-bold text-rose-300">
              9:16
            </div>
            <span className="text-[10px] text-rose-300 font-semibold">Vertical</span>
          </div>

          <RotateCw className="w-4 h-4 text-amber-400 shrink-0" />

          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-7 rounded-md border-2 border-emerald-400 bg-emerald-500/20 flex items-center justify-center text-[8px] font-extrabold text-emerald-300">
              16:9
            </div>
            <span className="text-[10px] text-emerald-300 font-bold">Horizontal (OK)</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            data-testid="force-landscape-btn"
            onClick={() => {
              void handleForceHorizontal();
            }}
            className="lg-btn-amber w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 shrink-0" />
            <span>Virar Tela para a Horizontal</span>
          </button>

          <p className="text-[11px] text-slate-400 leading-tight">
            Modo atual:{' '}
            <strong className="text-slate-200">
              {inputMode === 'touch' ? 'Tela Touch (Joystick 360°)' : 'Teclado e Mouse'}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};
