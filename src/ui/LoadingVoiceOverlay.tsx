import React, { useEffect, useMemo, useState } from 'react';
import {
  ALL_NPCS,
  ALL_PROBLEMS,
  ALL_SECTORS,
  DifficultyLevel,
  ProblemData,
} from '../problems/validator';
import { CAFETERIA_NPCS } from '../cafeteria/cafeteriaSystem';
import {
  buildHelenaWelcomeSpeech,
  getKokoroVoiceForNpc,
  SECTOR_OK_SPEECH,
  splitIntoSpeechChunks,
  voiceNarrator,
  VoicePreloadItem,
  VoicePreloadProgress,
} from '../audio/voiceNarrator';
import { CheckCircle2, Cpu, Database, FastForward, Loader2, Volume2 } from 'lucide-react';

interface LoadingVoiceOverlayProps {
  playerName: string;
  difficulty: DifficultyLevel;
  firstProblem: ProblemData;
  ticketQueue: ProblemData[];
  onFinishLoading: () => void;
}

const IT_TIPS = [
  'Dica de Suporte: Sempre converse com o funcionário do setor antes de abrir a Bancada de Hardware ou o OverOS.',
  'Dica de Carreira: Cada chamado resolvido sem erros garante bônus de precisão (+40 pts) para o Guarda-Roupa.',
  'Dica OverCoffee: Resolver chamados consome Energia. Passe fisicamente na Cafeteria OverCoffee para tomar um café!',
  'Dica Técnica: O download das demais vozes continua automaticamente em 2º plano enquanto você joga!',
];

/**
 * Splits the voice manifest into:
 * - `immediateItems`: Ultra-lightweight startup greeting (1 short clause) so the player enters the game rapidly
 * - `backgroundItems`: All remaining dialogues that download seamlessly in the background ("em segundo plano")
 */
export function splitVoiceManifestForFastStart(manifest: VoicePreloadItem[]): {
  immediateItems: VoicePreloadItem[];
  backgroundItems: VoicePreloadItem[];
} {
  if (manifest.length === 0) {
    return { immediateItems: [], backgroundItems: [] };
  }

  const first = manifest[0];
  const firstChunks = splitIntoSpeechChunks(first.text);
  const immediateItems: VoicePreloadItem[] = [
    {
      ...first,
      id: `${first.id}_fast_chunk_0`,
      text: firstChunks[0] || first.text,
    },
  ];

  const backgroundItems: VoicePreloadItem[] = [];
  if (firstChunks.length > 1) {
    backgroundItems.push({
      ...first,
      id: `${first.id}_remaining_bg`,
      text: firstChunks.slice(1).join(' '),
    });
  }
  backgroundItems.push(...manifest.slice(1));

  return { immediateItems, backgroundItems };
}

export function buildVoicePreloadManifest(
  playerName: string,
  difficulty: DifficultyLevel,
  firstProblem: ProblemData,
  ticketQueue: ProblemData[],
  fullCatalog: boolean
): VoicePreloadItem[] {
  const items: VoicePreloadItem[] = [];
  const seenKeys = new Set<string>();

  const pushUnique = (item: VoicePreloadItem) => {
    const voice = getKokoroVoiceForNpc(item.npcId, item.npcName);
    const dedupeKey = `${voice}:${item.text.trim()}`;
    if (seenKeys.has(dedupeKey)) return;
    seenKeys.add(dedupeKey);
    items.push(item);
  };

  // 1. Manager Helena Vasconcelos's Intro Welcome Speech (plays immediately after loading screen)
  const targetSector =
    ALL_SECTORS.find((s) => s.id === firstProblem.setor) || ALL_SECTORS[0];
  const targetNpc =
    ALL_NPCS.find((n) => n.id === firstProblem.npc) || ALL_NPCS[0];
  const helenaSpeech = buildHelenaWelcomeSpeech(
    playerName,
    targetSector.nome,
    targetNpc.nome
  );
  pushUnique({
    id: 'helena_intro',
    label: 'Helena Vasconcelos · Boas-vindas da Gerência (Voz Feminina pf_dora)',
    text: helenaSpeech,
    npcId: 'npc_mariana',
    npcName: 'Helena Vasconcelos',
  });

  // 2. First Active Ticket & Queued Tickets (Problem + Thank You speeches)
  const priorityTickets = [
    firstProblem,
    ...ticketQueue.filter((t) => t.id !== firstProblem.id),
  ];

  for (const prob of priorityTickets) {
    const npc = ALL_NPCS.find((n) => n.id === prob.npc) || ALL_NPCS[0];
    const voiceTag =
      getKokoroVoiceForNpc(npc.id, npc.nome) === 'pf_dora'
        ? 'Voz Feminina'
        : 'Voz Masculina';
    pushUnique({
      id: `${prob.id}_fala`,
      label: `${npc.nome} · Chamado #${prob.id} (${voiceTag})`,
      text: prob.falaNpc,
      npcId: npc.id,
      npcName: npc.nome,
    });
    pushUnique({
      id: `${prob.id}_agradecimento`,
      label: `${npc.nome} · Agradecimento #${prob.id} (${voiceTag})`,
      text: prob.agradecimentoNpc,
      npcId: npc.id,
      npcName: npc.nome,
    });
  }

  // 3. Default Sector "All Good" Greeting in both Female (pf_dora) and Male (pm_alex) voices
  pushUnique({
    id: 'sector_ok_female',
    label: 'Setores em Ordem · Saudação Feminina (pf_dora)',
    text: SECTOR_OK_SPEECH,
    npcId: 'npc_recepcao',
    npcName: 'Clara Mendes',
  });
  pushUnique({
    id: 'sector_ok_male',
    label: 'Setores em Ordem · Saudação Masculina (pm_alex)',
    text: SECTOR_OK_SPEECH,
    npcId: 'npc_administrativo',
    npcName: 'Roberto Prado',
  });

  // 4. Cafeteria OverCoffee NPC Dialogues
  for (const cafeNpc of CAFETERIA_NPCS) {
    const linesToLoad = fullCatalog
      ? cafeNpc.falasAleatorias
      : cafeNpc.falasAleatorias.slice(0, 2);
    linesToLoad.forEach((line, idx) => {
      pushUnique({
        id: `cafe_${cafeNpc.id}_${idx}`,
        label: `Cafeteria OverCoffee · ${cafeNpc.nome}`,
        text: line,
        npcId: cafeNpc.id,
        npcName: cafeNpc.nome,
      });
    });
  }

  // 5. Additional Shift Tickets (or Full 64-Ticket Catalog if toggled)
  const difficultyPool = ALL_PROBLEMS.filter((p) => {
    if (difficulty === 'facil') return p.dificuldade === 'facil';
    if (difficulty === 'normal')
      return p.dificuldade === 'facil' || p.dificuldade === 'normal';
    return true;
  });

  const extraProblems = fullCatalog
    ? ALL_PROBLEMS
    : difficultyPool.slice(0, 4);

  for (const prob of extraProblems) {
    const npc = ALL_NPCS.find((n) => n.id === prob.npc) || ALL_NPCS[0];
    pushUnique({
      id: `${prob.id}_fala`,
      label: `${npc.nome} · Chamado "${prob.descricaoCurta}"`,
      text: prob.falaNpc,
      npcId: npc.id,
      npcName: npc.nome,
    });
    pushUnique({
      id: `${prob.id}_agradecimento`,
      label: `${npc.nome} · Conclusão "${prob.descricaoCurta}"`,
      text: prob.agradecimentoNpc,
      npcId: npc.id,
      npcName: npc.nome,
    });
  }

  return items;
}

export const LoadingVoiceOverlay: React.FC<LoadingVoiceOverlayProps> = ({
  playerName,
  difficulty,
  firstProblem,
  ticketQueue,
  onFinishLoading,
}) => {
  const [fullCatalogMode, setFullCatalogMode] = useState<boolean>(false);
  const [tipIndex, setTipIndex] = useState<number>(0);

  const manifest = useMemo(
    () =>
      buildVoicePreloadManifest(
        playerName,
        difficulty,
        firstProblem,
        ticketQueue,
        fullCatalogMode
      ),
    [playerName, difficulty, firstProblem, ticketQueue, fullCatalogMode]
  );

  const { immediateItems, backgroundItems } = useMemo(
    () => splitVoiceManifestForFastStart(manifest),
    [manifest]
  );

  const itemsToAwaitOnScreen = fullCatalogMode ? manifest : immediateItems;

  const [progress, setProgress] = useState<VoicePreloadProgress>({
    engineStatus: 'loading',
    engineProgress: 15,
    completedItems: 0,
    totalItems: itemsToAwaitOnScreen.length,
    completedChunks: 0,
    totalChunks: itemsToAwaitOnScreen.length,
    cachedHits: 0,
    currentLabel: 'Preparando entrada rápida (demais vozes em 2º plano)...',
    overallPercent: 15,
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % IT_TIPS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cancelToken = { cancelled: false };
    let finished = false;

    const launchBackgroundAndFinish = () => {
      if (finished || cancelToken.cancelled) return;
      finished = true;
      cancelToken.cancelled = true;

      // Queue all remaining dialogues + shift tickets in the background worker ("em segundo plano")
      voiceNarrator.startBackgroundVoiceDownload(backgroundItems);
      const remainingPool = ALL_PROBLEMS.filter((p) => {
        if (difficulty === 'facil') return p.dificuldade === 'facil';
        if (difficulty === 'normal')
          return p.dificuldade === 'facil' || p.dificuldade === 'normal';
        return true;
      });
      voiceNarrator.preloadTicketsInBackground(remainingPool, ALL_NPCS);
      onFinishLoading();
    };

    // In Fast Mode (!fullCatalogMode), cap the loading screen wait so the player never waits more than ~2.2 seconds
    const fastCapTimer = !fullCatalogMode
      ? window.setTimeout(() => {
          launchBackgroundAndFinish();
        }, 2200)
      : null;

    void (async () => {
      await voiceNarrator.preloadDialogueItems(
        itemsToAwaitOnScreen,
        (info) => {
          if (!cancelToken.cancelled) {
            setProgress(info);
          }
        }
      );

      if (!cancelToken.cancelled) {
        launchBackgroundAndFinish();
      }
    })();

    return () => {
      cancelToken.cancelled = true;
      if (fastCapTimer !== null) clearTimeout(fastCapTimer);
    };
  }, [itemsToAwaitOnScreen, backgroundItems, fullCatalogMode, difficulty, onFinishLoading]);

  const handleSkipNow = () => {
    // Queue everything in the background worker and enter immediately
    voiceNarrator.startBackgroundVoiceDownload(manifest);
    voiceNarrator.preloadTicketsInBackground(
      [firstProblem, ...ticketQueue],
      ALL_NPCS
    );
    onFinishLoading();
  };

  return (
    <div
      role="dialog"
      aria-label="Preparando Vozes Neurais e Diálogos do Jogo"
      className="fixed inset-0 z-30 flex items-center justify-center p-6 bg-slate-950/88 backdrop-blur-md pointer-events-auto"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#0f172a] border border-slate-800 p-6 md:p-7 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Volume2 className="w-6 h-6 text-sky-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                  Kokoro 82M Neural TTS
                </span>
                <span className="text-xs text-slate-400 font-mono-tabular">
                  pf_dora (F) · pm_alex (M)
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-100 mt-0.5">
                Preparando Vozes e Conversas do Turno
              </h2>
            </div>
          </div>

          <span className="text-2xl font-black text-sky-400 font-mono-tabular">
            {progress.overallPercent}%
          </span>
        </div>

        {/* Main Progress Bar & Current Dialogue Status */}
        <div className="space-y-2.5">
          <div className="w-full h-3.5 rounded-full bg-[#090d16] border border-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${ Math.max(4, progress.overallPercent) }%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 gap-2">
            <span className="flex items-center gap-2 truncate font-medium">
              <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" />
              <span className="truncate">{progress.currentLabel}</span>
            </span>
            <span className="text-slate-400 font-mono-tabular shrink-0">
              {progress.completedChunks}/{progress.totalChunks} trechos
            </span>
          </div>
        </div>

        {/* Sub-metrics Cards (Engine Status & IndexedDB Cache Hits) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800/90 flex items-center gap-3">
            <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400">Motor Web Worker</div>
              <div className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                {progress.engineStatus === 'ready' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Pronto (60 FPS Livre)</span>
                  </>
                ) : (
                  <span>Carregando IA ({progress.engineProgress}%)</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800/90 flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400">Cache Local (IndexedDB)</div>
              <div className="text-xs font-bold text-slate-100 truncate">
                {progress.cachedHits > 0
                  ? `${progress.cachedHits} áudios instantâneos`
                  : 'Salvando no navegador'}
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selector: Fast Shift Pack vs Full 64-Conversation Preload */}
        <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-200">
              Modo de Pré-Carregamento de Áudio:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFullCatalogMode(false)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                  !fullCatalogMode
                    ? 'bg-sky-500/25 border border-sky-400/50 text-sky-200'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Pacote do Turno (Rápido)
              </button>
              <button
                type="button"
                onClick={() => setFullCatalogMode(true)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                  fullCatalogMode
                    ? 'bg-amber-500/25 border border-amber-400/50 text-amber-200'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas as 64 Conversas
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {fullCatalogMode
              ? 'Gerando e salvando no navegador todas as falas dos 64 chamados e da Cafeteria antes de iniciar. Nas próximas partidas, o carregamento será imediato!'
              : 'Pré-carrega a Gerente Helena, os chamados iniciais e a Cafeteria para início rápido, enquanto os demais chamados são gerados silenciosamente em 2º plano.'}
          </p>
        </div>

        {/* Rotating Tip & Skip Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          <p className="text-xs text-slate-400 italic flex-1">
            {IT_TIPS[tipIndex]}
          </p>

          <button
            type="button"
            onClick={handleSkipNow}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-colors"
            title="Entrar no jogo agora e continuar gerando as vozes em segundo plano"
          >
            <span>Entrar Agora</span>
            <FastForward className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
