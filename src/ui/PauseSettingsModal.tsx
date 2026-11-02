import React from 'react';
import { DifficultyLevel } from '../problems/validator';
import { InputControlMode } from '../player/touchControls';
import {
  Award,
  Gamepad2,
  Home,
  Info,
  Keyboard,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Shirt,
  Sliders,
  Volume2,
} from 'lucide-react';
import { OVERCLOCKED_ICON_URL } from './CreditsModal';

interface PauseSettingsModalProps {
  mode: 'paused' | 'gameover';
  difficulty: DifficultyLevel;
  inputMode: InputControlMode;
  musicVolume: number;
  sfxVolume: number;
  voiceEnabled: boolean;
  resolvedCount: number;
  points: number;
  unlockedMedalsCount: number;
  onChangeDifficulty: (d: DifficultyLevel) => void;
  onChangeInputMode: (mode: InputControlMode) => void;
  onChangeMusicVolume: (v: number) => void;
  onChangeSfxVolume: (v: number) => void;
  onToggleVoiceEnabled: () => void;
  onOpenCustomization: () => void;
  onOpenCredits: () => void;
  onResume: () => void;
  onRestartShift: () => void;
  onReturnToTitle: () => void;
}

export const PauseSettingsModal: React.FC<PauseSettingsModalProps> = ({
  mode,
  difficulty,
  inputMode,
  musicVolume,
  sfxVolume,
  voiceEnabled,
  resolvedCount,
  points,
  unlockedMedalsCount,
  onChangeDifficulty,
  onChangeInputMode,
  onChangeMusicVolume,
  onChangeSfxVolume,
  onToggleVoiceEnabled,
  onOpenCustomization,
  onOpenCredits,
  onResume,
  onRestartShift,
  onReturnToTitle,
}) => {
  return (
    <div
      role="dialog"
      aria-label={mode === 'paused' ? 'Jogo Pausado e Configurações' : 'Resumo do Turno'}
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/75 pointer-events-auto overflow-y-auto"
    >
      <div className="w-full max-w-md max-h-[92dvh] overflow-y-auto bg-[#0f172a] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1.5 border border-purple-400/50 flex items-center justify-center shrink-0">
              <img
                src={OVERCLOCKED_ICON_URL}
                alt="OVERCLOCKED"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {mode === 'paused' ? 'Pausa e Configurações' : 'Turno de Suporte Concluído'}
              </h2>
              <p className="text-xs text-slate-400">
                OVERCLOCKED · Controles, Áudio e Dificuldade
              </p>
            </div>
          </div>
          <Sliders className="w-5 h-5 text-sky-400" />
        </div>

        {/* Stat Tiles (Tabular Nums) */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Chamados</span>
            <span className="text-lg font-bold font-mono-tabular text-slate-100">
              {resolvedCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800">
            <span className="text-[10px] text-amber-400 block">Pontos</span>
            <span className="text-lg font-bold font-mono-tabular text-amber-300">
              {points}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800">
            <span className="text-[10px] text-sky-400 block">Medalhas</span>
            <span className="text-lg font-bold font-mono-tabular text-sky-400">
              {unlockedMedalsCount}/8
            </span>
          </div>
        </div>

        {/* Input Mode Selector (Teclado e Mouse vs Tela Touch) */}
        <div>
          <span className="text-xs font-medium text-slate-300 block mb-1.5">
            Modo de Controle (Teclado/Mouse ou Tela Touch)
          </span>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#090d16] rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => onChangeInputMode('keyboard_mouse')}
              className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                inputMode === 'keyboard_mouse'
                  ? 'bg-[#0071e3] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Teclado e Mouse</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeInputMode('touch')}
              className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                inputMode === 'touch'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Tela Touch (360°)</span>
            </button>
          </div>
        </div>

        {/* Separate WebAudio Sliders for Music and Office/SFX + Voice Narration Toggle */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                Volume da Música Ambiente
              </span>
              <span className="font-mono-tabular text-slate-400">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              aria-label="Volume da Música Ambiente"
              min={0}
              max={100}
              value={Math.round(musicVolume * 100)}
              onChange={(e) => onChangeMusicVolume(Number(e.target.value) / 100)}
              className="w-full accent-[#0071e3] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                Volume dos Efeitos e Escritório
              </span>
              <span className="font-mono-tabular text-slate-400">
                {Math.round(sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              aria-label="Volume dos Efeitos"
              min={0}
              max={100}
              value={Math.round(sfxVolume * 100)}
              onChange={(e) => onChangeSfxVolume(Number(e.target.value) / 100)}
              className="w-full accent-[#0071e3] cursor-pointer"
            />
          </div>

          <div className="pt-0.5 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
              {voiceEnabled ? (
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <MicOff className="w-3.5 h-3.5 text-slate-400" />
              )}
              Voz Humanizada (Ler Problemas)
            </span>
            <button
              type="button"
              onClick={onToggleVoiceEnabled}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                voiceEnabled
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {voiceEnabled ? 'Ativada' : 'Desativada'}
            </button>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div>
          <span className="text-xs font-medium text-slate-300 block mb-1.5">
            Dificuldade e Ritmo dos Chamados
          </span>
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#090d16] rounded-xl border border-slate-800">
            {(['facil', 'normal', 'dificil'] as DifficultyLevel[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onChangeDifficulty(d)}
                className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  difficulty === d
                    ? 'bg-[#0071e3] text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d === 'facil' ? 'Fácil' : d === 'normal' ? 'Normal' : 'Difícil (Pico)'}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            data-start={mode === 'gameover' ? 'true' : undefined}
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            {mode === 'paused' ? 'Continuar Atendimento' : 'Continuar Turno'}
          </button>

          <button
            type="button"
            onClick={onOpenCustomization}
            className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Shirt className="w-3.5 h-3.5" />
            <Award className="w-3.5 h-3.5" />
            Personalizar Analista, Roupas & Medalhas
          </button>

          <button
            type="button"
            onClick={onOpenCredits}
            className="w-full py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-purple-400" />
            Ver Créditos e Identidade Oficial do Jogo
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onRestartShift}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Sortear Chamado
            </button>

            <button
              type="button"
              onClick={onReturnToTitle}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              Tela Inicial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
