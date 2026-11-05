import { DifficultyLevel, SectorData } from '../problems/validator';
import { Vec2 } from '../pathfinding/trail';

export const MAX_ENERGY = 100;
export const MIN_ENERGY_FOR_DIAGNOSTIC = 10;

export interface CoffeeItem {
  id: string;
  nome: string;
  descricao: string;
  custoPontos: number;
  energiaRecuperada: number;
  corLiquido: string;
  destaque?: string;
}

export interface CafeteriaNpc {
  id: string;
  nome: string;
  cargo: string;
  altura: number;
  corCamisa: string;
  corCalca: string;
  corCabelo: string;
  tomPele: string;
  estiloCabelo: string;
  oculos: boolean;
  genero: 'masculino' | 'feminino';
  pos: Vec2;
  rotY: number;
  falasAleatorias: string[];
}

/**
 * Architectural bounds and doorway for the expanded 3D Cafeteria OverCoffee space
 * located right in the heart of the office (x: -0.5 to 11.0, z: -3.6 to 3.6 -> 11.5m x 7.2m).
 */
export const CAFETERIA_SPACE: SectorData = {
  id: 'cafeteria',
  nome: 'Cafeteria OverCoffee',
  cor: '#f59e0b',
  icone: 'coffee',
  bounds: { x: -0.5, z: -3.6, w: 11.5, d: 7.2 },
  door: { x: 5.25, z: 3.6, orientation: 'south' },
  pcPos: { x: 5.25, z: -1.65, rotY: 0 },
  hasPrinter: false,
  propType: 'cafeteria',
};

export const ALL_COFFEES: CoffeeItem[] = [
  {
    id: 'cafe_coado',
    nome: 'Café Coado da Casa',
    descricao: 'Tradicional e quentinho para recuperar o fôlego entre os chamados.',
    custoPontos: 15,
    energiaRecuperada: 35,
    corLiquido: '#451a03',
    destaque: 'Mais Barato',
  },
  {
    id: 'expresso_duplo',
    nome: 'Expresso Duplo Curto',
    descricao: 'Extração intensa de grãos arábica selecionados para despertar na hora.',
    custoPontos: 25,
    energiaRecuperada: 55,
    corLiquido: '#271206',
  },
  {
    id: 'cappuccino_canela',
    nome: 'Cappuccino Cremoso c/ Canela',
    descricao: 'Espuma de leite vaporizado aveludado com cacau e toque de canela.',
    custoPontos: 40,
    energiaRecuperada: 75,
    corLiquido: '#9a3412',
  },
  {
    id: 'iced_caramel',
    nome: 'Iced Caramel Macchiato',
    descricao: 'Café gelado artesanal com leite cremoso e calda de caramelo.',
    custoPontos: 55,
    energiaRecuperada: 90,
    corLiquido: '#d97706',
  },
  {
    id: 'combo_overclocked',
    nome: 'Combo Overclocked + Pão de Queijo',
    descricao: 'Mocha triplo especial acompanhado de porção de pão de queijo mineiro quentinho.',
    custoPontos: 75,
    energiaRecuperada: 100,
    corLiquido: '#f59e0b',
    destaque: 'Energia 100%',
  },
];

export const CAFETERIA_NPCS: CafeteriaNpc[] = [
  {
    id: 'npc_barista_leo',
    nome: 'Léo Batista',
    cargo: 'Barista Chefe · OverCoffee',
    altura: 1.02,
    corCamisa: '#78350f',
    corCalca: '#0f172a',
    corCabelo: '#1e293b',
    tomPele: '#e0ac69',
    estiloCabelo: 'topete',
    oculos: false,
    genero: 'masculino',
    pos: { x: 5.25, z: -2.25 },
    rotY: 0,
    falasAleatorias: [
      'Dia corrido hoje, né? Já passei mais de dez bules de café só nesta manhã!',
      'O pessoal do Financeiro veio aqui três vezes seguidas hoje. O fechamento está pegando fogo!',
      'Nada que um expresso duplo e um pão de queijo quentinho não resolvam, né?',
      'Fique à vontade no balcão! Temos desde o cafezinho coado até o Combo Overclocked completo.',
    ],
  },
  {
    id: 'npc_cafe_clara',
    nome: 'Clara Mendes',
    cargo: 'Analista Jurídica (Em Pausa)',
    altura: 0.98,
    corCamisa: '#ec4899',
    corCalca: '#1e293b',
    corCabelo: '#78350f',
    tomPele: '#fde68a',
    estiloCabelo: 'longo',
    oculos: true,
    genero: 'feminino',
    pos: { x: 1.45, z: -0.35 },
    rotY: 0.85,
    falasAleatorias: [
      'Não vejo a hora do final de semana chegar... minha cabeça já está cheia de contratos!',
      'Ainda bem que você entrou para a equipe de TI! Ontem a impressora quase me fez chorar.',
      'Você já provou o Cappuccino daqui? É a única coisa que me mantém acordada depois do almoço!',
      'Dizem que sexta-feira vão liberar mais cedo se a meta bater... tomara que seja verdade!',
    ],
  },
  {
    id: 'npc_cafe_thiago',
    nome: 'Thiago Moura',
    cargo: 'Motion Designer (Pausa pro Café)',
    altura: 1.03,
    corCamisa: '#8b5cf6',
    corCalca: '#18181b',
    corCabelo: '#09090b',
    tomPele: '#c68642',
    estiloCabelo: 'curto',
    oculos: true,
    genero: 'masculino',
    pos: { x: 8.85, z: -0.35 },
    rotY: -0.85,
    falasAleatorias: [
      'Cara, dia corrido hoje, né? Meu computador renderizou vídeo a manhã inteira!',
      'Prometi pra mim mesmo que hoje só ia tomar uma xícara... já estou na quarta!',
      'Não vejo a hora do final de semana chegar pra dormir até tarde sem ouvir barulho de notificação!',
      'Na sexta-feira a gente bem que podia organizar um happy hour do escritório, o que acha?',
    ],
  },
  {
    id: 'npc_cafe_sonia',
    nome: 'Sônia Abrantes',
    cargo: 'Coordenadora de Operações',
    altura: 0.99,
    corCamisa: '#0d9488',
    corCalca: '#0f172a',
    corCabelo: '#b45309',
    tomPele: '#f1c27d',
    estiloCabelo: 'coque',
    oculos: false,
    genero: 'feminino',
    pos: { x: 1.65, z: 1.75 },
    rotY: 0.65,
    falasAleatorias: [
      'Passando só pra pegar um cafezinho rápido porque a fila de reuniões hoje não dá trégua!',
      'A Dona Helena comentou no corredor que você está mandando super bem nos chamados!',
      'Dia corrido hoje, né? Parece que todo mundo combinou de abrir chamado ao mesmo tempo!',
      'Tome um café reforçado, porque correr o escritório inteiro sem energia ninguém merece!',
    ],
  },
];

/**
 * Computes the dynamic price of a coffee item so that:
 * 1. It scales upward alongside the user's point earnings and resolved tickets ("acompanha o ganho de pontos do usuário").
 * 2. In Hard mode ('dificil'), coffee prices are significantly more expensive ("no modo difícil os preços têm que ser mais caros para os cafés").
 * 3. If the player is broke on Hard mode and needs the basic House Coffee, it falls back to courtesy so they are never soft-locked.
 */
export function getCoffeeDynamicPrice(
  coffee: CoffeeItem,
  difficulty: DifficultyLevel = 'facil',
  currentPoints = 0,
  resolvedCount = 0,
  nightShift = false
): number {
  const baseCost = Math.max(10, coffee.custoPontos);
  const diffMultiplier =
    difficulty === 'facil' ? 1.0 : difficulty === 'normal' ? 1.15 : 1.35;
  const nightMultiplier = nightShift ? 1.5 : 1.0;

  // Gentle progression scale capped at +40% max so coffee always stays affordable
  const pointsTier = Math.floor(Math.max(0, currentPoints) / 400);
  const progressionMultiplier = Math.min(
    1.4,
    1 + pointsTier * 0.06 + Math.max(0, resolvedCount) * 0.03
  );

  const rawPrice = baseCost * diffMultiplier * progressionMultiplier * nightMultiplier;
  if (difficulty === 'facil' && pointsTier === 0 && resolvedCount === 0 && !nightShift) {
    return baseCost;
  }
  return Math.max(baseCost, Math.round(rawPrice / 5) * 5);
}

/**
 * Finds the closest Cafeteria NPC within conversational range (2.4m) inside the 3D Cafeteria space.
 */
export function findNearestCafeteriaNpc(
  playerPos: Vec2,
  maxDist = 2.4
): { npc: CafeteriaNpc; distance: number } | null {
  const { x, z, w, d } = CAFETERIA_SPACE.bounds;
  if (
    playerPos.x < x - 0.5 ||
    playerPos.x > x + w + 0.5 ||
    playerPos.z < z - 0.5 ||
    playerPos.z > z + d + 0.8
  ) {
    return null;
  }

  let best: { npc: CafeteriaNpc; distance: number } | null = null;
  for (const npc of CAFETERIA_NPCS) {
    const dist = Math.hypot(playerPos.x - npc.pos.x, playerPos.z - npc.pos.z);
    if (dist <= maxDist && (!best || dist < best.distance)) {
      best = { npc, distance: dist };
    }
  }
  return best;
}

/**
 * Checks whether the player is near the Espresso Bar Counter inside the Cafeteria to order coffee.
 */
export function isPlayerNearCafeteriaCounter(playerPos: Vec2): boolean {
  return (
    playerPos.x >= 2.8 &&
    playerPos.x <= 7.7 &&
    playerPos.z >= -2.5 &&
    playerPos.z <= 0.65
  );
}

export const LOW_ENERGY_THRESHOLD = 20;
export const SLEEP_RECOVERY_ENERGY = 10;

export function calculateEnergyDrainOnTicket(
  difficulty: DifficultyLevel,
  nightShift = false
): number {
  if (nightShift) {
    if (difficulty === 'facil') return 16;
    if (difficulty === 'normal') return 20;
    return 26;
  }
  if (difficulty === 'facil') return 10;
  if (difficulty === 'normal') return 12;
  return 16;
}

/**
 * Computes the energy drained on each required diagnostic action step while attending a ticket,
 * so the total energy across all required steps of a ticket equals calculateEnergyDrainOnTicket(difficulty, nightShift).
 */
export function calculateActionStepEnergyDrain(
  difficulty: DifficultyLevel,
  totalRequiredSteps: number,
  isFinalStep: boolean,
  stepsCompletedBeforeThis: number,
  nightShift = false
): number {
  const totalTicketDrain = calculateEnergyDrainOnTicket(difficulty, nightShift);
  const safeTotalSteps = Math.max(1, totalRequiredSteps);
  const perStep = Math.floor(totalTicketDrain / safeTotalSteps);
  if (isFinalStep) {
    const alreadyDrained = perStep * Math.max(0, stepsCompletedBeforeThis);
    return Math.max(1, totalTicketDrain - alreadyDrained);
  }
  return Math.max(1, perStep);
}

export function applyTicketEnergyDrain(
  currentEnergy: number,
  difficulty: DifficultyLevel,
  nightShift = false
): number {
  return Math.max(0, currentEnergy - calculateEnergyDrainOnTicket(difficulty, nightShift));
}

export function applyErrorEnergyDrain(currentEnergy: number): number {
  // Energy only decreases when attending/completing tickets ("a energia dele só diminui quando ele atende aos chamados")
  return Math.max(0, Math.min(MAX_ENERGY, currentEnergy));
}

/**
 * Returns true whenever the player's energy is critically low (1% to 20%).
 */
export function isLowEnergyWarning(energy: number): boolean {
  return energy > 0 && energy <= LOW_ENERGY_THRESHOLD;
}

/**
 * Returns true when energy crosses from > 20% down into <= 20% (and > 0%),
 * or starts at <= 20%, triggering the low-energy warning notification.
 */
export function shouldTriggerLowEnergyAlert(
  previousEnergy: number,
  nextEnergy: number
): boolean {
  return previousEnergy > LOW_ENERGY_THRESHOLD && isLowEnergyWarning(nextEnergy);
}

/**
 * Calculates the heavy point penalty when the player's energy hits 0% and they
 * fall asleep on the job ("dormiu no serviço"), plus recovery energy after the 2s blackout.
 */
export function applySleepOnJobPenalty(
  currentPoints: number,
  difficulty: DifficultyLevel
): {
  penalty: number;
  nextPoints: number;
  recoveredEnergy: number;
  message: string;
} {
  const penalty =
    difficulty === 'facil' ? 120 : difficulty === 'normal' ? 180 : 250;
  const nextPoints = currentPoints - penalty;
  const recoveredEnergy = SLEEP_RECOVERY_ENERGY;
  return {
    penalty,
    nextPoints,
    recoveredEnergy,
    message: `Você dormiu no serviço por exaustão (0% de energia)! Foram descontados -${penalty} pts do seu saldo e você acordou com ${recoveredEnergy}% de energia.`,
  };
}

/**
 * Returns the dynamic price of the cheapest coffee available in Cafeteria OverCoffee.
 */
export function getCheapestCoffeePrice(
  difficulty: DifficultyLevel = 'facil',
  currentPoints = 0,
  resolvedCount = 0,
  nightShift = false
): number {
  return getCoffeeDynamicPrice(
    ALL_COFFEES[0],
    difficulty,
    currentPoints,
    resolvedCount,
    nightShift
  );
}

/**
 * Determines whether the company goes bankrupt (Game Over) because the player has
 * depleted their energy (0%) while owing credits or lacking points to buy the cheapest coffee,
 * or is in debt (< 0 pts) with only exhaustion recovery energy (<= 10%).
 */
export function isCompanyBankrupt(
  currentEnergy: number,
  currentPoints: number,
  difficulty: DifficultyLevel = 'facil',
  resolvedCount = 0,
  nightShift = false
): boolean {
  const minCoffeePrice = getCheapestCoffeePrice(
    difficulty,
    currentPoints,
    resolvedCount,
    nightShift
  );
  if (currentEnergy <= 0 && currentPoints < minCoffeePrice) {
    return true;
  }
  if (currentPoints < 0 && currentEnergy <= SLEEP_RECOVERY_ENERGY) {
    return true;
  }
  return false;
}

export function purchaseAndDrinkCoffee(
  currentEnergy: number,
  currentPoints: number,
  coffee: CoffeeItem,
  difficulty: DifficultyLevel = 'facil',
  resolvedCount = 0,
  nightShift = false
): {
  success: boolean;
  nextEnergy: number;
  nextPoints: number;
  costPaid: number;
  message: string;
} {
  const dynamicCost = getCoffeeDynamicPrice(
    coffee,
    difficulty,
    currentPoints,
    resolvedCount,
    nightShift
  );

  if (currentPoints < dynamicCost) {
    return {
      success: false,
      nextEnergy: currentEnergy,
      nextPoints: currentPoints,
      costPaid: 0,
      message: `Pontos insuficientes para o ${coffee.nome} (custa ${dynamicCost} pts · saldo: ${currentPoints} pts). Atenda chamados para ganhar mais pontos!`,
    };
  }

  const nextEnergy = Math.min(MAX_ENERGY, currentEnergy + coffee.energiaRecuperada);
  const nextPoints = currentPoints - dynamicCost;
  return {
    success: true,
    nextEnergy,
    nextPoints,
    costPaid: dynamicCost,
    message: `Você tomou um ${coffee.nome} quentinho! Energia restaurada para ${nextEnergy}%.`,
  };
}

export function pickRandomCafeteriaChat(
  npc: CafeteriaNpc,
  lastSpokenLine?: string
): string {
  const pool = npc.falasAleatorias.filter((line) => line !== lastSpokenLine);
  const list = pool.length > 0 ? pool : npc.falasAleatorias;
  return list[Math.floor(Math.random() * list.length)];
}
