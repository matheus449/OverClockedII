import React, { useEffect } from 'react';
import { ALL_NPCS, ALL_SECTORS, ProblemData } from '../problems/validator';
import { buildHelenaWelcomeSpeech, voiceNarrator } from '../audio/voiceNarrator';
import { ArrowRight, Navigation, Shuffle, Sparkles, Volume2 } from 'lucide-react';

interface StoryIntroOverlayProps {
  playerName: string;
  firstProblem: ProblemData;
  voiceEnabled: boolean;
  onRerollFirstProblem: () => void;
  onBeginShift: () => void;
}

export const StoryIntroOverlay: React.FC<StoryIntroOverlayProps> = ({
  playerName,
  firstProblem,
  voiceEnabled,
  onRerollFirstProblem,
  onBeginShift,
}) => {
  const cleanName = playerName.trim() || 'Analista';
  const targetSector =
    ALL_SECTORS.find((s) => s.id === firstProblem.setor) || ALL_SECTORS[0];
  const targetNpc =
    ALL_NPCS.find((n) => n.id === firstProblem.npc) || ALL_NPCS[0];

  const fullSpeechText = buildHelenaWelcomeSpeech(
    cleanName,
    targetSector.nome,
    targetNpc.nome
  );

  useEffect(() => {
    if (voiceEnabled) {
      voiceNarrator.speakProblem(fullSpeechText, {
        npcId: 'npc_mariana', // Female voice prosody for Helena Vasconcelos
        npcName: 'Helena Vasconcelos',
      });
    }
    return () => {
      voiceNarrator.stop();
    };
  }, [fullSpeechText, voiceEnabled]);

  return (
    <div
      role="dialog"
      aria-label="Boas-vindas da Gerente Helena Vasconcelos"
      className="fixed inset-0 z-20 flex items-center justify-start p-3.5 sm:p-6 md:p-12 overflow-y-auto bg-[linear-gradient(90deg,rgba(9,13,22,0.95)_0%,rgba(9,13,22,0.86)_52%,rgba(9,13,22,0.12)_85%,rgba(9,13,22,0.0)_100%)] pointer-events-auto"
    >
      <div className="my-auto w-full max-w-xl bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5">
        {/* Manager Header: Helena Vasconcelos */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            {/* Custom SVG Portrait of Manager Helena Vasconcelos */}
            <svg
              viewBox="0 0 72 72"
              className="w-16 h-16 rounded-2xl bg-[#090d16] border border-amber-500/40 shrink-0 shadow-md"
            >
              <rect width="72" height="72" rx="14" fill="#090d16" />
              {/* Long Hair Back */}
              <path
                d="M18 28 C16 48 18 64 22 68 L50 68 C54 64 56 48 54 28 Z"
                fill="#451a03"
              />
              {/* Executive Burgundy Blazer & White Shirt */}
              <path d="M12 70 C14 48 58 48 60 70 Z" fill="#7c2d12" />
              <path d="M29 50 L36 66 L43 50 Z" fill="#f8fafc" />
              {/* Head & Neck */}
              <rect x="31" y="38" width="10" height="14" rx="4" fill="#e0ac69" />
              <circle cx="36" cy="29" r="13" fill="#e0ac69" />
              {/* Styled Hair Top */}
              <path
                d="M22 28 C22 13 50 13 50 28 C46 20 26 20 22 28 Z"
                fill="#451a03"
              />
              {/* Executive Glasses */}
              <g stroke="#38bdf8" strokeWidth="1.8" fill="rgba(56,189,248,0.15)">
                <rect x="25" y="25" width="9" height="6" rx="1.5" />
                <rect x="38" y="25" width="9" height="6" rx="1.5" />
                <line x1="34" y1="28" x2="38" y2="28" />
              </g>
              <circle cx="29.5" cy="28" r="1.4" fill="#0f172a" />
              <circle cx="42.5" cy="28" r="1.4" fill="#0f172a" />
              <path
                d="M32 35 Q36 38 40 35"
                stroke="#e11d48"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  Gerente Geral
                </span>
                <span className="text-xs text-slate-400">NexusCorp Operações</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-100 mt-0.5">
                Helena Vasconcelos
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              voiceNarrator.speakProblem(fullSpeechText, {
                npcId: 'npc_mariana',
                npcName: 'Helena Vasconcelos',
                force: true,
              })
            }
            className="p-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 transition-colors cursor-pointer"
            title="Ouvir mensagem da Gerente Helena"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Storytelling Narrative Body */}
        <div className="space-y-3 text-xs md:text-sm text-slate-200 leading-relaxed">
          <p>
            &ldquo;<strong className="text-emerald-400">Graças a Deus que você está aqui, {cleanName}!</strong>{' '}
            Estávamos contando os minutos para a sua chegada! A empresa está passando por
            um período super corrido: estamos em semana de fechamento global, auditoria no
            Financeiro e migração do nosso sistema interno <strong>OverOS</strong>.&rdquo;
          </p>
          <p className="text-slate-300">
            &ldquo;No meio dessa correria toda nos 15 setores, cabos foram esbarrados,
            impressoras travaram e vários computadores pararam de responder. Cada chamado
            resolvido rende <strong>pontos, medalhas, roupas e acessórios</strong> — mas
            cuidado: se você errar uma solução, pontos serão descontados (e se estiver com
            0, ficará <strong className="text-rose-400">devendo pontos</strong>!).&rdquo;
          </p>
        </div>

        {/* Randomly Drawn First Ticket Recommendation Box */}
        <div className="p-4 rounded-xl bg-[#090d16] border border-sky-500/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              &ldquo;Sugiro que comece pelo chamado:&rdquo;
            </span>
            <button
              type="button"
              onClick={onRerollFirstProblem}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1 cursor-pointer"
              title="Sortear outro chamado inicial"
            >
              <Shuffle className="w-3 h-3" />
              Sortear Outro
            </button>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-700"
              style={{ backgroundColor: `${targetSector.cor}25` }}
            >
              <Navigation className="w-5 h-5" style={{ color: targetSector.cor }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-100">
                Setor: {targetSector.nome}{' '}
                <span className="font-normal text-slate-400">· {targetNpc.nome}</span>
              </div>
              <p className="text-xs text-amber-300 font-medium truncate mt-0.5">
                &ldquo;{firstProblem.descricaoCurta}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action to Begin Gameplay */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            data-start="true"
            onClick={() => {
              voiceNarrator.stop();
              onBeginShift();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 cursor-pointer"
          >
            <span>Atender Chamado em {targetSector.nome}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
