import React from 'react';
import { DifficultyLevel } from '../problems/validator';
import { PlayerCustomization } from '../progression/progressionSystem';
import { Info, Mic, MicOff, Play, Shirt, User } from 'lucide-react';
import { OVERCLOCKED_ICON_URL, OVERCLOCKED_LOGO_URL } from './CreditsModal';

interface TitleScreenProps {
  playerName: string;
  difficulty: DifficultyLevel;
  voiceEnabled: boolean;
  playerCustomization: PlayerCustomization;
  onChangePlayerName: (name: string) => void;
  onSelectDifficulty: (d: DifficultyLevel) => void;
  onToggleVoiceEnabled: () => void;
  onChangeGender: (genero: 'masculino' | 'feminino') => void;
  onOpenCustomization: () => void;
  onOpenCredits: () => void;
  onStartGame: () => void;
}

export const TitleScreenOverlay: React.FC<TitleScreenProps> = ({
  playerName,
  difficulty,
  voiceEnabled,
  playerCustomization,
  onChangePlayerName,
  onSelectDifficulty,
  onToggleVoiceEnabled,
  onChangeGender,
  onOpenCustomization,
  onOpenCredits,
  onStartGame,
}) => {
  const difficulties: {
    id: DifficultyLevel;
    titulo: string;
    resumo: string;
  }[] = [
    { id: 'facil', titulo: 'Fácil', resumo: 'Ritmo tranquilo + dicas' },
    { id: 'normal', titulo: 'Normal', resumo: 'Equilibrado' },
    { id: 'dificil', titulo: 'Difícil', resumo: 'Horário de Pico' },
  ];

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between p-6 md:p-10 bg-[linear-gradient(90deg,rgba(9,13,22,0.96)_0%,rgba(9,13,22,0.88)_46%,rgba(9,13,22,0.14)_74%,rgba(9,13,22,0.0)_100%)] pointer-events-auto">
      {/* Left Content Column leaving >50% live 3D office vista unobstructed */}
      <div className="my-auto max-w-md space-y-5">
        {/* Official OVERCLOCKED Logo Banner + Power Emblem */}
        <div className="p-3.5 rounded-2xl bg-white border-2 border-purple-500/40 shadow-2xl flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
            <img
              src={OVERCLOCKED_ICON_URL}
              alt="Símbolo Power OVERCLOCKED"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <img
              src={OVERCLOCKED_LOGO_URL}
              alt="Logotipo Oficial OVERCLOCKED"
              className="w-full h-11 object-contain object-left"
            />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-800 block mt-0.5">
              Simulador de Suporte e Rotina em TI
            </span>
          </div>
        </div>

        {/* Clean Player Identification & Preferences Card */}
        <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl space-y-4">
          {/* Name Input */}
          <div>
            <label
              htmlFor="analyst-name-input"
              className="text-xs font-semibold text-slate-300 block mb-1.5"
            >
              Qual é o seu nome, Analista?
            </label>
            <input
              id="analyst-name-input"
              type="text"
              maxLength={28}
              value={playerName}
              onChange={(e) => onChangePlayerName(e.target.value)}
              placeholder="Digite seu nome..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 focus:border-purple-400 focus:outline-none text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Gender & Voice Narration Compact Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Personagem
              </span>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#090d16] border border-slate-800">
                <button
                  type="button"
                  onClick={() => onChangeGender('masculino')}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    playerCustomization.genero === 'masculino'
                      ? 'bg-[#0071e3] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3 h-3" />
                  Homem
                </button>
                <button
                  type="button"
                  onClick={() => onChangeGender('feminino')}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    playerCustomization.genero === 'feminino'
                      ? 'bg-[#0071e3] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3 h-3" />
                  Mulher
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Narração por Voz
              </span>
              <button
                type="button"
                onClick={onToggleVoiceEnabled}
                aria-pressed={voiceEnabled}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  voiceEnabled
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {voiceEnabled ? (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    Voz Ativada
                  </>
                ) : (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    Sem Voz
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Compact 3-Option Difficulty Selector */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Dificuldade
            </span>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map((item) => {
                const selected = difficulty === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectDifficulty(item.id)}
                    aria-pressed={selected}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#111c33] border-[#38bdf8] shadow-md'
                        : 'bg-[#090d16] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-100 block">
                      {item.titulo}
                    </span>
                    <span className="text-[10px] text-sky-400 block mt-0.5 truncate">
                      {item.resumo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Primary Start Action + Wardrobe & Credits Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            data-start="true"
            onClick={(e) => {
              e.currentTarget.blur();
              onStartGame();
            }}
            className="flex-1 py-3.5 px-5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Iniciar
          </button>

          <button
            type="button"
            onClick={onOpenCustomization}
            className="py-3.5 px-3.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Personalizar Roupas, Acessórios e Medalhas"
          >
            <Shirt className="w-4 h-4 text-sky-400" />
            Guarda-Roupa
          </button>

          <button
            type="button"
            onClick={onOpenCredits}
            className="py-3.5 px-3.5 rounded-xl bg-[#0f172a] hover:bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Abrir Tela de Créditos e Sobre o Jogo"
          >
            <Info className="w-4 h-4 text-purple-400" />
            Créditos
          </button>
        </div>
      </div>

      {/* Single flat borderless inline control hint line in the bottom safe margin */}
      <div className="text-xs text-slate-300 font-mono-tabular">
        WASD / Setas Mover · E Interagir · C Guarda-Roupa · V Mapa Inteiro · Esc Pausar
      </div>
    </div>
  );
};
