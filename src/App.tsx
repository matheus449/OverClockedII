/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ALL_NPCS,
  ALL_SECTORS,
  applyDiagnosticAction,
  createInitialWorkstationState,
  DiagnosticAction,
  DifficultyLevel,
  NpcData,
  pickNextProblem,
  ProblemData,
  WorkstationState,
} from './problems/validator';
import { loadSaveData, saveGameData } from './persistence/storage';
import { soundEngine } from './audio/soundEngine';
import {
  BackgroundVoiceDownloadStatus,
  buildHelenaWelcomeSpeech,
  voiceNarrator,
} from './audio/voiceNarrator';
import {
  applyErrorPenalty,
  calculateTicketReward,
  computeNextTicketDelaySeconds,
  getMaxSimultaneousTickets,
  PlayerCustomization,
  TicketScoreBreakdown,
} from './progression/progressionSystem';
import { OfficeSceneView } from './engine/OfficeSceneView';
import { TitleScreenOverlay } from './ui/TitleScreenOverlay';
import { LoadingVoiceOverlay } from './ui/LoadingVoiceOverlay';
import { StoryIntroOverlay } from './ui/StoryIntroOverlay';
import { HudOverlay } from './ui/HudOverlay';
import { HardwareWorkbenchModal } from './hardware/HardwareWorkbenchModal';
import { VirtualOSModal } from './virtualOS/VirtualOSModal';
import { PauseSettingsModal } from './ui/PauseSettingsModal';
import { CharacterCustomizationModal } from './ui/CharacterCustomizationModal';
import { CafeteriaModal } from './ui/CafeteriaModal';
import { CreditsModal } from './ui/CreditsModal';
import { NearbyInteraction } from './player/collision';
import { Vec2 } from './pathfinding/trail';
import {
  applyErrorEnergyDrain,
  applySleepOnJobPenalty,
  applyTicketEnergyDrain,
  CafeteriaNpc,
  CoffeeItem,
  isLowEnergyWarning,
  pickRandomCafeteriaChat,
  purchaseAndDrinkCoffee,
  shouldTriggerLowEnergyAlert,
} from './cafeteria/cafeteriaSystem';
import { AlertTriangle, Coffee, Loader2, Moon } from 'lucide-react';

type GameState = 'title' | 'loading' | 'story' | 'playing' | 'paused' | 'gameover';

export default function App() {
  const initialSave = loadSaveData();

  const [gameState, setGameState] = useState<GameState>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return 'playing';
    if (params.get('story') === '1') return 'story';
    return 'title';
  });

  const [playerName, setPlayerName] = useState<string>(initialSave.playerName);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialSave.difficulty);
  const [musicVolume, setMusicVolume] = useState<number>(initialSave.musicVolume);
  const [sfxVolume, setSfxVolume] = useState<number>(initialSave.sfxVolume);
  const [muted, setMuted] = useState<boolean>(initialSave.muted);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(initialSave.voiceEnabled);

  const [resolvedCount, setResolvedCount] = useState<number>(initialSave.resolvedCount);
  const [points, setPoints] = useState<number>(initialSave.points);
  const [energy, setEnergy] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const paramEnergy = params.get('energy');
    if (paramEnergy !== null && !Number.isNaN(Number(paramEnergy))) {
      return Math.max(0, Math.min(100, Number(paramEnergy)));
    }
    return initialSave.energy ?? 100;
  });
  const [lowEnergyAlertOpen, setLowEnergyAlertOpen] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    const paramEnergy = params.get('energy');
    const startEnergy =
      paramEnergy !== null && !Number.isNaN(Number(paramEnergy))
        ? Number(paramEnergy)
        : initialSave.energy ?? 100;
    return isLowEnergyWarning(startEnergy);
  });
  const [isSleepingBlackout, setIsSleepingBlackout] = useState<boolean>(false);
  const [sleepPenaltyNotice, setSleepPenaltyNotice] = useState<{
    penalty: number;
    nextPoints: number;
    recoveredEnergy: number;
    message: string;
  } | null>(null);
  const [bgVoiceStatus, setBgVoiceStatus] = useState<BackgroundVoiceDownloadStatus>(() =>
    voiceNarrator.getBackgroundDownloadStatus()
  );

  const [unlockedMedals, setUnlockedMedals] = useState<string[]>(initialSave.unlockedMedals);
  const [playerCustomization, setPlayerCustomization] = useState<PlayerCustomization>(
    initialSave.playerCustomization
  );
  const [showCustomizationModal, setShowCustomizationModal] = useState<boolean>(false);
  const [showCreditsModal, setShowCreditsModal] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('credits') === '1';
  });
  const [recentIds, setRecentIds] = useState<string[]>(initialSave.recentProblemIds);

  // Ticket Queue & Per-Ticket Workstation States
  const [initialProblem] = useState<ProblemData>(() =>
    pickNextProblem(initialSave.difficulty, null, initialSave.recentProblemIds)
  );
  const [ticketQueue, setTicketQueue] = useState<ProblemData[]>([initialProblem]);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(initialProblem.id);
  const [workstationMap, setWorkstationMap] = useState<Record<string, WorkstationState>>(() => ({
    [initialProblem.id]: createInitialWorkstationState(initialProblem),
  }));

  // Varied Ticket Interval & Rush Hour (Horário de Pico on Hard Difficulty)
  const [isRushHour, setIsRushHour] = useState<boolean>(initialSave.difficulty === 'dificil');
  const [rushHourRemaining, setRushHourRemaining] = useState<number>(
    initialSave.difficulty === 'dificil' ? 75 : 0
  );
  const [nextTicketCountdown, setNextTicketCountdown] = useState<number>(() =>
    computeNextTicketDelaySeconds(initialSave.difficulty, initialSave.difficulty === 'dificil')
  );

  const activeProblem: ProblemData | null =
    ticketQueue.find((p) => p.id === selectedProblemId) || ticketQueue[0] || null;
  const activeWorkstationState: WorkstationState | null = activeProblem
    ? workstationMap[activeProblem.id] || createInitialWorkstationState(activeProblem)
    : null;

  const [currentSectorName, setCurrentSectorName] = useState<string>('Corredor Principal');
  const [nearby, setNearby] = useState<NearbyInteraction | null>(null);
  const [nearCafeteria, setNearCafeteria] = useState<boolean>(false);
  const [nearbyCafeteriaNpc, setNearbyCafeteriaNpc] = useState<CafeteriaNpc | null>(null);
  const [activeCafeteriaDialogue, setActiveCafeteriaDialogue] = useState<{
    npc: CafeteriaNpc;
    message: string;
  } | null>(null);
  const [activeDialogueNpc, setActiveDialogueNpc] = useState<NpcData | null>(null);
  const [activeToolModal, setActiveToolModal] = useState<
    'none' | 'hardware' | 'virtualos' | 'cafeteria'
  >('none');
  const [lastDiagnosticMessage, setLastDiagnosticMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [resolvedModalData, setResolvedModalData] = useState<{
    problem: ProblemData;
    npc: NpcData;
    reward?: TicketScoreBreakdown;
  } | null>(null);
  const [npcEmotionOverride, setNpcEmotionOverride] = useState<{
    npcId: string;
    emotion: 'neutral' | 'waiting' | 'satisfied' | 'annoyed';
  } | null>(null);

  const [autoWalkTarget, setAutoWalkTarget] = useState<Vec2 | null>(null);
  const [cameraZoom, setCameraZoom] = useState<number>(1.0);

  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  useEffect(() => {
    return voiceNarrator.onBackgroundDownloadChange((status) => {
      setBgVoiceStatus(status);
    });
  }, []);

  useEffect(() => {
    soundEngine.setMusicVolume(musicVolume);
    soundEngine.setSfxVolume(sfxVolume);
    soundEngine.setMuted(muted);
    voiceNarrator.setMuted(muted);
  }, [musicVolume, sfxVolume, muted]);

  useEffect(() => {
    voiceNarrator.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  // Pre-warm Helena's welcome speech and initial ticket in the background while on the Title Screen!
  useEffect(() => {
    if (!voiceEnabled || !activeProblem) return;
    if (gameState === 'title') {
      const targetSector =
        ALL_SECTORS.find((s) => s.id === activeProblem.setor) || ALL_SECTORS[0];
      const targetNpc =
        ALL_NPCS.find((n) => n.id === activeProblem.npc) || ALL_NPCS[0];
      const helenaSpeech = buildHelenaWelcomeSpeech(
        playerName,
        targetSector.nome,
        targetNpc.nome
      );
      voiceNarrator.startBackgroundVoiceDownload([
        {
          id: 'helena_warmup',
          label: 'Helena Vasconcelos · Boas-vindas',
          text: helenaSpeech,
          npcId: 'npc_mariana',
          npcName: 'Helena Vasconcelos',
        },
      ]);
      voiceNarrator.preloadTicketsInBackground(ticketQueue, ALL_NPCS);
    } else if (gameState === 'playing' || gameState === 'story') {
      voiceNarrator.preloadTicketsInBackground(ticketQueue, ALL_NPCS);
    }
  }, [ticketQueue, voiceEnabled, gameState, activeProblem, playerName]);

  // Auto-dismiss the "Tudo funcionando em ordem por aqui..." speech card after 3.2 seconds
  useEffect(() => {
    if (!activeDialogueNpc) return;
    const hasTicketInSector = ticketQueue.some((p) => p.setor === activeDialogueNpc.setor);
    if (!hasTicketInSector) {
      const timer = window.setTimeout(() => {
        setActiveDialogueNpc(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [activeDialogueNpc, ticketQueue]);

  // Enqueue a brand new ticket into ticketQueue (avoiding duplicate sectors already in queue)
  const enqueueNewTicket = useCallback(
    (diff: DifficultyLevel, rush: boolean) => {
      setTicketQueue((prevQueue) => {
        const maxAllowed = getMaxSimultaneousTickets(diff, rush);
        if (prevQueue.length >= maxAllowed) return prevQueue;

        const busySectors = new Set(prevQueue.map((p) => p.setor));
        const excludeIds = [...recentIds, ...prevQueue.map((p) => p.id)];
        let candidate = pickNextProblem(
          diff,
          prevQueue[prevQueue.length - 1]?.id || null,
          excludeIds
        );
        for (let attempt = 0; attempt < 6; attempt++) {
          if (!busySectors.has(candidate.setor)) break;
          candidate = pickNextProblem(diff, candidate.id, [...excludeIds, candidate.id]);
        }

        setWorkstationMap((prevMap) => ({
          ...prevMap,
          [candidate.id]: createInitialWorkstationState(candidate),
        }));

        if (prevQueue.length === 0) {
          setSelectedProblemId(candidate.id);
        }

        soundEngine.playNotification();
        return [...prevQueue, candidate];
      });
    },
    [recentIds]
  );

  // Triggers the 2-second pure black screen ("dormiu no serviço") when energy hits 0%, deducting points
  const triggerSleepOnJobBlackout = useCallback(
    (basePoints: number) => {
      setIsSleepingBlackout(true);
      setLowEnergyAlertOpen(false);
      setActiveToolModal('none');
      setAutoWalkTarget(null);
      voiceNarrator.stop();
      soundEngine.playError();

      window.setTimeout(() => {
        const sleepRes = applySleepOnJobPenalty(basePoints, difficulty);
        setIsSleepingBlackout(false);
        setPoints(sleepRes.nextPoints);
        setEnergy(sleepRes.recoveredEnergy);
        setSleepPenaltyNotice(sleepRes);
        saveGameData({
          points: sleepRes.nextPoints,
          energy: sleepRes.recoveredEnergy,
        });
        soundEngine.playNotification();
      }, 2000);
    },
    [difficulty]
  );

  // Centralized helper whenever energy changes from tickets, errors, or shift fatigue
  const applyEnergyChange = useCallback(
    (prevEnergy: number, rawNextEnergy: number, basePoints: number) => {
      const clamped = Math.max(0, Math.min(100, rawNextEnergy));
      if (clamped <= 0) {
        setEnergy(0);
        triggerSleepOnJobBlackout(basePoints);
        return 0;
      }
      setEnergy(clamped);
      saveGameData({ points: basePoints, energy: clamped });
      if (shouldTriggerLowEnergyAlert(prevEnergy, clamped)) {
        soundEngine.playError();
        setLowEnergyAlertOpen(true);
      }
      return clamped;
    },
    [triggerSleepOnJobBlackout]
  );

  // If started directly at 0% energy (e.g. via URL param or saved 0% state), trigger the 2s blackout
  useEffect(() => {
    if (gameState === 'playing' && energy <= 0 && !isSleepingBlackout && !sleepPenaltyNotice) {
      triggerSleepOnJobBlackout(points);
    }
  }, [gameState, energy, isSleepingBlackout, sleepPenaltyNotice, points, triggerSleepOnJobBlackout]);

  // Varied Ticket Pacing, Rush Hour Timer & Gradual Shift Energy Drain (ticks every 1s during playing)
  useEffect(() => {
    if (
      gameState !== 'playing' ||
      resolvedModalData ||
      showCustomizationModal ||
      isSleepingBlackout
    ) {
      return;
    }

    let shiftSecondsCounter = 0;
    const timer = window.setInterval(() => {
      shiftSecondsCounter++;

      // Gradual shift exertion: drain 1% energy every 8 seconds when not inside the Cafeteria modal
      if (shiftSecondsCounter % 8 === 0 && activeToolModal !== 'cafeteria') {
        setEnergy((prevEnergy) => {
          if (prevEnergy <= 0) return 0;
          const nextE = Math.max(0, prevEnergy - 1);
          if (nextE <= 0) {
            triggerSleepOnJobBlackout(points);
            return 0;
          }
          if (shouldTriggerLowEnergyAlert(prevEnergy, nextE)) {
            soundEngine.playError();
            setLowEnergyAlertOpen(true);
          }
          saveGameData({ energy: nextE });
          return nextE;
        });
      }

      if (difficulty === 'dificil') {
        setRushHourRemaining((prevRem) => {
          if (prevRem > 1) return prevRem - 1;
          setIsRushHour((prevRush) => !prevRush);
          return isRushHour ? 25 : 75;
        });
      } else {
        if (isRushHour) setIsRushHour(false);
      }

      const maxSimultaneous = getMaxSimultaneousTickets(difficulty, isRushHour);
      const shouldTickForNext =
        ticketQueue.length === 0 || (isRushHour && ticketQueue.length < maxSimultaneous);

      if (shouldTickForNext) {
        setNextTicketCountdown((prev) => {
          if (prev <= 1) {
            enqueueNewTicket(difficulty, isRushHour);
            return computeNextTicketDelaySeconds(difficulty, isRushHour);
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    gameState,
    resolvedModalData,
    showCustomizationModal,
    isSleepingBlackout,
    activeToolModal,
    points,
    difficulty,
    isRushHour,
    ticketQueue.length,
    enqueueNewTicket,
    triggerSleepOnJobBlackout,
  ]);

  const resetWithRandomTicket = useCallback(
    (diff: DifficultyLevel) => {
      const nextProb = pickNextProblem(diff, activeProblem?.id || null, recentIds);
      setTicketQueue([nextProb]);
      setSelectedProblemId(nextProb.id);
      setWorkstationMap({
        [nextProb.id]: createInitialWorkstationState(nextProb),
      });
      const rush = diff === 'dificil';
      setIsRushHour(rush);
      setRushHourRemaining(rush ? 75 : 0);
      setNextTicketCountdown(computeNextTicketDelaySeconds(diff, rush));
      setLastDiagnosticMessage(null);
      setResolvedModalData(null);
      setActiveToolModal('none');
      setActiveDialogueNpc(null);
    },
    [activeProblem?.id, recentIds]
  );

  // Clicking "Iniciar" on Title Screen randomly draws a first ticket and opens the Story screen immediately
  const handleOpenStoryIntro = useCallback(() => {
    setShowCustomizationModal(false);
    resetWithRandomTicket(difficulty);
    setGameState('story');
    soundEngine.startAmbientMusic();
    soundEngine.playInteract();
  }, [difficulty, resetWithRandomTicket]);

  const handleFinishVoiceLoading = useCallback(() => {
    setGameState('story');
  }, []);

  const handleBeginShiftFromStory = useCallback(() => {
    setGameState('playing');
    soundEngine.playNotification();
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea';

      if (
        gameState === 'title' &&
        !showCustomizationModal &&
        !showCreditsModal &&
        !isTyping &&
        (e.code === 'Enter' || e.code === 'Space')
      ) {
        e.preventDefault();
        handleOpenStoryIntro();
        return;
      }

      if (
        gameState === 'story' &&
        !showCustomizationModal &&
        !showCreditsModal &&
        (e.code === 'Enter' || e.code === 'Space')
      ) {
        e.preventDefault();
        handleBeginShiftFromStory();
        return;
      }

      if (e.code === 'Escape') {
        e.preventDefault();
        if (showCreditsModal) {
          setShowCreditsModal(false);
          return;
        }
        if (showCustomizationModal) {
          setShowCustomizationModal(false);
          return;
        }
        if (activeToolModal !== 'none') {
          setActiveToolModal('none');
          return;
        }
        if (activeDialogueNpc) {
          voiceNarrator.stop();
          setActiveDialogueNpc(null);
          return;
        }
        setGameState((prev) =>
          prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev
        );
      } else if (e.code === 'KeyP' && activeToolModal === 'none' && !showCustomizationModal && !isTyping) {
        setGameState((prev) =>
          prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev
        );
      } else if (e.code === 'KeyM' && activeToolModal === 'none' && !isTyping) {
        setMuted((m) => {
          const next = !m;
          saveGameData({ muted: next });
          return next;
        });
      } else if (
        e.code === 'KeyV' &&
        gameState === 'playing' &&
        activeToolModal === 'none' &&
        !showCustomizationModal &&
        !isTyping
      ) {
        setCameraZoom((z) => (z >= 1.9 ? 1.0 : 2.1));
      } else if (e.code === 'KeyC' && activeToolModal === 'none' && !isTyping) {
        setShowCustomizationModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameState,
    activeToolModal,
    activeDialogueNpc,
    showCustomizationModal,
    showCreditsModal,
    handleOpenStoryIntro,
    handleBeginShiftFromStory,
  ]);

  const handleSelectDifficulty = (d: DifficultyLevel) => {
    setDifficulty(d);
    saveGameData({ difficulty: d });
    resetWithRandomTicket(d);
  };

  const handleNearbyChange = useCallback(
    (
      nextNearby: NearbyInteraction | null,
      sectorName: string,
      isNearCaf: boolean,
      nextCafeNpc: CafeteriaNpc | null
    ) => {
      setNearby(nextNearby);
      setCurrentSectorName(sectorName);
      setNearCafeteria(isNearCaf);
      setNearbyCafeteriaNpc(nextCafeNpc);
      if (!isNearCaf) {
        setActiveCafeteriaDialogue((prev) => {
          if (prev) voiceNarrator.stop();
          return null;
        });
      }
      setActiveDialogueNpc((prevNpc) => {
        if (!prevNpc) return null;
        if (!nextNearby || nextNearby.npc.id !== prevNpc.id) {
          voiceNarrator.stop();
          return null;
        }
        return prevNpc;
      });
    },
    []
  );

  const handleTalkToCafeteriaNpc = useCallback(
    (npc: CafeteriaNpc) => {
      soundEngine.playInteract();
      setAutoWalkTarget({
        x: npc.pos.x,
        z: Math.min(2.8, npc.pos.z + 0.9),
      });
      setActiveCafeteriaDialogue((prev) => {
        const line = pickRandomCafeteriaChat(
          npc,
          prev?.npc.id === npc.id ? prev.message : undefined
        );
        if (voiceEnabled) {
          voiceNarrator.speakProblem(line, {
            npcId: npc.id,
            npcName: npc.nome,
          });
        }
        return { npc, message: line };
      });
    },
    [voiceEnabled]
  );

  const openNpcDialogueWithVoice = useCallback(
    (npc: NpcData) => {
      soundEngine.playInteract();
      setActiveDialogueNpc(npc);

      const matchingTicket = ticketQueue.find((p) => p.setor === npc.setor);
      if (matchingTicket) {
        setSelectedProblemId(matchingTicket.id);
        voiceNarrator.speakProblem(matchingTicket.falaNpc, {
          npcId: npc.id,
          npcName: npc.nome,
        });
      } else {
        voiceNarrator.speakProblem(
          'Tudo funcionando em ordem por aqui no meu setor, obrigado por passar!',
          {
            npcId: npc.id,
            npcName: npc.nome,
          }
        );
      }
    },
    [ticketQueue]
  );

  const handleInteractRequest = useCallback(
    (targetNearby: NearbyInteraction) => {
      openNpcDialogueWithVoice(targetNearby.npc);
    },
    [openNpcDialogueWithVoice]
  );

  const handleExecuteDiagnosticAction = (action: DiagnosticAction) => {
    if (!activeProblem || !activeWorkstationState) return;
    const result = applyDiagnosticAction(activeWorkstationState, activeProblem, action);
    setWorkstationMap((prev) => ({
      ...prev,
      [activeProblem.id]: result.nextState,
    }));

    if (!result.success) {
      soundEngine.playError();
      // Deduct points on wrong diagnostic action! Can go negative ("ficar devendo pontos")
      const { penalty, nextPoints } = applyErrorPenalty(points, difficulty);
      const rawNextEnergy = applyErrorEnergyDrain(energy);
      setPoints(nextPoints);
      const finalEnergy = applyEnergyChange(energy, rawNextEnergy, nextPoints);

      setLastDiagnosticMessage({
        text: `${result.message} (-${penalty} pts · Saldo: ${nextPoints} pts${
          nextPoints < 0 ? ' [DEVENDO]' : ''
        } · Energia: ${finalEnergy}%)`,
        isError: true,
      });

      if (result.nextState.errorCount >= 2) {
        setNpcEmotionOverride({ npcId: activeProblem.npc, emotion: 'annoyed' });
      }
      return;
    }

    setLastDiagnosticMessage({
      text: result.message,
      isError: false,
    });
    soundEngine.playHardwareAction();

    if (result.isResolved) {
      soundEngine.playSuccess();
      const targetNpc =
        ALL_NPCS.find((n) => n.id === activeProblem.npc) || ALL_NPCS[0];
      const nextCount = resolvedCount + 1;
      const nextRecent = [...recentIds.slice(-14), activeProblem.id];

      const reward = calculateTicketReward({
        difficulty,
        categoria: activeProblem.categoria,
        errorCount: result.nextState.errorCount,
        isRushHour,
        currentPoints: points,
        resolvedCountAfter: nextCount,
        unlockedMedals,
      });

      const nextPoints = points + reward.totalEarned;
      const rawNextEnergy = applyTicketEnergyDrain(energy, difficulty);
      const nextMedals = [
        ...unlockedMedals,
        ...reward.newlyUnlockedMedals.map((m) => m.id),
      ];

      setResolvedCount(nextCount);
      setPoints(nextPoints);
      setUnlockedMedals(nextMedals);
      setRecentIds(nextRecent);
      saveGameData({
        resolvedCount: nextCount,
        points: nextPoints,
        energy: rawNextEnergy,
        unlockedMedals: nextMedals,
        recentProblemIds: nextRecent,
      });

      const remainingQueue = ticketQueue.filter((p) => p.id !== activeProblem.id);
      setTicketQueue(remainingQueue);
      setSelectedProblemId(remainingQueue[0]?.id || null);

      if (remainingQueue.length === 0) {
        setNextTicketCountdown(computeNextTicketDelaySeconds(difficulty, isRushHour));
      }

      setNpcEmotionOverride({ npcId: activeProblem.npc, emotion: 'satisfied' });
      setActiveToolModal('none');
      setActiveDialogueNpc(null);
      setAutoWalkTarget(null);

      // Apply energy drain (triggers 20% warning or 0% 2s blackout if energy hits 0%)
      const finalEnergy = applyEnergyChange(energy, rawNextEnergy, nextPoints);

      if (finalEnergy > 0) {
        setResolvedModalData({
          problem: activeProblem,
          npc: targetNpc,
          reward,
        });

        voiceNarrator.speakProblem(activeProblem.agradecimentoNpc, {
          npcId: targetNpc.id,
          npcName: targetNpc.nome,
        });
      }
    }
  };

  const handleWalkToActiveTicket = () => {
    if (!activeProblem) return;
    const sec = ALL_SECTORS.find((s) => s.id === activeProblem.setor);
    if (!sec) return;
    const npc = ALL_NPCS.find((n) => n.id === activeProblem.npc);
    const offsetZ = Math.abs(sec.pcPos.rotY) > 1.5 ? -1.25 : 1.25;
    setAutoWalkTarget({
      x: sec.pcPos.x,
      z: sec.pcPos.z + offsetZ,
    });
    if (npc) {
      openNpcDialogueWithVoice(npc);
    }
  };

  const handleWalkToCafeteria = () => {
    soundEngine.playInteract();
    // Only walks the player into the Cafeteria OverCoffee room (never opens the modal remotely!)
    setAutoWalkTarget({ x: 5.25, z: 0.2 });
  };

  const handleDrinkCoffee = (coffee: CoffeeItem) => {
    const res = purchaseAndDrinkCoffee(
      energy,
      points,
      coffee,
      difficulty,
      resolvedCount
    );
    if (res.success) {
      setPoints(res.nextPoints);
      setEnergy(res.nextEnergy);
      if (res.nextEnergy > 20) {
        setLowEnergyAlertOpen(false);
      }
      saveGameData({ points: res.nextPoints, energy: res.nextEnergy });
    }
    return { ok: res.success, reason: res.message };
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none">
      {/* Persistent 3D Isometric Office Viewport */}
      <OfficeSceneView
        gameState={gameState}
        activeProblem={resolvedModalData ? null : activeProblem}
        queuedSectorIds={ticketQueue.map((p) => p.setor)}
        playerCustomization={playerCustomization}
        autoWalkTarget={autoWalkTarget}
        onClearAutoWalk={() => setAutoWalkTarget(null)}
        onTapFloorWalk={(target) => {
          if (
            activeToolModal !== 'none' ||
            showCustomizationModal ||
            showCreditsModal ||
            resolvedModalData ||
            lowEnergyAlertOpen ||
            sleepPenaltyNotice
          ) {
            return;
          }
          setAutoWalkTarget(target);
        }}
        onNearbyChange={handleNearbyChange}
        onInteractRequest={handleInteractRequest}
        onOpenCafeteriaRequest={() => {
          soundEngine.playInteract();
          setActiveToolModal('cafeteria');
        }}
        onTalkToCafeteriaNpcRequest={handleTalkToCafeteriaNpc}
        npcEmotionOverride={npcEmotionOverride}
        cameraZoom={cameraZoom}
        onWheelZoom={(delta) =>
          setCameraZoom((z) =>
            Math.max(0.75, Math.min(2.2, Number((z + delta).toFixed(2))))
          )
        }
        onSetZoom={(nextZoom) => setCameraZoom(nextZoom)}
      />

      {/* Clean Title Screen Overlay */}
      {gameState === 'title' && !showCustomizationModal && !showCreditsModal && (
        <TitleScreenOverlay
          playerName={playerName}
          difficulty={difficulty}
          voiceEnabled={voiceEnabled}
          playerCustomization={playerCustomization}
          onChangePlayerName={(name) => {
            setPlayerName(name);
            saveGameData({ playerName: name });
          }}
          onSelectDifficulty={handleSelectDifficulty}
          onToggleVoiceEnabled={() => {
            const next = !voiceEnabled;
            setVoiceEnabled(next);
            saveGameData({ voiceEnabled: next });
          }}
          onChangeGender={(genero) => {
            const next = { ...playerCustomization, genero };
            setPlayerCustomization(next);
            saveGameData({ playerCustomization: next });
          }}
          onOpenCustomization={() => setShowCustomizationModal(true)}
          onOpenCredits={() => {
            soundEngine.playInteract();
            setShowCreditsModal(true);
          }}
          onStartGame={handleOpenStoryIntro}
        />
      )}

      {/* Voice & Dialogue Preloading Screen */}
      {gameState === 'loading' && activeProblem && !showCustomizationModal && (
        <LoadingVoiceOverlay
          playerName={playerName}
          difficulty={difficulty}
          firstProblem={activeProblem}
          ticketQueue={ticketQueue}
          onFinishLoading={handleFinishVoiceLoading}
        />
      )}

      {/* Storytelling Intro Sequence with Manager Helena Vasconcelos */}
      {gameState === 'story' && activeProblem && !showCustomizationModal && (
        <StoryIntroOverlay
          playerName={playerName}
          firstProblem={activeProblem}
          voiceEnabled={voiceEnabled}
          onRerollFirstProblem={() => {
            soundEngine.playInteract();
            resetWithRandomTicket(difficulty);
          }}
          onBeginShift={handleBeginShiftFromStory}
        />
      )}

      {/* Non-Intrusive Background Voice Download Pill ("em segundo plano") */}
      {voiceEnabled &&
        bgVoiceStatus.active &&
        (gameState === 'story' || gameState === 'playing') &&
        !isSleepingBlackout && (
          <div
            aria-live="polite"
            className="fixed bottom-16 left-4 z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-slate-950/90 border border-sky-500/35 text-[11px] font-semibold text-sky-300 flex items-center gap-2 shadow-lg backdrop-blur-sm"
          >
            <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" />
            <span>
              Baixando vozes em 2º plano ({bgVoiceStatus.percent}%)...
            </span>
          </div>
        )}

      {/* Playing HUD Overlay */}
      {gameState === 'playing' && (
        <HudOverlay
          activeProblem={activeProblem}
          ticketQueue={ticketQueue}
          nextTicketCountdown={nextTicketCountdown}
          isRushHour={isRushHour}
          rushHourRemaining={rushHourRemaining}
          currentSectorName={currentSectorName}
          nearby={nearby}
          nearCafeteria={nearCafeteria}
          nearbyCafeteriaNpc={nearbyCafeteriaNpc}
          activeCafeteriaDialogue={activeCafeteriaDialogue}
          activeDialogueNpc={activeDialogueNpc}
          resolvedModalData={resolvedModalData}
          resolvedCount={resolvedCount}
          points={points}
          energy={energy}
          unlockedMedalsCount={unlockedMedals.length}
          difficulty={difficulty}
          muted={muted}
          voiceEnabled={voiceEnabled}
          cameraZoom={cameraZoom}
          onSelectQueuedTicket={(probId) => {
            setSelectedProblemId(probId);
            setLastDiagnosticMessage(null);
          }}
          onSkipTicketWait={() => {
            enqueueNewTicket(difficulty, isRushHour);
            setNextTicketCountdown(computeNextTicketDelaySeconds(difficulty, isRushHour));
          }}
          onToggleMute={() => {
            const next = !muted;
            setMuted(next);
            saveGameData({ muted: next });
          }}
          onToggleVoiceEnabled={() => {
            const next = !voiceEnabled;
            setVoiceEnabled(next);
            saveGameData({ voiceEnabled: next });
          }}
          onReplayVoice={(text, npc) => {
            voiceNarrator.speakProblem(text, {
              npcId: npc.id,
              npcName: npc.nome,
              force: true,
            });
          }}
          onOpenCustomization={() => setShowCustomizationModal(true)}
          onOpenCafeteria={() => {
            if (!nearCafeteria) {
              handleWalkToCafeteria();
              return;
            }
            soundEngine.playInteract();
            setActiveToolModal('cafeteria');
          }}
          onWalkToCafeteria={handleWalkToCafeteria}
          onTalkToCafeteriaNpc={handleTalkToCafeteriaNpc}
          onCloseCafeteriaDialogue={() => {
            voiceNarrator.stop();
            setActiveCafeteriaDialogue(null);
          }}
          onCycleCameraZoom={() =>
            setCameraZoom((z) => (z < 0.9 ? 1.0 : z < 1.8 ? 2.1 : 0.8))
          }
          onToggleFullMap={() => setCameraZoom((z) => (z >= 1.9 ? 1.0 : 2.1))}
          onOpenPause={() => setGameState('paused')}
          onWalkToActiveTicket={handleWalkToActiveTicket}
          onOpenNpcDialogue={(n) => openNpcDialogueWithVoice(n.npc)}
          onCloseNpcDialogue={() => {
            voiceNarrator.stop();
            setActiveDialogueNpc(null);
          }}
          onOpenHardwareWorkbench={() => {
            soundEngine.playInteract();
            setActiveToolModal('hardware');
          }}
          onOpenVirtualOS={() => {
            soundEngine.playInteract();
            setActiveToolModal('virtualos');
          }}
          onNextTicketAfterResolve={() => {
            voiceNarrator.stop();
            setResolvedModalData(null);
          }}
        />
      )}

      {/* Interactive 3D/Tactile Hardware Workbench Modal */}
      {gameState === 'playing' &&
        activeToolModal === 'hardware' &&
        activeProblem &&
        activeWorkstationState && (
          <HardwareWorkbenchModal
            problem={activeProblem}
            state={activeWorkstationState}
            lastMessage={lastDiagnosticMessage}
            difficulty={difficulty}
            onExecuteAction={handleExecuteDiagnosticAction}
            onSwitchToVirtualOS={() => setActiveToolModal('virtualos')}
            onClose={() => setActiveToolModal('none')}
          />
        )}

      {/* Interactive Virtual OS (OverOS) Modal */}
      {gameState === 'playing' &&
        activeToolModal === 'virtualos' &&
        activeProblem &&
        activeWorkstationState && (
          <VirtualOSModal
            problem={activeProblem}
            state={activeWorkstationState}
            lastMessage={lastDiagnosticMessage}
            difficulty={difficulty}
            onExecuteAction={handleExecuteDiagnosticAction}
            onSwitchToHardware={() => setActiveToolModal('hardware')}
            onClose={() => setActiveToolModal('none')}
          />
        )}

      {/* Cafeteria OverCoffee Modal (Only accessible when physically inside the Cafeteria space!) */}
      {gameState === 'playing' && activeToolModal === 'cafeteria' && nearCafeteria && (
        <CafeteriaModal
          energy={energy}
          points={points}
          difficulty={difficulty}
          resolvedCount={resolvedCount}
          voiceEnabled={voiceEnabled}
          onDrinkCoffee={handleDrinkCoffee}
          onTalkToNpcInRoom={handleTalkToCafeteriaNpc}
          onClose={() => {
            voiceNarrator.stop();
            setActiveToolModal('none');
          }}
        />
      )}

      {/* Character Customization, Wardrobe (16 Outfits & 21 Accessories) and Medals Modal */}
      {showCustomizationModal && (
        <CharacterCustomizationModal
          playerName={playerName}
          customization={playerCustomization}
          points={points}
          resolvedCount={resolvedCount}
          difficulty={difficulty}
          unlockedMedals={unlockedMedals}
          onChangeCustomization={(next) => {
            soundEngine.playInteract();
            setPlayerCustomization(next);
            saveGameData({ playerCustomization: next });
          }}
          onClose={() => setShowCustomizationModal(false)}
        />
      )}

      {/* Pause & Settings Modal */}
      {(gameState === 'paused' || gameState === 'gameover') &&
        !showCustomizationModal &&
        !showCreditsModal && (
          <PauseSettingsModal
            mode={gameState}
            difficulty={difficulty}
            musicVolume={musicVolume}
            sfxVolume={sfxVolume}
            voiceEnabled={voiceEnabled}
            resolvedCount={resolvedCount}
            points={points}
            unlockedMedalsCount={unlockedMedals.length}
            onChangeDifficulty={handleSelectDifficulty}
            onChangeMusicVolume={(v) => {
              setMusicVolume(v);
              saveGameData({ musicVolume: v });
            }}
            onChangeSfxVolume={(v) => {
              setSfxVolume(v);
              saveGameData({ sfxVolume: v });
            }}
            onToggleVoiceEnabled={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              saveGameData({ voiceEnabled: next });
            }}
            onOpenCustomization={() => setShowCustomizationModal(true)}
            onOpenCredits={() => {
              soundEngine.playInteract();
              setShowCreditsModal(true);
            }}
            onResume={() => setGameState('playing')}
            onRestartShift={() => {
              resetWithRandomTicket(difficulty);
              setGameState('playing');
            }}
            onReturnToTitle={() => {
              soundEngine.stopAmbientMusic();
              voiceNarrator.stop();
              setGameState('title');
            }}
          />
        )}

      {/* Official Credits & Brand Showcase Modal */}
      {showCreditsModal && (
        <CreditsModal
          onClose={() => {
            soundEngine.playInteract();
            setShowCreditsModal(false);
          }}
        />
      )}

      {/* 20% Low Energy Alert Modal ("quando a energia do jogador chegar em 20% deve ser mostrado uma mensagem pra ele informando que a energia esta baixa") */}
      {gameState === 'playing' &&
        lowEnergyAlertOpen &&
        energy <= 20 &&
        energy > 0 &&
        !isSleepingBlackout && (
          <div
            role="alertdialog"
            aria-label="Alerta de Energia Baixa"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm pointer-events-auto"
          >
            <div className="w-full max-w-md rounded-2xl bg-[#0f172a] border-2 border-rose-500 p-6 shadow-2xl space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-extrabold uppercase tracking-wider">
                    Aviso de Exaustão · {energy}% de Energia
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-1">
                    Sua Energia Está Baixa ({energy}%)!
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                Atenção! Sua energia chegou a um nível crítico (<strong>{energy}%</strong>). Passe na{' '}
                <strong className="text-amber-300">Cafeteria OverCoffee</strong> para tomar um café agora mesmo! Se sua energia chegar a <strong>0%</strong>, você vai dormir no serviço e terá vários pontos descontados.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLowEnergyAlertOpen(false)}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Continuar Mesmo Assim
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLowEnergyAlertOpen(false);
                    setActiveToolModal('none');
                    handleWalkToCafeteria();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Coffee className="w-4 h-4" />
                  Ir para a Cafeteria Agora
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Wake-up Penalty Modal shown right after the 2-second 0% Energy Blackout finishes */}
      {gameState === 'playing' && sleepPenaltyNotice && !isSleepingBlackout && (
        <div
          role="alertdialog"
          aria-label="Você Dormiu no Serviço"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm pointer-events-auto"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#0f172a] border-2 border-rose-500/80 p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Penalidade por Exaustão (0% Energia)
                </span>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  💤 Você Dormiu no Serviço!
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {sleepPenaltyNotice.message}
            </p>

            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Desconto Aplicado:</span>
                <span className="text-sm font-black font-mono-tabular text-rose-400">
                  -{sleepPenaltyNotice.penalty} pts
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Saldo Atual:</span>
                <span
                  className={`text-sm font-black font-mono-tabular ${
                    sleepPenaltyNotice.nextPoints < 0 ? 'text-rose-400' : 'text-amber-300'
                  }`}
                >
                  {sleepPenaltyNotice.nextPoints} pts
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Energia Após Cochilo:</span>
                <span className="text-sm font-black font-mono-tabular text-emerald-400">
                  {sleepPenaltyNotice.recoveredEnergy}%
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSleepPenaltyNotice(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Voltar ao Turno
              </button>
              <button
                type="button"
                onClick={() => {
                  setSleepPenaltyNotice(null);
                  handleWalkToCafeteria();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Coffee className="w-4 h-4" />
                Ir Tomar Café na Cafeteria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 0% Energy 2-Second Pure Blackout Screen ("quando chegar em 0% a tela deve ficar preta por 2s e depois voltar ao normal") */}
      {isSleepingBlackout && (
        <div
          data-testid="sleep-blackout-overlay"
          aria-label="Tela preta — O jogador dormiu no serviço"
          className="fixed inset-0 z-[200] bg-black pointer-events-auto"
        />
      )}
    </main>
  );
}

