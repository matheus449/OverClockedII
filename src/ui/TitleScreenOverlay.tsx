import React from 'react';
import { DifficultyLevel } from '../problems/validator';
import { PlayerCustomization } from '../progression/progressionSystem';
import { VisualThemeMode } from '../persistence/storage';
import { Info, Layers, Mic, MicOff, Play, Shirt, Sparkles, User } from 'lucide-react';
import { OVERCLOCKED_LOGO_URL } from './CreditsModal';

interface TitleScreenProps {
  playerName: string;
  difficulty: DifficultyLevel;
  visualTheme: VisualThemeMode;
  voiceEnabled: boolean;
  playerCustomization: PlayerCustomization;
  onChangePlayerName: (name: string) => void;
  onSelectDifficulty: (d: DifficultyLevel) => void;
  onChangeVisualTheme: (theme: VisualThemeMode) => void;
  onToggleVoiceEnabled: () => void;
  onChangeGender: (genero: 'masculino' | 'feminino') => void;
  onOpenCustomization: () => void;
  onOpenCredits: () => void;
  onStartGame: () => void;
}

export const TitleScreenOverlay: React.FC<TitleScreenProps> = ({
  playerName,
  difficulty,
  visualTheme,
  voiceEnabled,
  playerCustomization,
  onChangePlayerName,
  onSelectDifficulty,
  onChangeVisualTheme,
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
    <section
      className={`fixed inset-0 z-20 flex flex-col p-3 sm:p-6 md:p-10 overflow-y-auto pointer-events-auto ${
        visualTheme === 'normal'
          ? 'bg-[linear-gradient(90deg,rgba(6,10,20,0.92)_0%,rgba(6,10,20,0.78)_44%,rgba(6,10,20,0.16)_76%,rgba(6,10,20,0.0)_100%)]'
          : 'bg-[linear-gradient(90deg,rgba(8,10,16,0.28)_0%,rgba(8,10,16,0.12)_48%,transparent_100%)]'
      }`}
    >
      <div className="w-full max-w-md my-auto space-y-2.5 sm:space-y-3">
        {/* 1. Game Logo matching the exact width of the form (standalone img) */}
        <img
          src={OVERCLOCKED_LOGO_URL}
          alt="Logotipo Oficial OVERCLOCKED"
          className="w-full h-14 sm:h-20 object-cover object-center rounded-2xl shadow-xl block"
        />

        {/* 2. Flat Player Identification & Preferences Form (zero nested divs inside divs) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onStartGame();
          }}
          className="lg-surface-panel w-full p-3.5 sm:p-5 rounded-2xl space-y-2.5 sm:space-y-3"
        >
          <label
            htmlFor="analyst-name-input"
            className="text-xs font-semibold text-slate-200 block"
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
            className="lg-input-glass w-full px-3.5 py-2 rounded-xl text-sm text-slate-100 placeholder:text-slate-400 block"
          />

          <span className="text-[11px] font-semibold text-slate-300 block pt-0.5">
            Personagem & Narração por Voz
          </span>
          <fieldset className="grid grid-cols-3 gap-2 m-0 p-0 border-0">
            <button
              type="button"
              onClick={() => onChangeGender('masculino')}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 ${
                playerCustomization.genero === 'masculino'
                  ? 'lg-control-chip lg-control-chip-active'
                  : 'lg-control-chip'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              Homem
            </button>

            <button
              type="button"
              onClick={() => onChangeGender('feminino')}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 ${
                playerCustomization.genero === 'feminino'
                  ? 'lg-control-chip lg-control-chip-active'
                  : 'lg-control-chip'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              Mulher
            </button>

            <button
              type="button"
              onClick={onToggleVoiceEnabled}
              aria-pressed={voiceEnabled}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                voiceEnabled
                  ? 'lg-control-chip border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                  : 'lg-control-chip'
              }`}
            >
              {voiceEnabled ? (
                <>
                  <Mic className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                  Voz Ativa
                </>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5 shrink-0" />
                  Sem Voz
                </>
              )}
            </button>
          </fieldset>

          <span className="text-[11px] font-semibold text-slate-300 block pt-0.5">
            Dificuldade
          </span>
          <fieldset className="grid grid-cols-3 gap-2 m-0 p-0 border-0">
            {difficulties.map((item) => {
              const selected = difficulty === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectDifficulty(item.id)}
                  aria-pressed={selected}
                  className={`p-2 rounded-xl text-left cursor-pointer ${
                    selected
                      ? 'lg-control-chip lg-control-chip-active'
                      : 'lg-control-chip'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-100 block">
                    {item.titulo}
                  </span>
                  <span className="text-[10px] text-sky-300 block mt-0.5 truncate">
                    {item.resumo}
                  </span>
                </button>
              );
            })}
          </fieldset>

          <span className="text-[11px] font-semibold text-slate-300 block pt-0.5">
            Personalização Visual da Interface
          </span>
          <fieldset className="grid grid-cols-2 gap-2 m-0 p-0 border-0">
            <button
              type="button"
              data-testid="select-theme-liquid-glass"
              aria-pressed={visualTheme === 'liquid_glass'}
              onClick={() => onChangeVisualTheme('liquid_glass')}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 ${
                visualTheme === 'liquid_glass'
                  ? 'lg-control-chip lg-control-chip-active'
                  : 'lg-control-chip'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-sky-300" />
              Liquid Glass
            </button>

            <button
              type="button"
              data-testid="select-theme-normal"
              aria-pressed={visualTheme === 'normal'}
              onClick={() => onChangeVisualTheme('normal')}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 ${
                visualTheme === 'normal'
                  ? 'lg-control-chip lg-control-chip-active'
                  : 'lg-control-chip'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0 text-slate-300" />
              Visual Normal
            </button>
          </fieldset>
        </form>

        {/* 3. Primary Start Action + Wardrobe & Credits Buttons */}
        <nav className="w-full flex flex-wrap sm:flex-nowrap items-center gap-2">
          <button
            type="button"
            data-start="true"
            onClick={(e) => {
              e.currentTarget.blur();
              onStartGame();
            }}
            className="lg-btn-primary w-full sm:flex-1 py-2.5 sm:py-3 px-5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            Iniciar
          </button>

          <button
            type="button"
            onClick={onOpenCustomization}
            className="lg-btn-secondary flex-1 sm:flex-initial py-2.5 sm:py-3 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Personalizar Roupas, Acessórios, Medalhas e Estilo Visual"
          >
            <Shirt className="w-4 h-4 text-sky-400" />
            Guarda-Roupa
          </button>

          <button
            type="button"
            onClick={onOpenCredits}
            className="lg-btn-secondary flex-1 sm:flex-initial py-2.5 sm:py-3 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Abrir Tela de Créditos e Sobre o Jogo"
          >
            <Info className="w-4 h-4 text-sky-300" />
            Créditos
          </button>
        </nav>

        {/* 4. Developer Signature Logo matching the exact width of the form (standalone img) */}
        <img
          src="/assets/aistudio/logo1_91c67f34.jpg"
          alt="Matheus Oliveira · Desenvolvedor"
          className="w-full h-11 sm:h-14 object-contain bg-[#f8f9fa] rounded-2xl opacity-85 hover:opacity-100 transition-opacity duration-300 shadow-lg block"
        />
      </div>
    </section>
  );
};
