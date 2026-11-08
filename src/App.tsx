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
import { loadSaveData, resetSaveData, saveGameData } from './persistence/storage';
import { soundEngine } from './audio/soundEngine';
import {
  BackgroundVoiceDownloadStatus,
  buildHelenaWelcomeSpeech,
  voiceNarrator,
} from './audio/voiceNarrator';
import {
  AccessoryItem,
  applyErrorPenalty,
  buildResetCareerState,
  calculateTicketReward,
  computeNextTicketDelaySeconds,
  getMaxSimultaneousTickets,
  OutfitItem,
  PlayerCustomization,
  purchaseAccessoryWithPoints,
  purchaseOutfitWithPoints,
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
import { GameOverBankruptcyModal } from './ui/GameOverBankruptcyModal';
import { CharacterCustomizationModal } from './ui/CharacterCustomizationModal';
import { CafeteriaModal } from './ui/CafeteriaModal';
import { CreditsModal } from './ui/CreditsModal';
import {
  InputModeSelectModal,
  MandatoryLandscapeOverlay,
} from './ui/InputModeSelectModal';
import { NearbyInteraction } from './player/collision';
import {
  detectMobileOrTabletClient,
  InputControlMode,
} from './player/touchControls';
import { Vec2 } from './pathfinding/trail';
import {
  advanceDayNightCycle,
  applyErrorEnergyDrain,
  applySleepOnJobPenalty,
  CafeteriaNpc,
  calculateActionStepEnergyDrain,
  CoffeeItem,
  DAY_SHIFT_DURATION_SECONDS,
  isCompanyBankrupt,
  isLowEnergyWarning,
  NIGHT_SHIFT_DURATION_SECONDS,
  pickRandomCafeteriaChat,
  purchaseAndDrinkCoffee,
  shouldTriggerLowEnergyAlert,
} from './cafeteria/cafeteriaSystem';
import {
  advanceHomeStayTimer,
  canReturnToOfficeFromHome,
  equipHomeFurnitureVersion,
  GameLocation,
  HOME_STAY_DURATION_SECONDS,
  HomeFurnitureItem,
  purchaseHomeFurniture,
  resolveNightfallChoice,
  sleepInHomeBed,
} from './home/homeSystem';
import { NightDecisionModal } from './ui/NightDecisionModal';
import { HomeFurnitureModal } from './ui/HomeFurnitureModal';
import { AlertTriangle, BedDouble, Coffee, Loader2, Moon, Sun } from 'lucide-react';

type GameState = 'title' | 'loading' | 'story' | 'playing' | 'paused' | 'gameover';

export default function App() {
  const initialSave = loadSaveData();

  const [gameState, setGameState] = useState<GameState>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return 'playing';
    if (params.get('story') === '1') return 'story';
    return 'title';
  });

  const [currentLocation, setCurrentLocation] = useState<GameLocation>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('location') === 'home' ? 'home' : 'office';
  });

  const [playerName, setPlayerName] = useState<string>(initialSave.playerName);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialSave.difficulty);
  const [nightShift, setNightShift] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('night') === '1') return true;
    if (params.get('night') === '0') return false;
    return false;
  });
  const [shiftCycleRemaining, setShiftCycleRemaining] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const customSec = params.get('cycleSec');
    if (customSec !== null && !Number.isNaN(Number(customSec))) {
      return Math.max(1, Math.round(Number(customSec)));
    }
    return params.get('night') === '1'
      ? NIGHT_SHIFT_DURATION_SECONDS
      : DAY_SHIFT_DURATION_SECONDS;
  });
  const [showNightDecisionModal, setShowNightDecisionModal] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('nightPrompt') === '1';
  });
  const [shiftTransitionBanner, setShiftTransitionBanner] = useState<'day' | 'night' | null>(
    null
  );
  const [inputMode, setInputMode] = useState<InputControlMode>(() => {
    const params = new URLSearchParams(window.location.search);
    const paramInput = params.get('input');
    if (paramInput === 'touch' || paramInput === 'keyboard_mouse') {
      return paramInput;
    }
    if (initialSave.inputMode) {
      return initialSave.inputMode;
    }
    return detectMobileOrTabletClient() ? 'touch' : 'keyboard_mouse';
  });
  const [showInputModeModal, setShowInputModeModal] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(initialSave.musicVolume);
  const [sfxVolume, setSfxVolume] = useState<number>(initialSave.sfxVolume);
  const [muted, setMuted] = useState<boolean>(initialSave.muted);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(initialSave.voiceEnabled);

  const [resolvedCount, setResolvedCount] = useState<number>(initialSave.resolvedCount);
  const [points, setPoints] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const paramPoints = params.get('points');
    if (paramPoints !== null && !Number.isNaN(Number(paramPoints))) {
      return Math.round(Number(paramPoints));
    }
    return initialSave.points;
  });
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
  const [sleepBlackoutMode, setSleepBlackoutMode] = useState<'exhaustion' | 'home_rest'>('exhaustion');
  const [sleepFadeOpacity, setSleepFadeOpacity] = useState<number>(0);
  const [sleepPenaltyNotice, setSleepPenaltyNotice] = useState<{
    penalty: number;
    nextPoints: number;
    recoveredEnergy: number;
    message: string;
  } | null>(null);
  const [bankruptcySnapshot, setBankruptcySnapshot] = useState<{
    playerName: string;
    gender: 'masculino' | 'feminino';
    finalPoints: number;
    resolvedCount: number;
    unlockedMedalsCount: number;
    purchasedOutfitsCount: number;
  } | null>(null);
  const [bgVoiceStatus, setBgVoiceStatus] = useState<BackgroundVoiceDownloadStatus>(() =>
    voiceNarrator.getBackgroundDownloadStatus()
  );

  const [unlockedMedals, setUnlockedMedals] = useState<string[]>(initialSave.unlockedMedals);
  const [purchasedOutfitIds, setPurchasedOutfitIds] = useState<string[]>(
    initialSave.purchasedOutfitIds
  );
  const [purchasedAccessoryIds, setPurchasedAccessoryIds] = useState<string[]>(
    initialSave.purchasedAccessoryIds
  );
  const [purchasedFurnitureIds, setPurchasedFurnitureIds] = useState<string[]>(
    initialSave.purchasedFurnitureIds || []
  );
  const [showHomeFurnitureModal, setShowHomeFurnitureModal] = useState<boolean>(false);
  const [nearHomeDoor, setNearHomeDoor] = useState<boolean>(false);
  const [nearHomeBed, setNearHomeBed] = useState<boolean>(false);
  const [hasSleptAtHome, setHasSleptAtHome] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('hasSlept') === '1';
  });
  const [homeStayRemaining, setHomeStayRemaining] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const homeSec = params.get('homeSec');
    if (homeSec !== null && !Number.isNaN(Number(homeSec))) {
      return Math.max(1, Math.round(Number(homeSec)));
    }
    return HOME_STAY_DURATION_SECONDS;
  });
  const [homeActionToast, setHomeActionToast] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
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

  // Strict check: player MUST be physically inside the office AND inside the active ticket's sector room to attend it!
  const isAtActiveTicketSector = Boolean(
    currentLocation === 'office' &&
      nearby &&
      activeProblem &&
      nearby.sector.id === activeProblem.setor
  );
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
    if (gameState === 'playing') {
      soundEngine.startBackgroundTrack();
    } else if (gameState === 'title' || gameState === 'story') {
      soundEngine.startMenuMusic();
    }
  }, [gameState]);

  // Global button click sound effect & first-gesture menu music unlock
  useEffect(() => {
    const onGlobalClick = (e: MouseEvent) => {
      if (gameState === 'title' || gameState === 'story') {
        soundEngine.startMenuMusic();
      }
      const target = e.target as HTMLElement | null;
      const btn = target?.closest('button, [role="button"]') as HTMLButtonElement | null;
      if (btn && !btn.disabled) {
        soundEngine.playButtonClick();
      }
    };

    const onFirstUnlock = () => {
      if (gameState === 'title' || gameState === 'story') {
        soundEngine.startMenuMusic();
      }
    };

    window.addEventListener('click', onGlobalClick, true);
    window.addEventListener('pointerdown', onFirstUnlock, { passive: true });
    window.addEventListener('keydown', onFirstUnlock, { passive: true });
    return () => {
      window.removeEventListener('click', onGlobalClick, true);
      window.removeEventListener('pointerdown', onFirstUnlock);
      window.removeEventListener('keydown', onFirstUnlock);
    };
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

  // Triggers the gradual-yet-fast fade-to-black screen ("dormiu no serviço") when energy hits 0%,
  // playing bocejomasculino.mp3 or bocejofeminino.mp3 and restoring 10% energy (or triggering Company Bankruptcy Game Over if in debt/out of points).
  const triggerSleepOnJobBlackout = useCallback(
    (basePoints: number) => {
      setSleepBlackoutMode('exhaustion');
      setIsSleepingBlackout(true);
      setSleepFadeOpacity(0);
      setLowEnergyAlertOpen(false);
      setActiveToolModal('none');
      setAutoWalkTarget(null);
      voiceNarrator.stop();
      soundEngine.playYawnSleepSound(playerCustomization.genero);

      // Start gradual yet fast fade to black (700ms transition)
      window.setTimeout(() => {
        setSleepFadeOpacity(1);
      }, 25);

      window.setTimeout(() => {
        const sleepRes = applySleepOnJobPenalty(basePoints, difficulty);
        const bankrupt =
          isCompanyBankrupt(0, basePoints, difficulty, resolvedCount, nightShift) ||
          isCompanyBankrupt(0, sleepRes.nextPoints, difficulty, resolvedCount, nightShift);

        if (bankrupt) {
          const finalDebtPoints = sleepRes.nextPoints;
          setBankruptcySnapshot({
            playerName,
            gender: playerCustomization.genero,
            finalPoints: finalDebtPoints,
            resolvedCount,
            unlockedMedalsCount: unlockedMedals.length,
            purchasedOutfitsCount: purchasedOutfitIds.length,
          });
          // Immediately reset the entire game and save data from 0 when Game Over happens
          resetSaveData();
          const cleanCareer = buildResetCareerState();
          setPlayerName('');
          setPoints(cleanCareer.points);
          setEnergy(cleanCareer.energy);
          setResolvedCount(cleanCareer.resolvedCount);
          setUnlockedMedals(cleanCareer.unlockedMedals);
          setPurchasedOutfitIds(cleanCareer.purchasedOutfitIds);
          setPurchasedAccessoryIds(cleanCareer.purchasedAccessoryIds);
          setPurchasedFurnitureIds([]);
          setPlayerCustomization(cleanCareer.playerCustomization);
          setRecentIds([]);
          setSleepPenaltyNotice(null);
          soundEngine.stopAmbientMusic();
          soundEngine.playError();
          setGameState('gameover');
          setSleepFadeOpacity(0);
          window.setTimeout(() => {
            setIsSleepingBlackout(false);
          }, 450);
          return;
        }

        setPoints(sleepRes.nextPoints);
        setEnergy(sleepRes.recoveredEnergy);
        setSleepPenaltyNotice(sleepRes);
        saveGameData({
          points: sleepRes.nextPoints,
          energy: sleepRes.recoveredEnergy,
        });
        soundEngine.playNotification();
        // Smooth fade out from black
        setSleepFadeOpacity(0);
        window.setTimeout(() => {
          setIsSleepingBlackout(false);
        }, 450);
      }, 1900);
    },
    [
      difficulty,
      nightShift,
      playerCustomization.genero,
      playerName,
      purchasedOutfitIds.length,
      resolvedCount,
      unlockedMedals.length,
    ]
  );

  // Centralized helper whenever energy changes from attending tickets
  const applyEnergyChange = useCallback(
    (prevEnergy: number, rawNextEnergy: number, basePoints: number) => {
      const clamped = Math.max(0, Math.min(100, rawNextEnergy));
      if (
        clamped <= 0 ||
        isCompanyBankrupt(clamped, basePoints, difficulty, resolvedCount, nightShift)
      ) {
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
    [difficulty, nightShift, resolvedCount, triggerSleepOnJobBlackout]
  );

  // If started directly at 0% energy or already in a bankrupt state (e.g. via URL param or saved state), trigger the sleep/bankruptcy fade-out
  useEffect(() => {
    if (
      gameState === 'playing' &&
      currentLocation === 'office' &&
      !isSleepingBlackout &&
      !sleepPenaltyNotice
    ) {
      if (
        energy <= 0 ||
        isCompanyBankrupt(energy, points, difficulty, resolvedCount, nightShift)
      ) {
        triggerSleepOnJobBlackout(points);
      }
    }
  }, [
    gameState,
    currentLocation,
    energy,
    isSleepingBlackout,
    sleepPenaltyNotice,
    points,
    difficulty,
    nightShift,
    resolvedCount,
    triggerSleepOnJobBlackout,
  ]);

  // Automatic 3-Minute Day / 2-Minute Night Shift Cycle in the Office
  // When Day finishes and Night arrives, prompts the player with NightDecisionModal ("deseja fazer um plantao noturno ou ir para a casa descansar")
  useEffect(() => {
    if (
      gameState !== 'playing' ||
      currentLocation !== 'office' ||
      isSleepingBlackout ||
      showNightDecisionModal
    ) {
      return;
    }

    const cycleTimer = window.setInterval(() => {
      setShiftCycleRemaining((prevRem) => {
        const next = advanceDayNightCycle(nightShift, prevRem);
        if (next.transitioned) {
          if (next.isNightShift) {
            // Night arrived! Show the NightDecisionModal asking Plantão Noturno vs Ir para Casa Descansar
            soundEngine.playNotification();
            setShowNightDecisionModal(true);
            return prevRem;
          }
          // Night shift finished -> Dawn arrives automatically
          setNightShift(false);
          saveGameData({ nightShift: false });
          soundEngine.playNotification();
          setShiftTransitionBanner('day');
        }
        return next.remainingSeconds;
      });
    }, 1000);

    return () => clearInterval(cycleTimer);
  }, [gameState, currentLocation, isSleepingBlackout, showNightDecisionModal, nightShift]);

  const handleChooseNightShift = useCallback(() => {
    const outcome = resolveNightfallChoice(
      'night_shift',
      energy,
      DAY_SHIFT_DURATION_SECONDS,
      NIGHT_SHIFT_DURATION_SECONDS
    );
    setShowNightDecisionModal(false);
    setNightShift(outcome.isNightShift);
    setShiftCycleRemaining(outcome.nextCycleSeconds);
    saveGameData({ nightShift: outcome.isNightShift });
    soundEngine.playNotification();
    setShiftTransitionBanner('night');
  }, [energy]);

  const handleChooseGoHome = useCallback(() => {
    const outcome = resolveNightfallChoice(
      'go_home',
      energy,
      DAY_SHIFT_DURATION_SECONDS,
      NIGHT_SHIFT_DURATION_SECONDS
    );
    setShowNightDecisionModal(false);
    setLowEnergyAlertOpen(false);
    setNearby(null);
    setNearCafeteria(false);
    setNearbyCafeteriaNpc(null);
    setCurrentSectorName('Sua Casa');
    setActiveToolModal('none');
    setActiveDialogueNpc(null);
    setActiveCafeteriaDialogue(null);
    setAutoWalkTarget(null);
    voiceNarrator.stop();
    soundEngine.playInteract();

    setCurrentLocation(outcome.nextLocation);
    setNightShift(outcome.isNightShift);
    setShiftCycleRemaining(outcome.nextCycleSeconds);
    setHomeStayRemaining(outcome.homeStaySeconds);
    setHasSleptAtHome(outcome.hasSleptAtHome);
    setHomeActionToast({
      ok: true,
      text: 'Bem-vindo à sua Casa (3 min até voltar ao emprego)! Caminhe até a cama no quarto e clique para dormir e recuperar 100% de energia.',
    });
    saveGameData({
      energy: outcome.nextEnergy,
      nightShift: outcome.isNightShift,
    });
  }, [energy]);

  const handleSleepInHomeBed = useCallback(() => {
    if (isSleepingBlackout) return;
    setShowHomeFurnitureModal(false);
    setSleepBlackoutMode('home_rest');
    setIsSleepingBlackout(true);
    setSleepFadeOpacity(0);
    soundEngine.playYawnSleepSound(playerCustomization.genero);

    window.setTimeout(() => {
      setSleepFadeOpacity(1);
    }, 25);

    window.setTimeout(() => {
      const res = sleepInHomeBed();
      setEnergy(res.nextEnergy);
      setHasSleptAtHome(res.hasSleptAtHome);
      setLowEnergyAlertOpen(false);
      saveGameData({ energy: res.nextEnergy });
      soundEngine.playSuccess();
      setHomeActionToast({
        ok: true,
        text: res.message,
      });
      setSleepFadeOpacity(0);
      window.setTimeout(() => {
        setIsSleepingBlackout(false);
      }, 450);
    }, 1500);
  }, [isSleepingBlackout, playerCustomization.genero]);

  const executeReturnToOfficeNow = useCallback(() => {
    soundEngine.playInteract();
    setShowHomeFurnitureModal(false);
    setHomeActionToast(null);
    setCurrentLocation('office');
    setNightShift(false);
    setShiftCycleRemaining(DAY_SHIFT_DURATION_SECONDS);
    setShiftTransitionBanner('day');
    saveGameData({ nightShift: false });
  }, []);

  const handleReturnToOfficeFromHome = useCallback(() => {
    const check = canReturnToOfficeFromHome(hasSleptAtHome);
    if (!check.allowed) {
      soundEngine.playError();
      setHomeActionToast({
        ok: false,
        text: check.reason!,
      });
      return;
    }
    executeReturnToOfficeNow();
  }, [hasSleptAtHome, executeReturnToOfficeNow]);

  // 3-Minute Home Stay Countdown Timer ("3 min contando ate a volta para o emprego")
  useEffect(() => {
    if (
      gameState !== 'playing' ||
      currentLocation !== 'home' ||
      isSleepingBlackout
    ) {
      return;
    }

    const homeTimer = window.setInterval(() => {
      setHomeStayRemaining((prev) => {
        const step = advanceHomeStayTimer(prev, hasSleptAtHome);
        if (step.shouldAutoReturnToOffice) {
          window.setTimeout(() => {
            executeReturnToOfficeNow();
          }, 50);
        } else if (step.shouldPromptMustSleep && prev > 0) {
          soundEngine.playNotification();
          setHomeActionToast({
            ok: false,
            text: 'Os 3 minutos em casa terminaram! Caminhe até a cama no quarto e clique para dormir agora para recuperar 100% de energia e voltar ao escritório.',
          });
        }
        return step.nextRemainingSeconds;
      });
    }, 1000);

    return () => clearInterval(homeTimer);
  }, [gameState, currentLocation, isSleepingBlackout, hasSleptAtHome, executeReturnToOfficeNow]);

  useEffect(() => {
    if (!homeActionToast) return;
    const t = window.setTimeout(() => setHomeActionToast(null), 5500);
    return () => clearTimeout(t);
  }, [homeActionToast]);

  useEffect(() => {
    if (!shiftTransitionBanner) return;
    const t = window.setTimeout(() => setShiftTransitionBanner(null), 4500);
    return () => clearTimeout(t);
  }, [shiftTransitionBanner]);

  // Varied Ticket Pacing & Rush Hour Timer (ticks every 1s during playing in the office; NO passive energy drain!)
  useEffect(() => {
    if (
      gameState !== 'playing' ||
      currentLocation !== 'office' ||
      showNightDecisionModal ||
      resolvedModalData ||
      showCustomizationModal ||
      isSleepingBlackout
    ) {
      return;
    }

    const timer = window.setInterval(() => {
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
    currentLocation,
    showNightDecisionModal,
    resolvedModalData,
    showCustomizationModal,
    isSleepingBlackout,
    difficulty,
    isRushHour,
    ticketQueue.length,
    enqueueNewTicket,
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

  // Full General Reset after Company Bankruptcy ("quando der gameover todo o jogo seja reiniciado e apareça algo para tentar novamente, desde o 0 com a apresentação e tudo")
  const handleFullBankruptcyReset = useCallback(() => {
    resetSaveData();
    const cleanCareer = buildResetCareerState();
    setPlayerName('');
    setDifficulty('normal');
    setCurrentLocation('office');
    setNightShift(false);
    setShiftCycleRemaining(DAY_SHIFT_DURATION_SECONDS);
    setShowNightDecisionModal(false);
    setShowHomeFurnitureModal(false);
    setShiftTransitionBanner(null);
    setPoints(cleanCareer.points);
    setEnergy(cleanCareer.energy);
    setResolvedCount(cleanCareer.resolvedCount);
    setUnlockedMedals(cleanCareer.unlockedMedals);
    setPurchasedOutfitIds(cleanCareer.purchasedOutfitIds);
    setPurchasedAccessoryIds(cleanCareer.purchasedAccessoryIds);
    setPurchasedFurnitureIds([]);
    setPlayerCustomization(cleanCareer.playerCustomization);
    setRecentIds([]);
    setLowEnergyAlertOpen(false);
    setSleepPenaltyNotice(null);
    setBankruptcySnapshot(null);
    setIsSleepingBlackout(false);
    setSleepFadeOpacity(0);
    setShowCustomizationModal(false);
    setShowCreditsModal(false);
    setShowInputModeModal(false);
    setActiveToolModal('none');
    setActiveDialogueNpc(null);
    setActiveCafeteriaDialogue(null);
    setAutoWalkTarget(null);
    resetWithRandomTicket('normal');
    soundEngine.stopAmbientMusic();
    voiceNarrator.stop();
    soundEngine.playInteract();
    setGameState('title');
  }, [resetWithRandomTicket]);

  // Clicking "Iniciar" on Title Screen opens the Input Mode Prompt (Teclado e Mouse vs Tela Touch)
  const handlePromptInputModeBeforeStart = useCallback(() => {
    soundEngine.playInteract();
    setShowCustomizationModal(false);
    setShowCreditsModal(false);
    setShowInputModeModal(true);
  }, []);

  // Confirmed Input Mode -> draws a first ticket and opens the Story screen immediately (starting on 3-min Daytime)
  const handleOpenStoryIntro = useCallback(() => {
    setShowInputModeModal(false);
    setShowCustomizationModal(false);
    setCurrentLocation('office');
    setShowNightDecisionModal(false);
    setShowHomeFurnitureModal(false);
    setNightShift(false);
    setShiftCycleRemaining(DAY_SHIFT_DURATION_SECONDS);
    setShiftTransitionBanner(null);
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
    soundEngine.startBackgroundTrack();
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
        !showInputModeModal &&
        !isTyping &&
        (e.code === 'Enter' || e.code === 'Space')
      ) {
        e.preventDefault();
        handlePromptInputModeBeforeStart();
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
        if (showInputModeModal) {
          setShowInputModeModal(false);
          return;
        }
        if (showCreditsModal) {
          setShowCreditsModal(false);
          return;
        }
        if (showCustomizationModal) {
          setShowCustomizationModal(false);
          return;
        }
        if (showHomeFurnitureModal) {
          setShowHomeFurnitureModal(false);
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
      } else if (
        e.code === 'KeyP' &&
        activeToolModal === 'none' &&
        !showCustomizationModal &&
        !showHomeFurnitureModal &&
        !isTyping
      ) {
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
        !showHomeFurnitureModal &&
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
    showHomeFurnitureModal,
    showCreditsModal,
    showInputModeModal,
    handlePromptInputModeBeforeStart,
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
      if (!isNearCaf && !nextCafeNpc) {
        setActiveCafeteriaDialogue((prev) => {
          if (prev) voiceNarrator.stop();
          return null;
        });
      }
      if (!isNearCaf) {
        setActiveToolModal((prev) => (prev === 'cafeteria' ? 'none' : prev));
      }
      setActiveDialogueNpc((prevNpc) => {
        if (!prevNpc) return null;
        if (!nextNearby || nextNearby.npc.id !== prevNpc.id) {
          voiceNarrator.stop();
          return null;
        }
        return prevNpc;
      });
      // If the player walks away from the sector, close any open Hardware/OverOS diagnostic modal!
      if (!nextNearby || !nextNearby.isTicketTarget) {
        setActiveToolModal((prev) =>
          prev === 'hardware' || prev === 'virtualos' ? 'none' : prev
        );
      }
    },
    []
  );

  const handleTalkToCafeteriaNpc = useCallback(
    (npc: CafeteriaNpc) => {
      if (currentLocation !== 'office' || (!nearCafeteria && !nearbyCafeteriaNpc)) return;
      soundEngine.playInteract();
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
    [currentLocation, nearCafeteria, nearbyCafeteriaNpc, voiceEnabled]
  );

  const openNpcDialogueWithVoice = useCallback(
    (npc: NpcData) => {
      if (currentLocation !== 'office' || !nearby || nearby.npc.id !== npc.id) return;
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
    [currentLocation, nearby, ticketQueue]
  );

  const handleInteractRequest = useCallback(
    (targetNearby: NearbyInteraction) => {
      if (currentLocation !== 'office') return;
      openNpcDialogueWithVoice(targetNearby.npc);
    },
    [currentLocation, openNpcDialogueWithVoice]
  );

  const handleExecuteDiagnosticAction = (action: DiagnosticAction) => {
    if (
      currentLocation !== 'office' ||
      !activeProblem ||
      !activeWorkstationState ||
      !isAtActiveTicketSector
    ) {
      return;
    }
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

    // Drain energy for this diagnostic step while attending the ticket (higher drain during Plantão Noturno!)
    const stepDrain = calculateActionStepEnergyDrain(
      difficulty,
      activeProblem.acoesRequeridas.length,
      result.isResolved,
      activeWorkstationState.completedActions.length,
      nightShift
    );
    const rawNextEnergy = Math.max(0, energy - stepDrain);

    // If energy reaches 0% while attending the ticket, the player collapses from exhaustion!
    // Points MUST decrease by the sleep penalty (DO NOT add ticket reward points!).
    if (rawNextEnergy <= 0) {
      setWorkstationMap((prev) => ({
        ...prev,
        [activeProblem.id]: createInitialWorkstationState(activeProblem),
      }));
      setActiveToolModal('none');
      setActiveDialogueNpc(null);
      setAutoWalkTarget(null);
      applyEnergyChange(energy, 0, points);
      return;
    }

    if (!result.isResolved) {
      applyEnergyChange(energy, rawNextEnergy, points);
      return;
    }

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
      isNightShift: nightShift,
      currentPoints: points,
      resolvedCountAfter: nextCount,
      unlockedMedals,
    });

    const nextPoints = points + reward.totalEarned;
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
  };

  const handleDrinkCoffee = (coffee: CoffeeItem) => {
    if (currentLocation !== 'office' || !nearCafeteria) {
      return {
        ok: false,
        reason: 'Caminhe até o balcão da Cafeteria OverCoffee dentro do escritório para pedir um café!',
      };
    }
    const res = purchaseAndDrinkCoffee(
      energy,
      points,
      coffee,
      difficulty,
      resolvedCount,
      nightShift
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

  const handlePurchaseOutfit = (outfit: OutfitItem) => {
    const res = purchaseOutfitWithPoints({
      outfit,
      currentPoints: points,
      purchasedOutfitIds,
      difficulty,
      resolvedCount,
    });
    if (res.success) {
      soundEngine.playSuccess();
      setPoints(res.nextPoints);
      setPurchasedOutfitIds(res.nextPurchasedOutfitIds);
      const nextCust = { ...playerCustomization, roupaId: outfit.id };
      setPlayerCustomization(nextCust);
      saveGameData({
        points: res.nextPoints,
        purchasedOutfitIds: res.nextPurchasedOutfitIds,
        playerCustomization: nextCust,
      });
    } else {
      soundEngine.playError();
    }
    return { ok: res.success, message: res.message };
  };

  const handlePurchaseAccessory = (accessory: AccessoryItem) => {
    const res = purchaseAccessoryWithPoints({
      accessory,
      currentPoints: points,
      purchasedAccessoryIds,
      difficulty,
      resolvedCount,
    });
    if (res.success) {
      soundEngine.playSuccess();
      setPoints(res.nextPoints);
      setPurchasedAccessoryIds(res.nextPurchasedAccessoryIds);
      const nextCust = { ...playerCustomization, acessorioId: accessory.id };
      setPlayerCustomization(nextCust);
      saveGameData({
        points: res.nextPoints,
        purchasedAccessoryIds: res.nextPurchasedAccessoryIds,
        playerCustomization: nextCust,
      });
    } else {
      soundEngine.playError();
    }
    return { ok: res.success, message: res.message };
  };

  const handlePurchaseHomeFurniture = (item: HomeFurnitureItem) => {
    const res = purchaseHomeFurniture({
      furnitureId: item.id,
      currentPoints: points,
      purchasedFurnitureIds,
    });
    if (res.success) {
      soundEngine.playSuccess();
      setPoints(res.nextPoints);
      setPurchasedFurnitureIds(res.nextPurchasedFurnitureIds);
      saveGameData({
        points: res.nextPoints,
        purchasedFurnitureIds: res.nextPurchasedFurnitureIds,
      });
    } else {
      soundEngine.playError();
    }
    return { ok: res.success, message: res.message };
  };

  const handleEquipHomeFurnitureVersion = (item: HomeFurnitureItem) => {
    soundEngine.playInteract();
    const nextIds = equipHomeFurnitureVersion(item.id, purchasedFurnitureIds);
    setPurchasedFurnitureIds(nextIds);
    saveGameData({ purchasedFurnitureIds: nextIds });
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none">
      {/* Persistent 3D Isometric Office & Home Viewport */}
      <OfficeSceneView
        gameState={gameState}
        currentLocation={currentLocation}
        purchasedFurnitureIds={purchasedFurnitureIds}
        hasSleptAtHome={hasSleptAtHome}
        activeProblem={resolvedModalData ? null : activeProblem}
        queuedSectorIds={ticketQueue.map((p) => p.setor)}
        playerCustomization={playerCustomization}
        nightShift={nightShift}
        autoWalkTarget={autoWalkTarget}
        onClearAutoWalk={() => setAutoWalkTarget(null)}
        onTapFloorWalk={() => {
          // Player moves mechanically via joystick or keyboard
        }}
        onNearbyChange={handleNearbyChange}
        onHomeProximityChange={(nearDoor, nearBed) => {
          setNearHomeDoor(nearDoor);
          setNearHomeBed(nearBed);
        }}
        onInteractRequest={handleInteractRequest}
        onOpenCafeteriaRequest={() => {
          soundEngine.playInteract();
          setActiveToolModal('cafeteria');
        }}
        onTalkToCafeteriaNpcRequest={handleTalkToCafeteriaNpc}
        onOpenHomeShopRequest={() => {
          soundEngine.playInteract();
          setShowHomeFurnitureModal(true);
        }}
        onSleepInHomeBedRequest={handleSleepInHomeBed}
        onReturnToOfficeRequest={handleReturnToOfficeFromHome}
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
      {gameState === 'title' &&
        !showCustomizationModal &&
        !showCreditsModal &&
        !showInputModeModal && (
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
            onStartGame={handlePromptInputModeBeforeStart}
          />
        )}

      {/* Input Mode Selection Prompt (Asks "Teclado e Mouse" vs "Tela Touch" when starting the game) */}
      {showInputModeModal && (
        <InputModeSelectModal
          initialMode={inputMode}
          onConfirmModeAndStart={(chosenMode) => {
            setInputMode(chosenMode);
            saveGameData({ inputMode: chosenMode });
            handleOpenStoryIntro();
          }}
          onClose={() => setShowInputModeModal(false)}
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

      {/* Automatic Day/Night Transition Notification Toast */}
      {gameState === 'playing' && shiftTransitionBanner && !isSleepingBlackout && (
        <div
          role="status"
          data-testid="shift-transition-banner"
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-4 py-2 rounded-2xl lg-toast-glass flex items-center gap-2.5 text-xs font-extrabold transition-all ${
            shiftTransitionBanner === 'night'
              ? 'border-indigo-400/60 text-indigo-100'
              : 'border-amber-400/60 text-amber-100'
          }`}
        >
          {shiftTransitionBanner === 'night' ? (
            <>
              <Moon className="w-4 h-4 text-indigo-300 shrink-0" />
              <span>
                Plantão Noturno Iniciado (2 min) · Luzes Acesas · +50% Pontos · +Energia · Café +50%
              </span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                Amanheceu no Escritório (3 min de Dia) · Consumo de Energia e Preços de Café Normais
              </span>
            </>
          )}
        </div>
      )}

      {/* Non-Intrusive Background Voice Download Pill ("em segundo plano") */}
      {voiceEnabled &&
        bgVoiceStatus.active &&
        (gameState === 'story' || gameState === 'playing') &&
        !isSleepingBlackout && (
          <div
            aria-live="polite"
            className="fixed bottom-16 left-4 z-20 pointer-events-none px-3 py-1.5 rounded-xl lg-toast-glass border-sky-500/35 text-[11px] font-semibold text-sky-300 flex items-center gap-2"
          >
            <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin shrink-0" />
            <span>
              Baixando vozes em 2º plano ({bgVoiceStatus.percent}%)...
            </span>
          </div>
        )}

      {/* Home Action / Bed Requirement Notification Toast */}
      {gameState === 'playing' &&
        currentLocation === 'home' &&
        homeActionToast &&
        !isSleepingBlackout && (
          <div
            role="alert"
            data-testid="home-action-toast"
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none max-w-xl w-[92%] px-4 py-2.5 rounded-2xl lg-toast-glass flex items-center gap-2.5 text-xs font-extrabold transition-all ${
              homeActionToast.ok
                ? 'border-emerald-400/60 text-emerald-100'
                : 'border-rose-400/60 text-rose-100'
            }`}
          >
            <BedDouble className="w-4 h-4 shrink-0" />
            <span>{homeActionToast.text}</span>
          </div>
        )}

      {/* Playing HUD Overlay */}
      {gameState === 'playing' && (
        <HudOverlay
          currentLocation={currentLocation}
          purchasedFurnitureIds={purchasedFurnitureIds}
          nearHomeDoor={nearHomeDoor}
          nearHomeBed={nearHomeBed}
          hasSleptAtHome={hasSleptAtHome}
          homeStayRemaining={homeStayRemaining}
          activeProblem={activeProblem}
          ticketQueue={ticketQueue}
          nextTicketCountdown={nextTicketCountdown}
          isRushHour={isRushHour}
          rushHourRemaining={rushHourRemaining}
          nightShift={nightShift}
          shiftCycleRemaining={shiftCycleRemaining}
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
          inputMode={inputMode}
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
            if (currentLocation !== 'office' || !nearCafeteria) return;
            soundEngine.playInteract();
            setActiveToolModal('cafeteria');
          }}
          onTalkToCafeteriaNpc={handleTalkToCafeteriaNpc}
          onCloseCafeteriaDialogue={() => {
            voiceNarrator.stop();
            setActiveCafeteriaDialogue(null);
          }}
          onOpenHomeShop={() => {
            soundEngine.playInteract();
            setShowHomeFurnitureModal(true);
          }}
          onSleepInHomeBed={handleSleepInHomeBed}
          onReturnToOffice={handleReturnToOfficeFromHome}
          onCycleCameraZoom={() =>
            setCameraZoom((z) => (z < 0.9 ? 1.0 : z < 1.8 ? 2.1 : 0.8))
          }
          onToggleFullMap={() => setCameraZoom((z) => (z >= 1.9 ? 1.0 : 2.1))}
          onOpenPause={() => setGameState('paused')}
          onOpenNpcDialogue={(n) => openNpcDialogueWithVoice(n.npc)}
          onCloseNpcDialogue={() => {
            voiceNarrator.stop();
            setActiveDialogueNpc(null);
          }}
          onOpenHardwareWorkbench={() => {
            if (currentLocation !== 'office' || !isAtActiveTicketSector) return;
            soundEngine.playInteract();
            setActiveToolModal('hardware');
          }}
          onOpenVirtualOS={() => {
            if (currentLocation !== 'office' || !isAtActiveTicketSector) return;
            soundEngine.playInteract();
            setActiveToolModal('virtualos');
          }}
          onNextTicketAfterResolve={() => {
            voiceNarrator.stop();
            setResolvedModalData(null);
          }}
        />
      )}

      {/* Nightfall Decision Modal ("quando chegar a noite o funcionário recebe a modal perguntando se ele deseja fazer um plantao noturno ou ir para a casa descansar") */}
      {gameState === 'playing' &&
        showNightDecisionModal &&
        !isSleepingBlackout && (
          <NightDecisionModal
            playerName={playerName}
            energy={energy}
            points={points}
            ownedFurnitureCount={purchasedFurnitureIds.length}
            onChooseNightShift={handleChooseNightShift}
            onChooseGoHome={handleChooseGoHome}
          />
        )}

      {/* Home Furniture & Decoration Catalog Modal (inside the 3D Home map) */}
      {gameState === 'playing' &&
        currentLocation === 'home' &&
        showHomeFurnitureModal &&
        !isSleepingBlackout && (
          <HomeFurnitureModal
            points={points}
            purchasedFurnitureIds={purchasedFurnitureIds}
            hasSleptAtHome={hasSleptAtHome}
            homeStayRemaining={homeStayRemaining}
            onPurchaseFurniture={handlePurchaseHomeFurniture}
            onEquipFurnitureVersion={handleEquipHomeFurnitureVersion}
            onReturnToOffice={handleReturnToOfficeFromHome}
            onClose={() => {
              soundEngine.playInteract();
              setShowHomeFurnitureModal(false);
            }}
          />
        )}

      {/* Interactive 3D/Tactile Hardware Workbench Modal (Strictly requires being physically at the target sector in the office!) */}
      {gameState === 'playing' &&
        currentLocation === 'office' &&
        activeToolModal === 'hardware' &&
        isAtActiveTicketSector &&
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

      {/* Interactive Virtual OS (OverOS) Modal (Strictly requires being physically at the target sector in the office!) */}
      {gameState === 'playing' &&
        currentLocation === 'office' &&
        activeToolModal === 'virtualos' &&
        isAtActiveTicketSector &&
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

      {/* Cafeteria OverCoffee Modal (Only accessible when physically inside the Cafeteria space at the coffee counter!) */}
      {gameState === 'playing' &&
        currentLocation === 'office' &&
        activeToolModal === 'cafeteria' &&
        nearCafeteria && (
        <CafeteriaModal
          energy={energy}
          points={points}
          difficulty={difficulty}
          nightShift={nightShift}
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

      {/* Character Customization, Wardrobe (16 Outfits & 21 Accessories Purchased with Points) and Medals Modal */}
      {showCustomizationModal && (
        <CharacterCustomizationModal
          playerName={playerName}
          customization={playerCustomization}
          points={points}
          resolvedCount={resolvedCount}
          difficulty={difficulty}
          unlockedMedals={unlockedMedals}
          purchasedOutfitIds={purchasedOutfitIds}
          purchasedAccessoryIds={purchasedAccessoryIds}
          onChangeCustomization={(next) => {
            soundEngine.playInteract();
            setPlayerCustomization(next);
            saveGameData({ playerCustomization: next });
          }}
          onPurchaseOutfit={handlePurchaseOutfit}
          onPurchaseAccessory={handlePurchaseAccessory}
          onClose={() => setShowCustomizationModal(false)}
        />
      )}

      {/* Pause & Settings Modal */}
      {gameState === 'paused' &&
        !showCustomizationModal &&
        !showCreditsModal && (
          <PauseSettingsModal
            mode={gameState}
            difficulty={difficulty}
            inputMode={inputMode}
            musicVolume={musicVolume}
            sfxVolume={sfxVolume}
            voiceEnabled={voiceEnabled}
            resolvedCount={resolvedCount}
            points={points}
            unlockedMedalsCount={unlockedMedals.length}
            onChangeDifficulty={handleSelectDifficulty}
            onChangeInputMode={(nextMode) => {
              soundEngine.playInteract();
              setInputMode(nextMode);
              saveGameData({ inputMode: nextMode });
            }}
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

      {/* Company Bankruptcy Game Over & General Reset Modal */}
      {gameState === 'gameover' && (
        <GameOverBankruptcyModal
          playerName={bankruptcySnapshot?.playerName ?? playerName}
          gender={bankruptcySnapshot?.gender ?? playerCustomization.genero}
          finalPoints={bankruptcySnapshot?.finalPoints ?? points}
          resolvedCount={bankruptcySnapshot?.resolvedCount ?? resolvedCount}
          unlockedMedalsCount={
            bankruptcySnapshot?.unlockedMedalsCount ?? unlockedMedals.length
          }
          purchasedOutfitsCount={
            bankruptcySnapshot?.purchasedOutfitsCount ?? purchasedOutfitIds.length
          }
          onConfirmFullReset={handleFullBankruptcyReset}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 lg-modal-backdrop pointer-events-auto"
          >
            <div className="w-full max-w-md rounded-2xl lg-modal-floating border-rose-500/75 p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 animate-pulse shadow-inner">
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

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setLowEnergyAlertOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl lg-btn-amber text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Coffee className="w-4 h-4" />
                  Entendido · Vou Caminhar até a Cafeteria
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Wake-up Penalty Modal shown right after the 0% Energy Gradual Blackout finishes */}
      {gameState === 'playing' && sleepPenaltyNotice && !isSleepingBlackout && (
        <div
          role="alertdialog"
          aria-label="Você Dormiu no Serviço"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 lg-modal-backdrop pointer-events-auto"
        >
          <div className="w-full max-w-md rounded-2xl lg-modal-floating border-rose-500/75 p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
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

            <div className="p-3.5 rounded-xl lg-inner-well flex items-center justify-between text-xs">
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

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSleepPenaltyNotice(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl lg-btn-amber text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Coffee className="w-4 h-4" />
                Voltar ao Turno ({sleepPenaltyNotice.recoveredEnergy}% Energia)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gradual-Yet-Fast Blackout Screen (Used both when collapsing at 0% energy AND when going home to rest/sleep!) */}
      {isSleepingBlackout && (
        <div
          data-testid="sleep-blackout-overlay"
          aria-label={
            sleepBlackoutMode === 'home_rest'
              ? 'Indo para casa descansar — Recuperando 100% de energia'
              : 'Tela escurecendo gradualmente — O jogador dormiu no serviço'
          }
          style={{
            opacity: sleepFadeOpacity,
            transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="fixed inset-0 z-[200] bg-black pointer-events-auto flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-2 text-slate-300/90">
            {sleepBlackoutMode === 'home_rest' ? (
              <>
                <BedDouble className="w-8 h-8 text-emerald-300/80 animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase">
                  Indo para Casa Descansar... Recuperando 100% da Energia
                </span>
              </>
            ) : (
              <>
                <Moon className="w-8 h-8 text-amber-300/70 animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase">
                  Exaustão (0% Energia)... Cochilando no turno
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Landscape Mode Enforcer for Smartphones and Tablets (Independent of Keyboard/Mouse or Touch selection) */}
      <MandatoryLandscapeOverlay inputMode={inputMode} />
    </main>
  );
}

