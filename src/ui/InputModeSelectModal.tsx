import React, { useEffect, useState } from 'react';
import {
  detectMobileOrTabletClient,
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
      className="lg-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 pointer-events-auto overflow-y-auto"
    >
      <div className="lg-modal-floating w-full max-w-2xl max-h-[96dvh] overflow-y-auto rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/12 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 border border-white/40 flex items-center justify-center shrink-0 shadow-md">
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
              <h2 className="text-sm sm:text-lg font-extrabold text-white leading-tight mt-0.5">
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
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {/* Option 1: Teclado e Mouse */}
          <button
            type="button"
            data-testid="select-input-keyboard-mouse"
            aria-pressed={selected === 'keyboard_mouse'}
            onClick={() => setSelected('keyboard_mouse')}
            onDoubleClick={() => handleConfirm('keyboard_mouse')}
            className={`lg-choice-card p-3.5 rounded-xl text-left cursor-pointer flex flex-col justify-between gap-2.5 ${
              selected === 'keyboard_mouse' ? 'lg-choice-card-sky' : ''
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-sky-300/40 flex items-center justify-center text-sky-300 shrink-0">
                  <Keyboard className="w-4 h-4" />
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
                <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">
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
            className={`lg-choice-card p-3.5 rounded-xl text-left cursor-pointer flex flex-col justify-between gap-2.5 ${
              selected === 'touch' ? 'lg-choice-card-emerald' : ''
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-emerald-300/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <Gamepad2 className="w-4 h-4" />
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
                <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">
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
        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="lg-inner-well px-3 py-2 rounded-xl border-amber-500/35 flex items-center gap-2 text-[11px] text-amber-200 flex-1 min-w-0">
            <RotateCw className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="leading-tight">
              <strong>Modo Paisagem Obrigatório:</strong> Celulares e tablets operam na horizontal em ambos os modos.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="lg-btn-secondary px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Voltar
            </button>

            <button
              type="button"
              data-testid="confirm-input-mode-start"
              onClick={() => handleConfirm(selected)}
              className="lg-btn-primary px-4 sm:px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
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
 * Regardless of whether the player chose Keyboard & Mouse or Touch Screen,
 * if a phone or tablet is held vertically (portrait: height > width),
 * this overlay blocks the screen and prompts them to rotate horizontally.
 */
export const MandatoryLandscapeOverlay: React.FC<MandatoryLandscapeOverlayProps> = ({
  inputMode,
}) => {
  const [mustRotate, setMustRotate] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return shouldEnforceLandscapeLock(
      window.innerWidth,
      window.innerHeight,
      detectMobileOrTabletClient()
    );
  });

  useEffect(() => {
    const checkOrientation = () => {
      const enforce = shouldEnforceLandscapeLock(
        window.innerWidth,
        window.innerHeight,
        detectMobileOrTabletClient()
      );
      setMustRotate(enforce);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!mustRotate) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Modo Paisagem Obrigatório — Gire seu celular ou tablet"
      data-testid="mandatory-landscape-overlay"
      className="lg-modal-backdrop fixed inset-0 z-[250] flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto"
    >
      <div className="lg-modal-floating w-full max-w-md rounded-2xl border-amber-500/50 p-6 space-y-5">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
          <RotateCw className="w-10 h-10 animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        <div className="space-y-2">
          <span className="text-amber-300 text-xs font-extrabold tracking-wide block">
            Orientação Horizontal Obrigatória
          </span>
          <h2 className="text-xl font-extrabold text-white">
            Gire o Aparelho para o Modo Paisagem
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Nos celulares e tablets, o <strong className="text-white">OVERCLOCKED</strong> funciona obrigatoriamente com a tela na <strong className="text-amber-300">horizontal (Modo Paisagem)</strong> — tanto no modo <strong className="text-sky-300">Teclado e Mouse</strong> quanto no modo <strong className="text-emerald-300">Tela Touch</strong>.
          </p>
        </div>

        {/* Visual Horizontal Phone Diagram */}
        <div className="lg-inner-well py-3 px-4 rounded-xl flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1 opacity-55">
            <div className="w-7 h-12 rounded-md border-2 border-rose-400/70 flex items-center justify-center text-[9px] font-bold text-rose-300">
              9:16
            </div>
            <span className="text-[10px] text-rose-300 font-semibold">Vertical</span>
          </div>

          <RotateCw className="w-5 h-5 text-amber-400 shrink-0" />

          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-8 rounded-md border-2 border-emerald-400 bg-emerald-500/15 flex items-center justify-center text-[9px] font-extrabold text-emerald-300">
              16:9
            </div>
            <span className="text-[10px] text-emerald-300 font-bold">Paisagem (OK)</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              void requestLandscapeOrientationLock();
            }}
            className="lg-btn-amber w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 shrink-0" />
            <span>Forçar Modo Paisagem em Tela Cheia</span>
          </button>

          <p className="text-[11px] text-slate-400">
            Modo selecionado:{' '}
            <strong className="text-slate-200">
              {inputMode === 'touch' ? 'Tela Touch (Joystick 360°)' : 'Teclado e Mouse'}
            </strong>
            . Assim que você virar o aparelho na horizontal, o jogo aparecerá automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
};
