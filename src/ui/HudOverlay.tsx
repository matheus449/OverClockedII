import React from 'react';
import {
  ALL_NPCS,
  ALL_SECTORS,
  DifficultyLevel,
  NpcData,
  ProblemData,
} from '../problems/validator';
import { NearbyInteraction } from '../player/collision';
import { TicketScoreBreakdown } from '../progression/progressionSystem';
import {
  CAFETERIA_NPCS,
  CafeteriaNpc,
  formatCycleTimer,
} from '../cafeteria/cafeteriaSystem';
import { isFemaleNpc, voiceNarrator } from '../audio/voiceNarrator';
import { InputControlMode } from '../player/touchControls';
import { TouchControlsPad } from './TouchControlsPad';
import {
  calculateHomeComfortScore,
  GameLocation,
} from '../home/homeSystem';
import {
  Award,
  BedDouble,
  CheckCircle2,
  Clock,
  Coffee,
  Cpu,
  FastForward,
  Flame,
  Home,
  Laptop,
  Lock,
  Map,
  MessageCircle,
  Mic,
  MicOff,
  Moon,
  Pause,
  Shirt,
  ShoppingBag,
  Sun,
  Volume2,
  VolumeX,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

interface HudOverlayProps {
  currentLocation?: GameLocation;
  purchasedFurnitureIds?: string[];
  nearHomeDoor?: boolean;
  nearHomeBed?: boolean;
  hasSleptAtHome?: boolean;
  homeStayRemaining?: number;
  activeProblem: ProblemData | null;
  ticketQueue: ProblemData[];
  nextTicketCountdown: number;
  isRushHour: boolean;
  rushHourRemaining: number;
  nightShift: boolean;
  shiftCycleRemaining: number;
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
  inputMode: InputControlMode;
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
  onTalkToCafeteriaNpc: (npc: CafeteriaNpc) => void;
  onCloseCafeteriaDialogue: () => void;
  onOpenHomeShop?: () => void;
  onSleepInHomeBed?: () => void;
  onReturnToOffice?: () => void;
  onCycleCameraZoom: () => void;
  onToggleFullMap: () => void;
  onOpenPause: () => void;
  onOpenNpcDialogue: (nearby: NearbyInteraction) => void;
  onCloseNpcDialogue: () => void;
  onOpenHardwareWorkbench: () => void;
  onOpenVirtualOS: () => void;
  onNextTicketAfterResolve: () => void;
}

export const HudOverlay: React.FC<HudOverlayProps> = ({
  currentLocation = 'office',
  purchasedFurnitureIds = [],
  nearHomeDoor = false,
  nearHomeBed = false,
  hasSleptAtHome = false,
  homeStayRemaining = 180,
  activeProblem,
  ticketQueue,
  nextTicketCountdown,
  isRushHour,
  rushHourRemaining,
  nightShift,
  shiftCycleRemaining,
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
  inputMode,
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
  onTalkToCafeteriaNpc,
  onCloseCafeteriaDialogue,
  onOpenHomeShop,
  onSleepInHomeBed,
  onReturnToOffice,
  onToggleFullMap,
  onOpenPause,
  onOpenNpcDialogue,
  onCloseNpcDialogue,
  onOpenHardwareWorkbench,
  onOpenVirtualOS,
  onNextTicketAfterResolve,
}) => {
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
  const homeComfort = calculateHomeComfortScore(purchasedFurnitureIds);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-2 sm:p-3">
      {/* SINGLE-ROW COMPACT TOP PERIMETER HUD (Left: Active Ticket Pill · Right: Sleek Metrics & Quick Tools) */}
      <div className="flex items-start justify-between gap-2 w-full">
        {/* TOP-LEFT: Compact Active Ticket Module (or Home Status Card when inside Home Map) */}
        <div className="flex flex-col gap-1.5 min-w-0 max-w-[52%] sm:max-w-lg">
          {currentLocation === 'home' ? (
            <div
              data-testid="hud-home-status-card"
              className="pointer-events-auto bg-[#0b111e]/94 border border-emerald-500/40 rounded-2xl px-3.5 py-2.5 shadow-xl flex flex-col gap-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-300 font-bold">
                      <span className="truncate">Sua Casa · {homeComfort.levelTitle}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">
                      {homeComfort.ownedSlotsCount}/{homeComfort.totalSlots} Móveis ({homeComfort.ownedCount}/36) · Conforto +{homeComfort.totalComfort}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {nearHomeBed && !hasSleptAtHome && (
                    <button
                      type="button"
                      data-testid="hud-top-sleep-bed-btn"
                      onClick={onSleepInHomeBed}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shadow-md"
                    >
                      <BedDouble className="w-3.5 h-3.5" />
                      Dormir [E]
                    </button>
                  )}
                  <button
                    type="button"
                    data-testid="hud-open-furniture-shop-btn"
                    onClick={onOpenHomeShop}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Loja de Móveis
                  </button>
                  <button
                    type="button"
                    data-testid="hud-return-office-btn"
                    onClick={onReturnToOffice}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shadow-md ${
                      hasSleptAtHome
                        ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
                    }`}
                    title={
                      hasSleptAtHome
                        ? 'Voltar para o Escritório (Novo Dia)'
                        : 'Caminhe até a cama no quarto e clique para dormir antes de voltar ao trabalho!'
                    }
                  >
                    {hasSleptAtHome ? (
                      <>
                        <Sun className="w-3.5 h-3.5" />
                        Ir Trabalhar
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        Ir Trabalhar
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-row inside Home Status Card showing Bed Sleep Requirement */}
              <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px]">
                {hasSleptAtHome ? (
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <BedDouble className="w-3 h-3 text-emerald-400 shrink-0" />
                    Energia 100% recuperada na cama · Porta de saída liberada!
                  </span>
                ) : (
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <BedDouble className="w-3 h-3 text-amber-400 shrink-0" />
                    Vá até a cama no quarto e clique em Dormir para recuperar 100% de energia
                  </span>
                )}
              </div>
            </div>
          ) : activeProblem && targetSector && targetNpc ? (
            <div className="pointer-events-auto bg-[#0b111e]/92 border border-slate-800/90 rounded-2xl px-3 py-2 shadow-xl flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: targetSector.cor }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 leading-tight">
                      <span className="font-bold text-sky-400 truncate">
                        {targetSector.nome}
                      </span>
                      <span>·</span>
                      <span className="truncate text-slate-300">{targetNpc.nome}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-100 truncate mt-0.5">
                      {activeProblem.descricaoCurta}
                    </p>
                  </div>
                </div>

                {isAtTarget ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      if (nearby) onOpenNpcDialogue(nearby);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-md"
                  >
                    Atender [E]
                  </button>
                ) : (
                  <span
                    className="hidden sm:inline-flex px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[10px] font-semibold text-slate-400 whitespace-nowrap shrink-0"
                    title="Caminhe até o setor indicado pela trilha luminosa no chão para atender o chamado"
                  >
                    Vá até o setor
                  </span>
                )}
              </div>

              {/* Sub-row: Current Sector & Queue Tabs or Rush Hour / Low Energy Micro-Alerts */}
              {(ticketQueue.length > 1 || isRushHour || (energy <= 20 && energy > 0)) && (
                <div className="pt-1 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap text-[10px]">
                  {isRushHour && (
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400 shrink-0" />
                      Pico ({rushHourRemaining}s)
                    </span>
                  )}
                  {energy <= 20 && energy > 0 && (
                    <span
                      role="alert"
                      className="text-rose-300 font-bold flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-rose-400 shrink-0" />
                      Energia baixa ({energy}%) · Vá à Cafeteria!
                    </span>
                  )}
                  {ticketQueue.length > 1 &&
                    ticketQueue.map((prob, idx) => {
                      const sec = ALL_SECTORS.find((s) => s.id === prob.setor);
                      const isSelected = prob.id === activeProblem.id;
                      return (
                        <button
                          key={prob.id}
                          type="button"
                          onClick={() => onSelectQueuedTicket(prob.id)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-sky-500 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          #{idx + 1} {sec?.nome.split(' ')[0] || prob.setor}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          ) : !resolvedModalData ? (
            <div className="pointer-events-auto bg-[#0b111e]/92 border border-slate-800/90 rounded-2xl px-3 py-2 shadow-xl flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-emerald-400 block truncate">
                  Escritório em Ordem ({currentSectorName})
                </span>
                <p className="text-[10px] text-slate-300 font-mono-tabular">
                  Próximo chamado em {nextTicketCountdown}s
                </p>
              </div>
              <button
                type="button"
                onClick={onSkipTicketWait}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <FastForward className="w-3 h-3" />
                Receber Agora
              </button>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* TOP-RIGHT: Sleek Unified Status & Quick-Action Bar */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 bg-[#0b111e]/92 border border-slate-800/90 rounded-2xl px-2 py-1.5 shadow-xl shrink-0">
          {/* Energy Readout */}
          <div
            className={`px-2 py-1 rounded-xl border flex items-center gap-1 transition-colors ${
              energy <= 20
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : energy <= 50
                ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
            title="Sua Energia Atual — A energia só diminui ao atender chamados. Vá caminhando até a Cafeteria OverCoffee para tomar café!"
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs font-extrabold font-mono-tabular">
              {energy}%
            </span>
          </div>

          {/* Points Readout */}
          <div
            className="px-2 py-1 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-1"
            title="Saldo de Pontos (Moeda para comprar cafés e roupas)"
          >
            <Award
              className={`w-3.5 h-3.5 shrink-0 ${
                points < 0 ? 'text-rose-400' : 'text-amber-400'
              }`}
            />
            <span
              className={`text-[11px] sm:text-xs font-extrabold font-mono-tabular ${
                points < 0 ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              {points}
            </span>
          </div>

          {/* Resolved Tickets Counter */}
          <div
            className="hidden sm:flex px-2 py-1 rounded-xl bg-slate-900/90 border border-slate-800 items-center gap-1 text-slate-200"
            title="Chamados Resolvidos"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-xs font-extrabold font-mono-tabular">
              {resolvedCount}
            </span>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-0.5" />

          {/* Automatic Day/Night Cycle Indicator (or 3-Minute Home Stay Countdown when inside Home) */}
          <div
            data-testid="hud-shift-cycle-badge"
            className={`h-8 px-2 sm:px-2.5 rounded-xl border flex items-center gap-1.5 text-[11px] font-bold shrink-0 ${
              currentLocation === 'home'
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200 shadow-sm'
                : nightShift
                ? 'bg-indigo-500/25 border-indigo-400/50 text-indigo-200 shadow-sm'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}
            title={
              currentLocation === 'home'
                ? `Tempo em Casa até voltar ao emprego (${formatCycleTimer(homeStayRemaining)}) — Durma na cama para recuperar 100% da energia!`
                : nightShift
                ? `Plantão Noturno Automático (${formatCycleTimer(shiftCycleRemaining)} restantes) — +50% Pontos · Maior Gasto de Energia · Café +50%`
                : `Turno Diurno Automático (${formatCycleTimer(shiftCycleRemaining)} até anoitecer) — Ciclo: 3 min de Dia / 2 min de Noite`
            }
          >
            {currentLocation === 'home' ? (
              <>
                <Home className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="hidden xl:inline">Volta</span>
                <span className="font-mono-tabular text-[11px] text-emerald-100">
                  {formatCycleTimer(homeStayRemaining)}
                </span>
              </>
            ) : nightShift ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                <span className="hidden xl:inline">Noite</span>
                <span className="font-mono-tabular text-[11px] text-indigo-100">
                  {formatCycleTimer(shiftCycleRemaining)}
                </span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="hidden xl:inline">Dia</span>
                <span className="font-mono-tabular text-[11px] text-amber-100">
                  {formatCycleTimer(shiftCycleRemaining)}
                </span>
              </>
            )}
          </div>

          {/* Quick Diagnostic Tools (Hardware & OverOS) — ONLY available when physically at the target sector! */}
          {activeProblem && isAtTarget && (
            <>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Inspecionar Hardware"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenHardwareWorkbench();
                }}
                className="h-8 px-2 sm:px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                title="Bancada de Hardware 3D (No Setor)"
              >
                <Cpu className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Hardware</span>
              </button>

              <button
                type="button"
                tabIndex={-1}
                aria-label="Abrir Computador Virtual"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenVirtualOS();
                }}
                className="h-8 px-2 sm:px-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/35 text-sky-300 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                title="Computador Virtual OverOS (No Setor)"
              >
                <Laptop className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">OverOS</span>
              </button>
            </>
          )}

          {/* Wardrobe & Points Store Button */}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Abrir Guarda-Roupa e Medalhas"
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenCustomization();
            }}
            className="h-8 px-2 sm:px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-amber-300 flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
            title="Loja de Roupas, Acessórios e Medalhas [C]"
          >
            <Shirt className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">Roupas</span>
            {unlockedMedalsCount > 0 && (
              <span className="text-[10px] font-mono-tabular text-amber-200">
                {unlockedMedalsCount}
              </span>
            )}
          </button>

          {/* Toggle Full Map View [V] */}
          <button
            type="button"
            tabIndex={-1}
            aria-label={isFullMap ? 'Voltar ao Analista' : 'Ver Mapa Inteiro'}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleFullMap();
            }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isFullMap
                ? 'bg-sky-500 text-slate-950'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200'
            }`}
            title="Visão do Mapa Inteiro [V]"
          >
            <Map className="w-3.5 h-3.5" />
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
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              voiceEnabled
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-400'
            }`}
            title={voiceEnabled ? 'Voz Humanizada Ativada' : 'Voz Humanizada Desativada'}
          >
            {voiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
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
            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Áudio [M]"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
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
            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Pausar [Esc / P]"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MIDDLE AREA: NPC Speech Card OR Didactic Resolution Feedback + Points/Medal Card */}
      <div className="my-auto flex flex-col items-center justify-center pointer-events-none px-2">
        {resolvedModalData && (
          <div
            role="dialog"
            aria-label="Chamado Concluído"
            className="pointer-events-auto w-full max-w-lg bg-[#0f172a] border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-3.5"
          >
            <div className="flex items-center justify-between gap-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-emerald-400">
                    Atendimento Concluído · {resolvedModalData.npc.nome}
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-100 mt-0.5">
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
                  {resolvedModalData.reward.nightShiftBonus > 0 && (
                    <span className="text-[10px] font-semibold text-indigo-300 block">
                      Inclui +{resolvedModalData.reward.nightShiftBonus} pts Noturno
                    </span>
                  )}
                </div>
              )}
            </div>

            {resolvedModalData.reward &&
              resolvedModalData.reward.newlyUnlockedMedals.length > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
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

            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 space-y-1">
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
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Shirt className="w-4 h-4" />
                Loja de Roupas
              </button>

              <button
                type="button"
                onClick={onNextTicketAfterResolve}
                className="px-4 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold transition-colors cursor-pointer"
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
            className="pointer-events-auto w-full max-w-xl bg-[#0f172a] border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0">
                <svg
                  viewBox="0 0 56 56"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#090d16] border border-slate-800 shrink-0"
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
                    <span className="text-[10px] font-semibold text-sky-400">
                      ·{' '}
                      {isFemaleNpc(activeDialogueNpc.id, activeDialogueNpc.nome)
                        ? 'Voz Feminina'
                        : 'Voz Masculina'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-100 mt-1 leading-relaxed">
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
              <div className="pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  Escolha como iniciar o diagnóstico desta estação:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenHardwareWorkbench}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Inspecionar Hardware
                  </button>
                  <button
                    type="button"
                    onClick={onOpenVirtualOS}
                    className="px-3.5 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    Computador Virtual (OverOS)
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

        {/* In-World 3D Cafeteria NPC Conversation Card */}
        {!resolvedModalData && !activeDialogueNpc && activeCafeteriaDialogue && (
          <div
            role="region"
            aria-label={`Conversa na Cafeteria com ${activeCafeteriaDialogue.npc.nome}`}
            className="pointer-events-auto w-full max-w-xl bg-[#0f172a] border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 min-w-0">
                <svg
                  viewBox="0 0 56 56"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#090d16] border border-amber-500/30 shrink-0"
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
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-100 mt-1 leading-relaxed italic">
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

            <div className="pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
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
                  className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  Balcão de Cafés
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ZONE: Clean Analog Touch Pad (on Touch Mode) OR Minimal Contextual Prompt (on Keyboard Mode when near an NPC/Cafeteria) */}
      <div className="w-full flex flex-col items-center pointer-events-none">
        {inputMode === 'touch' &&
          !resolvedModalData &&
          !activeDialogueNpc &&
          !activeCafeteriaDialogue && (
            <TouchControlsPad
              currentLocation={currentLocation}
              nearHomeBed={nearHomeBed}
              nearHomeDoor={nearHomeDoor}
              hasSleptAtHome={hasSleptAtHome}
              onSleepInHomeBed={onSleepInHomeBed}
              onOpenHomeShop={onOpenHomeShop}
              onReturnToOffice={onReturnToOffice}
              hasNearbyNpc={Boolean(nearby)}
              nearbyNpcFirstName={nearby?.npc.nome.split(' ')[0]}
              nearCafeteria={nearCafeteria}
              nearbyCafeteriaNpcFirstName={nearbyCafeteriaNpc?.nome.split(' ')[0]}
              hasActiveProblem={Boolean(activeProblem)}
              isAtTargetSector={isAtTarget}
              onOpenHardwareWorkbench={onOpenHardwareWorkbench}
              onOpenVirtualOS={onOpenVirtualOS}
              onOpenCafeteria={onOpenCafeteria}
              onTalkToCafeteriaNpc={() =>
                onTalkToCafeteriaNpc(nearbyCafeteriaNpc || CAFETERIA_NPCS[1])
              }
            />
          )}

        {inputMode === 'keyboard_mouse' &&
          currentLocation === 'home' && (
            <div className="pointer-events-auto bg-[#0b111e]/92 border border-slate-800 rounded-2xl px-3.5 py-2 shadow-2xl flex flex-wrap items-center justify-center gap-2">
              {nearHomeBed && (
                <button
                  type="button"
                  data-testid="hud-sleep-bed-btn"
                  onClick={onSleepInHomeBed}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <BedDouble className="w-4 h-4" />
                  {hasSleptAtHome
                    ? 'Dormir Novamente na Cama (100% Energia) [E]'
                    : 'Dormir na Cama · Recuperar 100% Energia [E]'}
                </button>
              )}
              <button
                type="button"
                onClick={onOpenHomeShop}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Comprar Móveis para Casa [E]
              </button>
              {nearHomeDoor && (
                <button
                  type="button"
                  data-testid="hud-door-return-office-btn"
                  onClick={onReturnToOffice}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md ${
                    hasSleptAtHome
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {hasSleptAtHome ? (
                    <>
                      <Sun className="w-3.5 h-3.5" />
                      Sair pela Porta · Novo Dia no Escritório [E]
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Porta Trancada · Vá Dormir na Cama Primeiro
                    </>
                  )}
                </button>
              )}
            </div>
          )}

        {inputMode === 'keyboard_mouse' &&
          currentLocation === 'office' &&
          !resolvedModalData &&
          !activeDialogueNpc &&
          !activeCafeteriaDialogue &&
          (nearCafeteria || nearby) && (
            <div className="pointer-events-auto bg-[#0b111e]/92 border border-slate-800 rounded-2xl px-3.5 py-2 shadow-2xl flex items-center gap-2">
              {nearCafeteria && (
                <>
                  <button
                    type="button"
                    onClick={onOpenCafeteria}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    Balcão de Cafés [E]
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onTalkToCafeteriaNpc(nearbyCafeteriaNpc || CAFETERIA_NPCS[1])
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {nearbyCafeteriaNpc
                      ? `Conversar com ${nearbyCafeteriaNpc.nome.split(' ')[0]} [E]`
                      : 'Conversar na Cafeteria'}
                  </button>
                </>
              )}

              {!nearCafeteria && nearby && (
                <button
                  type="button"
                  onClick={() => onOpenNpcDialogue(nearby)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  Falar com {nearby.npc.nome.split(' ')[0]} [E]
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  );
};
