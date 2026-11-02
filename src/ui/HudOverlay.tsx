import React, { useState } from 'react';
import {
  ALL_NPCS,
  ALL_SECTORS,
  DifficultyLevel,
  NpcData,
  ProblemData,
} from '../problems/validator';
import { NearbyInteraction } from '../player/collision';
import { TicketScoreBreakdown } from '../progression/progressionSystem';
import { CAFETERIA_NPCS, CafeteriaNpc } from '../cafeteria/cafeteriaSystem';
import { isFemaleNpc, voiceNarrator } from '../audio/voiceNarrator';
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Compass,
  Cpu,
  FastForward,
  Flame,
  Laptop,
  Map,
  MessageCircle,
  Mic,
  MicOff,
  Navigation,
  Pause,
  Shirt,
  Volume2,
  VolumeX,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

interface HudOverlayProps {
  activeProblem: ProblemData | null;
  ticketQueue: ProblemData[];
  nextTicketCountdown: number;
  isRushHour: boolean;
  rushHourRemaining: number;
  currentSectorName: string;
  nearby: NearbyInteraction | null;
  nearCafeteria: boolean;
  nearbyCafeteriaNpc: CafeteriaNpc | null;
  activeCafeteriaDialogue: { npc: CafeteriaNpc; message: string } | null;
  activeDialogueNpc: NpcData | null;
  resolvedModalData: {
    problem: ProblemData;
    npc: NpcData;
    reward?: TicketScoreBreakdown;
  } | null;
  resolvedCount: number;
  points: number;
  energy: number;
  unlockedMedalsCount: number;
  difficulty: DifficultyLevel;
  muted: boolean;
  voiceEnabled: boolean;
  cameraZoom: number;
  onSelectQueuedTicket: (problemId: string) => void;
  onSkipTicketWait: () => void;
  onToggleRushHourManual?: () => void;
  onToggleMute: () => void;
  onToggleVoiceEnabled: () => void;
  onReplayVoice: (text: string, npc: NpcData) => void;
  onOpenCustomization: () => void;
  onOpenCafeteria: () => void;
  onWalkToCafeteria: () => void;
  onTalkToCafeteriaNpc: (npc: CafeteriaNpc) => void;
  onCloseCafeteriaDialogue: () => void;
  onCycleCameraZoom: () => void;
  onToggleFullMap: () => void;
  onOpenPause: () => void;
  onWalkToActiveTicket: () => void;
  onOpenNpcDialogue: (nearby: NearbyInteraction) => void;
  onCloseNpcDialogue: () => void;
  onOpenHardwareWorkbench: () => void;
  onOpenVirtualOS: () => void;
  onNextTicketAfterResolve: () => void;
}

export const HudOverlay: React.FC<HudOverlayProps> = ({
  activeProblem,
  ticketQueue,
  nextTicketCountdown,
  isRushHour,
  rushHourRemaining,
  currentSectorName,
  nearby,
  nearCafeteria,
  nearbyCafeteriaNpc,
  activeCafeteriaDialogue,
  activeDialogueNpc,
  resolvedModalData,
  resolvedCount,
  points,
  energy,
  unlockedMedalsCount,
  difficulty,
  muted,
  voiceEnabled,
  cameraZoom,
  onSelectQueuedTicket,
  onSkipTicketWait,
  onToggleMute,
  onToggleVoiceEnabled,
  onReplayVoice,
  onOpenCustomization,
  onOpenCafeteria,
  onWalkToCafeteria,
  onTalkToCafeteriaNpc,
  onCloseCafeteriaDialogue,
  onCycleCameraZoom,
  onToggleFullMap,
  onOpenPause,
  onWalkToActiveTicket,
  onOpenNpcDialogue,
  onCloseNpcDialogue,
  onOpenHardwareWorkbench,
  onOpenVirtualOS,
  onNextTicketAfterResolve,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const targetSector = activeProblem
    ? ALL_SECTORS.find((s) => s.id === activeProblem.setor)
    : null;
  const targetNpc = activeProblem
    ? ALL_NPCS.find((n) => n.id === activeProblem.npc)
    : null;

  const isAtTarget = Boolean(
    nearby && activeProblem && nearby.sector.id === activeProblem.setor
  );

  const isFullMap = cameraZoom >= 1.9;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-4">
      {/* TOP PERIMETER CLUSTER: Ticket Notification / Queue / Wait Timer + Utility & Progression Bar */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 max-w-2xl">
          {/* Rush Hour Indicator Banner (Active on Hard Difficulty Rush Waves) */}
          {isRushHour && (
            <div className="pointer-events-auto self-start px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-lg">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>
                HORÁRIO DE PICO ATIVO ({rushHourRemaining}s) · Chamados acumulam na fila · Bônus +75 pts!
              </span>
            </div>
          )}

          {/* Critical 20% Low Energy Warning Banner */}
          {energy <= 20 && energy > 0 && (
            <div
              role="alert"
              className="pointer-events-auto self-start px-4 py-2 rounded-xl bg-rose-950/95 border border-rose-500 text-rose-200 text-xs font-bold flex items-center justify-between gap-3 shadow-xl animate-pulse"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  ⚠️ ENERGIA BAIXA ({energy}%)! Vá à Cafeteria OverCoffee tomar café ou você vai dormir no serviço (0%) e perder pontos!
                </span>
              </div>
              {!nearCafeteria && (
                <button
                  type="button"
                  onClick={onWalkToCafeteria}
                  className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 text-[11px] font-extrabold shrink-0 cursor-pointer transition-colors"
                >
                  Ir à Cafeteria
                </button>
              )}
            </div>
          )}

          {/* Active Ticket Card OR Calm Patrol Countdown Card */}
          {activeProblem && targetSector && targetNpc ? (
            <div className="pointer-events-auto bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 shadow-xl flex flex-col gap-2.5">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-slate-700"
                  style={{ backgroundColor: `${targetSector.cor}22` }}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="12"
                      rx="2"
                      stroke={targetSector.cor}
                      strokeWidth="2"
                    />
                    <path
                      d="M8 20H16M12 16V20"
                      stroke="#f8fafc"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-sky-400">
                      Chamado no Setor: {targetSector.nome}
                    </span>
                    <span>·</span>
                    <span className="truncate">{targetNpc.nome}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-100 truncate mt-0.5">
                    {activeProblem.descricaoCurta}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isAtTarget ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.currentTarget.blur();
                        onWalkToActiveTicket();
                      }}
                      className="px-3.5 py-2 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Ir até o Setor
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.currentTarget.blur();
                        if (nearby) onOpenNpcDialogue(nearby);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Atender Agora [E]
                    </button>
                  )}
                </div>
              </div>

              {/* Accumulated Ticket Queue Switcher (when 2+ tickets are open simultaneously) */}
              {ticketQueue.length > 1 && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    Fila Acumulada ({ticketQueue.length}):
                  </span>
                  {ticketQueue.map((prob, idx) => {
                    const sec = ALL_SECTORS.find((s) => s.id === prob.setor);
                    const isSelected = prob.id === activeProblem.id;
                    return (
                      <button
                        key={prob.id}
                        type="button"
                        onClick={() => onSelectQueuedTicket(prob.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <span>#{idx + 1}</span>
                        <span>{sec?.nome || prob.setor}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : !resolvedModalData ? (
            /* Peaceful Interval Between Tickets */
            <div className="pointer-events-auto bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 shadow-xl flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-400 block">
                  Escritório Operando em Ordem
                </span>
                <p className="text-xs text-slate-300 font-mono-tabular">
                  Próximo chamado espontâneo em {nextTicketCountdown}s...
                </p>
              </div>
              <button
                type="button"
                onClick={onSkipTicketWait}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <FastForward className="w-3.5 h-3.5" />
                Receber Agora
              </button>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* Top-Right Compact Progression, Energy Status & Utility Controls (No remote Cafeteria button!) */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#0f172a] border border-slate-800 rounded-xl p-1.5 shadow-xl">
          {/* Energy Meter Indicator (Does NOT open Cafeteria remotely; guides player to walk there) */}
          <div
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-2 transition-colors ${
              energy <= 25
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                : energy <= 55
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
            title="Sua Energia Atual — Vá até a sala da Cafeteria OverCoffee no mapa para tomar café"
          >
            <Zap className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                Energia
              </div>
              <div className="text-xs font-extrabold font-mono-tabular leading-tight">
                {energy}%
              </div>
            </div>
          </div>

          {/* Career Points (can go negative if player owes points) */}
          <div className="px-2.5 py-1 text-right border-r border-slate-800">
            <div
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                points < 0 ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              {points < 0 ? 'Devendo' : 'Pontos'}
            </div>
            <div
              className={`text-sm font-bold font-mono-tabular leading-tight ${
                points < 0 ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              {points}
            </div>
          </div>

          {/* Resolved Tickets */}
          <div className="px-2.5 py-1 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Chamados
            </div>
            <div className="text-sm font-bold font-mono-tabular text-slate-100 leading-tight">
              {resolvedCount}
            </div>
          </div>

          {/* Wardrobe & Medals Button */}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Abrir Guarda-Roupa e Medalhas"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenCustomization();
            }}
            className="px-2.5 h-9 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
            title="Roupas, Acessórios e Medalhas [C]"
          >
            <Shirt className="w-4 h-4" />
            <span className="hidden sm:inline">Roupas & Medalhas</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] font-mono-tabular">
              {unlockedMedalsCount}
            </span>
          </button>

          {/* Voice Narration Toggle */}
          <button
            type="button"
            tabIndex={-1}
            aria-label={voiceEnabled ? 'Desativar Voz Narrada' : 'Ativar Voz Narrada'}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleVoiceEnabled();
            }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              voiceEnabled
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400'
            }`}
            title={voiceEnabled ? 'Voz Humanizada Ativada' : 'Voz Humanizada Desativada'}
          >
            {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Mute Audio */}
          <button
            type="button"
            tabIndex={-1}
            aria-label={muted ? 'Ativar Áudio' : 'Silenciar Áudio'}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Áudio [M]"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Pause & Settings */}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Pausar e Configurações"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenPause();
            }}
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Pausar [Esc / P]"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MIDDLE AREA: NPC Speech Card OR Didactic Resolution Feedback + Points/Medal Card */}
      <div className="my-auto flex flex-col items-center justify-center pointer-events-none">
        {resolvedModalData && (
          <div
            role="dialog"
            aria-label="Chamado Concluído"
            className="pointer-events-auto w-full max-w-lg bg-[#0f172a] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between gap-3.5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-emerald-400">
                    Atendimento Concluído · {resolvedModalData.npc.nome}
                  </span>
                  <p className="text-base font-bold text-slate-100 mt-0.5">
                    &ldquo;{resolvedModalData.problem.agradecimentoNpc}&rdquo;
                  </p>
                </div>
              </div>

              {resolvedModalData.reward && (
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-right shrink-0">
                  <span className="text-[10px] uppercase tracking-wider text-amber-300 block">
                    Recompensa
                  </span>
                  <span className="text-sm font-extrabold font-mono-tabular text-amber-400">
                    +{resolvedModalData.reward.totalEarned} pts
                  </span>
                </div>
              )}
            </div>

            {/* Newly Unlocked Medals Banner */}
            {resolvedModalData.reward &&
              resolvedModalData.reward.newlyUnlockedMedals.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center gap-3">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-300 block">
                      Nova Medalha Conquistada!
                    </span>
                    <span className="text-slate-200">
                      {resolvedModalData.reward.newlyUnlockedMedals
                        .map((m) => `${m.titulo} (+${m.pontosRecompensa} pts)`)
                        .join(' · ')}
                    </span>
                  </div>
                </div>
              )}

            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-sky-400 block">
                O que você aprendeu na prática:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {resolvedModalData.problem.feedbackEducativo}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onOpenCustomization}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Shirt className="w-4 h-4" />
                Ver Roupas & Medalhas
              </button>

              <button
                type="button"
                onClick={onNextTicketAfterResolve}
                className="px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {ticketQueue.length > 1
                  ? 'Atender Próximo da Fila'
                  : 'Continuar Turno'}
              </button>
            </div>
          </div>
        )}

        {!resolvedModalData && activeDialogueNpc && (
          <div
            role="region"
            aria-label={`Relato de ${activeDialogueNpc.nome}`}
            className="pointer-events-auto w-full max-w-xl bg-[#0f172a] border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <svg
                  viewBox="0 0 56 56"
                  className="w-14 h-14 rounded-xl bg-[#090d16] border border-slate-800 shrink-0"
                >
                  <rect width="56" height="56" rx="12" fill="#090d16" />
                  <path
                    d="M10 54 C10 41 46 41 46 54 Z"
                    fill={activeDialogueNpc.corCamisa}
                  />
                  <circle cx="28" cy="24" r="11" fill={activeDialogueNpc.tomPele} />
                  <path
                    d="M17 22 C17 12 39 12 39 22 C39 17 17 17 17 22 Z"
                    fill={activeDialogueNpc.corCabelo}
                  />
                  <circle cx="24" cy="24" r="1.5" fill="#0f172a" />
                  <circle cx="32" cy="24" r="1.5" fill="#0f172a" />
                </svg>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                    <span className="font-bold text-slate-100">
                      {activeDialogueNpc.nome}
                    </span>
                    <span>·</span>
                    <span>{activeDialogueNpc.cargo}</span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-[10px] font-semibold text-sky-300">
                      {isFemaleNpc(activeDialogueNpc.id, activeDialogueNpc.nome)
                        ? 'Voz Feminina'
                        : 'Voz Masculina'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-100 mt-1.5 leading-relaxed">
                    &ldquo;
                    {activeProblem && activeDialogueNpc.setor === activeProblem.setor
                      ? activeProblem.falaNpc
                      : 'Tudo funcionando em ordem por aqui no meu setor, obrigado por passar!'}
                    &rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  aria-label="Ouvir relato em voz alta"
                  onClick={() =>
                    onReplayVoice(
                      activeProblem && activeDialogueNpc.setor === activeProblem.setor
                        ? activeProblem.falaNpc
                        : 'Tudo funcionando em ordem por aqui no meu setor, obrigado por passar!',
                      activeDialogueNpc
                    )
                  }
                  className="p-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 transition-colors cursor-pointer"
                  title="Ouvir Voz Humanizada"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Fechar mensagem do funcionário"
                  onClick={onCloseNpcDialogue}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Fechar [Esc]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {activeProblem && activeDialogueNpc.setor === activeProblem.setor ? (
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  Escolha como iniciar o diagnóstico desta estação:
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onOpenHardwareWorkbench}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Wrench className="w-4 h-4" />
                    Inspecionar Hardware (3D / Cabos)
                  </button>
                  <button
                    type="button"
                    onClick={onOpenVirtualOS}
                    className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Laptop className="w-4 h-4" />
                    Abrir Computador Virtual (OverOS)
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Este setor não possui chamados pendentes no momento.</span>
                <button
                  type="button"
                  onClick={onCloseNpcDialogue}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        )}
        {/* In-World 3D Cafeteria NPC Conversation Card (Triggered when talking directly to NPCs inside the Cafeteria space!) */}
        {!resolvedModalData && !activeDialogueNpc && activeCafeteriaDialogue && (
          <div
            role="region"
            aria-label={`Conversa na Cafeteria com ${activeCafeteriaDialogue.npc.nome}`}
            className="pointer-events-auto w-full max-w-xl bg-[#0f172a] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <svg
                  viewBox="0 0 56 56"
                  className="w-14 h-14 rounded-xl bg-[#090d16] border border-amber-500/30 shrink-0"
                >
                  <rect width="56" height="56" rx="12" fill="#090d16" />
                  <path
                    d="M10 54 C10 41 46 41 46 54 Z"
                    fill={activeCafeteriaDialogue.npc.corCamisa}
                  />
                  <circle cx="28" cy="24" r="11" fill={activeCafeteriaDialogue.npc.tomPele} />
                  <path
                    d="M17 22 C17 12 39 12 39 22 C39 17 17 17 17 22 Z"
                    fill={activeCafeteriaDialogue.npc.corCabelo}
                  />
                  <circle cx="24" cy="24" r="1.5" fill="#0f172a" />
                  <circle cx="32" cy="24" r="1.5" fill="#0f172a" />
                </svg>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-amber-300">
                    <span className="font-bold text-white">
                      {activeCafeteriaDialogue.npc.nome}
                    </span>
                    <span>·</span>
                    <span>{activeCafeteriaDialogue.npc.cargo}</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-semibold text-amber-200">
                      {isFemaleNpc(
                        activeCafeteriaDialogue.npc.id,
                        activeCafeteriaDialogue.npc.nome
                      )
                        ? 'Voz Feminina'
                        : 'Voz Masculina'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-100 mt-1.5 leading-relaxed italic">
                    &ldquo;{activeCafeteriaDialogue.message}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  aria-label="Ouvir fala do colega na cafeteria"
                  onClick={() =>
                    voiceNarrator.speakProblem(activeCafeteriaDialogue.message, {
                      npcId: activeCafeteriaDialogue.npc.id,
                      npcName: activeCafeteriaDialogue.npc.nome,
                      force: true,
                    })
                  }
                  className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-colors cursor-pointer"
                  title="Ouvir Voz"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Fechar conversa da cafeteria"
                  onClick={onCloseCafeteriaDialogue}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
                  title="Fechar [Esc]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 mr-1">Na Cafeteria:</span>
                {CAFETERIA_NPCS.map((cNpc) => (
                  <button
                    key={cNpc.id}
                    type="button"
                    onClick={() => onTalkToCafeteriaNpc(cNpc)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                      activeCafeteriaDialogue.npc.id === cNpc.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {cNpc.nome.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onTalkToCafeteriaNpc(activeCafeteriaDialogue.npc)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Outro Assunto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCloseCafeteriaDialogue();
                    onOpenCafeteria();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  Balcão de Cafés
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM UNIFIED COLLAPSIBLE CONTROL DOCK */}
      <div className="mx-auto w-full max-w-4xl flex flex-col items-center pointer-events-auto">
        <button
          type="button"
          onClick={() => setDockCollapsed((prev) => !prev)}
          className="px-3 py-1 rounded-t-lg bg-[#0f172a] border border-b-0 border-slate-800 text-[11px] font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Mostrar Barra de Ações
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Ocultar Controles
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Compass className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="font-semibold text-slate-100">{currentSectorName}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 capitalize">Nível: {difficulty}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {nearCafeteria ? (
                <>
                  <button
                    type="button"
                    onClick={onOpenCafeteria}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    Balcão de Cafés [E]
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onTalkToCafeteriaNpc(nearbyCafeteriaNpc || CAFETERIA_NPCS[1])
                    }
                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {nearbyCafeteriaNpc
                      ? `Conversar com ${nearbyCafeteriaNpc.nome.split(' ')[0]} [E]`
                      : 'Conversar na Cafeteria'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onWalkToCafeteria}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                    energy <= 35
                      ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
                      : 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300'
                  }`}
                  title="Caminhar até a sala da Cafeteria OverCoffee no mapa"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Caminhar até a Cafeteria ({energy}%)
                </button>
              )}

              {nearby && (
                <button
                  type="button"
                  onClick={() => onOpenNpcDialogue(nearby)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium cursor-pointer whitespace-nowrap"
                >
                  Falar com {nearby.npc.nome.split(' ')[0]} [E]
                </button>
              )}

              {activeProblem && (
                <>
                  <button
                    type="button"
                    onClick={onOpenHardwareWorkbench}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    Hardware
                  </button>
                  <button
                    type="button"
                    onClick={onOpenVirtualOS}
                    className="px-3 py-1.5 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    Computador Virtual
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onToggleFullMap}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                  isFullMap
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title="Alternar Visão do Mapa Inteiro [V]"
              >
                <Map className="w-3.5 h-3.5" />
                {isFullMap ? 'Voltar ao Analista [V]' : 'Ver Mapa Inteiro [V]'}
              </button>

              <button
                type="button"
                onClick={onCycleCameraZoom}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-tabular cursor-pointer whitespace-nowrap"
                title="Alternar Zoom da Câmera (ou use a roda do mouse)"
              >
                Zoom {cameraZoom <= 0.85 ? 'Próximo' : cameraZoom >= 1.9 ? 'Total' : 'Médio'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
