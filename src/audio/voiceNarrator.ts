import { soundEngine } from './soundEngine';
import { normalizePortugueseText } from './ptBrPhonemizer';

export type KokoroPortugueseVoice = 'pf_dora' | 'pm_alex';
export type KokoroEngineStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface VoicePreloadItem {
  id: string;
  label: string;
  text: string;
  npcId?: string;
  npcName?: string;
}

export interface VoicePreloadProgress {
  engineStatus: KokoroEngineStatus;
  engineProgress: number;
  completedItems: number;
  totalItems: number;
  completedChunks: number;
  totalChunks: number;
  cachedHits: number;
  currentLabel: string;
  overallPercent: number;
}

export interface BackgroundVoiceDownloadStatus {
  active: boolean;
  completedChunks: number;
  totalChunks: number;
  currentLabel: string;
  percent: number;
}

const FEMALE_NPC_IDS = new Set([
  // Sector female NPCs (from src/data/npcs.json)
  'npc_recepcao',     // Clara Mendes
  'npc_financeiro',   // Helena Vasconcelos
  'npc_rh',           // Marina Costa
  'npc_marketing',    // Beatriz Alencar
  'npc_redes',        // Camila Rocha
  'npc_reunioes',     // Patrícia Duarte
  'npc_convivencia',  // Juliana Moreira
  // Cafeteria female NPCs (from src/cafeteria/cafeteriaSystem.ts)
  'cafe_npc_clara',   // Clara Mendes
  'cafe_npc_sonia',   // Sônia Abrantes
  'npc_cafe_clara',   // Clara Mendes
  'npc_cafe_sonia',   // Sônia Abrantes
  // Story / legacy female IDs
  'npc_helena',
  'npc_mariana',
  'npc_fernanda',
  'npc_camila',
  'npc_juliana',
  'npc_patricia',
  'npc_beatriz',
  'npc_larissa',
]);

const MALE_NPC_IDS = new Set([
  // Sector male NPCs (from src/data/npcs.json)
  'npc_administrativo',   // Roberto Prado
  'npc_comercial',        // Lucas Nogueira
  'npc_desenvolvimento',  // Rafael Akira
  'npc_suporte',          // Tiago Ribeiro
  'npc_manutencao',       // Sérgio Barros
  'npc_laboratorio',      // Dr. Henrique Silveira
  'npc_servidores',       // André Freitas
  'npc_estoque',          // Marcos Vinícius
  // Cafeteria male NPCs (from src/cafeteria/cafeteriaSystem.ts)
  'cafe_npc_leo',         // Léo Batista
  'cafe_npc_thiago',      // Thiago Moura
  'npc_barista_leo',      // Léo Batista
  'npc_cafe_thiago',      // Thiago Moura
  // Legacy male IDs
  'npc_carlos',
  'npc_roberto',
]);

const FEMALE_FIRST_NAMES = new Set([
  'clara',
  'helena',
  'marina',
  'beatriz',
  'camila',
  'patrícia',
  'patricia',
  'juliana',
  'sônia',
  'sonia',
  'mariana',
  'fernanda',
  'larissa',
  'ana',
  'maria',
  'carla',
  'paula',
  'amanda',
  'bruna',
  'letícia',
  'leticia',
  'gabriela',
]);

const MALE_FIRST_NAMES = new Set([
  'roberto',
  'lucas',
  'rafael',
  'tiago',
  'thiago',
  'sérgio',
  'sergio',
  'dr.',
  'dr',
  'henrique',
  'andré',
  'andre',
  'marcos',
  'léo',
  'leo',
  'carlos',
  'joão',
  'joao',
  'pedro',
  'paulo',
  'matheus',
  'gabriel',
]);

export function isFemaleNpc(npcId?: string | null, npcName?: string | null): boolean {
  if (npcId) {
    const cleanId = npcId.trim().toLowerCase();
    if (FEMALE_NPC_IDS.has(cleanId)) return true;
    if (MALE_NPC_IDS.has(cleanId)) return false;
  }
  if (!npcName) return false;
  const parts = npcName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return false;

  const first = parts[0];
  if (FEMALE_FIRST_NAMES.has(first)) return true;
  if (MALE_FIRST_NAMES.has(first)) return false;

  if (first === 'dra.' || first === 'dra') return true;

  return (
    first.endsWith('a') &&
    first !== 'luca' &&
    first !== 'costa' &&
    first !== 'rocha' &&
    first !== 'akira' &&
    first !== 'moura' &&
    first !== 'silveira' &&
    first !== 'nogueira' &&
    first !== 'batista'
  );
}

/**
 * Returns the voice profile identifier for any NPC:
 * - 'pf_dora' (Female profile) for all female characters
 * - 'pm_alex' (Male profile) for all male characters
 */
export function getKokoroVoiceForNpc(
  npcId?: string | null,
  npcName?: string | null
): KokoroPortugueseVoice {
  return isFemaleNpc(npcId, npcName) ? 'pf_dora' : 'pm_alex';
}

/**
 * Shared generator for Manager Helena Vasconcelos's welcome speech.
 */
export function buildHelenaWelcomeSpeech(
  playerName: string,
  sectorName: string,
  npcName: string
): string {
  const cleanName = playerName.trim() || 'Analista';
  return `Graças a Deus que você está aqui, ${cleanName}! Eu sou a Helena Vasconcelos, gerente da empresa. Estamos passando por um período super corrido de fechamento de projetos e vários equipamentos começaram a dar problema ao mesmo tempo. Cada acerto soma pontos para liberar roupas e acessórios, mas cuidado com os erros para não ficar devendo pontos! Para começar, sugiro que comece pelo chamado do setor de ${sectorName}, com ${npcName}.`;
}

export const SECTOR_OK_SPEECH =
  'Tudo funcionando em ordem por aqui no meu setor, obrigado por passar!';

/**
 * Splits Portuguese dialogue into natural clauses.
 */
export function splitIntoSpeechChunks(text: string): string[] {
  const cleaned = normalizePortugueseText(text);
  if (!cleaned) return [];

  const rawSentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const chunks: string[] = [];
  for (const sentence of rawSentences) {
    if (sentence.length <= 95) {
      chunks.push(sentence);
      continue;
    }
    const clauses = sentence
      .split(/(?<=[,;:])\s+/)
      .map((c) => c.trim())
      .filter(Boolean);

    let accum = '';
    for (const clause of clauses) {
      if (!accum) {
        accum = clause;
      } else if (accum.length + 1 + clause.length <= 95) {
        accum = `${accum} ${clause}`;
      } else {
        chunks.push(accum);
        accum = clause;
      }
    }
    if (accum) {
      chunks.push(accum);
    }
  }

  return chunks.length > 0 ? chunks : [cleaned];
}

const FEMALE_VOICE_HINTS = [
  'francisca',
  'luciana',
  'maria',
  'thalita',
  'fernanda',
  'vitória',
  'vitoria',
  'helena',
  'leila',
  'camila',
  'female',
  'feminina',
  'mulher',
  'google português do brasil',
];

const MALE_VOICE_HINTS = [
  'antonio',
  'antônio',
  'daniel',
  'felipe',
  'ricardo',
  'mateus',
  'carlos',
  'male',
  'masculino',
  'homem',
];

class VoiceNarrator {
  private enabled = true;
  private muted = false;
  private speaking = false;
  private listeners = new Set<(isSpeaking: boolean) => void>();
  private statusListeners = new Set<(status: KokoroEngineStatus, progress: number) => void>();
  private backgroundListeners = new Set<(status: BackgroundVoiceDownloadStatus) => void>();

  private cachedVoices: SpeechSynthesisVoice[] = [];
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.refreshVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.refreshVoices();
      };
    }
  }

  private refreshVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const list = window.speechSynthesis.getVoices();
      if (list && list.length > 0) {
        this.cachedVoices = list;
      }
    } catch {
      // Ignore
    }
  }

  private selectNativePtBrVoice(wantFemale: boolean): SpeechSynthesisVoice | null {
    if (this.cachedVoices.length === 0) {
      this.refreshVoices();
    }
    if (this.cachedVoices.length === 0) return null;

    const ptVoices = this.cachedVoices.filter((v) =>
      v.lang.toLowerCase().replace('_', '-').startsWith('pt')
    );
    const pool = ptVoices.length > 0 ? ptVoices : this.cachedVoices;

    const preferredHints = wantFemale ? FEMALE_VOICE_HINTS : MALE_VOICE_HINTS;
    for (const hint of preferredHints) {
      const match = pool.find((v) => v.name.toLowerCase().includes(hint));
      if (match) return match;
    }

    // Prefer pt-BR over pt-PT if no gender name matched
    const ptBr = pool.filter((v) =>
      v.lang.toLowerCase().replace('_', '-').startsWith('pt-br')
    );
    const finalPool = ptBr.length > 0 ? ptBr : pool;

    if (finalPool.length >= 2) {
      return wantFemale ? finalPool[0] : finalPool[1];
    }
    return finalPool[0] || null;
  }

  public getEngineStatus(): { status: KokoroEngineStatus; progress: number } {
    return { status: 'ready', progress: 100 };
  }

  public getBackgroundDownloadStatus(): BackgroundVoiceDownloadStatus {
    return {
      active: false,
      completedChunks: 0,
      totalChunks: 0,
      currentLabel: '',
      percent: 100,
    };
  }

  public onBackgroundDownloadChange(
    cb: (status: BackgroundVoiceDownloadStatus) => void
  ): () => void {
    this.backgroundListeners.add(cb);
    cb(this.getBackgroundDownloadStatus());
    return () => {
      this.backgroundListeners.delete(cb);
    };
  }

  public onStatusChange(
    cb: (status: KokoroEngineStatus, progress: number) => void
  ): () => void {
    this.statusListeners.add(cb);
    cb('ready', 100);
    return () => {
      this.statusListeners.delete(cb);
    };
  }

  public async preloadDialogueItems(
    items: VoicePreloadItem[],
    onProgress?: (info: VoicePreloadProgress) => void
  ): Promise<void> {
    this.refreshVoices();
    if (onProgress) {
      onProgress({
        engineStatus: 'ready',
        engineProgress: 100,
        completedItems: items.length,
        totalItems: items.length,
        completedChunks: items.length,
        totalChunks: items.length,
        cachedHits: items.length,
        currentLabel: 'Vozes nativas prontas instantaneamente!',
        overallPercent: 100,
      });
    }
  }

  public startBackgroundVoiceDownload(_items: VoicePreloadItem[]) {
    this.refreshVoices();
  }

  public preloadTicketsInBackground(
    _problems: { id: string; npc: string; falaNpc: string; agradecimentoNpc: string }[],
    _npcs: { id: string; nome: string }[]
  ) {
    this.refreshVoices();
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stop();
    }
  }

  public isSpeaking(): boolean {
    return this.speaking;
  }

  public onSpeakingChange(cb: (isSpeaking: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(state: boolean) {
    this.speaking = state;
    this.listeners.forEach((cb) => cb(state));
  }

  public speakProblem(
    text: string,
    options?: { npcId?: string; npcName?: string; force?: boolean }
  ) {
    if ((!this.enabled && !options?.force) || this.muted) return;
    if (typeof window === 'undefined') return;

    this.stop();
    soundEngine.playInteract();

    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      return;
    }

    const cleaned = normalizePortugueseText(text);
    if (!cleaned) return;

    const female = isFemaleNpc(options?.npcId, options?.npcName);
    const chosenVoice = this.selectNativePtBrVoice(female);

    try {
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = chosenVoice?.lang || 'pt-BR';
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      // Distinct female vs male prosody (pitch & speaking rate)
      utterance.pitch = female ? 1.18 : 0.85;
      utterance.rate = female ? 1.05 : 1.01;
      utterance.volume = 0.95;

      utterance.onstart = () => {
        this.notify(true);
      };
      utterance.onend = () => {
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
          this.notify(false);
        }
      };
      utterance.onerror = () => {
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
          this.notify(false);
        }
      };

      this.activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      this.notify(false);
    }
  }

  public stop() {
    this.activeUtterance = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
    if (this.speaking) {
      this.notify(false);
    }
  }
}

export const voiceNarrator = new VoiceNarrator();
