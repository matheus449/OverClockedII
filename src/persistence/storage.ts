import { DifficultyLevel } from '../problems/validator';
import {
  DEFAULT_CUSTOMIZATION,
  DEFAULT_PURCHASED_ACCESSORIES,
  DEFAULT_PURCHASED_OUTFITS,
  PlayerCustomization,
} from '../progression/progressionSystem';
import { InputControlMode } from '../player/touchControls';

const STORAGE_KEY = 'overclocked_save_v1';

export interface OverclockedSaveData {
  playerName: string;
  difficulty: DifficultyLevel;
  inputMode?: InputControlMode;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  voiceEnabled: boolean;
  resolvedCount: number;
  points: number;
  energy: number;
  unlockedMedals: string[];
  purchasedOutfitIds: string[];
  purchasedAccessoryIds: string[];
  playerCustomization: PlayerCustomization;
  recentProblemIds: string[];
}

const DEFAULT_SAVE: OverclockedSaveData = {
  playerName: '',
  difficulty: 'normal',
  musicVolume: 0.45,
  sfxVolume: 0.7,
  muted: false,
  voiceEnabled: true,
  resolvedCount: 0,
  points: 0,
  energy: 100,
  unlockedMedals: [],
  purchasedOutfitIds: [...DEFAULT_PURCHASED_OUTFITS],
  purchasedAccessoryIds: [...DEFAULT_PURCHASED_ACCESSORIES],
  playerCustomization: { ...DEFAULT_CUSTOMIZATION },
  recentProblemIds: [],
};

export function loadSaveData(): OverclockedSaveData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_SAVE,
        purchasedOutfitIds: [...DEFAULT_PURCHASED_OUTFITS],
        purchasedAccessoryIds: [...DEFAULT_PURCHASED_ACCESSORIES],
        playerCustomization: { ...DEFAULT_CUSTOMIZATION },
      };
    }
    const parsed = JSON.parse(raw);

    const cust = parsed.playerCustomization || {};
    const playerCustomization: PlayerCustomization = {
      genero: cust.genero === 'feminino' ? 'feminino' : 'masculino',
      roupaId: typeof cust.roupaId === 'string' ? cust.roupaId : DEFAULT_CUSTOMIZATION.roupaId,
      acessorioId:
        typeof cust.acessorioId === 'string'
          ? cust.acessorioId
          : DEFAULT_CUSTOMIZATION.acessorioId,
      corCabelo:
        typeof cust.corCabelo === 'string' ? cust.corCabelo : DEFAULT_CUSTOMIZATION.corCabelo,
      tomPele: typeof cust.tomPele === 'string' ? cust.tomPele : DEFAULT_CUSTOMIZATION.tomPele,
    };

    const inputMode: InputControlMode | undefined =
      parsed.inputMode === 'keyboard_mouse' || parsed.inputMode === 'touch'
        ? parsed.inputMode
        : undefined;

    const purchasedOutfitIds = Array.isArray(parsed.purchasedOutfitIds)
      ? Array.from(new Set([...DEFAULT_PURCHASED_OUTFITS, ...parsed.purchasedOutfitIds]))
      : [...DEFAULT_PURCHASED_OUTFITS];

    const purchasedAccessoryIds = Array.isArray(parsed.purchasedAccessoryIds)
      ? Array.from(new Set([...DEFAULT_PURCHASED_ACCESSORIES, ...parsed.purchasedAccessoryIds]))
      : [...DEFAULT_PURCHASED_ACCESSORIES];

    return {
      playerName: typeof parsed.playerName === 'string' ? parsed.playerName : DEFAULT_SAVE.playerName,
      difficulty:
        parsed.difficulty === 'facil' ||
        parsed.difficulty === 'normal' ||
        parsed.difficulty === 'dificil'
          ? parsed.difficulty
          : DEFAULT_SAVE.difficulty,
      inputMode,
      musicVolume:
        typeof parsed.musicVolume === 'number' ? parsed.musicVolume : DEFAULT_SAVE.musicVolume,
      sfxVolume:
        typeof parsed.sfxVolume === 'number' ? parsed.sfxVolume : DEFAULT_SAVE.sfxVolume,
      muted: Boolean(parsed.muted),
      voiceEnabled:
        typeof parsed.voiceEnabled === 'boolean' ? parsed.voiceEnabled : DEFAULT_SAVE.voiceEnabled,
      resolvedCount: typeof parsed.resolvedCount === 'number' ? parsed.resolvedCount : 0,
      points: typeof parsed.points === 'number' ? parsed.points : 0,
      energy:
        typeof parsed.energy === 'number'
          ? Math.max(0, Math.min(100, Math.round(parsed.energy)))
          : 100,
      unlockedMedals: Array.isArray(parsed.unlockedMedals) ? parsed.unlockedMedals : [],
      purchasedOutfitIds,
      purchasedAccessoryIds,
      playerCustomization,
      recentProblemIds: Array.isArray(parsed.recentProblemIds)
        ? parsed.recentProblemIds.slice(-15)
        : [],
    };
  } catch {
    return {
      ...DEFAULT_SAVE,
      purchasedOutfitIds: [...DEFAULT_PURCHASED_OUTFITS],
      purchasedAccessoryIds: [...DEFAULT_PURCHASED_ACCESSORIES],
      playerCustomization: { ...DEFAULT_CUSTOMIZATION },
    };
  }
}

export function saveGameData(partial: Partial<OverclockedSaveData>): OverclockedSaveData {
  const current = loadSaveData();
  const updated: OverclockedSaveData = {
    ...current,
    ...partial,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors in restricted frames
  }
  return updated;
}
